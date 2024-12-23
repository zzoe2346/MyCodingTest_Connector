// 제출 버튼 클릭 이벤트 감지 (이 부분은 이전과 동일)
document.querySelector('#submit_button').addEventListener('click', () => {
    // CodeMirror 텍스트 에디터에서 코드 가져오기
    const code = getCodeMirrorCode();
    console.log("코드 출력");
    console.log(code);

    // 코드를 저장 (Chrome Storage 사용)
    chrome.storage.local.set({ 'submittedCode': code }, () => {
        console.log('Code saved to storage');
    });
    //이제 결과창에서 합쳐서 보낼거라...
    //chrome.runtime.sendMessage({ type: 'code', data: code });
});

//제출할 코드 가져오기
function getCodeMirrorCode() {
    const codeLines = document.querySelectorAll('.CodeMirror-code .CodeMirror-line');
    let code = '';
    codeLines.forEach(line => {
        code += line.textContent + '\n';
    });
    return code;
}

// 결과 페이지 감지
let isCheckingResult = false;

// URL 변경 감지 함수
async function handleUrlChange() {
    console.log("Url변경됨");
    console.log("isCheckingResult " + isCheckingResult);
    if (window.location.href.includes('status')) {
        if (!isCheckingResult) {
            isCheckingResult = true;
            console.log("결과 읽기 시작");
            readResults();
        }
    } else {
        isCheckingResult = false;
    }
}

// 초기 URL 확인
handleUrlChange();

// URL 변경 감지를 위한 이벤트 리스너
window.addEventListener('popstate', handleUrlChange); // 브라우저 히스토리 변경 감지
window.addEventListener('hashchange', handleUrlChange); // URL 해시 변경 감지

async function readResults() {
    try {
        const response = await fetch(window.location.href);
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.status}`);
        }
        const text = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        const resultRows = doc.querySelectorAll('#status-table tbody tr');

        if (resultRows.length > 0) {
            let results = [];
            resultRows.forEach(row => {
                const cells = row.querySelectorAll('td');
                const submissionId = cells[0].textContent;
                const userId = cells[1].querySelector('a').href;
                const problemId = cells[2].querySelector('a').href;
                const resultText = cells[3].querySelector('.result-text').textContent;
                const memory = cells[4].textContent;
                const time = cells[5].textContent;
                const language = cells[6].textContent;
                const codeLength = cells[7].textContent;
                const submittedAt = cells[8].querySelector('.show-date').getAttribute('data-original-title');

                results.push({
                    submissionId,
                    userId,
                    problemId,
                    resultText,
                    memory,
                    time,
                    language,
                    codeLength,
                    submittedAt
                });
            });
            console.log("결과");
            console.log(results);
            chrome.runtime.sendMessage({ type: 'result', data: results });
        } else {
            console.log("결과 테이블이 비어 있습니다.");
        }
    } catch (error) {
        console.error("결과를 읽는 중 오류가 발생했습니다:", error);
    } finally {
        isCheckingResult = false;
    }
}