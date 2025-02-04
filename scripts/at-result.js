const BASE_URL = {hidden};
const LOGIN_CHECK_API_URL = {hidden};
const SUBMISSION_DUPLICATION_CHECK_API_URL = {hidden};
const JUDGMENT_RESULT_SAVE_API_URL = {hidden};
const CODE_SAVE_API_URL = {hidden};

const MESSAGE_WAITING = "⌛ 대기 중";
const MESSAGE_CHECKING_SUBMISSION = "✅ 이미 서버에 저장된 제출 번호 인지 확인하고 있습니다.";
const MESSAGE_WAITING_FOR_GRADING = "⌛️ 채점이 완료될 때까지 대기 중입니다.";
const MESSAGE_SENDING_DATA = "🌏 서버에 소스 코드와 채점 결과와 전송 중입니다...";
const MESSAGE_TRANSMISSION_COMPLETE = "🎉 전송 완료.";
const MESSAGE_EMPTY_RESULT_TABLE = '⚠️ 채점 결과 표가 비었습니다.';
const MESSAGE_NOT_YOUR_RESULT = (bojUserId) => `⚠️ ${bojUserId} 의 채점 결과가 아닙니다.`;
const MESSAGE_LOGIN_REQUIRED = '⚠️ mycodingtest.com 에서 로그인해 주세요. 비 로그인 상태에서는 서비스 이용이 불가합니다.';
const MESSAGE_ALREADY_SOLVED = `✅ 아직 풀지 않은 문제입니다.`;
const MESSAGE_ALREADY_SAVED = (submissionId) => `✅ 제출 번호 ${submissionId} 은 이미 서버에 저장된 상태입니다.`;
const MESSAGE_NETWORK_ERROR = '⚠️ Network response was not ok';
const MESSAGE_NO_SOURCE_CODE = (submissionId) => `⚠️ 소스 코드가 없습니다.\n백준 '제출' 페이지에서 제출 버튼을 클릭 후, '내 제출' 페이지에서 채점되는 로직을 가정하고 만든 서비스입니다.\nhttps://www.acmicpc.net/source/${submissionId}\n위 링크에 소스 코드가 있으니 '복사&붙여넣기'로 복습 진행 부탁드립니다.`;

const statusTable = document.querySelector('#status-table');
if (statusTable && !document.getElementById('extension-status')) {
    createStatusDiv(statusTable);
}

run();

async function run() {
    try {
        checkBojIdInStatusTable();

        await loginCheck();

        updateStatusMessage(MESSAGE_CHECKING_SUBMISSION);
        await checkIfSubmissionExists();

        updateStatusMessage(MESSAGE_WAITING_FOR_GRADING);
        const resultTable = await waitForTableLoadAndGrading();

        const result = await readResults(resultTable);

        updateStatusMessage(MESSAGE_SENDING_DATA);
        await sendJudgmentResultToServer(result);
        await sendCodeToS3(result.submissionId, result.problemNumber);

        updateStatusMessage(MESSAGE_TRANSMISSION_COMPLETE);
    } catch (error) {
        updateStatusMessage(error.message);
    }
}

function checkBojIdInStatusTable() {
    const bojUserId = document.querySelector('.username').textContent;

    const statusTable = document.querySelector('#status-table');
    const firstRow = statusTable.querySelector('tbody tr');
    if (!firstRow) throw new Error(MESSAGE_EMPTY_RESULT_TABLE);

    const cells = firstRow.querySelectorAll('td');
    const statusTableBojId = cells[1].querySelector('a').textContent;

    if (bojUserId !== statusTableBojId) {
        throw new Error(MESSAGE_NOT_YOUR_RESULT(bojUserId));
    }
}

async function loginCheck() {
    const response = await fetch(LOGIN_CHECK_API_URL, {
        method: 'GET',
        credentials: 'include',
    });
    if (response.status !== 200) {
        throw new Error(MESSAGE_LOGIN_REQUIRED);
    }
}

async function checkIfSubmissionExists() {
    const resultTable = document.querySelector('#status-table');
    let submissionId;
    try {
        submissionId = resultTable.querySelector('tbody tr td:nth-child(1)').textContent;
    } catch (error) {
        throw new Error(MESSAGE_ALREADY_SOLVED);
    }

    const response = await fetch(SUBMISSION_DUPLICATION_CHECK_API_URL + submissionId, {
        method: 'GET',
        credentials: "include"
    });
    if (response.status === 409) {
        throw new Error(MESSAGE_ALREADY_SAVED(submissionId));
    }
    if (!response.ok) {
        throw new Error(MESSAGE_NETWORK_ERROR);
    }
}

