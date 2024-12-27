# BaekjoonLog
## 간단 설명
1. 백준에서 본인의 풀이 코드를 넣어서 제출하고 채점 결과가 나온다.
2. 아래의 `json`을 `body`로 하여 미리 지정해둔 서버로 `POST` HTTP 요청을 보낸다.

```json
{
  "code": "import java.io.BufferedReader;\nimport java.io.IOException;\nimport java.io.InputStreamReader;\nimport java.util.ArrayDeque;\nimport java.util.Arrays;\nimport java.util.Queue;\nimport java.util.StringTokenizer;\n​\nclass Main {\n    static int[] di = {1, -1, 0, 0};\n    static int[] dj = {0, 0, 1, -1};\n​\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        StringTokenizer st = new StringTokenizer(br.readLine());\n        int N = Integer.parseInt(st.nextToken());\n        int M = Integer.parseInt(st.nextToken());\n        st = new StringTokenizer(br.readLine());\n        int[] juNan = {Integer.parseInt(st.nextToken()), Integer.parseInt(st.nextToken()), 0};\n        int[] target = {Integer.parseInt(st.nextToken()), Integer.parseInt(st.nextToken())};\n        if (juNan[0] == target[0] && juNan[1] == target[1]) {\n​\n            System.out.println(0);\n            return;\n        }\n        char[][] map = new char[N + 1][M + 1];\n        for (int i = 1; i <= N; i++) {\n            String s = br.readLine();\n            for (int j = 1; j <= M; j++) {\n                map[i][j] = s.charAt(j - 1);\n            }\n        }\n        map[juNan[0]][juNan[1]] = '0';\n//1을 만나면 0으로 바꾸고\n        Queue<int[]> q = new ArrayDeque<>();\n        q.add(juNan);\n        int[][] visited = new int[N + 1][M + 1];\n        for (int i = 0; i <= N; i++) {\n            Arrays.fill(visited[i], Integer.MAX_VALUE);\n        }\n        visited[juNan[0]][juNan[1]] = 0;\n        int ans = Integer.MAX_VALUE;\n        while (!q.isEmpty()) {\n            int[] poll = q.poll(); // i , j , 여기까지의 누적 가중치\n            if (poll[0] == target[0] && poll[1] == target[1]) {\n                ans = Math.min(ans, poll[2] + 1);\n                continue;\n            }\n            for (int i = 0; i < 4; i++) {\n                int ni = poll[0] + di[i];\n                int nj = poll[1] + dj[i];\n​\n                //다음꺼를 큐에 넣어도 되는지 검증해야한다. 다음꺼!! 지금게 아니라\n                if (ni < 1 || ni > N || nj < 1 || nj > M) continue;\n                int nextWeight = poll[2] + (map[ni][nj] == '1' ? 1 : 0);\n                if (visited[ni][nj] <= nextWeight) continue;\n                visited[ni][nj] = nextWeight;\n                q.add(new int[]{ni, nj, nextWeight});\n            }\n​\n        }\n        System.out.println(ans);\n    }\n}\n​\n",
  "submissionId": "87877658",
  "baekjoonId": "https://www.acmicpc.net/user/zzoe2346",
  "problemId": "https://www.acmicpc.net/problem/14497",
  "resultText": "맞았습니다!!",
  "memory": "299268",
  "time": "888",
  "language": "Java 11 / 수정",
  "codeLength": "2448",
  "submittedAt": "2024년 12월 27일 20:39:23"
}
```
