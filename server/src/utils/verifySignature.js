import crypto from 'crypto';

function verifySignature(req) {
  const signature = req.headers['x-hub-signature-256'];

  if (typeof signature !== 'string') {
    return false;
  }

  const secret = process.env.GITHUB_WEBHOOK_SECRET?.trim();
  if (!secret) {
    console.error('Signature verification failed: missing webhook secret');
    return false;
  }

  const rawBody = Buffer.isBuffer(req.body) ? req.body : null;
  if (!rawBody) {
    console.error('Signature verification failed: req.body is not a Buffer');
    return false;
  }

  const expectedSignature = `sha256=${crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex')}`;
  const receivedBuffer = Buffer.from(signature, 'utf8');
  const expectedBuffer = Buffer.from(expectedSignature, 'utf8');

  if (receivedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(receivedBuffer, expectedBuffer);
}

export default verifySignature;
