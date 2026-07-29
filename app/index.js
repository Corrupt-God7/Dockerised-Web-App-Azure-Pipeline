const express = require('express');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;

const FACTS = [
  "This page is being served from inside a Docker container.",
  "Every push to GitHub triggers an automatic test, build, and deploy.",
  "This exact container could be running on any cloud, anywhere in the world.",
  "If a test fails, this deployment never happens.",
  "The image for this app lives on Docker Hub, ready to run anywhere."
];

app.get('/', (req, res) => {
  const fact = FACTS[Math.floor(Math.random() * FACTS.length)];
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Dockerised Web App</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #0f172a, #1e293b 40%, #0ea5e9 130%);
    font-family: -apple-system, Segoe UI, Roboto, sans-serif;
    color: #e2e8f0;
    padding: 24px;
  }
  .card {
    max-width: 560px;
    width: 100%;
    background: rgba(15, 23, 42, 0.65);
    border: 1px solid rgba(148, 163, 184, 0.25);
    border-radius: 16px;
    padding: 40px;
    backdrop-filter: blur(6px);
    box-shadow: 0 20px 60px rgba(0,0,0,0.4);
  }
  .badge {
    display: inline-block;
    font-size: 12px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #38bdf8;
    border: 1px solid rgba(56, 189, 248, 0.4);
    border-radius: 999px;
    padding: 4px 12px;
    margin-bottom: 20px;
  }
  h1 {
    font-size: 28px;
    line-height: 1.3;
    margin-bottom: 12px;
    color: #f8fafc;
  }
  p.sub {
    color: #94a3b8;
    margin-bottom: 28px;
    font-size: 15px;
  }
  .fact {
    background: rgba(56, 189, 248, 0.08);
    border-left: 3px solid #38bdf8;
    padding: 14px 16px;
    border-radius: 8px;
    font-size: 14px;
    margin-bottom: 28px;
    color: #cbd5e1;
  }
  .meta {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    font-size: 13px;
  }
  .meta div {
    background: rgba(148,163,184,0.08);
    border-radius: 8px;
    padding: 10px 12px;
  }
  .meta span.label {
    display: block;
    color: #64748b;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 4px;
  }
  .meta span.value {
    color: #e2e8f0;
    font-family: 'SF Mono', Consolas, monospace;
    word-break: break-all;
  }
  .pulse {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #22c55e;
    margin-right: 6px;
    box-shadow: 0 0 0 rgba(34, 197, 94, 0.7);
    animation: pulse 2s infinite;
  }
  @keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.6); }
    70% { box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); }
    100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
  }
</style>
</head>
<body>
  <div class="card">
    <span class="badge">Docker · Azure DevOps · CI/CD</span>
    <h1>🚀 This app shipped itself.</h1>
    <p class="sub"><span class="pulse"></span>Live and running inside a container</p>
    <div class="fact">💡 ${fact}</div>
    <div class="meta">
      <div>
        <span class="label">Hostname</span>
        <span class="value">${os.hostname()}</span>
      </div>
      <div>
        <span class="label">Version</span>
        <span class="value">${process.env.APP_VERSION || 'local'}</span>
      </div>
      <div>
        <span class="label">Server time</span>
        <span class="value">${new Date().toISOString()}</span>
      </div>
      <div>
        <span class="label">Status</span>
        <span class="value">Healthy ✅</span>
      </div>
    </div>
  </div>
</body>
</html>`);
});

// Health check endpoint used by container/orchestrator probes.
// Kept as plain JSON since monitoring tools expect machine-readable output.
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Only start listening if this file is run directly (not when imported by tests)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
  });
}

module.exports = app;
