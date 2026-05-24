import crypto from 'crypto';

function verifySignature(req){
    const signature=req.headers['x-hub-signature-256'];

    if(!signature){
        return false;
    }
    const hmac=crypto.createHmac('sha256',process.env.GITHUB_WEBHOOK_SECRET);
    hmac.update(req.body);
    const digest='sha256'+hmac.digest('hex');

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