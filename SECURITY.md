# Security Policy

## Reporting Vulnerabilities

If you discover a security issue within `Vibe-Video-Flow`, please submit your report directly to the project security team.

## Security Practices

1. **Environment Secrets**: API secrets, database credentials, and media service access keys must reside strictly in `.env` configuration files and never be committed to git repositories.
2. **Media API Endpoints**: Video processing, upload parameters, and access tokens are secured server-side to prevent unauthorized video manipulation or data leaks.
