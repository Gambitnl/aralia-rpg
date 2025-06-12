import { jest } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

const html = fs.readFileSync(path.join(process.cwd(), 'town_view.html'), 'utf8');
const js = fs.readFileSync(path.join(process.cwd(), 'town_view.js'), 'utf8');

test('renderTown attaches click handlers', async () => {
  const dom = new JSDOM(html, { runScripts: 'dangerously' });
  const { window } = dom;
  Object.defineProperty(window, 'sessionStorage', {
    value: {
      getItem: () => null,
      setItem: () => {},
    },
    configurable: true,
  });
  global.sessionStorage = window.sessionStorage;
  window.fetch = jest.fn(() =>
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

  window.eval(js);
  window.document.dispatchEvent(new window.Event('DOMContentLoaded', { bubbles: true }));

  await new Promise(r => setTimeout(r, 0));
  const { fetchTownData, renderTown } = window.__townView;
  const data = await fetchTownData('testville', 'forest');
  renderTown(data);

  const li = window.document.querySelector('#town-map-container li');
  expect(li).not.toBeNull();

  li.dispatchEvent(new window.Event('click'));
  expect(window.document.getElementById('town-info').innerHTML).toContain('Type: shop');
});
