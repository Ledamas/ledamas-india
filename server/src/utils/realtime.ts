import { Response } from 'express';

// Store all active SSE client connections
const clients = new Set<Response>();

export function addRealtimeClient(res: Response) {
  clients.add(res);
  console.log(`📡 [SSE REALTIME] Client connected. Total clients: ${clients.size}`);

  res.on('close', () => {
    clients.delete(res);
    console.log(`📡 [SSE REALTIME] Client disconnected. Remaining clients: ${clients.size}`);
  });
}

export function broadcastOrderEvent(eventType: string, orderPayload: any) {
  const payload = {
    type: eventType,
    order: orderPayload,
    timestamp: new Date().toISOString(),
  };

  const message = `event: order_update\ndata: ${JSON.stringify(payload)}\n\n`;

  console.log(`⚡ [SSE BROADCAST] Event: ${eventType} | Order: #${orderPayload?.orderNumber || orderPayload?.id} | Broadcasting to ${clients.size} clients`);

  for (const client of clients) {
    try {
      client.write(message);
    } catch (err) {
      console.error('[SSE WRITE ERROR]', err);
      clients.delete(client);
    }
  }
}
