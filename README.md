# SFMC Query Validator

Salesforce Marketing Cloud의 **SQL Query Activity(Automation Studio)** 및 **Journey Custom Activity(MySQL)** 쿼리를 브라우저에서 바로 검증·자동수정하는 도구입니다.

🔗 **라이브 사이트:** https://10se0hyun02.github.io/sfmc-query-validator/

---

## 실행 방법

**온라인:** https://10se0hyun02.github.io/sfmc-query-validator/ 접속

**로컬:** 별도 설치 없이 `index.html`을 브라우저로 열면 바로 사용할 수 있습니다.

```
sfmc-query-validator/
├── index.html            ← 이 파일을 브라우저로 열기
├── validator.js          ← SFMC T-SQL / MySQL 규칙 엔진 + 자동수정
├── data-schema.js        ← 고객사 DE 스키마 정의 (테이블명, CustomerKey, 컬럼 구조)
├── worker.js             ← Cloudflare Worker CORS 프록시 (배포용)
├── wrangler.toml         ← Cloudflare Workers 배포 설정
└── style.css             ← 다크/라이트 테마 스타일
```

> **인터넷 연결 필요** — Monaco Editor, Tailwind CSS를 CDN에서 불러옵니다.

---

## 모드 탭

### 🤖 Automation (T-SQL)

Automation Studio SQL Query Activity용 T-SQL 쿼리를 검증합니다.

### ⚙️ CustomActivity (MySQL)

Journey Custom Activity에서 레거시 DB(Oracle → MySQL 연동)로 INSERT/UPDATE하는 쿼리를 검증합니다.
상단의 테이블 탭을 클릭하면 캠페인별 SQL 템플릿이 자동으로 로드됩니다.

| 테이블 탭 | 대상 테이블 | 용도 |
|-----------|-------------|------|
| SS_HIST | SS_SERVICE_ACTION_HIST | 서비스 실행 이력 적재 |
| SS_HIST_DTL | SS_SERVICE_ACTION_HIST_DTL | 서비스 실행 이력 상세 적재 |
| CA_MAIL | CA_MAIL_LIST | 이메일 발송 요청 적재 |
| CA_SMS | CA_SMS_LIST | SMS/알림톡 발송 요청 적재 |
| CA_CMC_TGT | CA_CMC_TARGET_LIST | CMC 발송 대상자 적재 |
| CA_CMC_CMP | CA_CMC_CAMPAIGN | CMC 캠페인 대상자 수 갱신 |

---

## 주요 기능

### ✅ 검사 결과 탭

#### T-SQL 검증 규칙 (Automation Studio)

**비지원 명령 (❌ 오류)**

| 규칙 | 설명 |
|------|------|
| UPDATE / DELETE | Query Activity는 SELECT 전용 |
| CREATE / DROP / ALTER / TRUNCATE / MERGE | DDL/DML 불가 |
| EXEC / EXECUTE | 저장 프로시저 호출 불가 |
| #temp 임시 테이블 | 별도 DE에 저장할 것 |
| DECLARE / @변수 | 변수 선언 불가 |
| PIVOT / UNPIVOT | CASE WHEN으로 대체 |
| CURSOR / WHILE | 단일 SELECT만 실행 가능 |
| BEGIN TRAN / COMMIT / ROLLBACK | 트랜잭션 불가 |
| BEGIN TRY / BEGIN CATCH | 예외 처리 불가 |
| FOR XML / FOR JSON | 포맷 변환 불가 |
| GO / SET / USE / PRINT / WAITFOR | 지원 안됨 |
| BULK INSERT / OPENQUERY 등 | 외부 접근 불가 |

**MySQL 함수 오용 (❌ 오류)**

| MySQL | T-SQL 대체 |
|-------|-----------|
| `LIMIT N` | `SELECT TOP N` |
| `NOW()` | `GETDATE()` |
| `DATE_ADD()` | `DATEADD(단위, N, 날짜)` |
| `DATE_SUB()` | `DATEADD(단위, -N, 날짜)` |
| `DATE_FORMAT()` | `FORMAT(날짜, '포맷')` |
| `IFNULL()` | `ISNULL(컬럼, 기본값)` |
| `CONCAT_WS()` | `CONCAT()` 또는 `+` |
| `GROUP_CONCAT()` | `STRING_AGG(컬럼, 구분자)` |
| `CHAR_LENGTH()` / `LENGTH()` | `LEN()` |
| `LOCATE()` | `CHARINDEX()` |
| `IF()` | `IIF()` 또는 `CASE WHEN` |
| `STR_TO_DATE()` | `CONVERT(DATE, ...)` |
| `TIMESTAMPDIFF()` | `DATEDIFF(단위, 시작, 종료)` |
| `REPEAT()` | `REPLICATE()` |
| `CURRENT_DATE` / `CURRENT_TIME` | `CAST(GETDATE() AS DATE/TIME)` |
| `REGEXP` / `RLIKE` | `LIKE` |

