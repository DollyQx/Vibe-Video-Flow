require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Config ───────────────────────────────────────────────────────────────────
const PIXAZO_API_KEY = process.env.PIXAZO_API_KEY;
const PIXAZO_HEADERS = {
  "Content-Type": "application/json",
  "Ocp-Apim-Subscription-Key": PIXAZO_API_KEY,
};

// Pixazo model endpoints
const ENDPOINTS = {
  textToImage:
    "https://gateway.pixazo.ai/kling-image/v1/kling-image/generate",
  imageToVideo:
    "https://gateway.pixazo.ai/kling-3-0-image-to-video-standard/v1/kling-3-0-image-to-video-standard-request",
  pollStatus: (requestId) =>
    `https://gateway.pixazo.ai/v2/requests/status/${requestId}`,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Poll Pixazo until the request is COMPLETED or FAILED.
 * Returns the final result object.
 */
async function pollUntilDone(requestId, intervalMs = 3000, maxAttempts = 60) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    await new Promise((r) => setTimeout(r, intervalMs));
    const { data } = await axios.get(ENDPOINTS.pollStatus(requestId), {
      headers: PIXAZO_HEADERS,
    });

    const status = (data?.status || "").toUpperCase();
    console.log(`[poll] requestId=${requestId} attempt=${attempt} status=${status}`);

    if (status === "COMPLETED" || status === "SUCCEEDED") {
      // Image result: data.result.images[0].url  or  data.images[0].url
      // Video result: data.result.videos[0].url  or  data.videos[0].url
      return data;
    }
    if (status === "FAILED" || status === "ERROR") {
      throw new Error(`Pixazo request ${requestId} failed: ${JSON.stringify(data)}`);
    }
  }
  throw new Error(`Pixazo request ${requestId} timed out after ${maxAttempts} attempts`);
}

/**
 * Extract media URL from a polled response.
 * Handles multiple response shapes gracefully.
 */
