import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { apiRouter } from './src/server/api.js';
import { db } from './src/server/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  // Ensure database initialization runs and fails fast in production if unavailable
  try {
    await db.waitForInit();
  } catch (err: any) {
    console.error('❌ [Server Startup] Failed to connect to database:', err.message);
    if (process.env.NODE_ENV === 'production') {
      console.error('FATAL: Production server cannot start without an active PostgreSQL database.');
      process.exit(1);
    }
  }

  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Mount API endpoints
  app.use('/api', apiRouter);

  // Payload error handling middleware
  app.use((err: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err && (err.type === 'entity.too.large' || err.status === 413 || err.name === 'PayloadTooLargeError')) {
      return res.status(413).json({
        error: 'Upload payload is too large. Please select a photo smaller than 50MB.',
      });
    }
    next(err);
  });

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Driver Ping server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
