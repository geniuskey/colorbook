# ColorBook 챕터 작성 가이드

## 기여물의 라이선스

기여하는 코드는 MIT, 교재 콘텐츠는 CC BY 4.0으로 제공하는 데 동의해야 합니다. HTML 안에 코드와 콘텐츠가 함께 있어도 각 부분에 해당하는 라이선스를 적용합니다. 적용 범위는 [라이선스 안내](LICENSE.md)를 참고하세요. 제3자 자료를 추가할 때는 재사용·배포가 허용되는지 확인하고 출처와 해당 라이선스를 명시하세요.

빌드 과정 없는 정적 사이트다. `index.html` + `chapters/<slug>.html` + 공통 `css/style.css`, `js/common.js`.
로컬 실행: `python3 -m http.server 8000` → http://localhost:8000 (file://로 열어도 동작하게 classic script만 사용한다. ES module 금지.)

## 원칙
- **한국어**, 대상은 공학자와 공대 학부생(선형대수·적분·기초 광학을 안다고 가정). 예술·디자인 교재가 아니라 **색을 측정하고 계산하고 재현하는 공학 교과서**다. 영어 원어는 `<span class="en">(Tristimulus Values)</span>`처럼 병기.
- 개념 → 직관 그림(SVG) → 수식(KaTeX) → 시뮬레이터 → 실제 수치 예 → 요약/퀴즈 순서.
- 수치는 표준과 실제 장비에서 합리적인 범위를 쓴다(예: sRGB 백색 80 cd/m², HDR 피크 1,000~10,000 cd/m², 인쇄 허용차 ΔE00 1~3). 표준 문서 이름(CIE 015, IEC 61966-2-1, ITU-R BT.2100, ISO 12647 등)을 근거로 밝힌다.
- 색 계산은 직접 구현하지 말고 `CB`의 색채 헬퍼(아래)를 쓴다. 모든 장이 같은 CIE 데이터와 같은 공식을 쓰도록 하기 위해서다.
- 페이지 배경은 무채색 회색이다(색 판단에 영향을 주지 않도록). 색 견본은 sRGB로 표시되므로, 가멋 밖 색을 보여줄 때는 "화면에서 클리핑됨"을 밝힌다.
- 외부 라이브러리는 아래 head 템플릿에 있는 것만(KaTeX, three.js r147). 이미지 파일 대신 인라인 SVG/canvas로 그린다.
- 색은 하드코딩하지 말고 CSS 변수(`var(--accent)` 등)나 `SB.palette()`를 쓴다. 라이트/다크 둘 다 읽혀야 한다. 단, 물리적 색(파장색, R/G/B 필터색)은 고정색 가능.
- 모바일(폭 360px)에서 가로 스크롤이 생기면 안 된다. SVG는 `viewBox`만 주고 width/height 속성 생략.

## head 템플릿
```html
<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="icon" href="../favicon.ico" sizes="any">
<link rel="icon" href="../favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="../apple-touch-icon.png">
<title>색도도 · ColorBook</title>
<meta name="description" content="한 문장 설명">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"></script>
<link rel="stylesheet" href="../css/style.css">
<script src="../js/common.js"></script>
<!-- 3D가 필요한 페이지만 -->
<script src="https://cdn.jsdelivr.net/npm/three@0.147.0/build/three.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.147.0/examples/js/controls/OrbitControls.js"></script>
</head>
<body data-chapter="chromaticity">
<main class="chapter">
  <header class="chapter-hero">
    <div class="eyebrow">Chapter 04</div>
    <h1>색도도</h1>
    <p class="lead">...</p>
    <ul class="objectives"><li>...</li></ul>
  </header>

  <section id="intro"><h2>제목</h2> ... </section>   <!-- h2 번호와 우측 목차는 자동 생성 -->
  ...
  <section class="keypoints" id="summary"><h2>핵심 정리</h2><ol><li>...</li></ol></section>
  <section class="quiz-sec" id="quiz"><h2>확인 퀴즈</h2><div class="quiz"> ... </div></section>
</main>
<script> /* 페이지 스크립트: 여기서 SB 사용 */ </script>
</body>
</html>
```
상단바, 챕터 서랍, 목차, 이전/다음, 푸터, 테마 토글, 퀴즈 동작, KaTeX 렌더는 `common.js`가 자동 처리한다.
새 챕터는 `common.js`의 `CHAPTERS`에 등록한 뒤 `python tools/seo.py`를 실행한다. canonical·Open Graph·JSON-LD 태그가 `<meta name="description">` 바로 아래에 삽입되고 `sitemap.xml`이 갱신된다(직접 쓰지 않는다).

