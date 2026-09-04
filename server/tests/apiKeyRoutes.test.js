import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js'; // adjust — your Express app export
import ApiKey from '../src/models/ApiKey.js';

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

afterEach(async () => {
    await ApiKey.deleteMany({});
});

function authCookie(userId) {
    // adapt to however your JWT auth actually issues/reads cookies
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ userId }, process.env.JWT_SECRET);
    return `token=${token}`;
}

describe('POST /api/keys', () => {
    test('creates a key and returns raw key once', async () => {
        const res = await request(app)
            .post('/api/keys')
            .set('Cookie', authCookie('user123'))
            .send({ name: 'test key' });

        expect(res.status).toBe(201);
        expect(res.body.apiKey).toMatch(/^csk_live_/);
        expect(res.body.name).toBe('test key');
    });

    test('rejects missing name', async () => {
        const res = await request(app)
            .post('/api/keys')
            .set('Cookie', authCookie('user123'))
            .send({});
        expect(res.status).toBe(400);
    });
});

describe('DELETE /api/keys/:id', () => {
    test('revokes a key belonging to the user', async () => {
        const created = await ApiKey.create({
            userId: 'user123',
            name: 'to revoke',
            keyHash: 'fakehash',
            keyPrefix: 'csk_live_fake',
        });

        const res = await request(app)
            .delete(`/api/keys/${created._id}`)
            .set('Cookie', authCookie('user123'));

        expect(res.status).toBe(200);
        const updated = await ApiKey.findById(created._id);
        expect(updated.revoked).toBe(true);
    });

    test('returns 404 for a key belonging to a different user', async () => {
        const created = await ApiKey.create({
            userId: 'someoneElse',
            name: 'not mine',
            keyHash: 'fakehash2',
            keyPrefix: 'csk_live_fake2',
        });

        const res = await request(app)
            .delete(`/api/keys/${created._id}`)
            .set('Cookie', authCookie('user123'));

        expect(res.status).toBe(404);
    });
});