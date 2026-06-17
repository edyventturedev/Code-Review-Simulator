// api/review.js
// Serverless function (Vercel, Node.js runtime).
// Keeps the Anthropic API key on the server — it is never exposed to the browser.
//
// Required setup in Vercel:
//   Project Settings → Environment Variables → add ANTHROPIC_API_KEY
//
// The front-end (index.html) calls POST /api/review with { code, language }
// and gets back the parsed review JSON.

const SYSTEM_PROMPT = `You are a senior software engineer doing a code review. Respond ONLY with valid JSON — no markdown, no extra text.
Structure: {"scores":{"correctness":<1-10>,"efficiency":<1-10>,"readability":<1-10>,"best_practices":<1-10>},"issues":[{"type":"<bug|perf|style|security|logic>","title":"<short title>","description":"<1-2 sentences>"}],"suggestions":["<s1>","<s2>","<s3>"],"summary":"<2-3 sentences>"}
Be specific, technical, constructive. Respond in English.`;

module.exports = async function handler(req, res) {
  // Basic CORS (safe to leave open since there's no secret on the client side,
  // and the API key check below protects the endpoint itself)
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

  // Basic abuse guard — keep snippets reasonably sized
  if (code.length > 12000) {
    return res.status(400).json({ error: 'Code snippet is too long (max ~12,000 characters)' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY is not set in the environment');
    return res.status(500).json({ error: 'Server is missing API credentials' });
  }

  try {
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `Language: ${language || 'unspecified'}\n\nCode:\n${code}`
          }
        ]
      })
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      console.error('Anthropic API error:', anthropicRes.status, errText);
      return res.status(502).json({ error: 'The AI service returned an error' });
    }

    const data = await anthropicRes.json();
    const text = (data.content || []).map((block) => block.text || '').join('');
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
    console.error('Unexpected error calling Anthropic API:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
