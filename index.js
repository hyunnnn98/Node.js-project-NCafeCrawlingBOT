const xlsx = require('xlsx');
const puppeteer = require('puppeteer');
const axios = require('axios');
const fs = require('fs');
const add_to_sheet = require('./add_to_sheet');

const workbook = xlsx.readFile('xlsx/data.xlsx'); // TODO: 왜 한 페이지에서 크롤링 하는지 이유 설명하기(메모리, rate-limit)
const ws = workbook.Sheets.영화목록;
const records = xlsx.utils.sheet_to_json(ws);

fs.readdir('screenshot', (err) => {
  if (err) {
    console.log('screenshot 폴더가 없어 screenshot 폴더를 생성합니다.');
    fs.mkdirSync('screenshot');
    // sync 메서드는 프로그램의 처음과 끝에만 쓰자. 비동기 처리라서 실행이 꼬일 가능성이 높다.
  }
});
fs.readdir('poster', (err) => {
  if (err) {
    console.log('poster 폴더가 없어 poster 폴더를 생성합니다.');
    fs.mkdirSync('poster');
  }
});

const crawler = async () => {
  try {
    const browser = await puppeteer.launch({ 
      // headless: process.env.NODE_ENV === 'production'
      headless: false,
      args: ['--window-size=1920,1080'] // 브라우저 전체 창 키우기
    });
    const page = await browser.newPage();
    // 페이지 영역 키우기
    await page.setViewport({
      width: 1920,
      height: 1080,
    })
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36')
    add_to_sheet(ws, 'C1', 's', '평점');
    for (const [i, r] of records.entries()) {
      await page.goto(r.링크);
      const result = await page.evaluate(() => {
        const scoreEl = document.querySelector('.score.score_left .star_score');
        let score = ''
        if (scoreEl) {
          score = scoreEl.textContent;
        }
        const imgEl = document.querySelector('.poster img');
        let img = ''
        if (imgEl) {
          img = imgEl.src;
        }
        return { score, img };  // 비구조화를 씀 score : score를 줄여쓴거.
      });
      if (result.score) {
        const newCell = 'C' + (i + 2);
        console.log(r.제목, '평점', result.score.trim(), newCell);
        add_to_sheet(ws, newCell, 'n', result.score.trim());
      }
      // 이미지 주소가 있으면 => 엑시오스를 활용해서 그 주소를 통해 요청 보내기 => buffer로 받아오기
      // 이미지를 받아올 때 arraybuffer로 받아옴
      // * buffer가 연속적으로 들어있는 자료 구조가 arraybuffer이다.
      if (result.img) {
        // 스크린샷 찍기, 두번째 인자로 fullPage 속성도 넣을 수 있다.
        /*
          path 속성     -> 스크린샷 저장 경로 지정가능.
          fullPage 속성 -> 페이지 전체 스크린샷 저장가능.
          clip 속성     -> 스크린샷 찍고 싶은 영역 직접 지정가능.
        */
        const buffer = await page.screenshot({ 
          path: `screenshot/${r.제목}.png`, 
          fullPage: false,
          clip: {
            x: 100,
            y: 100,
            width: 300,
            height: 300,
          }
        });
        /*  # 아래 방법으로도 저장 가능하다.
            const buffer = await page.screenshot();
            fs.writeFileSync('screenshot/', buffer); 
        */
        // [정규표현식] ?.+$에서 .은 모든단어, +는 한 개 이상, $는 끝을 의미한다.
        const imgResult = await axios.get(result.img.replace(/\?.*$/, ''), {
          responseType: 'arraybuffer',
        })
        fs.writeFileSync(`poster/${r.제목}.jpg`, imgResult.data);
      }
      await page.waitFor(1000);
    }
    await page.close();
    await browser.close();
    xlsx.writeFile(workbook, 'xlsx/result.xlsx');
  } catch (e) {
    console.error(e);
  }
};
crawler();
