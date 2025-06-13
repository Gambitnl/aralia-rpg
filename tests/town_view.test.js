import { jest } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

const html = fs.readFileSync(path.join(process.cwd(), 'town_view.html'), 'utf8');

test('renderTown attaches click handlers', async () => {
  const dom = new JSDOM(html, { url: 'http://localhost/town_view.html?town=test_town_id' });
  global.window = dom.window;
  global.document = dom.window.document;
  global.sessionStorage = { getItem: () => null, setItem: jest.fn() };
  global.localStorage = { getItem: () => null, setItem: jest.fn() };
  const mockFetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          name: 'Testville',
          environment_type: 'forest',
          buildings: [{ name: 'Shop', type: 'shop', position: { x: 1, y: 2 } }],
          roads: [],
        }),
    })
  );
  window.fetch = mockFetch;
  global.fetch = mockFetch;

  await import('../town_view.js');
  window.document.dispatchEvent(new window.Event('DOMContentLoaded', { bubbles: true }));

  await new Promise(r => setTimeout(r, 0));
  const { fetchTownData, renderTown } = window.__townView;
  const data = await fetchTownData('testville', 'forest');
  renderTown(data);

  const li = window.document.querySelector('#town-map-container li');
  expect(li).not.toBeNull();

  li.dispatchEvent(new window.Event('click'));
  expect(window.document.getElementById('town-info').innerHTML).toContain('Type: shop');

  delete global.window;
  delete global.document;
  delete global.sessionStorage;
  delete global.localStorage;
  delete global.fetch;
});
