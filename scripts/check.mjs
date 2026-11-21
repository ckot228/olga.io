import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
const html=await readFile('dist/index.html','utf8');
const config=JSON.parse((await readFile('src/config/hotel.json','utf8')).replace(/^\uFEFF/,''));
assert.equal([...html.matchAll(/<h1[ >]/g)].length,1,'Один H1');
const ids=new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]));
for(const [,id] of html.matchAll(/href="#([^"]+)"/g))assert(ids.has(id),`Нет якоря ${id}`);
for(const [,phone] of html.matchAll(/href="tel:([^"]+)"/g))assert.equal(phone,config.phone);
const schema=JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
assert.equal(schema['@type'],'Hotel');assert.equal(schema.numberOfRooms,9);assert.equal(schema.telephone,config.phone);
assert(!schema.aggregateRating&&!schema.review&&!schema.priceRange,'Не включать неподтверждённые сведения');
assert(html.includes('Стоимость уточняйте по телефону'));
for(const [,path] of html.matchAll(/(?:src|href)="(\/(?:assets|photos)\/[^"?#]+)"/g))await access('dist'+path);
const photos=JSON.parse(await readFile('src/config/photos.json','utf8'));
for(const photo of photos){assert(photo.alt);for(const key of ['src','webp','small'])await access('dist'+photo[key].replace(/^\/olga\.io/, ''));}
assert(html.includes(config.siteUrl?'index,follow':'noindex,follow'));
const sitemap=await readFile('dist/sitemap.xml','utf8');
assert.equal(sitemap.includes('<loc>'),Boolean(config.siteUrl));
for(const [path,status] of [['/',200],['/robots.txt',200],['/sitemap.xml',200],['/missing-page-qa',404]]){const r=await fetch('http://127.0.0.1:4185'+path);assert.equal(r.status,status,path);}
console.log('PASS: H1, якоря, телефоны, JSON-LD, изображения, preview SEO, HTTP 200/404.');
