import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      console.log('📦 Received from frontend:', req.body);
      
      const phpResponse = await fetch('https://allupipay.in/publicsewa/api/users/submit_review.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body),
      });
      
      console.log('📡 PHP Response status:', phpResponse.status);
      
      // Handle empty response
      const responseText = await phpResponse.text();
      let data = {};
      
      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error('❌ JSON parse error:', parseError);
          data = { error: 'Invalid JSON response from PHP API' };
        }
      }
      
      console.log('✅ Response data:', data);
      res.status(phpResponse.status).json(data);
      
    } catch (error) {
      console.error('❌ Proxy error:', error);
      res.status(500).json({ 
        error: 'Failed to submit review',
        details: error.message 
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}