## 컴포넌트
```html
<figure class="diagram"><svg viewBox="0 0 800 300">...</svg><figcaption><b>그림 4-1.</b> 설명</figcaption></figure>
```
SVG 안 유틸 클래스: `.t .t-dim .t-mono .t-acc`(텍스트), `.s-line .s-axis .s-acc`(선), `.f-surface .f-elev .f-acc .f-acc-soft .f-acc2-soft`(면).

```html
<div class="sim" id="sim-qe">
  <div class="sim-head"><span class="sim-tag">SIMULATOR</span><h3>제목</h3></div>   <!-- 3D는 <span class="sim-tag three">3D</span> -->
  <div class="sim-body side">                                    <!-- side: 넓은 화면에서 컨트롤을 오른쪽에 -->
    <div class="sim-view"><canvas id="cv-qe"></canvas></div>     <!-- 3D는 <div class="sim-view three" id="v3d"></div> -->
    <div class="sim-controls">
      <label class="ctrl"><span>파장 <output id="wl-out"></output></span><input type="range" id="wl" min="350" max="1100" value="550"></label>
      <div class="ctrl"><span>모드</span><div class="seg" id="mode"><button data-value="fsi" class="on">FSI</button><button data-value="bsi">BSI</button></div></div>
      <label class="check"><input type="checkbox" id="showx"> 옵션</label>
      <button class="btn primary" id="run">실행</button>
    </div>
  </div>
  <div class="sim-readout">
    <div class="stat"><span class="k">흡수 깊이</span><span class="v" id="o-depth">—</span></div>
  </div>
  <div class="sim-note">해볼 것: ...</div>
</div>
```
콜아웃: `<div class="callout">`, `.tip`, `.warn`, `.deep`(심화). 수식: `<div class="formula">$$...$$<div class="where">여기서 ...</div></div>`, 인라인 `\( ... \)`.
표: `<div class="table-wrap"><table>...</table></div>`. 퀴즈:
```html
<div class="quiz-q"><p>질문?</p><div class="opts">
  <button class="opt">보기</button><button class="opt" data-correct>정답</button>
</div><div class="quiz-exp">해설</div></div>
```

## JS 헬퍼 (`js/common.js`)
- `SB.canvas(el, (ctx,w,h)=>{}, {aspect:0.5, height, minHeight, maxHeight})` → `{ctx,w,h,redraw()}` HiDPI, 리사이즈/테마 시 자동 redraw(배경 `--canvas-bg`로 칠해 줌).
- `SB.chart(ctx, box|null, {x:[a,b], y:[a,b], logX, logY, xLabel, yLabel, series:[{data:[[x,y]],color,width,dash,fill}], vlines, hlines, points, bands, xFmt, yFmt})` → `{X,Y,box}`.
- `SB.loop(el, (dt,t)=>{})` 화면에 보일 때만 도는 rAF 루프 `{start,stop,toggle}`.
- `SB.range(id, fmt, onInput)` → getter `get()`, `get.set(v)`. `SB.seg(id, onChange)` → getter. `SB.stat(id, html)`.
- `SB.palette()` 테마 색, `SB.color('accent')`, `SB.onTheme(cb)`, `SB.isDark()`.
- `SB.wl2rgb(nm, alpha)`, `SB.wl2rgbArr(nm)`, `SB.randn()`, `SB.poisson(λ)`, `SB.fmt(x, digits)`, `SB.si(x,'m')`, `SB.clamp/lerp/map`, `SB.C = {h,c,q,k}`.
- `SB.three(el, {camera:[x,y,z], target:[x,y,z], fov, autoRotate, minDistance, maxDistance})` → `T = {THREE, scene, camera, renderer, controls, onFrame(cb), label(html, Vector3|[x,y,z]) , material(color, opts)}`. 조명/리사이즈/화면밖 정지 포함. 라벨의 `L.obj = mesh`로 두면 로컬 좌표를 따라감.

