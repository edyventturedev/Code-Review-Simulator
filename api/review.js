// api/review.js
// Serverless function (Vercel, Node.js runtime).
// Uses the OpenAI API. Keeps the API key on the server — it is never
// exposed to the browser.
//
// Required setup in Vercel:
//   Project Settings → Environment Variables → add OPENAI_API_KEY
//
// The front-end (index.html) calls POST /api/review with { code, language }
// and gets back the parsed review JSON.

const SYSTEM_PROMPT = `You are a senior software engineer doing a code review. Respond ONLY with valid JSON — no markdown, no extra text.
Structure: {"scores":{"correctness":<1-10>,"efficiency":<1-10>,"readability":<1-10>,"best_practices":<1-10>},"issues":[{"type":"<bug|perf|style|security|logic>","title":"<short title>","description":"<1-2 sentences>"}],"suggestions":["<s1>","<s2>","<s3>"],"summary":"<2-3 sentences>"}
Be specific, technical, constructive. Respond in English.`;

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, language } = req.body || {};

  if (!code || typeof code !== 'string' || !code.trim()) {
    return res.status(400).json({ error: 'Missing "code" in request body' });
  }

  if (code.length > 12000) {
    return res.status(400).json({ error: 'Code snippet is too long (max ~12,000 characters)' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('OPENAI_API_KEY is not set in the environment');
    return res.status(500).json({ error: 'Server is missing API credentials' });
  }

  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `Language: ${language || 'unspecified'}\n\nCode:\n${code}` }
        ]
      })
    });

    if (!openaiRes.ok) {
      const errText = await openaiRes.text();
      console.error('OpenAI API error:', openaiRes.status, errText);
      return res.status(502).json({ error: 'The AI service returned an error' });
    }

    const data = await openaiRes.json();
    const text = data.choices?.[0]?.message?.content || '';
    const cleaned = text.replace(/```json|```/g, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error('Failed to parse model output as JSON:', text);
      return res.status(502).json({ error: 'The AI response was not valid JSON' });
    }

    return res.status(200).json(parsed);
  } catch (err) {
    console.error('Unexpected error calling OpenAI API:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
