# BaekjoonLog
## 간단 설명
1. 백준에서 본인의 풀이 코드를 넣어서 제출하고 채점 결과가 나온다.
2. 아래의 `json`을 `body`로 하여 미리 지정해둔 서버로 `POST` HTTP 요청을 보낸다.

```json
{
  "code": "import java.io.BufferedReader;\nimport java.io.IOException;\nimport java.io.InputStreamReader;\nimport java.util.StringTokenizer;\n​\nclass Main {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n​\n        int[][][] dp = new int[1001][1001][2];\n        dp[2][0][0] = 2;\n        dp[2][0][1] = 1;\n        dp[2][1][1] = 1; // n == 2, k == 1 그리고 끝이 1로 끝나는 경우의 수\n        for (int n = 3; n < 1001; n++) {\n            for (int k = 0; k < 1001; k++) { // k = 1 부터 시작했었음 그러니 틀림! 왜? 빼먹었으니\n                dp[n][k][0] += dp[n - 1][k][0];// 길이가 1작은거중에서 k가\n                dp[n][k][1] += dp[n - 1][k][0];\n                dp[n][k][0] += dp[n - 1][k][1];\n                if (k != 0) dp[n][k][1] += dp[n - 1][k - 1][1];\n​\n            }\n        }\n​\n        StringBuilder sb = new StringBuilder();\n        int T = Integer.parseInt(br.readLine());\n        for (int t = 0; t < T; t++) {\n            StringTokenizer st = new StringTokenizer(br.readLine());\n            int n = Integer.parseInt(st.nextToken());\n            int k = Integer.parseInt(st.nextToken());\n            sb.append(dp[n][k][0] + dp[n][k][1] + \"\\n\");\n        }\n        System.out.printf(sb.toString());\n​\n    }\n}\n​\n",
  "result": {
    "submissionId": "87819421",
    "userId": "https://www.acmicpc.net/user/zzoe2346",
    "problemId": "https://www.acmicpc.net/problem/2698",
    "resultText": "맞았습니다!!",
    "memory": "42540",
    "time": "204",
    "language": "Java 11 / 수정",
    "codeLength": "1332",
    "submittedAt": "2024년 12월 26일 12:47:20"
  }
}
```
