const express = require('express');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const OPENAI_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_KEY) {
  console.warn('Warning: OPENAI_API_KEY not set. The /chat endpoint will fail without it.');
}

app.post('/chat', async (req, res) => {
  try {
    const { message, messages } = req.body;
    // Support either a single message or array of messages
    const userMessages = messages && Array.isArray(messages) ? messages : [{ role: 'user', content: message }];

    if (!OPENAI_KEY) {
      return res.status(500).json({ error: 'OPENAI_API_KEY not configured on server' });
    }

    const payload = {
      model: 'gpt-3.5-turbo',
      messages: userMessages.map(m => ({ role: m.role || 'user', content: m.content || m })),
      temperature: 0.7,
      max_tokens: 800
    };

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!r.ok) {
      const text = await r.text();
      return res.status(500).json({ error: 'OpenAI error', detail: text });
    }

    const data = await r.json();
    const assistant = data.choices && data.choices[0] && data.choices[0].message ? data.choices[0].message : null;

    return res.json({ reply: assistant });
  } catch (err) {
    console.error('Chat error', err);
    return res.status(500).json({ error: 'server_error', detail: String(err) });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`ai-backend listening on http://localhost:${port}`);
});
