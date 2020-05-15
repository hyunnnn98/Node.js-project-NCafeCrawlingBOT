const puppeteer = require('puppeteer');
const dotenv = require('dotenv');
dotenv.config();

const crawler = async () => {
  try {
    const browser = await puppeteer.launch({ headless: false, args: ['--window-size=1920,1080'] });

    const page = await browser.newPage();
    await page.setViewport({
      width: 1080,
      height: 1080,
    })

    await page.goto('https://m.cafe.naver.com/ca-fe/wtac');

    // 모바일 네이버 접속 -> 네이버 카페 페이지 불러올때까지 대기
    await page.waitForSelector('.list_area');

    // 크롤링된 데이터 담을 변수
    let result      = [];
    let viewRank    = [];
    let commentRank = [];

    try {
      // 1시간 단위로 크롤링 -> 종료
      while (true) {
        console.log('무한 반복문 시작입니다!');
        // 새로운 페이지 크롤링 시작
        const data = await page.evaluate(() => {
          // 현재 시간 불러오기
          const HOUR = new Date().getHours();
          // console.log('현재시간 :', HOUR);
          let Tags = [];

          const li_Tags = document.querySelectorAll('.list_area .board_box');
          if (li_Tags.length) {

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
                if (post.title) Tags.push(post);
                console.log('시간이 틀렸습니다!!');
                return Tags;
              } else {
                console.log('li태그 삭제.')
                // 완료된 li태그 제거
                v.parentElement.removeChild(v);
                // 게시글이 정상적으로 채워졌을 시 배열 푸쉬.
                if (post.title) Tags.push(post);
              }
            });
          }
          console.log('이제 리턴 타임임!');
          return Tags;
        });

        // 뽑아온 데이터 순차로 저장
        result = result.concat(data);

        let itemTime = result.slice(-1)[0].time.split(':');
        console.log(itemTime)
        let nowTime = new Date().getHours();
        console.log(nowTime)
        if (nowTime != itemTime[0]) {
          throw "TIMEOUT"
        }

        // 한 페이지 태그 다 뽑아 왔으면 3초간 쉬어주고 다음페이지 이동.
        await page.waitFor(1000);
        await page.evaluate(() => {
          document.querySelector('.u_cbox_btn_more').click();
        });

        // 새 페이지 이동 후 -> 새로운 li 태그들 로딩 대기
        await page.waitForSelector('.board_box');
        console.log('다음페이지로 넘어갑니다.');
      }
    } catch (err) {
      console.log('받은 에러', err);
      // console.log('전체 결과', result);
      if (err == "TIMEOUT") {
        /* 조회수 순으로 정렬 */
        let sortingField = "view";
        let topViewList = result.sort(function (a, b) {
          return b[sortingField] - a[sortingField];
        });
        viewRank = topViewList.slice(0, 5);
        console.log('조회수 순으로 정렬', viewRank);

        /* 댓글 순으로 정렬 */
        sortingField = "commentCount";
        let topCommentList = result.sort(function (a, b) {
          return b[sortingField] - a[sortingField];
        });
        commentRank = topCommentList.slice(0, 5);
        console.log('댓글 순으로 정렬', commentRank);
      }
    }

    await page.close();

    // 네이버 로그인 시작
    const page_temp = await browser.newPage();
    await page_temp.setViewport({
      width: 1080,
      height: 1080
    })

    const page_naver = await browser.newPage();
    await page_naver.setViewport({
      width: 1080,
      height: 1080,
    })

    await page_temp.goto('https://m.naver.com');
    await page_naver.goto('https://m.cafe.naver.com/ca-fe');


    // 모바일 네이버 접속 -> 네이버 카페 페이지 불러올때까지 대기
    await page_naver.waitForSelector('.btn_cafe');
    await page_naver.waitFor(1000);

    // 로그인 버튼 클릭하기
    await page_naver.evaluate(() => {
      document.querySelector('.btn_cafe').click();
    });

    // 로그인 페이지 불러올떄까지 대기
    await page_naver.waitForSelector('#id');

    await page_temp.mouse.move(300, 200);
    await page_temp.mouse.click(300, 200);
    await page_temp.type('#query', process.env.ID);
    await page_temp.keyboard.down('Control');
    await page_temp.keyboard.press('KeyA');
    await page_temp.keyboard.up('Control');
    await page_temp.keyboard.down('Control');
    await page_temp.keyboard.press('KeyX');
    await page_temp.keyboard.up('Control');
    await page_temp.waitFor(1000);

    await page_naver.mouse.move(100, 470);
    await page_naver.waitFor(2000);
    await page_naver.mouse.click(100, 470);
    await page_naver.waitFor(1000);

    await page_naver.keyboard.down('Control');
    await page_naver.keyboard.press('KeyV');
    await page_naver.keyboard.up('Control');
    await page_naver.waitFor(10000);

    await page_temp.type('#query', process.env.PASSWORD);
    await page_temp.keyboard.down('Control');
    await page_temp.keyboard.press('KeyA');
    await page_temp.keyboard.up('Control');
    await page_temp.keyboard.down('Control');
    await page_temp.keyboard.press('KeyX');
    await page_temp.keyboard.up('Control');
    await page_temp.waitFor(5000);
    await page_temp.close();

    await page_naver.keyboard.press('Tab');
    await page_naver.waitFor(1000);

    await page_naver.keyboard.down('Control');
    await page_naver.keyboard.press('KeyV');
    await page_naver.keyboard.up('Control');
    await page_naver.waitFor(5000);

    await page_naver.evaluate(() => {
      document.querySelector('.btn_login > .btn_global').click();
    });
    await page_naver.waitForResponse((response) => {
      return response.url().includes('ca-fe/');
    });

    await page_naver.goto('https://m.cafe.naver.com/hyun9803');

    await page_naver.waitForSelector('.list_area');

    
    await page_naver.evaluate(() => {
      document.querySelector('button.btn_write').click();
    });
    
    await page_naver.waitForSelector('#menuid_list');
    await page_naver.evaluate(() => {
              // 내 마우스 위치 잘 보이게 하는 CSS 적용 함수.
              (() => {
                const box = document.createElement('div');
                box.classList.add('mouse-helper');
                const styleElement = document.createElement('style');
                styleElement.innerHTML = `
                  .mouse-helper {
                    pointer-events: none;
                    position: absolute;
                    z-index: 100000;
                    top: 0;
                    left: 0;
                    width: 20px;
                    height: 20px;
                    background: rgba(0,0,0,.4);
                    border: 1px solid white;
                    border-radius: 10px;
                    margin-left: -10px;
                    margin-top: -10px;
                    transition: background .2s, border-radius .2s, border-color .2s;
                  }
                  .mouse-helper.button-1 {
                    transition: none;
                    background: rgba(0,0,0,0.9);
                  }
                  .mouse-helper.button-2 {
                    transition: none;
                    border-color: rgba(0,0,255,0.9);
                  }
                  .mouse-helper.button-3 {
                    transition: none;
                    border-radius: 4px;
                  }
                  .mouse-helper.button-4 {
                    transition: none;
                    border-color: rgba(255,0,0,0.9);
                  }
                  .mouse-helper.button-5 {
                    transition: none;
                    border-color: rgba(0,255,0,0.9);
                  }
                  `;
                document.head.appendChild(styleElement);
                document.body.appendChild(box);
                document.addEventListener('mousemove', event => {
                  box.style.left = event.pageX + 'px';
                  box.style.top = event.pageY + 'px';
                  updateButtons(event.buttons);
                }, true);
                document.addEventListener('mousedown', event => {
                  updateButtons(event.buttons);
                  box.classList.add('button-' + event.which);
                }, true);
                document.addEventListener('mouseup', event => {
                  updateButtons(event.buttons);
                  box.classList.remove('button-' + event.which);
                }, true);
                function updateButtons(buttons) {
                  for (let i = 0; i < 5; i++)
                    box.classList.toggle('button-' + i, !!(buttons & (1 << i)));
                }
              })();
    });

    await page_naver.mouse.move(150, 90);
    await page_naver.mouse.click(150, 90);
    await page_naver.keyboard.press('ArrowDown');
    await page_naver.keyboard.press('Enter');

    await page_naver.waitFor(1000);

    // 타이틀 입력.
    await page_naver.evaluate(() => {
      document.querySelector('#subject').value = new Date();
    });

    // iframe 안으로 이동.
    await page_naver.waitForSelector('iframe');

    const elementHandle = await page_naver.$(
      'iframe[src="/SmartEditor2Inputarea.nhn"]',
    );
    const frame = await elementHandle.contentFrame();

    let viewTxt = "<p>■■■ TOP 조회 게시글 ■■■</p><br/>";
    for (let item in viewRank) {
      viewTxt += `<p>${viewRank[item].view} view │ <strong>${viewRank[item].title}</strong></p>`;
      viewTxt += `<a href="${viewRank[item].link}"  title="${viewRank[item].title}">${viewRank[item].link}</a><br/>`;
    }

    let commentTxt = "<p>■■■ TOP 댓글 게시글 ■■■</p><br/>";
    for (let item in commentRank) {
      commentTxt += `<p>[${commentRank[item].commentCount}]개 │ <strong>${commentRank[item].title}</strong></p>`;
      commentTxt += `<a href="${commentRank[item].link}"  title="${commentRank[item].title}"/>${commentRank[item].link}</a><br/>`;
    }

    
    // 함수내에 매개변수를 지정해준다.
    await frame.evaluate(({ viewTxt, commentTxt }) => {
      console.log('viewRank!', viewTxt);
      console.log('commentRank!', commentTxt);
      document.querySelector('#body').innerHTML = viewTxt + "<br/><br/>" + commentTxt;
    }, { viewTxt, commentTxt });


    await page_naver.waitFor(3000);
    await page_naver.evaluate(() => {
      document.querySelector('.btns_right a:nth-child(2)').click();
    });

    await page_naver.close();
    await browser.close();
  } catch (e) {
  }
};
crawler();