async function waitForTableLoadAndGrading() {
    const statusTable = document.querySelector('#status-table');

    return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
            if (statusTable && statusTable.querySelector('tbody tr')) {
                const resultCell = statusTable.querySelector('tbody tr td:nth-child(4)');
                const resultText = resultCell.querySelector('.result-text');

                if (resultText) {
                    const status = resultText.textContent.trim();
                    if (!status.includes('채점') && !status.includes('기다')) {
                        clearInterval(checkInterval);
                        resolve(statusTable);
                    }
                }
            }
        }, 300);
    });
}

async function readResults(resultTable) {
    resultTable = document.querySelector('#status-table');
    const firstRow = resultTable.querySelector('tbody tr');
    if (!firstRow) throw new Error(MESSAGE_EMPTY_RESULT_TABLE);
    const cells = firstRow.querySelectorAll('td');
    const submissionId = cells[0].textContent;
    const baekjoonId = cells[1].querySelector('a').href.split('/').pop();
    const problemNumber = cells[2].querySelector('a').href.split('/').pop();
    const problemTitle = cells[2].querySelector('a').getAttribute('data-original-title');
    const resultText = cells[3].querySelector('.result-text').textContent;
    const memory = cells[4].textContent;
    const time = cells[5].textContent;
    const language = cells[6].textContent.split("/")[0].trim();
    const codeLength = cells[7].textContent;
    const submittedAt = convertToISO(cells[8].querySelector('.show-date').getAttribute('data-original-title'));

    return {
        submissionId,
        baekjoonId,
        problemNumber,
        problemTitle,
        resultText,
        memory,
        time,
        language,
        codeLength,
        submittedAt,
    };
}

async function getCodeFromStorage() {
    const result = await chrome.storage.local.get('submittedCode');
    if (result.submittedCode) {
        const code = result.submittedCode;
        await chrome.storage.local.remove('submittedCode');
        console.log(`submittedCode removed from storage.`);
        return code;
    } else {
        return undefined;
    }
}

async function sendJudgmentResultToServer(result) {
    const data = {...result};

    const response = await fetch(JUDGMENT_RESULT_SAVE_API_URL, {
        method: 'POST',
        credentials: "include",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error(MESSAGE_NETWORK_ERROR);
    }
}

async function sendCodeToS3(submissionId, problemNumber) {
    const submittedCode = await getCodeFromStorage(problemNumber);
    try {
        const response = await fetch(CODE_SAVE_API_URL + submissionId, {
            method: 'GET',
            credentials: "include"
        });

        const {url} = await response.json();
        await fetch(url, {
            method: 'PUT',
            body: submittedCode || MESSAGE_NO_SOURCE_CODE(submissionId)
        });

    } catch (error) {
        throw new Error(MESSAGE_NETWORK_ERROR);
    }
}

// Util
function convertToISO(dateStr) {
    const parts = dateStr.match(/(\d+)년 (\d+)월 (\d+)일 (\d+):(\d+):(\d+)/);
    const [_, year, month, day, hour, minute, second] = parts;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:${second.padStart(2, '0')}`;
}

function updateStatusMessage(message) {
    const statusDiv = document.getElementById('extension-status');
    const statusMessageSpan = document.getElementById('status-message');

    statusMessageSpan.textContent = message;
    statusDiv.style.display = 'block';
}

function createStatusDiv(statusTable) {
    const caption = document.createElement('span');
    caption.textContent = "My Coding Test 알림판";
    caption.style.display = 'block';
    caption.style.fontWeight = 'bold';
    caption.style.padding = '0px 10px';
    caption.style.marginBottom = '1px';

    const statusDiv = document.createElement('div');
    statusDiv.id = 'extension-status';
    statusDiv.style.display = 'block';
    statusDiv.style.padding = '10px';
    statusDiv.style.border = '1px solid #ddd';
    statusDiv.style.marginBottom = '20px';
    statusDiv.innerHTML = `<span id="status-message">${MESSAGE_WAITING}</span>`;

    statusTable.parentNode.insertBefore(caption, statusTable);
    statusTable.parentNode.insertBefore(statusDiv, statusTable);
}
