'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const cities=JSON.parse(fs.readFileSync(path.join(__dirname,'..','data','catalog','original-cities.json'),'utf8'));
const books=JSON.parse(fs.readFileSync(path.join(__dirname,'..','public','data','library-books.json'),'utf8'));
const server=fs.readFileSync(path.join(__dirname,'..','server.js'),'utf8');
const student=fs.readFileSync(path.join(__dirname,'..','public','index.html'),'utf8');
const dir=path.join(__dirname,'..','public','assets','cities','original');
const files=fs.readdirSync(dir).filter(x=>/^city_\d{3}\.png$/.test(x)).sort();
assert.equal(cities.length,225);
assert.equal(files.length,cities.length);
for(const file of files){
  const b=fs.readFileSync(path.join(dir,file));
  assert.equal(b.toString('ascii',1,4),'PNG');
  assert.equal(b.readUInt32BE(16),400);
  assert.equal(b.readUInt32BE(20),320);
}
assert.ok(Array.isArray(books.books)&&books.books.length>=20);
assert.ok(books.books.every(b=>b.id&&b.title&&b.intro&&Array.isArray(b.sections)&&b.sections.length>=2));
assert.match(server,/socket\.on\('enterCity'/);
assert.match(server,/socket\.on\('leaveCity'/);
assert.match(server,/cityEntryExitGameMinutes: 0/);
assert.match(server,/currentCityImage:/);
assert.match(student,/id="cityView"/);
assert.match(student,/id="libraryView"/);
assert.match(student,/fetch\('\/data\/library-books\.json\?v=68'/);
assert.match(student,/cityScene\.src=serverSelf\.currentCityImage/);
console.log(JSON.stringify({ok:true,cityImages:files.length,size:'400x320',libraryBooks:books.books.length,entryExitTimeCost:0}));