function extractUrl(polledData, type /* 'image' | 'video' */) {
  const result = polledData?.result ?? polledData;
  const key = type === "image" ? "images" : "videos";
  const arr = result?.[key] ?? result?.output?.[key] ?? [];
  if (arr.length > 0) return arr[0]?.url ?? arr[0];
  // Fallback: look for any URL-shaped field
  const flat = JSON.stringify(polledData);
  const match = flat.match(/https?:\/\/[^\s"]+\.(jpg|jpeg|png|webp|mp4|gif)/i);
  return match ? match[0] : null;
}

// ─── LLM Scene Parser ─────────────────────────────────────────────────────────

/**
 * Phase A – Turn a free-form script into an array of structured scenes.
 * Uses a rule-based splitter so there is no extra LLM API requirement.
 * Each scene: { scene_number, visual_prompt, duration }
 */
function parseScenes(script) {
  // Split on common screenplay delimiters or numbered lines
  const raw = script
    .split(/\n{2,}|(?=\bScene\s*\d+\b)|(?=\d+\.\s)/gi)
    .map((s) => s.trim())
    .filter(Boolean);

  if (raw.length === 0) {
    // Treat the whole script as one scene
    return [{ scene_number: 1, visual_prompt: script.trim(), duration: 10 }];
  }

  return raw.map((block, i) => ({
    scene_number: i + 1,
    visual_prompt: block.replace(/^(Scene\s*\d+[:\-]?\s*|\d+\.\s*)/i, "").trim(),
    duration: Math.min(15, Math.max(5, Math.ceil(block.split(" ").length / 10))),
  }));
}

// ─── Main Route ───────────────────────────────────────────────────────────────
app.post("/generate-video", async (req, res) => {
  try {
    const { script, character_description } = req.body;

    if (!script || script.trim().length === 0) {
      return res.status(400).json({ error: "script is required" });
    }

    if (!PIXAZO_API_KEY) {
      return res.status(500).json({ error: "PIXAZO_API_KEY is not set on server" });
    }

    // ── Phase A: Script → Scenes ──────────────────────────────────────────────
    console.log("[Phase A] Parsing script into scenes…");
    const scenes = parseScenes(script);
    console.log(`[Phase A] ${scenes.length} scene(s) detected`);

    // ── Phase B: Generate Master Reference Image ──────────────────────────────
    const dollyDescription =
      character_description ||
      "Dolly, a vibrant young woman with curly auburn hair, warm brown eyes, wearing a stylish teal jacket, cinematic lighting, ultra detailed, 4K";

    console.log("[Phase B] Generating master reference image for character Dolly…");
    const ttiPayload = {
      prompt: `Character concept art: ${dollyDescription}. White background, full body portrait, high detail, consistent character design.`,
      n: 1,
      aspect_ratio: "1:1",
    };

    const ttiResponse = await axios.post(ENDPOINTS.textToImage, ttiPayload, {
      headers: PIXAZO_HEADERS,
    });

    const ttiRequestId =
      ttiResponse.data?.request_id ?? ttiResponse.data?.id ?? ttiResponse.data?.requestId;

    if (!ttiRequestId) {
      throw new Error(
        `No request_id returned from Text-to-Image API. Response: ${JSON.stringify(ttiResponse.data)}`
      );
    }

    console.log(`[Phase B] TTI request_id=${ttiRequestId} – polling…`);
    const ttiPolled = await pollUntilDone(ttiRequestId);
    const masterImageUrl = extractUrl(ttiPolled, "image");

    if (!masterImageUrl) {
      throw new Error(
        `Could not extract master image URL from response: ${JSON.stringify(ttiPolled)}`
      );
    }

    console.log(`[Phase B] Master image URL: ${masterImageUrl}`);

    // ── Phase C: Generate Video Per Scene ────────────────────────────────────
    console.log(`[Phase C] Generating videos for ${scenes.length} scene(s)…`);
    const videoUrls = [];

    for (const scene of scenes) {
      console.log(`[Phase C] Scene ${scene.scene_number}: "${scene.visual_prompt.slice(0, 60)}…"`);

      const i2vPayload = {
        prompt: `${scene.visual_prompt}. Featuring character Dolly (${dollyDescription}). Cinematic, high quality.`,
        start_image_url: masterImageUrl,
        duration: String(Math.min(scene.duration, 10)), // Pixazo max 10s
        aspect_ratio: "16:9",
      };

      const i2vResponse = await axios.post(ENDPOINTS.imageToVideo, i2vPayload, {
        headers: PIXAZO_HEADERS,
      });

      const i2vRequestId =
        i2vResponse.data?.request_id ?? i2vResponse.data?.id ?? i2vResponse.data?.requestId;

      if (!i2vRequestId) {
        throw new Error(
          `No request_id for scene ${scene.scene_number}. Response: ${JSON.stringify(i2vResponse.data)}`
        );
      }

      console.log(`[Phase C] Scene ${scene.scene_number} i2v request_id=${i2vRequestId} – polling…`);
      const i2vPolled = await pollUntilDone(i2vRequestId);
      const videoUrl = extractUrl(i2vPolled, "video");

      if (!videoUrl) {
        throw new Error(
          `Could not extract video URL for scene ${scene.scene_number}: ${JSON.stringify(i2vPolled)}`
        );
      }

      console.log(`[Phase C] Scene ${scene.scene_number} video: ${videoUrl}`);
      videoUrls.push({ scene_number: scene.scene_number, visual_prompt: scene.visual_prompt, url: videoUrl });
    }

    // ── Response ──────────────────────────────────────────────────────────────
    return res.json({
      success: true,
      master_image_url: masterImageUrl,
      scenes_parsed: scenes.length,
      video_urls: videoUrls,
    });
  } catch (err) {
    console.error("[/generate-video] ERROR:", err.message);
    const detail = err.response?.data ?? err.message;
    return res.status(500).json({ error: "Video generation failed", detail });
  }
});

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/health", (req, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ OpsDolly ScriptToScreen backend running on port ${PORT}`);
});
