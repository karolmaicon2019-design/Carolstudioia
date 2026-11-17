import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
for(const file of ['server.js','carol-ia.js','welcome-intro.js','api/index.js'])execFileSync(process.execPath,['--check',new URL('../'+file,import.meta.url).pathname]);
const home=read('index.html'),admin=read('admin.html'),portal=read('cliente.html'),chat=read('carol-ia.js'),server=read('server.js'),vercel=JSON.parse(read('vercel.json'));
assert.match(home,/id="ai-messages"/);assert.match(home,/id="ai-scope-summary"/);assert.match(home,/id="project-similar"/);
assert.match(chat,/projectSummary/);assert.match(chat,/carol:project-brief/);
assert.match(admin,/id="dashboard"/);assert.match(portal,/id="projects"/);assert.match(portal,/\/api\/client\/projects/);assert.match(server,/\/api\/admin\/client-access/);assert.match(admin,/id="status-filter"/);
assert.match(server,/\/api\/leads/);assert.match(server,/\/api\/admin\/leads/);assert.match(server,/Cache-Control/);
assert.match(server,/const bearer=/);assert.ok(server.includes('match(/^Bearer\\s+(.+)$/i)'), 'Bearer token parsing must use whitespace regex');assert.match(server,/\/api\/client\/projects/);
for(const p of ['index.html','admin.html','cliente.html','carol-ia.js','welcome-intro.js','robots.txt','sitemap.xml'])assert.ok(existsSync(new URL('../'+p,import.meta.url)),p+' missing');
for(const p of ['index.html','admin.html','cliente.html','carol-ia.js','robots.txt','sitemap.xml'])assert.ok(vercel.builds.some(b=>b.src===p),p+' missing in build');
const inline=[...home.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m=>m[1]).filter(x=>!x.trim().startsWith('{'));
for(const [i,js] of inline.entries()){const {Script}=await import('node:vm');new Script(js,{filename:'index-inline-'+i+'.js'});}
const adminScript=admin.match(/<script type="module">([\s\S]*?)<\/script>/)?.[1];assert.ok(adminScript);assert.match(adminScript,/function render/);
const portalScript=portal.match(/<script type="module">([\s\S]*?)<\/script>/)?.[1];assert.ok(portalScript);new (await import('node:vm')).Script(portalScript.replace(/^import\{createClient\}from'[^']+';/,''));
console.log('Static smoke checks passed. Live API/auth tests require production credentials and two test accounts.');
