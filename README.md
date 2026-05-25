# SFMC T-SQL Validator

Salesforce Marketing Cloud Automation Studio의 **Query Activity SQL**을 브라우저에서 바로 검증하는 도구입니다.

🔗 **라이브 사이트:** https://wonderful-fox-48914f.netlify.app

---

## 실행 방법

**온라인:** https://wonderful-fox-48914f.netlify.app 접속

**로컬:** 별도 설치 없이 `index.html`을 브라우저로 열면 바로 사용할 수 있습니다.

```
sfmc-query-validator/
├── index.html       ← 이 파일을 브라우저로 열기
├── validator.js     ← SFMC T-SQL 규칙 엔진
├── mock-runner.js   ← 브라우저 내 SQL 실행 (sql.js 기반)
└── style.css        ← 다크 테마 스타일
```

> **인터넷 연결 필요** — Monaco Editor, sql.js, Tailwind CSS를 CDN에서 불러옵니다.

---

## 주요 기능

### ✅ Validate 탭

SFMC T-SQL 문법 규칙을 자동으로 검사합니다.

| 유형 | 규칙 | 원인 |
|------|------|------|
| ❌ 오류 | `LIMIT` 사용 | T-SQL은 `SELECT TOP N` 사용 |
| ❌ 오류 | `NOW()` 사용 | `GETDATE()` 로 변경 필요 |
| ❌ 오류 | `DATE_ADD()` 사용 | `DATEADD(unit, n, date)` 로 변경 필요 |
| ❌ 오류 | `DATE_SUB()` 사용 | `DATEADD(unit, -n, date)` 로 변경 필요 |
| ❌ 오류 | `IFNULL()` 사용 | `ISNULL(col, default)` 로 변경 필요 |
| ❌ 오류 | `CONCAT_WS()` 사용 | `CONCAT()` 또는 `+` 연산자 사용 |
| ❌ 오류 | `GROUP_CONCAT()` 사용 | `STRING_AGG(col, sep)` 로 변경 필요 |
| ❌ 오류 | 백틱(`` ` ``) 사용 | 식별자는 `[이름]` 또는 `"이름"` 사용 |
| ⚠️ 경고 | `INTO` 절 없음 | Query Activity는 결과 DE 지정 필수 |
| ⚠️ 경고 | `SELECT *` 사용 | 필요한 컬럼만 명시 권장 |
| ⚠️ 경고 | 행 수 제한 없음 | `SELECT TOP N` 추가 권장 |
| ℹ️ 정보 | `DATEDIFF()` 인수 순서 | `DATEDIFF(단위, 시작, 종료)` 확인 |

**올바른 SFMC T-SQL 예시:**

```sql
SELECT TOP 1000
    c.ContactKey,
    c.Email,
    c.FirstName,
    o.OrderAmount
INTO [Result_DE]
FROM [Contact_DE] c
INNER JOIN [Order_DE] o
    ON c.ContactKey = o.ContactKey
WHERE o.OrderDate >= DATEADD(DAY, -30, GETDATE())
  AND ISNULL(c.OptOut, 'N') = 'N'
```

---

### ▶ Mock Run 탭

실제 SFMC 연결 없이 가짜 데이터로 쿼리 결과를 미리 확인합니다.

**사용 방법:**

1. `+ DE 추가` 버튼 클릭
2. DE 이름 입력 (SQL에서 사용할 테이블명과 동일하게)
3. CSV 형식으로 샘플 데이터 입력

```
ContactKey,Email,Name,OrderAmount
001,a@test.com,홍길동,50000
002,b@test.com,김영희,30000
003,c@test.com,이민준,80000
```

4. 왼쪽 에디터에 SQL 작성 (INTO 절은 자동으로 제거됨)
5. `▶ Mock 실행` 클릭 → 결과 테이블 확인

> **참고:** Mock Run은 내부적으로 SQLite(sql.js)를 사용합니다.
> `GETDATE()`는 `datetime('now')`로, `DATEADD(DAY, n, date)`는 SQLite 날짜 함수로 자동 변환됩니다.
> 복잡한 T-SQL 함수는 변환이 제한될 수 있습니다.

---

### 🔗 Connect SFMC 탭

SFMC Installed Package 자격증명으로 실제 연결을 테스트합니다.

> **CORS 제한:** 브라우저에서 SFMC API를 직접 호출하면 CORS 오류가 발생합니다.
> 로컬 프록시를 사용하면 우회할 수 있습니다:
>
> ```bash
> npx local-cors-proxy --proxyUrl https://[subdomain].auth.marketingcloudapis.com
> ```

---

## Installed Package 발급 방법

1. SFMC → **Setup** → **Installed Packages** → `[New]`
2. 이름 입력 후 **Add Component** → **API Integration** → **Server-to-Server**
3. 권한 설정:
   - Journeys: **Read**
   - Data Extensions: **Read / Write**
4. 저장 후 **Client Id**, **Client Secret**, **Subdomain** 복사

---

## 일반 SQL vs SFMC T-SQL 비교표

| 기능 | 일반 SQL (MySQL 등) | SFMC T-SQL |
|------|---------------------|------------|
| 행 수 제한 | `LIMIT 100` | `SELECT TOP 100` |
| 현재 시각 | `NOW()` | `GETDATE()` |
| 날짜 더하기 | `DATE_ADD(date, INTERVAL 7 DAY)` | `DATEADD(DAY, 7, date)` |
| 날짜 빼기 | `DATE_SUB(date, INTERVAL 7 DAY)` | `DATEADD(DAY, -7, date)` |
| 날짜 차이 | `DATEDIFF(date1, date2)` | `DATEDIFF(DAY, date1, date2)` |
| NULL 대체 | `IFNULL(col, 'x')` | `ISNULL(col, 'x')` |
| 문자열 합치기 | `CONCAT_WS(',', a, b)` | `a + ',' + b` 또는 `CONCAT(a, ',', b)` |
| 식별자 감싸기 | `` `테이블명` `` | `[테이블명]` |
| 결과 저장 | 없음 (클라이언트 처리) | `INTO [결과DE명]` 필수 |

---

## 기술 스택

- [Monaco Editor](https://microsoft.github.io/monaco-editor/) — SQL 에디터 (VS Code와 동일 엔진)
- [sql.js](https://sql.js.org/) — 브라우저 내 SQLite (WebAssembly)
- Vanilla JavaScript — 프레임워크 없음
