import fs from 'fs';
import path from 'path';
import vm from 'vm';

test('handleOpenTownView calls openTownView', () => {
  const js = fs.readFileSync(path.join(process.cwd(), 'main_game.js'), 'utf8');
  const start = js.indexOf('async function handleOpenTownView');
  const end = js.indexOf('}', js.indexOf('openTownView', start)) + 1;
  const snippet = js.slice(start, end);
  const code = `let captured; const openTownView=(...a)=>{captured=a}; let gameState={current_town_id:'startville'}; const sessionStorage={getItem:()=>undefined};` + snippet + 'handleOpenTownView(); captured;';
  const result = vm.runInNewContext(code, { URL });
  expect(result).toEqual(['startville', undefined]);
});