## 색채 헬퍼 (`js/common.js`)
데이터는 CIE/CVRL 원표(380–780 nm, 5 nm, 81점)를 내장한다. 함수 인자 nm은 실수, 표는 선형 보간.
- **데이터**: `CB.DATA`(원표), `CB.table(arr, lo=380, step=5)` → 보간 함수, `CB.wls(step)` 파장 배열.
- **관측자·감도**: `CB.cmf(nm, '1931'|'1964')` → [x̄,ȳ,z̄], `CB.cmfFit(nm)`(Wyman 2013 가우시안 근사), `CB.V(nm)`, `CB.lms(nm)`(Stockman–Sharpe 2°, 각 최대 1), `CB.rgbCMF(nm)`(Stiles–Burch 1955 r̄ḡb̄).
- **광원**: `CB.illum(name)(nm)` (`A D50 D65 FL2 FL7 FL11 LED-B3 LED-RGB1 LED-V1 HP1`), `CB.D65(nm)`, `CB.daylight(T)(nm)`(CIE 주광, 4000–25000 K), `CB.planck(nm,T)`(W·sr⁻¹·m⁻³), `CB.blackbody(nm,T)`(560 nm=100), `CB.gauss(nm, center, fwhm)`, `CB.tcs(1..14)(nm)`(CRI 시험색 반사율).
- **적분**: `CB.spd2XYZ(S, {illum, observer, step, Y, absolute})`. 발광체는 Y=1(또는 `Y`)로 정규화, `absolute:true`면 683 lm/W 적용. `illum`을 주면 S를 반사율로 보고 완전 백색 Y=100.
- **좌표**: `CB.XYZ2xy`, `CB.xy2XYZ(xy, Y)`, `CB.XYZ2uv`(u′v′), `CB.xy2uv`, `CB.uv2xy`, `CB.monoXY(nm)`, `CB.planckXY(T)`, `CB.daylightXY(T)`, `CB.cct(xy)`(McCamy).
- **RGB**: `CB.WHITE`(D65 D50 A E DCI의 xy), `CB.SPACES`(srgb p3 adobe rec2020 ntsc: `{name,r,g,b,w}`), `CB.rgb2xyzMatrix(space)`, `CB.M_SRGB`, `CB.M_SRGB_INV`, `CB.srgbEncode/srgbDecode`, `CB.XYZ2linRGB`, `CB.linRGB2XYZ`, `CB.XYZ2rgb8(XYZ)`(Y=1 백색 기준, `.clipped` 플래그), `CB.XYZ2css`, `CB.rgb8css`, `CB.xy2display(xy)`, `CB.hex2rgb`, `CB.rgb2hex`, `CB.rgb82XYZ`.
- **균등 색공간·색차**: `CB.whiteXYZ(name|xy, Y)`, `CB.XYZ2Lab(XYZ, white)`, `CB.Lab2XYZ`, `CB.Lab2LCh`, `CB.LCh2Lab`, `CB.dE76`, `CB.dE2000(lab1, lab2, kL, kC, kH)`, `CB.linRGB2oklab`, `CB.oklab2linRGB`.
- **색순응**: `CB.CAT`(bradford vonkries cat02 xyz), `CB.adaptMatrix(srcW, dstW, method)`, `CB.adapt(XYZ, srcW, dstW, method)`.
- **대비**: `CB.relLum(rgb8)`, `CB.contrast(rgb8a, rgb8b)`(WCAG 2.x).
- **행렬**: `CB.mat.mul`, `CB.mat.vec`, `CB.mat.inv`, `CB.mat.diag`.
- **그리기**: `CB.chromaticity(ctx, box|null, {fill, grid, labels, planck, gamuts:['srgb', {name,r,g,b,color,dash}], uv, range, fillAlpha})` → `{X, Y, P(xy)→[px,py], inv(px,py), inside(xy), box}`. `uv:true`면 CIE 1976 u′v′ 좌표. `CB.spectrumBar(ctx, box, nm0, nm1)`.

같은 공식을 장마다 다시 쓰지 않는다. 장 고유의 모델(예: CAM16, PQ, Kubelka–Munk, Machado CVD)은 해당 장의 페이지 스크립트에 둔다.
