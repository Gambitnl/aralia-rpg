# Aralia RPG

Aralia is a small demo role‑playing project. The repository mixes a simple browser UI, an API handler for Vercel, and some Python game logic modeled after Dungeons & Dragons. Both JavaScript and Python tests are included.

## Setup

Install Node dependencies first:

```bash
npm install
```

This installs Jest, jsdom, and any other packages declared in `package.json`.

Install Python dependencies as well:

```bash
pip install -r requirements.txt
```

These dependencies include Flask for the API and pytest for running the tests.

## Running Tests

### JavaScript

Run the Jest suite with:

```bash
npm test
```

### Python

All Python tests are compatible with pytest:

```bash
pytest
```

After installing these dependencies, both suites should pass.

## Deployment

The `api/` directory contains serverless functions designed for Vercel. After installing the [Vercel CLI](https://vercel.com/docs/cli) you can deploy with:

```bash
vercel
```

Make sure to set `GEMINI_API_KEY` in your Vercel project settings so that `/api/gemini.js` can call the Gemini API correctly.
When running the Flask server locally, the `/api/gemini` route will proxy to the same API if `GEMINI_API_KEY` is set in your environment.

### GitHub Integration

This repository is linked to Vercel via the GitHub app. Every push to `main` automatically deploys a new production build, while pull requests create preview deployments. These development snapshots use the Gemini serverless API for any AI prompts. The GitHub connection means the repo acts as the single source of truth: each push triggers a Vercel build that includes the serverless functions in `api/`. Set `FLASK_BASE` if those functions should proxy to a local Flask server during development.
