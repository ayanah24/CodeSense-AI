import crypto from 'crypto';

function verifySignature(req){
    const signature=req.headers['x-hub-signature-256'];

    if(!signature){
        return false;
    }
    const secret = process.env.GITHUB_WEBHOOK_SECRET?.trim();
    if (!secret) {
      console.error('Signature verification failed: missing webhook secret');
      return false;
    }
    const hmac = crypto.createHmac('sha256', secret);
    const rawBody = Buffer.isBuffer(req.body) ? req.body : null;
    if (!rawBody) {
      console.error('Signature verification failed: req.body is not a Buffer — ensure express.raw() middleware is applied to /webhook');
      return false;
    }
    hmac.update(rawBody);
    const digest='sha256='+hmac.digest('hex');
    console.log('GitHub signature:', signature);
    console.log('Our digest:      ', digest);
    console.log('Secret used:     ', process.env.GITHUB_WEBHOOK_SECRET);
    try{
        return crypto.timingSafeEqual(
            Buffer.from(signature),
            Buffer.from(digest)

        );

    } catch (error) {
        return false;
    }
}

export default verifySignature;