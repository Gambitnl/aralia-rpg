import { jest } from '@jest/globals';
import handler from '../api/gemini.js';

/* eslint-disable jest/require-top-level-describe */

test('rejects non-POST requests', async () => {
  const req = { method: 'GET' };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

  await handler(req, res);

  expect(res.status).toHaveBeenCalledWith(405);
  expect(res.json).toHaveBeenCalledWith({ message: 'Method not allowed' });
});

test('returns 500 when API key is missing', async () => {
  const original = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;

  const req = { method: 'POST', body: { prompt: 'hi' } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

  await handler(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ message: 'API key not configured' });

  process.env.GEMINI_API_KEY = original;
});

test('returns generated text on success', async () => {
  process.env.GEMINI_API_KEY = 'test-key';
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({ candidates: [{ content: { parts: [{ text: 'hello' }] } }] }),
    }),
  );

  const req = { method: 'POST', body: { prompt: 'hi' } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

  await handler(req, res);

  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({ text: 'hello' });
});
