import path from 'node:path';

export const env = {
  port: Number(process.env.PORT ?? 8787),
  jwtSecret: process.env.JWT_SECRET ?? 'dev-secret',
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
  startingBalance: Number(process.env.STARTING_BALANCE ?? 1000),
  uploadDir: process.env.UPLOAD_DIR ?? path.join(process.cwd(), 'uploads'),
  // Path to the built frontend (vite build output). When present, the API
  // server also serves it — lets the whole app run as one deployable
  // service instead of two.
  clientDistDir: process.env.CLIENT_DIST_DIR ?? path.join(process.cwd(), '..', 'dist'),
};
