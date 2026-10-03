# ColorBook — 인터랙티브 색채공학 교과서

스펙트럼에서 픽셀 값까지. 공학자와 공대생을 위한 한국어 색채공학 학습 사이트입니다.
예술·디자인이 아니라 색을 정의하고, 측정하고, 계산하고, 장치 사이에서 재현하는 법을 다룹니다.
20개 챕터, 100여 개의 시뮬레이터로 구성되며, 모든 계산은 내장된 CIE 원표 데이터(5 nm)를 사용합니다.

SensorBook · LithoBook 등과 같은 시리즈입니다.

## 실행
빌드 과정이 없는 정적 사이트입니다.

```bash
python3 -m http.server 8000   # → http://localhost:8000
```
`index.html`을 브라우저로 바로 열어도 동작합니다. KaTeX, three.js, 폰트는 CDN에서 불러오므로 인터넷 연결이 필요합니다.

## 구성
| 장 | 파일 | 주제 |
|---|---|---|
| 01 | chapters/light.html | 분광 분포, 복사량과 측광량, 흑체, 광원 스펙트럼 |
| 02 | chapters/vision.html | 원추세포 LMS, 단일 변수 원리, 메타머리즘, 반대색, 색각 이상 |
| 03 | chapters/colorimetry.html | 그라스만 법칙, 등색 함수, CIE XYZ, 3자극치 적분 |
| 04 | chapters/chromaticity.html | xy·u′v′, 스펙트럼 궤적, 가산 혼합, 주파장·순도 |
| 05 | chapters/rgb.html | RGB 행렬 유도, sRGB·P3·Rec.2020, 가멋과 가멋 매핑 |
| 06 | chapters/transfer.html | OETF·EOTF, sRGB 곡선, 선형광 연산, 양자화·디더링 |
| 07 | chapters/uniform.html | CIELAB, ΔE76/94/2000, OKLab |
| 08 | chapters/adaptation.html | CCT·Duv, 주광 궤적, 색순응 변환, 화이트 밸런스 |
| 09 | chapters/appearance.html | 색 외관 현상, CIECAM02/CAM16 |
| 10 | chapters/lighting.html | CRI 계산, TM-30, 백색 LED 스펙트럼 설계 |
| 11 | chapters/measurement.html | 분광광도계·분광복사계·색채계, 측정 기하, 불확도 |
| 12 | chapters/camera.html | 분광 감도, 루터 조건, CCM, 화이트 밸런스 추정 |
| 13 | chapters/display.html | 원색 스펙트럼, 특성화(GOG), 교정 |
| 14 | chapters/hdr.html | PQ·HLG, 톤 매핑, ICtCp |
| 15 | chapters/encoding.html | Y′CbCr, 레인지, 크로마 서브샘플링 |
| 16 | chapters/management.html | ICC, PCS, 렌더링 인텐트, ACES·OCIO |
| 17 | chapters/print.html | 베르–람베르트, 쿠벨카–뭉크, 노이게바우어, 하프톤 |
| 18 | chapters/dataviz.html | WCAG 대비, 색각 이상 시뮬레이션, 컬러맵 |
| 19 | chapters/workbench.html | 스펙트럼·색 값 변환기, 색차·가멋 계산 도구 |
| 20 | chapters/glossary.html | 용어집, 종합 퀴즈 |

공통 코드: `css/style.css`(디자인 토큰, 라이트/다크), `js/common.js`(내비게이션, 캔버스·차트 헬퍼, 색채 계산 헬퍼와 CIE 데이터).
챕터 작성 규칙은 [CONTRIBUTING.md](CONTRIBUTING.md)를 참고하세요.
챕터를 추가하거나 제목·설명을 바꾼 뒤에는 `python tools/seo.py`로 canonical/OG/JSON-LD 태그와 `sitemap.xml`을 다시 만들고, `node tools/check.js`로 챕터 스크립트를 점검합니다.

CIE 표준 데이터(등색 함수, 원추 기본함수, 표준 광원, CRI 시험색)는 CIE 015:2018 및 CVRL 공개 표를 [colour-science](https://github.com/colour-science/colour) 데이터셋에서 5 nm 간격으로 옮긴 것입니다. 일부 시뮬레이터(LED·디스플레이·잉크 스펙트럼 등)는 교육용 근사 모델입니다.

## 라이선스

코드는 [MIT](LICENSE-MIT), 교재 콘텐츠는 [CC BY 4.0](LICENSE-CC-BY-4.0)으로 제공됩니다. 적용 범위와 재사용 조건, 출처 표기 예시는 [라이선스 안내](LICENSE.md)를 참고하세요.
