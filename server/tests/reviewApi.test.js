import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js'; // adjust to your actual app export
import Review from '../src/models/Review.js';

// Mock the queue module entirely — replace path with your actual queue file
jest.mock('../src/queues/reviewQueue.js', () => ({
    __esModule: true,
    default: {
        add: jest.fn().mockResolvedValue({ id: 'fake-job-id-123' }),
        getJob: jest.fn(),
    },
}));

import reviewQueue from '../src/queues/reviewQueue.js';

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
    await Review.deleteMany({});
    jest.clearAllMocks();
});

describe('POST /api/v1/review', () => {
    test('rejects missing diff', async () => {
        const res = await request(app)
            .post('/api/v1/review')
            .set('Authorization', 'Bearer csk_live_validtestkey')
            .send({});
        expect(res.status).toBe(400);
    });

    test('rejects oversized diff', async () => {
        const hugeDiff = 'x'.repeat(200_001);
        const res = await request(app)
            .post('/api/v1/review')
            .set('Authorization', 'Bearer csk_live_validtestkey')
            .send({ diff: hugeDiff });
        expect(res.status).toBe(413);
    });

    test('queues a valid diff and returns jobId', async () => {
        const res = await request(app)
            .post('/api/v1/review')
            .set('Authorization', 'Bearer csk_live_validtestkey')
            .send({ diff: 'diff --git a/x.js b/x.js\n+console.log(1)', repoName: 'test/repo' });

        expect(res.status).toBe(202);
        expect(res.body.jobId).toBe('fake-job-id-123');
        expect(res.body.status).toBe('queued');
        expect(reviewQueue.add).toHaveBeenCalledWith(
            'review-job',
            expect.objectContaining({ source: 'api', diff: expect.any(String) })
        );
    });
});

describe('GET /api/v1/review/:jobId', () => {
    test('returns completed result from DB if review exists', async () => {
        await Review.create({
            jobId: 'done-job-1',
            userId: 'testUserId',
            summary: 'Looks fine',
            score: 95,
            issues: [],
            positives: ['Clean code'],
            passed: true,
        });

        const res = await request(app)
            .get('/api/v1/review/done-job-1')
            .set('Authorization', 'Bearer csk_live_validtestkey');

        expect(res.status).toBe(200);
        expect(res.body.status).toBe('completed');
        expect(res.body.result.passed).toBe(true);
    });

    test('falls back to queue state if not yet in DB', async () => {
        reviewQueue.getJob.mockResolvedValue({
            getState: jest.fn().mockResolvedValue('active'),
        });

        const res = await request(app)
            .get('/api/v1/review/in-progress-job')
            .set('Authorization', 'Bearer csk_live_validtestkey');

        expect(res.status).toBe(200);
        expect(res.body.status).toBe('active');
    });

    test('returns 404 for a job that does not exist anywhere', async () => {
        reviewQueue.getJob.mockResolvedValue(null);

        const res = await request(app)
            .get('/api/v1/review/nonexistent-job')
            .set('Authorization', 'Bearer csk_live_validtestkey');

        expect(res.status).toBe(404);
    });
});