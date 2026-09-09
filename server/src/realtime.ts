import type { Server } from 'socket.io';

let io: Server | null = null;

export function setIo(server: Server) {
  io = server;
}

export function emitPriceUpdate(trendId: string, price: number, change24h: number) {
  io?.to(`trend:${trendId}`).emit('price:update', { trendId, price, change24h });
  io?.to('feed').emit('price:update', { trendId, price, change24h });
}

export function emitTrendCreated(trend: unknown) {
  io?.to('feed').emit('trend:created', trend);
}
