import { apiKeyAuth } from '../src/middleware/apiKeyAuth.js';
import ApiKey from '../src/models/ApiKey.js';
import { hashApiKey } from '../src/utils/apiKey.js';

jest.mock('../src/models/ApiKey.js');

function mockReqRes(authHeader) {
    const req = { headers: { authorization: authHeader } };
    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    };
    const next = jest.fn();
    return { req, res, next };
}

describe('apiKeyAuth middleware', () => {
    afterEach(() => jest.clearAllMocks());

    test('rejects missing Authorization header', async () => {
        const { req, res, next } = mockReqRes(undefined);
        await apiKeyAuth(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    test('rejects malformed header (no Bearer prefix)', async () => {
        const { req, res, next } = mockReqRes('csk_live_abc123');
        await apiKeyAuth(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
    });

    test('rejects unknown/invalid key', async () => {
        ApiKey.findOne.mockResolvedValue(null);
        const { req, res, next } = mockReqRes('Bearer csk_live_invalidkey');
        await apiKeyAuth(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    test('rejects revoked key', async () => {
        ApiKey.findOne.mockResolvedValue({ userId: 'u1', revoked: true });
        const { req, res, next } = mockReqRes('Bearer csk_live_revokedkey');
        await apiKeyAuth(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
    });

    test('accepts valid key and sets req.user.userId', async () => {
        ApiKey.findOne.mockResolvedValue({ userId: 'u123', revoked: false, save: jest.fn() });
        const { req, res, next } = mockReqRes('Bearer csk_live_validkey');
        await apiKeyAuth(req, res, next);
        expect(next).toHaveBeenCalled();
        expect(req.user.userId).toBe('u123');
    });
});