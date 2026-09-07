# GHL Backup 1.0

Self-hosted automated backup for one GoHighLevel sub-account. It uses a **Sub-Account Private Integration Token**, so no Agency account is required. HighLevel documents that Sub-Account APIs accept either a Location access token or a Sub-Account Private Integration Token. It also supports Marketplace OAuth apps targeting Sub-account users. See the official docs linked below.

## Included

- automated daily backup
- manual backup endpoint and tiny dashboard
- JSON snapshots with SHA-256 hashes
- contacts, opportunities, pipelines, calendars, custom fields, custom values, tags, workflows, campaigns, objects and location
- local persistent storage
- optional S3-compatible offsite storage such as Wasabi or Backblaze B2
- retention settings exposed in env for the next retention worker
- contact restore endpoint with explicit `confirm=true`
- Docker deployment

## Important limitation

This is a **real working backup engine**, but it is not a magical clone of HighLevel. Some resources are not fully reconstructable through the Location API, and endpoint schemas can change. The manifest records resource-level failures instead of silently claiming a complete backup.

Before relying on it for disaster recovery, run it against a test location and verify the returned JSON and API scopes. Do not grant write scopes unless you intend to use restore.

## Setup

```bash
cp .env.example .env
```

Set:

```env
GHL_PRIVATE_INTEGRATION_TOKEN=YOUR_SUB_ACCOUNT_PRIVATE_INTEGRATION_TOKEN
GHL_LOCATION_ID=YOUR_LOCATION_ID
ADMIN_TOKEN=use-a-long-random-secret
```

Build and start:

```bash
docker compose up -d --build
```

Run manually:

```bash
curl -X POST http://localhost:3000/api/backup -H 'Authorization: Bearer use-a-long-random-secret'
```

Dashboard:

`http://localhost:3000/`

## HighLevel auth

For a personal/self-hosted installation, a Private Integration Token is the simplest route. For a SaaS version, use HighLevel OAuth with Target User = Sub-account. HighLevel states that a sub-account user installing such an app receives a Location token directly.

Official docs:
- https://marketplace.gohighlevel.com/docs/Authorization/TargetUserSubAccount/
- https://marketplace.gohighlevel.com/docs/oauth/AppDistribution/index.html
- https://marketplace.gohighlevel.com/docs/Authorization/Scopes/

## Production hardening still recommended

- put the service behind HTTPS
- keep the admin token out of the browser in a real UI
- encrypt backup archives at rest
- use S3 versioning/object lock if you need ransomware protection
- add webhook-driven incremental backups
- add per-resource restore tooling and a dry-run mode
- add a proper OAuth install flow if distributing this to other GHL users
