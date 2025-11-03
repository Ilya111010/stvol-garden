import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Временный health check пока настраиваем
  if (req.url === '/api/health') {
    return res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'Backend работает на Vercel Serverless'
    });
  }

  return res.status(200).json({
    message: 'API endpoint',
    path: req.url,
    method: req.method
  });
}

