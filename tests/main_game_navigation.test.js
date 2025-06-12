import fs from 'fs';
import path from 'path';
import vm from 'vm';

test('handleOpenTownView builds correct URL', () => {
  const js = fs.readFileSync(path.join(process.cwd(), 'main_game.js'), 'utf8');
  const start = js.indexOf('async function handleOpenTownView');
  const end = js.indexOf('}', js.indexOf('window.location.assign', start)) + 1;
  const snippet = js.slice(start, end);
  const code = `let captured; const window={location:{href:'http://host/game', assign:u=>{captured=u}}}; let gameState={current_town_id:'startville'};` + snippet + 'handleOpenTownView(); captured;';
  const result = vm.runInNewContext(code, { URL });
  expect(result).toBe('http://host/town_view.html?town=startville');
});
