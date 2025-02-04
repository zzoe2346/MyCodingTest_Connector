document.querySelector('#submit_button').addEventListener('click', () => {
    const code = getCodeMirrorCode();
    chrome.storage.local.set({submittedCode: code});
});

function getProblemNumber(){
    const currentUrl = window.location.href;
    const parts = currentUrl.split("/");
    return parts[parts.length - 2];
}

function getCodeMirrorCode() {
    const codeLines = document.querySelectorAll('.CodeMirror-code .CodeMirror-line');
    let code = '';
    codeLines.forEach(line => {
        code += line.textContent + '\n';
    });
    return code;
}
