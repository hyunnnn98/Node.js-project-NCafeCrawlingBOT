const puppeteer = require('puppeteer');
const dotenv = require('dotenv');
dotenv.config();

const crawler = async () => {
  try {
    const browser = await puppeteer.launch({ headless: true, args: ['--window-size=1920,1080'] });

    const page = await browser.newPage();
    await page.setViewport({
      width: 1080,
      height: 1080,
    })

    await page.goto('https://m.cafe.naver.com/ca-fe/wtac');

    // 모바일 네이버 접속 -> 네이버 카페 페이지 불러올때까지 대기
    await page.waitForSelector('.list_area');

    // 크롤링된 데이터 담을 변수
    let result = [];

    // 시간 변동 확인 변수
    let timeCheck = true;

    try {
      // 1시간 단위로 크롤링 -> 종료
      do {
        // 새로운 페이지 크롤링 시작
        const data = await page.evaluate(() => {
          // 현재 시간 불러오기
          const HOUR = new Date().getHours();
          // console.log('현재시간 :', HOUR);
          let Tags = [];

          const li_Tags = document.querySelectorAll('.list_area .board_box');

          if (li_Tags.length) {

            try {
              li_Tags.forEach((v) => {
                // 조회수 split로 한글 날리기
                let view = v.querySelector('.user_area .no').innerText.split(' ');
                let time = v.querySelector('.user_area .time').innerText;

                let post = {
                  link: v.querySelector('.txt_area').href,
                  title: v.querySelector('.txt_area .tit').innerText,
                  time: time,
                  view: view[1],
                  commentCount: v.querySelector('.comment_inner .num').innerText,
                }

                let checkHour = time.split(':');
                // console.log(checkHour)
                // console.log(HOUR)

                if (HOUR != checkHour[0]) {
                  console.log('현재 시간과 틀려, 결과를 도출합니다!');
                  timeCheck = false
                  throw Error;
                }

                // 완료된 li태그 제거
                v.parentElement.removeChild(v);

                // 게시글이 정상적으로 채워졌을 시 배열 푸쉬.
                if (post.title) {
                  Tags.push(post);
                }
              });
            } catch (err) {
              result = result.concat(Tags);
              timeCheck = false
              throw Error;
            }
          }
          console.log('새로운 페이지 ul 태그 로딩 완료!');
          return Tags;
        });


        // 뽑아온 데이터 순차로 저장
        result = result.concat(data);
        // console.log(result);

        // 한 페이지 태그 다 뽑아 왔으면 3초간 쉬어주고 다음페이지 이동.
        await page.waitFor(1000);
        await page.evaluate(() => {
          document.querySelector('.u_cbox_btn_more').click();
        });

        // await page.waitFor(1000);
        // 새 페이지 이동 후 -> 새로운 li 태그들 로딩 대기
        await page.waitForSelector('.board_box');

      } while (timeCheck)

    } catch (err) {
      /* 조회수 순으로 정렬 */
      let sortingField = "view";
      let topViewList = result.sort(function (a, b) {
        return b[sortingField] - a[sortingField];
      });
      let outOfResult = topViewList.slice(0, 5);
      console.log('조회수 순으로 정렬', outOfResult);
      
      /* 댓글 순으로 정렬 */
      sortingField = "commentCount";
      let topCommentList = result.sort(function (a, b) {
        return b[sortingField] - a[sortingField];
      });
      outOfResult = topCommentList.slice(0, 5);
      console.log('댓글 순으로 정렬', outOfResult);

    }
    // await page.close();
    // await browser.close();
  } catch (e) {
  }
};
crawler();
