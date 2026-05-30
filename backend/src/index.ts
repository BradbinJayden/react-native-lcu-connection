import * as fs from 'fs';
import { WebSocket, type RawData } from 'ws';

const rawData = fs.readFileSync('C:\\Riot Games\\League of Legends\\lockfile', 'utf8');
const [name, pid, port, password, protocol] = rawData.split(':');

const hostname = `wss://127.0.0.1:${port}/`;
const base64Auth = Buffer.from(`riot:${password}`).toString('base64');

const ws = new WebSocket(hostname, {
  headers: {
    Authorization: `Basic ${base64Auth}`
  },
  rejectUnauthorized: false 
});

ws.on('open', () => {
  ws.send(JSON.stringify([5, "OnJsonApiEvent"]));
});

ws.on('message', (message: RawData): void => {  
  try {
    const text: string = message.toString();

    if (!text.trim()) {
      return;
    }

    const data: unknown = JSON.parse(text);
    
    if (Array.isArray(data) && data[2]) {
      const payload = data[2];
      const uri: string = payload.uri;
      const eventType: string = payload.eventType; 
      const eventData: any = payload.data;
      
      console.log(payload.uri);

      if (uri.startsWith('/example')) {
        console.log(`[${eventType}]:`, eventData);
      } 
      
      else if (uri === '/example #2') {
        console.log(`[${eventType}]:`, eventData);
      }
    }

  } catch (error) {
    console.error('Failed to parse incoming WebSocket message:', error);
  }
});

ws.on('error', (error: Error): void => {
  console.error('WebSocket Error:', error.message);
});

ws.on('close', (code: number, reason: Buffer): void => {
  console.log(`Disconnected from League Client. Code: ${code}, Reason: ${reason.toString()}`);
}); 
