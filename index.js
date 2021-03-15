/* Utils */
const login_process = require('./Utils/n_login');
const write_process = require('./Utils/n_write');
const sorting_process = require('./Utils/n_sorting');

const puppeteer = require('puppeteer');
const dotenv = require('dotenv');
dotenv.config();

const crawler = async () => {
  try {
    console.log('크롤링을 시작합니다!');
    const NOW_HOUR = new Date().getHours();
    const END_HOUR = NOW_HOUR - 8;
    console.log(`시작시간 : ${NOW_HOUR}, 종료시간 : ${END_HOUR}`)

    const browser = await puppeteer.launch({ headless: false, args: ['--window-size=1080,1080'] });

    // init browser
    // const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });

    const page = await browser.newPage();

    // page setting
    const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36'
    await page.setUserAgent(USER_AGENT)
    await page.setViewport({
      width: 1080,
      height: 1080,
    })

    await page.goto('https://m.cafe.naver.com/ca-fe/wtac');

    // 모바일 네이버 접속 -> 네이버 카페 페이지 불러올때까지 대기
    await page.waitForSelector('.list_area');

    // 크롤링된 데이터 담을 변수
    let result = [];
    let viewRank = [];
    let commentRank = [];
    let is_possible_parse = true;

    // <<-- 크롤링 시작
    while (is_possible_parse) {
      // <<-- 페이지 완벽한 이동 검사
      await page.waitForSelector('.board_box');
      console.log('** 페이지 로딩 완료 **');
      // -->>

      // 새로운 페이지 크롤링 시작
      const data = await page.evaluate((END_HOUR) => {
        /**
         * 업데이트 1시간 단위 크롤링 기준 -> +2 시간으로 변경.
         */
        let Tags = [];
        // URL 쿼리 파싱 정규식표현
        const URI_REGULAR_EXPRESSION = /(articleid\=)([\/0-9-%#]*)(&boardtype)/g;

        const li_Tags = document.querySelectorAll('.list_area .board_box');
        const IS_POSTS_EXIST = li_Tags && li_Tags.length !== 0;

        if (IS_POSTS_EXIST) {
          li_Tags.forEach(async (v) => {
            // 조회수 split로 한글 날리기
            let queryParsing = URI_REGULAR_EXPRESSION.exec(v.querySelector('.txt_area').href);
            let link = 'https://cafe.naver.com/wtac/' + queryParsing[2];
            let title = v.querySelector('.txt_area .tit').innerText;
            let time = await v.querySelector('.user_area .time').innerText;
            let view = v.querySelector('.user_area .no').innerText.split(' ')[1];
            const titleParsing = await title.indexOf("[완료]");
            const sellStringParsing = await title.indexOf("[모동숲 사요]");
            const buyStringParsing = await title.indexOf("[모동숲 팔아요]");
            const tradeStringParsing = await title.indexOf("[모동숲 교환]");
            const multiStringParsing = await title.indexOf("사고팜");

            let post = {
              link,
              title,
              time,
              view,
              commentCount: v.querySelector('.comment_inner .num').innerText,
            }

            // << --타임아웃 체크 (게시글 파싱 종료 시간일 경우 반복문 탈출 )
            let post_hour = await time.split(':')[0];

            if (END_HOUR > post_hour || post_hour == 23) {
              console.log('** 타임 아웃 **');
              if (typeof (Tags.slice(-1)[0]) == "object") Tags.push("loop_end")
            } else if (post.title && (titleParsing === -1 && sellStringParsing === -1 && buyStringParsing === -1 && tradeStringParsing === - 1 && multiStringParsing === - 1)) {
              // 게시글이 정상적으로 채워졌을 시 배열 푸쉬.
              Tags.push(post);
            }
            // -->>

            // 완료된 li태그 제거
            console.log('** 다음 게시글 이동 **');
            v.parentElement.removeChild(v);
          });
        }

        console.log('** 게시글 크롤링 종료 **');
        return Tags;
      }, END_HOUR);

      // << --타임아웃 체크 (게시글 파싱 종료 시간일 경우 반복문 탈출 )
      let is_end_of_loop = typeof (data.slice(-1)[0]) == "string";
      console.log(data.slice(-1)[0])

      if (is_end_of_loop) {
        is_possible_parse = false;
        data.splice(-1);
        console.log(data.slice(-1)[0])
      }
      // -->>

      // 뽑아온 데이터 순차로 저장
      result = result.concat(data);

      // <<-- 다음페이지 이동.
      await page.evaluate(() => {
        document.querySelector('.u_cbox_btn_more').click();
      });
      // -->>
    }
    await page.close();
    // -->>

    /* 조회수 순으로 정렬 */
    sortingField = "view";
    viewRank = sorting_process(sortingField, result, 5);
    console.log('조회수 순으로 정렬', viewRank);

    /* 댓글 순으로 정렬 */
    sortingField = "commentCount";
    commentRank = sorting_process(sortingField, result, 5);
    console.log('댓글 순으로 정렬', commentRank);

    // <<-- 네이버 로그인 로직 실행
    const page_naver = await browser.newPage();
    page_naver.setDefaultNavigationTimeout(60000);
    await login_process(browser, page_naver);
    // -->>

    // <<-- 네이버 카페 글작성 로직 실행
    await write_process(browser, page_naver, NOW_HOUR, viewRank, commentRank);
    // -->>

    // <<-- 크롤링 종료와 동시에 브라우저 종료
    console.log('크롤링을 종료합니다!');
    // await page_naver.close();
    // await browser.close();
    // -->>

  } catch (e) {
    console.log('예상치 못한 오류로 종료합니다!', e);
  }
};
const schedule = require('node-schedule');

const rule = new schedule.RecurrenceRule();
rule.hour = new schedule.Range(0, 23, 3);
rule.minute = 59;

const work = schedule.scheduleJob(rule, () => {
  console.log('노드 스케쥴러 작동합니다!')
});

crawler();

