const express = require('express');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({
    message: 'Hello from a Dockerised Web App deployed via Azure DevOps CI/CD!',
    hostname: os.hostname(),
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || 'local'
  });
});

// Health check endpoint used by container/orchestrator probes
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
