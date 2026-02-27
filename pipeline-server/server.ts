/**
 * BloomContent Pipeline Server
 * Runs locally on this machine, called by Vercel via Cloudflare tunnel.
 * Solves the 60s Vercel timeout issue without paying for Pro.
 */

import http from 'http';
import { runArticlePipeline, PipelineRequest } from '../generator/pipeline-runner';

const PORT = 3099;
const SECRET = process.env.PIPELINE_SECRET || 'bloomcontent-pipeline-secret-2026';

const server = http.createServer(async (req, res) => {
  // Health check
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'bloomcontent-pipeline' }));
    return;
  }

  // Pipeline endpoint
  if (req.method === 'POST' && req.url === '/pipeline/run') {
    // Auth check
    const auth = req.headers['authorization'];
    if (auth !== `Bearer ${SECRET}`) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Unauthorized' }));
      return;
    }

    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const request: PipelineRequest = JSON.parse(body);
        console.log(`[${new Date().toISOString()}] Starting pipeline for: ${request.storeName}`);

        // Respond immediately — pipeline runs async
        res.writeHead(202, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'accepted', message: 'Pipeline started' }));

        // Run pipeline in background
        runArticlePipeline(request)
          .then(result => {
            console.log(`[${new Date().toISOString()}] ✅ Pipeline done: ${result?.title} (score: ${result?.qaScore})`);
          })
          .catch(err => {
            console.error(`[${new Date().toISOString()}] ❌ Pipeline error:`, err.message);
          });

      } catch (err: any) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`🚀 BloomContent Pipeline Server running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   Pipeline: POST http://localhost:${PORT}/pipeline/run`);
});
