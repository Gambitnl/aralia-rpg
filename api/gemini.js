// File: /api/gemini.js

export default async function handler(request, response) {
  // 1. We only accept POST requests
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // 2. Get the prompt from the game's request
    const { prompt } = request.body;
    if (!prompt) {
      return response.status(400).json({ message: 'Prompt is required' });
    }

    // 3. Use the secret API key from Vercel's environment variables
    const apiKey = process.env.GEMINI_API_KEY;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const payload = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    };

    // 4. Call the real Gemini API
    const geminiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!geminiResponse.ok) {
      const error = await geminiResponse.json();
      console.error('Gemini API Error:', error);
      return response.status(geminiResponse.status).json({ message: 'Error from Gemini API' });
    }

    // 5. Send the result back to the game
    const geminiResult = await geminiResponse.json();
    const text = geminiResult.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return response.status(200).json({ text: text });

  } catch (error) {
    console.error('Serverless Function Error:', error);
    return response.status(500).json({ message: 'Internal server error' });
  }
}
