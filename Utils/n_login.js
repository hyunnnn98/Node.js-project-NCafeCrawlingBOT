const dotenv = require('dotenv');
dotenv.config();

const login_process = async (browser, login_page) => {

    // 네이버 로그인 시작
    // const temp_page = await browser.newPage();
    // await temp_page.setViewport({
    //     width: 1080,
    //     height: 1080
    // })

    await login_page.setViewport({
        width: 1080,
        height: 1080,
    })

    await login_page.goto('https://nid.naver.com/nidlogin.login');
    await login_page.evaluate((id, pw) => {
        document.querySelector('#id').value = id;
        document.querySelector('#pw').value = pw;
    }, process.env.ID, process.env.PASSWORD);
    await login_page.click('.btn_global');
    await login_page.waitForNavigation();

    // await temp_page.goto('https://m.naver.com');
    // await login_page.goto('https://m.cafe.naver.com/ca-fe');


    // // 모바일 네이버 접속 -> 네이버 카페 페이지 불러올때까지 대기
    // await login_page.waitForSelector('.btn_cafe');
    // await login_page.waitFor(1000);

    // // 로그인 버튼 클릭하기
    // await login_page.evaluate(() => {
    //     document.querySelector('.btn_cafe').click();
    // });

    // // 로그인 페이지 불러올떄까지 대기
    // await login_page.waitForSelector('#id');

    // await temp_page.mouse.move(300, 200);
    // await temp_page.mouse.click(300, 200);
    // await temp_page.type('#query', process.env.ID);
    // await temp_page.keyboard.down('Control');
    // await temp_page.keyboard.press('KeyA');
    // await temp_page.keyboard.up('Control');
    // await temp_page.keyboard.down('Control');
    // await temp_page.keyboard.press('KeyX');
    // await temp_page.keyboard.up('Control');
    // await temp_page.waitFor(1000);

    // for (let i = 0; i < 4; i++)
    //     await login_page.keyboard.press('Tab');

    // await login_page.keyboard.down('Control');
    // await login_page.keyboard.press('KeyV');
    // await login_page.keyboard.up('Control');
    // await login_page.waitFor(7000);

    // await temp_page.type('#query', process.env.PASSWORD);
    // await temp_page.keyboard.down('Control');
    // await temp_page.keyboard.press('KeyA');
    // await temp_page.keyboard.up('Control');
    // await temp_page.keyboard.down('Control');
    // await temp_page.keyboard.press('KeyX');
    // await temp_page.keyboard.up('Control');
    // await temp_page.waitFor(3000);
    // await temp_page.close();

    // await login_page.keyboard.press('Tab');
    // await login_page.waitFor(1000);

    // await login_page.keyboard.down('Control');
    // await login_page.keyboard.press('KeyV');
    // await login_page.keyboard.up('Control');
    // await login_page.waitFor(2000);
    // await login_page.keyboard.press('Tab');
    // await login_page.keyboard.press('Enter');

    // await login_page.setRequestInterception(true)

    // login_page.on('request', (request) => {
    //     const headers = request.headers();
    //     headers['X-Just-Must-Be-Request-In-All-Requests'] = '1';
    //     request.continue({
    //         headers
    //     });
    // });
    
    // await login_page.waitFor(10000);
    // await login_page.waitForResponse((response) => {
    //     // console.log('res', response.url());
    //     return response.url().includes('ca-fe/');
    // }, { timeout: 480000 });
    // await login_page.waitFor(12000);
    // await login_page.waitForNavigation();
    // await login_page.reload();
    console.log(`로그인 완료!!`)
}

module.exports = login_process;