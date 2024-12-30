// 제출 버튼 클릭 이벤트 감지
document.querySelector('#submit_button').addEventListener('click', () => {
    // CodeMirror 텍스트 에디터에서 코드 가져오기
    const code = getCodeMirrorCode();

    // 코드를 저장 (Chrome Storage 사용)
    chrome.storage.local.set({ 'submittedCode': code }, () => {
        console.log('Code saved to storage');
    });
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