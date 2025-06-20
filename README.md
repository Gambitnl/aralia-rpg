# Aralia RPG

Aralia is a small demo role‑playing project. The repository mixes a simple browser UI, an API handler for Vercel, and some Python game logic modeled after Dungeons & Dragons. Both JavaScript and Python tests are included.

## Setup

Install Node dependencies first:

```bash
npm install
```

This installs Jest and any other packages declared in `package.json`.

Install Python dependencies as well:

```bash
pip install -r requirements.txt
```

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
