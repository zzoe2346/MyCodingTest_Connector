// #status-table 로딩 완료 여부 확인 변수
let tableLoaded = false;

// 채점 완료 여부 확인 변수
let isGradingDone = false;

// 테이블 로딩 및 채점 완료 대기 함수
function waitForTableLoadAndGrading() {
    return new Promise(resolve => {
        const checkInterval = setInterval(() => {
            const resultTable = document.querySelector('#status-table');
            if (resultTable && resultTable.querySelector('tbody tr')) {
                // 첫 번째 행의 결과 셀(4번째 td) 확인
                const firstResultCell = resultTable.querySelector('tbody tr td:nth-child(4)');

                // 결과 셀이 있고, 텍스트 내용이 "채점 중"만 포함하고 있지 않으면 채점 완료
                if (firstResultCell && (!firstResultCell.textContent.includes('채점')) && (!firstResultCell.textContent.includes('기다리는'))) {
                    clearInterval(checkInterval);
                    isGradingDone = true;
                    resolve(resultTable);
                }
            }
        }, 100); // 100ms 간격으로 테이블 및 채점 상태 확인
    });
}


// 결과 읽기 함수
async function readResults(resultTable) {
    try {
        // 첫 번째 행만 선택
        const firstRow = resultTable.querySelector('tbody tr');

        if (firstRow) {
            // 첫 번째 행의 각 셀 가져오기
            const cells = firstRow.querySelectorAll('td');
            const submissionId = cells[0].textContent;
            const baekjoonId = cells[1].querySelector('a').href;
            const problemId = cells[2].querySelector('a').href;
            const resultText = cells[3].querySelector('.result-text').textContent;
            const memory = cells[4].textContent;
            const time = cells[5].textContent;
            const language = cells[6].textContent;
            const codeLength = cells[7].textContent;
            const submittedAt = cells[8].querySelector('.show-date').getAttribute('data-original-title');

            // 저장된 코드 가져오기 (Chrome Storage 사용) 및 결과 처리
            chrome.storage.local.get('submittedCode', (data) => {
                if (data.submittedCode) {
                    const code = data.submittedCode;

                    // 결과 객체 생성
                    const result = {
                        code,
                        submissionId,
                        baekjoonId,
                        problemId,
                        resultText,
                        memory,
                        time,
                        language,
                        codeLength,
                        submittedAt,
                    };

                    // 코드와 결과 데이터를 서버로 전송
                    sendCodeAndResultToServer(result);

                    // (선택 사항) 전송 후 저장된 코드 삭제
                    chrome.storage.local.remove('submittedCode', () => {
                        console.log('Code removed from storage');
                    });
                } else {
                    console.log('저장된 코드가 없습니다.');
                }
            });
        } else {
            console.log('결과 테이블이 비어 있습니다.');
        }
    } catch (error) {
        console.error('결과를 읽는 중 오류가 발생했습니다:', error);
    }
}

// 페이지 로드 시 URL 확인
if (window.location.href.includes('status')) {
    // 테이블 로딩 및 채점 완료 대기
    waitForTableLoadAndGrading().then(readResults);
}

// 서버로 코드와 결과 데이터를 전송하는 함수
function sendCodeAndResultToServer(result) {
    // 서버 URL
    const serverUrl = 'http://localhost:8080/api/grading-result'  //'https://your-server.com/api/submit'; // 실제 서버 URL로 변경

    // 전송할 데이터
    const data = {
        ...result
    };

    console.log(JSON.stringify(data));

    // POST 요청 보내기
    fetch(serverUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Server response:', data);
        })
        .catch(error => {
            console.error('Error sending data to server:', error);
        });
}
