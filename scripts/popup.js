const BASE_URL = {hidden};
const LOGIN_CHECK_API_URL = {hidden};

document.addEventListener('DOMContentLoaded', function () {
    const statusDiv = document.getElementById('status');
    const usernameDiv = document.getElementById('username');

    fetch(LOGIN_CHECK_API_URL, {
        method: 'GET',
        credentials: 'include',
    })
        .then(response => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error('Not logged in');
            }
        })
        .then(data => {
            statusDiv.innerHTML = `안녕하세요 <b>${data.name}</b>님! <br>서비스 이용이 가능합니다.`;
            usernameDiv.style.display = 'block';
        })
        .catch(error => {
            statusDiv.innerHTML = 'MyCodingTest에 로그인 상태가 아닙니다.<br><br><a href="https://mycodingtest.com" target="_blank">mycodingtest.com</a> 에서<br> 로그인해주세요.';
        });
});

function a() {
    fetch(LOGIN_CHECK_API_URL, {
        method: 'GET',
        credentials: 'include',
    })
        .then(response => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error('Not logged in');
            }
        })
        .then(data => {
            statusDiv.innerHTML = `안녕하세요 <b>${data.name}</b>님! <br>서비스 이용이 가능합니다.`;
            usernameDiv.style.display = 'block';
        })
        .catch(error => {
            statusDiv.innerHTML = 'MyCodingTest에 로그인 상태가 아닙니다.<br><br><a href="https://mycodingtest.com" target="_blank">mycodingtest.com</a> 에서<br> 로그인해주세요.';
        });
}