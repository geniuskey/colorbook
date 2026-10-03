// 챕터 정적 점검: node tools/check.js chapters/light.html [...]
// - 인라인 스크립트 문법 검사
// - getElementById/CB.range/CB.seg/CB.stat/#id 참조가 HTML에 존재하는지
// - CB.* 호출이 common.js에 정의되어 있는지
const fs = require("fs"), path = require("path"), vm = require("vm");
const common = fs.readFileSync(path.join(__dirname, "../js/common.js"), "utf8");
const defined = new Set([...common.matchAll(/CB\.([A-Za-z_$][\w$]*)\s*=/g)].map((m) => m[1]).concat(["CHAPTERS"]));
let bad = 0;
const files = process.argv.slice(2).length ? process.argv.slice(2) : fs.readdirSync("chapters").map((f) => "chapters/" + f);
for (const f of files) {
  const html = fs.readFileSync(f, "utf8");
  const errs = [];
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)(?![^>]*application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  scripts.forEach((s, i) => {
    try { new vm.Script(s, { filename: `${f}#script${i}` }); } catch (e) { errs.push(`syntax: ${e.message}`); }
    for (const m of s.matchAll(/(?:getElementById|CB\.(?:range|seg|stat))\(\s*["'`]([\w-]+)["'`]/g)) if (!m[1].endsWith("-") && !ids.has(m[1])) errs.push(`missing id: ${m[1]}`);
    for (const m of s.matchAll(/querySelector\(\s*["'`]#([\w-]+)["'`]/g)) if (!ids.has(m[1])) errs.push(`missing id: #${m[1]}`);
    for (const m of s.matchAll(/\bCB\.([A-Za-z_$][\w$]*)/g)) if (!defined.has(m[1])) errs.push(`undefined helper: CB.${m[1]}`);
  });
  const dup = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]).filter((v, i, a) => a.indexOf(v) !== i);
  if (dup.length) errs.push(`duplicate ids: ${[...new Set(dup)].join(", ")}`);
  const kb = (Buffer.byteLength(html) / 1024).toFixed(0);
  const secs = (html.match(/<section/g) || []).length, sims = (html.match(/class="sim"/g) || []).length, quiz = (html.match(/class="quiz-q"/g) || []).length;
  console.log(`${errs.length ? "FAIL" : "ok  "} ${f}  ${kb} KB  sections=${secs} sims=${sims} quiz=${quiz}`);
  [...new Set(errs)].forEach((e) => console.log("     - " + e));
  if (errs.length) bad++;
}
process.exit(bad ? 1 : 0);
