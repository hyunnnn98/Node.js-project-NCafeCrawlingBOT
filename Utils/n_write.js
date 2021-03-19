const write_process = async (browser, page_naver, now_hour, viewRank, commentRank) => {
    console.log(`현재 시간은 ${now_hour} 입니다. 스마일 봇 메인 페이지로 이동합니다...`)
    await page_naver.goto('https://m.cafe.naver.com/ca-fe/web/cafes/15092639/menus/567');

    await page_naver.waitForSelector('button.btn_write');

    await page_naver.evaluate(() => {
        document.querySelector('button.btn_write').click();
    });

    await page_naver.waitForSelector('.ArticleWriteFormSubject textarea');

    await page_naver.waitFor(1000);

    let start_time = await now_hour - 2;
    let end_time = await now_hour;
    let title = `${start_time}:00 ~ ${end_time}:00 - TOP 인기글 스마일 봇 - v2.0.3`;

    await page_naver.type('.ArticleWriteFormSubject textarea', title);
    await page_naver.mouse.click(100, 100);
    let text = '';

    let blank = `
`;

    let notice1 = `인기글 서비스 운영중입니다.` + blank;
    let notice2 = "(현재 인기글 리스트는 거래게시글 중 [완료], [모동숲 사요,팔아요,교환] 를 제외한 모든 게시글이 대상입니다)" + blank;
    let notice3 = "※ 원치않은 게시글이 있을 경우 댓글로 남겨주시면 반영하겠습니다 :)" + blank;

    let notice = notice1 + notice2 + notice3 + blank;

    let viewTxt = "■■■ TOP 조회 게시글 ■■■" + blank;
    let commentTxt = "■■■ TOP 댓글 게시글 ■■■" + blank;

    text = text + notice;

    text = text + viewTxt;

    for (let item in viewRank) {
        let title = `${viewRank[item].view} view │ ${viewRank[item].title}`;
        let link = `${viewRank[item].link}`;

        text = text + title + blank + link + blank + blank;
    }

    text = text + blank + commentTxt;

    for (let item in commentRank) {
        let title = `[${commentRank[item].commentCount}]개 │ ${commentRank[item].title}`;
        let link = `${commentRank[item].link}`;

        text = text + title + blank + link + blank + blank;
    }

    console.log("최종결과 : ", text)

    // <<-- 내용 복사 붙여넣기 로직.
    const temp_page = await browser.newPage();
    await temp_page.goto('https://m.cafe.naver.com/ca-fe/web/cafes/15092639/articles/2769652/comments?useCafeId=false');
    await temp_page.waitForSelector('.CommentWriteArea__inbox textarea');
    await temp_page.type('.CommentWriteArea__inbox textarea', text);

    await temp_page.keyboard.down('Control');
    await temp_page.keyboard.press('KeyA');
    await temp_page.keyboard.up('Control');
    await temp_page.keyboard.down('Control');
    await temp_page.keyboard.press('KeyX');
    await temp_page.keyboard.up('Control');
    await temp_page.close();
    // -------- temp page close --------
    // -->>

    // <<-- 글 작성 폼 이동
    for (let i = 0; i < 13; i++) {
        await page_naver.keyboard.press('Tab');
    }

    await page_naver.keyboard.down('Control');
    await page_naver.keyboard.press('KeyV');
    await page_naver.keyboard.up('Control');
    // -->>

    // <-- 게시글 공개 처리 후 글 작성 완료
    await page_naver.evaluate(() => {
        document.querySelector('.btn_set').click();
    });

    await page_naver.waitFor(2000);

    await page_naver.evaluate(() => {
        document.querySelector('#optionOpenEntire').click();
    });

    await page_naver.waitFor(1000);

    await page_naver.evaluate(() => {
        document.querySelector('.ArticleWriteComplete a:nth-child(2)').click();
    });
    // -->>
}

module.exports = write_process;