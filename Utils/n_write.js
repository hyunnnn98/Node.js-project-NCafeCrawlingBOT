const write_process = async (page_naver, now_hour, viewRank, commentRank) => {
    console.log(now_hour, viewRank, commentRank)
    await page_naver.waitForResponse((response) => {
        return response.url().includes('ca-fe/');
    });

    await page_naver.goto('https://m.cafe.naver.com/ca-fe/web/cafes/15092639/menus/567');

    await page_naver.waitForSelector('button.btn_write');

    await page_naver.evaluate(() => {
        document.querySelector('button.btn_write').click();
    });

    await page_naver.waitForSelector('.ArticleWriteFormSubject textarea');

    await page_naver.waitFor(1000);

    // console.log(now_hour);

    let start_time = await now_hour - 2;
    let end_time = await now_hour;
    let title = `${start_time}:00 ~ ${end_time}:00 - TOP 인기글 스마일 봇 - v2.0`;

    for (let i = 0; i < 5; i++)
        await page_naver.keyboard.press('Tab');

    await page_naver.type('.ArticleWriteFormSubject textarea', title);

    await page_naver.waitFor(3000);
    // 타이틀 입력.
    // await page_naver.evaluate(({ title }) => {
    //     console.log("test : ", title);
    //     document.querySelector('.ArticleWriteFormSubject textarea').value = title;
    // }, { title });

    // // iframe 안으로 이동.
    // await page_naver.waitForSelector('iframe');

    // const elementHandle = await page_naver.$(
    //     'iframe[src="/SmartEditor2Inputarea.nhn"]',
    // );
    // const frame = await elementHandle.contentFrame();
    for (let i = 0; i < 2; i++)
        await page_naver.keyboard.press('Tab');

    let notice1 = "인기글 서비스 운영중입니다.";
    let notice2 = "(현재 인기글 리스트는 거래게시글 중 [완료]를 제외한 모든 게시글이 대상입니다)";
    // let viewTxt = "<p><span>■■■ TOP 조회 게시글 ■■■</span></p>";
    let viewTxt = "■■■ TOP 조회 게시글 ■■■";
    // let commentTxt = "<p><span>■■■ TOP 댓글 게시글 ■■■</span></p>";
    let commentTxt = "■■■ TOP 댓글 게시글 ■■■";

    await page_naver.keyboard.type(notice1);
    await page_naver.waitFor(500);
    await page_naver.keyboard.press('Enter');
    await page_naver.keyboard.type(notice2);
    await page_naver.waitFor(500);
    await page_naver.keyboard.press('Enter');

    await page_naver.keyboard.type(viewTxt);
    await page_naver.waitFor(3000);
    await page_naver.keyboard.press('Enter');
    for (let item in viewRank) {
        await page_naver.keyboard.type(`${viewRank[item].view} view │ ${viewRank[item].title}`);
        await page_naver.keyboard.press('Enter');
        await page_naver.keyboard.type(`${viewRank[item].link}`);
        await page_naver.keyboard.press('Enter');

        // viewTxt += `<p><span></span>${viewRank[item].view} view │ <strong>${viewRank[item].title}</strong><span/></p>`;
        // viewTxt += `<p><a href="${viewRank[item].link}"  title="${viewRank[item].title}">${viewRank[item].link}</a></p><br/><br/>`;
    }

    await page_naver.keyboard.type(commentTxt);
    await page_naver.waitFor(3000);
    await page_naver.keyboard.press('Enter');
    for (let item in commentRank) {
        await page_naver.keyboard.type(`[${commentRank[item].commentCount}]개 │ ${commentRank[item].title}`);
        await page_naver.keyboard.press('Enter');
        await page_naver.keyboard.type(`${commentRank[item].link}`);
        await page_naver.keyboard.press('Enter');

        // commentTxt += `<p><span>[${commentRank[item].commentCount}]개 │ <strong>${commentRank[item].title}</strong></span></p>`;
        // commentTxt += `<p><a href="${commentRank[item].link}"  title="${commentRank[item].title}"/>${commentRank[item].link}</a></p><br/><br/>`;
    }

    // 함수내에 매개변수를 지정해준다.
    // await page_naver.evaluate(async ({ notice, viewTxt, commentTxt }) => {
    //     document.querySelector('.se-component-content div div div').innerHTML = notice + viewTxt + "<br/><br/>" + commentTxt;
    //     document.querySelector('.se-component-content div div div').className = "se-module se-module-text __se-unit";
    // }, { notice, viewTxt, commentTxt });

    await page_naver.waitFor(3000);
    await page_naver.evaluate(() => {
        document.querySelector('.ArticleWriteComplete a:nth-child(2)').click();
    });
}

module.exports = write_process;