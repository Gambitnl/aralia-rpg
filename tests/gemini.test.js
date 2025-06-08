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
