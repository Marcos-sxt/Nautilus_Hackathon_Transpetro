// Vercel Serverless Function - Proxy para o backend HTTP
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Permitir apenas POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Fazer requisição para o backend HTTP (server-side não tem problema com Mixed Content)
    const backendResponse = await fetch('http://35.192.46.221:8000/prever', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      return res.status(backendResponse.status).json({ 
        error: `Backend error: ${errorText}` 
      });
    }

    const data = await backendResponse.json();
    
    // Retornar resposta do backend
    return res.status(200).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ 
      error: 'Failed to connect to backend',
      message: error.message 
    });
  }
}

