'use strict';
// Independent reference cases from Sharma/Wu/Dalal (2005), W3C and CIE 13.3.
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict'), path = require('node:path');
const root = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const ctx = { window: {} }; vm.createContext(ctx);
const common = read('js/common.js');
vm.runInContext(common.slice(0, common.indexOf('/* ------------------------------------------------------------ theme */')) + '})();', ctx);
const CB = ctx.window.CB; ctx.CB = CB;
let checks = 0;
function near(a, b, tol = 1e-10) { assert.ok(Math.abs(a - b) <= tol, `${a} != ${b}`); checks++; }
for (const r of require('./ciede2000-reference.json').rows) {
  near(CB.dE2000(r.slice(0, 3), r.slice(3, 6)), r[6], 0.00005);
  near(CB.dE2000(r.slice(3, 6), r.slice(0, 3)), r[6], 0.00005);
}
near(CB.contrast([0, 0, 0], [255, 255, 255]), 21);
assert.ok(CB.contrast([118,118,118], [255,255,255]) > 4.5);
assert.ok(CB.contrast([119,119,119], [255,255,255]) < 4.5);
for (let i = 0; i <= 255; i++) near(CB.srgbEncode(CB.srgbDecode(i / 255)), i / 255, 1e-14);
for (const sp of Object.values(CB.SPACES)) {
  const M = CB.rgb2xyzMatrix(sp), W = CB.mat.vec(M, [1,1,1]), expected = CB.xy2XYZ(sp.w);
  W.forEach((v, i) => near(v, expected[i]));
  const identity = CB.mat.mul(CB.mat.inv(M), M);
  identity.forEach((r,i) => r.forEach((v,j) => near(v, i === j ? 1 : 0)));
}
for (const method of Object.keys(CB.CAT)) for (const src of ['A','D50','D65','E']) {
  const x = CB.whiteXYZ(src), target = CB.whiteXYZ('D65'), result = CB.adapt(x, x, target, method);
  result.forEach((v,i) => near(v, target[i], 1e-12));
}
for (let i=0;i<=100;i++) {
  const rgb=[i/100,(100-i)/100,.3];
  const XYZ=CB.linRGB2XYZ(rgb), back=CB.Lab2XYZ(CB.XYZ2Lab(XYZ));
  back.forEach((v,j)=>near(v,XYZ[j],1e-12));
  const ok=CB.oklab2linRGB(CB.linRGB2oklab(rgb));
  ok.forEach((v,j)=>near(v,rgb[j],3e-7));
}
const light=read('chapters/lighting.html').split('<script>')[1];
const prefix=light.slice(0, light.indexOf('  function ledSPD'));
vm.runInContext(prefix+'globalThis.criTest={cri,cctDuv,refSPD,uv60,xyz,plUV};})();',ctx);
const F=ctx.criTest;
for (const [n,expected] of [['A',100],['D65',100],['FL2',64],['FL7',90],['FL11',83]]) {
  const S=CB.wls().map(CB.illum(n)), r=F.cri(S);
  near(r.Ra,expected,.35);
  const uv=F.uv60(F.xyz(S)), ur=F.uv60(F.xyz(F.refSPD(r.T)));
  near(r.deltaC,Math.sqrt((uv[0]-ur[0])**2+(uv[1]-ur[1])**2));
}
// Distances to the daylight reference and to the Planckian locus differ.
const pointSource=light.slice(light.indexOf('  function pointAt'),light.indexOf('  function pointAt')+500);
const pointFunction=pointSource.slice(0,pointSource.indexOf('\n  }')+4);
vm.runInContext(prefix+pointFunction+'globalThis.pointAt=pointAt;})();',ctx);
for (const [duv,valid] of [[.006,true],[-.004,false]]) {
  const q=ctx.pointAt(6504,duv), back=F.cctDuv(q), ur=F.uv60(F.xyz(F.refSPD(back.T)));
  const d=Math.hypot(q[0]-ur[0],q[1]-ur[1]);
  assert.equal(d<=.0054,valid); assert.notEqual(Math.abs(back.duv)<=.0054,valid); checks+=2;
}
let blocks=0;
for(const file of fs.readdirSync(path.join(root,'chapters')).filter(x=>x.endsWith('.html'))) {
  const html=read('chapters/'+file);
  for(const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
    if(match[1].includes('application/ld+json')) JSON.parse(match[2]);
    else if(!match[1].includes('src=')) new vm.Script(match[2],{filename:file});
    blocks++;
  }
}
console.log(`PASS: ${checks} numerical reference checks; ${blocks} script/JSON blocks in all 20 chapters.`);
