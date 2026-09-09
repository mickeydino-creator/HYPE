export const env = {
  port: Number(process.env.PORT ?? 8787),
  jwtSecret: process.env.JWT_SECRET ?? 'dev-secret',
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
  startingBalance: Number(process.env.STARTING_BALANCE ?? 1000),
};