**Oracle 함수 오용 (❌ 오류)**

| Oracle | T-SQL 대체 |
|--------|-----------|
| `SYSDATE` | `GETDATE()` |
| `NVL()` / `NVL2()` | `ISNULL()` / `IIF()` |
| `TO_CHAR()` | `FORMAT()` 또는 `CONVERT(VARCHAR, ...)` |
| `TO_DATE()` / `TO_NUMBER()` | `CONVERT(DATE, ...)` / `CAST(... AS DECIMAL)` |
| `DECODE()` | `CASE WHEN` |
| `ROWNUM` | `SELECT TOP N` 또는 `ROW_NUMBER()` |
| `FROM DUAL` | `FROM` 절 생략 |
| `CONNECT BY` | 재귀 CTE |
| `INSTR()` | `CHARINDEX()` (인수 순서 반대 주의) |
| `LPAD()` / `RPAD()` | `RIGHT(REPLICATE(...) + ...)` 패턴 |
| `GREATEST()` / `LEAST()` | `CASE WHEN` 또는 `IIF()` |

**기타 문법 오류 (❌ 오류)**

| 규칙 | 설명 |
|------|------|
| 백틱(`` ` ``) 사용 | 식별자는 `[이름]` 사용 |
| `\|\|` 문자열 연결 | `+` 또는 `CONCAT()` 사용 |
| `#` 주석 | `--` 또는 `/* */` 사용 |
| `SELECT TOP N,` — 콤마 직후 | TOP N 뒤 바로 컬럼명 |
| 콤마 누락 (SELECT 절) | 컬럼 사이 콤마 확인 |
| `CAST(x AS SIGNED/UNSIGNED)` | `CAST(x AS INT/BIGINT)` |
| `ILIKE` | `LIKE` |
| `EXTRACT(unit FROM date)` | `DATEPART(단위, 날짜)` |
| `POSITION()` | `CHARINDEX()` |

**경고 / 정보 (⚠️ / ℹ️)**

| 유형 | 규칙 |
|------|------|
| ⚠️ 경고 | `SELECT TOP N` 없음 — 최대 행 수 제한 권장 |
| ⚠️ 경고 | `SELECT *` 사용 — 필요한 컬럼만 명시 권장 |
| ⚠️ 경고 | 쿼리 끝 세미콜론(`;`) — SFMC에서 오류 유발 가능 |
| ⚠️ 경고 | `TRIM()` — SQL Server 2017 미만 미지원 가능 |
| ℹ️ 정보 | `DATEDIFF()` 인수 순서 확인 (T-SQL ≠ MySQL) |

---

#### MySQL 검증 규칙 (Journey CustomActivity)

**오류 (❌)**

| 규칙 | 설명 |
|------|------|
| T-SQL 함수 오용 | `GETDATE()`, `ISNULL()`, `LEN()`, `DATEADD()`, `STRING_AGG()`, `CHARINDEX()`, `GETUTCDATE()`, `NVARCHAR` |
| UPDATE without WHERE | 전체 행 변경 방지 |
| `SELECT TOP` | MySQL에서는 `LIMIT` 사용 |
| `[대괄호]` 식별자 | MySQL에서는 백틱(`` ` ``) 사용 |
| 컬럼/VALUES 수 불일치 | INSERT 열 수 확인 |
| INSERT/UPDATE 콤마 누락 | 컬럼 목록/SET 절 확인 |

**경고 / 정보 (⚠️ / ℹ️)**

| 유형 | 규칙 |
|------|------|
| ⚠️ 경고 | INSERT/UPDATE 문 없음 — CustomActivity 목적 확인 |
| ⚠️ 경고 | `DATEDIFF()` 인수 순서 (MySQL ≠ T-SQL) |
| ℹ️ 정보 | `[[Journey 변수]]` 감지 및 목록 표시 |
| ℹ️ 정보 | 쿼리 끝 세미콜론(`;`) 없음 |

---

### 🔧 자동 수정 (Auto-fix)

**수정** 버튼을 클릭하면 감지된 오류를 자동으로 T-SQL(또는 MySQL) 문법으로 변환합니다.
수정된 라인에는 `-- [수정] 항목명` 주석이 자동 추가됩니다.

**T-SQL 자동수정 항목:**

`백틱 → []`, `|| → +`, `SYSDATE/NOW() → GETDATE()`, `NVL/IFNULL → ISNULL()`,
`TO_CHAR → FORMAT()`, `DATE_FORMAT → FORMAT()`, `DATE_ADD/DATE_SUB → DATEADD()`,
`LIMIT → SELECT TOP N`, `GROUP_CONCAT → STRING_AGG()`, `CHAR_LENGTH/LENGTH → LEN()`,
`LOCATE → CHARINDEX()`, `SUBSTR → SUBSTRING()`, `TRIM → LTRIM(RTRIM())`,
`# 주석 → --`, `MOD() → %`, `CEIL → CEILING()`, `IF() → IIF()`,
`INSTR → CHARINDEX()` (인수 순서 자동 교환), `EXTRACT → DATEPART()`,
`TIMESTAMPDIFF → DATEDIFF()`, `REPEAT → REPLICATE()`,
`CURRENT_DATE/TIME → CAST(GETDATE() AS DATE/TIME)`,
`STR_TO_DATE → CONVERT(DATE, ...)`, `ILIKE → LIKE`,
`CAST(x AS SIGNED/UNSIGNED) → INT/BIGINT`, 말미 세미콜론 제거

**MySQL 자동수정 항목:**

`SYSDATE/GETDATE → NOW()`, `NVL/ISNULL → IFNULL()`,
`TO_CHAR → DATE_FORMAT()` (Oracle 포맷 자동 변환),
`DATEADD → DATE_ADD/DATE_SUB()`, `SELECT TOP → LIMIT`,
`STRING_AGG → GROUP_CONCAT()`, `LEN → CHAR_LENGTH()`,
`CHARINDEX → LOCATE()`, `SUBSTR → SUBSTRING()`,
`LTRIM(RTRIM()) → TRIM()`, `[대괄호] → 백틱`, `<> → !=`,
trailing 콤마 제거, 말미 세미콜론 추가, 작은따옴표 이스케이프 교정

---

### 📌 스니펫 삽입

에디터 상단의 스니펫 버튼을 클릭하면 자주 쓰는 코드가 커서 위치에 삽입됩니다.

**T-SQL 스니펫:** `TOP N`, `GETDATE()`, `DATEADD`, `DATEDIFF`, `DATEPART`, `FORMAT`, `ISNULL`, `IIF`, `COALESCE`, `CAST`, `JOIN`, `ROW_NUMBER`, `STRING_AGG`, `WITH CTE`, `RANDOM`

**MySQL 스니펫:** `NOW()`, `IFNULL`, `DATE_ADD`, `DATEDIFF`, `[[변수]]`

Monaco Editor에서 SQL 함수명을 타이핑하면 자동완성도 동작합니다.  
`data-schema.js`에 정의된 DE 테이블명·컬럼명도 자동완성에 포함됩니다.

---

### 📋 DE 스키마 탭 (Automation 전용)

Automation(T-SQL) 모드 우측 패널의 **📋 DE 스키마** 탭에서 `data-schema.js`에 정의된 DE 구조를 SFMC 연결 없이 바로 조회할 수 있습니다.

- DE명을 입력하면 자동완성 드롭다운으로 빠르게 검색
- DE 선택 시 컬럼명, 타입, 길이, PK 여부, 필수 여부를 테이블로 표시
- `data-schema.js`의 `DATA_SCHEMA` 객체에 고객사별 스키마를 추가해 사용

---

### 💾 저장 / 불러오기

**저장** 버튼으로 현재 쿼리에 이름을 붙여 브라우저 `localStorage`에 저장할 수 있습니다.  
**불러오기** 버튼으로 저장한 쿼리 목록을 확인하고 재사용합니다.  
T-SQL, MySQL 별로 독립적으로 저장됩니다.

---

### 🔗 DE 연결 탭

SFMC Installed Package 자격증명으로 실제 연결을 테스트하고 Data Extension을 조회합니다.

**공유 연결:** Automation 탭과 CustomActivity 탭은 연결 정보를 공유합니다.  
한 탭에서 연결하면 양쪽에 동시 적용됩니다.

**DE 목록 불러오기:** SOAP API로 계정 내 전체 DE 목록을 로드한 뒤 이름으로 검색합니다.  
SFMC 관리 페이지 URL을 그대로 붙여넣으면 External Key가 자동 추출됩니다.

**DE 조회:** External Key로 실제 데이터 미리보기(최대 10행)를 확인합니다.

> **CORS 프록시 필요** — 브라우저에서 SFMC API를 직접 호출하면 CORS 오류가 발생합니다.  
> 팀 공용 Cloudflare Worker를 사용하거나 아래 방법으로 직접 배포하세요.

---

## Cloudflare Worker 프록시 설정

SFMC API는 CORS 정책으로 브라우저에서 직접 호출이 차단됩니다.  
`worker.js`를 Cloudflare Worker로 무료 배포하면 프록시를 통해 우회할 수 있습니다.

```
1. workers.cloudflare.com → 무료 계정 생성
2. "Create a Worker" → worker.js 내용 붙여넣기 → 배포
3. 배포된 Worker URL을 "프록시 URL" 입력란에 붙여넣기
```

또는 Wrangler CLI로 배포:

```bash
npx wrangler deploy
```

---

## Installed Package 발급 방법

1. SFMC → **Setup** → **Installed Packages** → `[New]`
2. 이름 입력 후 **Add Component** → **API Integration** → **Server-to-Server**
3. 권한 설정:
   - Data Extensions: **Read / Write**
   - (선택) Journeys: **Read**
4. 저장 후 **Client Id**, **Client Secret**, **Subdomain** 복사

> DE 목록 불러오기(`SOAP`)에는 Data Extensions **Read** 권한이 필요합니다.

---

## 일반 SQL vs SFMC T-SQL 비교표

| 기능 | MySQL | Oracle | SFMC T-SQL |
|------|-------|--------|------------|
| 행 수 제한 | `LIMIT 100` | `ROWNUM <= 100` | `SELECT TOP 100` |
| 현재 시각 | `NOW()` | `SYSDATE` | `GETDATE()` |
| 날짜 더하기 | `DATE_ADD(date, INTERVAL 7 DAY)` | `SYSDATE + 7` | `DATEADD(DAY, 7, date)` |
| 날짜 빼기 | `DATE_SUB(date, INTERVAL 7 DAY)` | `SYSDATE - 7` | `DATEADD(DAY, -7, date)` |
| 날짜 차이 | `DATEDIFF(date1, date2)` | — | `DATEDIFF(DAY, date1, date2)` |
| 날짜 포맷 | `DATE_FORMAT(date, '%Y%m%d')` | `TO_CHAR(date, 'YYYYMMDD')` | `FORMAT(date, 'yyyyMMdd')` |
| NULL 대체 | `IFNULL(col, 'x')` | `NVL(col, 'x')` | `ISNULL(col, 'x')` |
| 문자열 합치기 | `CONCAT_WS(',', a, b)` | `a \|\| ',' \|\| b` | `a + ',' + b` |
| 문자열 길이 | `CHAR_LENGTH(col)` | `LENGTH(col)` | `LEN(col)` |
| 식별자 감싸기 | `` `테이블명` `` | `"테이블명"` | `[테이블명]` |
| 결과 저장 | 없음 | 없음 | `INTO [결과DE명]` 필수 |
| 조건 분기 | `IF(cond, a, b)` | `DECODE()` | `IIF(cond, a, b)` |
| 행 번호 | — | `ROWNUM` | `ROW_NUMBER() OVER (ORDER BY ...)` |
| 문자 반복 | `REPEAT('0', 5)` | `LPAD(n, 5, '0')` | `REPLICATE('0', 5)` |

---

## 올바른 SFMC T-SQL 예시

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

## 기술 스택

- [Monaco Editor](https://microsoft.github.io/monaco-editor/) — SQL 에디터 (VS Code와 동일 엔진), 자동완성 포함
- [Cloudflare Workers](https://workers.cloudflare.com/) — CORS 프록시 (worker.js)
- Vanilla JavaScript — 프레임워크 없음
- SFMC REST API — DE 데이터 미리보기
- SFMC SOAP API — DE 목록 조회
