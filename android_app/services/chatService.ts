import { Platform } from 'react-native';

const localhostHost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const BASE_URL = `https://0636d097d6fd.ngrok-free.app/api`;

export async function sendMessageToAi(message: string, messages?: Array<{role:string,content:string}>) {
  const payload: any = {};
  if (messages) payload.messages = messages;
  else payload.message = message;

  const res = await fetch(`${BASE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Chat API error: ${res.status} ${text}`);
  }

  const data = await res.json();
  return data.reply; // { role, content }
}
