// SFMC SQL Query Activity (Automation Studio) T-SQL 규칙
// ref: https://help.salesforce.com/s/articleView?id=sf.mc_as_sql_query_activity_tips.htm
const SFMC_RULES = [

  // ════════════════════════════════════════════════════════
  // 1. 비지원 명령 — Query Activity는 SELECT 전용
  // ════════════════════════════════════════════════════════
  {
    id: 'no-dml',
    type: 'error',
    message: 'UPDATE / DELETE는 SQL Query Activity에서 사용할 수 없습니다.',
    suggestion: 'Query Activity는 SELECT 전용입니다.\nDML이 필요하면 Script Activity(SSJS)를 사용하세요.',
    check: (sql) => /^\s*(UPDATE|DELETE)\b/im.test(sql),
  },
  {
    id: 'no-ddl',
    type: 'error',
    message: 'CREATE / DROP / ALTER는 SQL Query Activity에서 사용할 수 없습니다.',
    suggestion: 'Query Activity는 SELECT 전용입니다.',
    check: (sql) => /^\s*(CREATE|DROP|ALTER)\b/im.test(sql),
  },
  {
    id: 'no-truncate',
    type: 'error',
    message: 'TRUNCATE TABLE은 SQL Query Activity에서 사용할 수 없습니다.',
    suggestion: 'DE 초기화는 SFMC UI 또는 Script Activity(SSJS)를 사용하세요.',
    check: (sql) => /\bTRUNCATE\s+TABLE\b/i.test(sql),
  },
  {
    id: 'no-merge',
    type: 'error',
    message: 'MERGE 구문은 SQL Query Activity에서 사용할 수 없습니다.',
    suggestion: 'Query Activity는 SELECT 전용입니다.',
    check: (sql) => /^\s*MERGE\b/im.test(sql),
  },
  {
    id: 'no-exec',
    type: 'error',
    message: 'EXEC / EXECUTE는 SQL Query Activity에서 사용할 수 없습니다.',
    suggestion: '저장 프로시저 호출은 지원되지 않습니다.',
    check: (sql) => /^\s*EXEC(UTE)?\b/im.test(sql),
  },
  {
    id: 'no-temp-table',
    type: 'error',
    message: '임시 테이블(#temp)은 SQL Query Activity에서 지원되지 않습니다.',
    suggestion: '중간 결과는 별도 Data Extension에 저장하세요.',
    check: (sql) => /#\w+/.test(sql),
  },
  {
    id: 'no-declare',
    type: 'error',
    message: 'DECLARE 변수 선언은 SQL Query Activity에서 지원되지 않습니다.',
    suggestion: '변수 대신 값을 직접 쿼리에 작성하거나 CTE(WITH 절)를 활용하세요.',
    check: (sql) => /\bDECLARE\b/i.test(sql),
  },
  {
    id: 'no-table-variable',
    type: 'error',
    message: '테이블 변수(@var)는 SQL Query Activity에서 지원되지 않습니다.',
    suggestion: '중간 결과는 별도 Data Extension에 저장하세요.',
    check: (sql) => /\b(FROM|JOIN)\s+@\w+/i.test(sql),
  },
  {
    id: 'no-pivot',
    type: 'error',
    message: 'PIVOT / UNPIVOT은 SQL Query Activity에서 지원되지 않습니다.',
    suggestion: "CASE WHEN 으로 피벗을 구현하세요.\n예) MAX(CASE WHEN col='A' THEN val END) AS A",
    check: (sql) => /\bPIVOT\b|\bUNPIVOT\b/i.test(sql),
  },
  {
    id: 'no-cursor',
    type: 'error',
    message: 'CURSOR는 SQL Query Activity에서 지원되지 않습니다.',
    suggestion: 'Query Activity는 단일 SELECT 문만 실행합니다.',
    check: (sql) => /\bCURSOR\b/i.test(sql),
  },
  {
    id: 'no-while',
    type: 'error',
    message: 'WHILE 루프는 SQL Query Activity에서 지원되지 않습니다.',
    suggestion: 'Query Activity는 단일 SELECT 문만 실행합니다.',
    check: (sql) => /\bWHILE\b/i.test(sql),
  },
  {
    id: 'no-go',
    type: 'error',
    message: 'GO는 SQL Query Activity에서 사용할 수 없습니다.',
    suggestion: 'GO를 제거하고 단일 SELECT 쿼리만 작성하세요.',
    check: (sql) => /^\s*GO\s*$/im.test(sql),
  },
  {
    id: 'no-print',
    type: 'error',
    message: 'PRINT는 SQL Query Activity에서 지원되지 않습니다.',
    suggestion: 'PRINT를 제거하세요. Query Activity는 콘솔 출력을 지원하지 않습니다.',
    check: (sql) => /\bPRINT\b/i.test(sql),
  },
  {
    id: 'no-transaction',
    type: 'error',
    message: 'BEGIN TRAN / COMMIT / ROLLBACK은 SQL Query Activity에서 지원되지 않습니다.',
    suggestion: 'Query Activity는 트랜잭션 제어를 지원하지 않습니다. 단일 SELECT 문만 사용하세요.',
    pattern: /\b(BEGIN\s+TRAN(SACTION)?|COMMIT|ROLLBACK|SAVE\s+TRAN(SACTION)?)\b/i,
  },
  {
    id: 'no-try-catch',
    type: 'error',
    message: 'BEGIN TRY / BEGIN CATCH는 SQL Query Activity에서 지원되지 않습니다.',
    suggestion: 'Query Activity는 단일 SELECT 문만 실행합니다.',
    pattern: /\b(BEGIN\s+TRY|BEGIN\s+CATCH|END\s+TRY|END\s+CATCH)\b/i,
  },
  {
    id: 'no-set-statement',
    type: 'error',
    message: 'SET 구문은 SQL Query Activity에서 지원되지 않습니다.',
    suggestion: 'SET NOCOUNT ON 등의 구문을 제거하세요. Query Activity는 단일 SELECT만 실행합니다.',
    pattern: /^\s*SET\s+(NOCOUNT|QUOTED_IDENTIFIER|ANSI_NULLS|ANSI_PADDING|CONCAT_NULL_YIELDS_NULL|ARITHABORT|ROWCOUNT|TRANSACTION\s+ISOLATION)\b/im,
  },
  {
    id: 'no-use',
    type: 'error',
    message: 'USE [데이터베이스] 구문은 SQL Query Activity에서 지원되지 않습니다.',
    suggestion: 'USE 구문을 제거하세요. SFMC Data Extension은 별도 DB 지정 없이 직접 참조합니다.',
    pattern: /^\s*USE\s+[\["\w]/im,
  },
  {
    id: 'no-for-xml-json',
    type: 'error',
    message: 'FOR XML / FOR JSON은 SQL Query Activity에서 지원되지 않습니다.',
    suggestion: 'XML/JSON 변환이 필요하면 Script Activity(SSJS)를 활용하세요.',
    pattern: /\bFOR\s+(XML|JSON)\b/i,
  },
  {
    id: 'no-bulk-insert',
    type: 'error',
    message: 'BULK INSERT는 SQL Query Activity에서 지원되지 않습니다.',
    suggestion: '외부 파일 가져오기는 SFMC Import Activity를 사용하세요.',
    pattern: /^\s*BULK\s+INSERT\b/im,
  },
  {
    id: 'no-waitfor',
    type: 'error',
    message: 'WAITFOR는 SQL Query Activity에서 지원되지 않습니다.',
    suggestion: 'Query Activity 실행 시간 제어는 Automation Studio 스케줄로 관리하세요.',
    pattern: /\bWAITFOR\b/i,
  },
  {
    id: 'no-openquery',
    type: 'error',
    message: 'OPENQUERY / OPENROWSET / OPENDATASOURCE는 SQL Query Activity에서 지원되지 않습니다.',
    suggestion: '외부 데이터 소스 직접 접근은 지원되지 않습니다.',
    pattern: /\b(OPENQUERY|OPENROWSET|OPENDATASOURCE)\b/i,
  },
  {
    id: 'no-raiserror',
    type: 'error',
    message: 'RAISERROR / THROW는 SQL Query Activity에서 지원되지 않습니다.',
    suggestion: '오류 처리 구문을 제거하세요. Query Activity는 자체적으로 오류를 Automation Studio에 기록합니다.',
    pattern: /\b(RAISERROR|THROW)\b/i,
  },

  // ════════════════════════════════════════════════════════
  // 2. T-SQL 문법 오류
  // ════════════════════════════════════════════════════════
  {
    id: 'select-top-comma',
    pattern: /\bSELECT\s+TOP\s+\d+\s*,/i,
    type: 'error',
    message: 'SELECT TOP N 바로 뒤에 콤마(,)가 있습니다.',
    suggestion: 'TOP N 뒤에는 바로 컬럼명이 와야 합니다.\n예) SELECT TOP 1000\n    c.ContactKey,\n    c.Email',
  },
  {
    id: 'no-backtick',
    pattern: /`/,
    type: 'error',
    message: '백틱(`)은 T-SQL에서 지원되지 않습니다.',
    suggestion: '식별자는 대괄호 [] 로 감싸세요.\n예) [Contact DE], [Email Address]',
  },
  {
    id: 'no-pipe-concat',
    pattern: /\|\|/,
    type: 'error',
    message: '|| 는 Oracle/PostgreSQL 문자열 연결 연산자입니다. T-SQL에서 지원되지 않습니다.',
    suggestion: "+ 또는 CONCAT() 을 사용하세요.\n예) FirstName + ' ' + LastName",
  },
  {
    id: 'no-semicolon',
    type: 'warning',
    message: '쿼리 끝에 세미콜론(;)이 있습니다.',
    suggestion: 'SFMC SQL Query Activity에서 세미콜론은 불필요하며 오류를 유발할 수 있습니다.',
    check: (sql) => /;\s*$/.test(sql.trim()),
  },
  {
    id: 'select-star',
    type: 'warning',
    message: 'SELECT * 는 성능 저하를 유발할 수 있습니다.',
    suggestion: '필요한 컬럼만 명시적으로 지정하세요.\n예) SELECT c.ContactKey, c.Email FROM ...',
    check: (sql) => /\bSELECT\s+(TOP\s+\d+\s+)?\*/i.test(sql),
  },
  {
    id: 'no-hash-comment',
    type: 'error',
    message: '# 주석 스타일은 T-SQL에서 지원되지 않습니다.',
    suggestion: '-- 또는 /* */ 주석을 사용하세요.\n예) -- 이것은 주석입니다\n    /* 블록 주석 */',
    check: (sql) => /^[ \t]*#(?!\w)/m.test(sql),
  },

  // ════════════════════════════════════════════════════════
  // 3. MySQL 함수/문법 오용
  // ════════════════════════════════════════════════════════
  {
    id: 'no-limit',
    pattern: /\bLIMIT\s+\d+/i,
    type: 'error',
    message: 'LIMIT 은 MySQL 문법입니다. T-SQL에서 지원되지 않습니다.',
    suggestion: 'SELECT TOP N 을 사용하세요.\n예) SELECT TOP 1000 ...',
  },
  {
    id: 'no-now',
    pattern: /\bNOW\s*\(\s*\)/i,
    type: 'error',
    message: 'NOW() 는 MySQL 함수입니다. T-SQL에서 지원되지 않습니다.',
    suggestion: 'GETDATE() 를 사용하세요.',
  },
  {
    id: 'no-date-add',
    pattern: /\bDATE_ADD\s*\(/i,
    type: 'error',
    message: 'DATE_ADD() 는 MySQL 함수입니다. T-SQL에서 지원되지 않습니다.',
    suggestion: 'DATEADD(단위, N, 날짜) 를 사용하세요.\n예) DATEADD(DAY, -30, GETDATE())',
  },
  {
    id: 'no-date-sub',
    pattern: /\bDATE_SUB\s*\(/i,
    type: 'error',
    message: 'DATE_SUB() 는 MySQL 함수입니다. T-SQL에서 지원되지 않습니다.',
    suggestion: 'DATEADD(단위, -N, 날짜) 를 사용하세요.\n예) DATEADD(DAY, -30, GETDATE())',
  },
  {
    id: 'no-date-format',
    pattern: /\bDATE_FORMAT\s*\(/i,
    type: 'error',
    message: 'DATE_FORMAT() 는 MySQL 함수입니다. T-SQL에서 지원되지 않습니다.',
    suggestion: "FORMAT(날짜, '포맷') 을 사용하세요.\n예) FORMAT(GETDATE(), 'yyyy-MM-dd')",
  },
  {
    id: 'no-ifnull',
    pattern: /\bIFNULL\s*\(/i,
    type: 'error',
    message: 'IFNULL() 는 MySQL 함수입니다. T-SQL에서 지원되지 않습니다.',
    suggestion: "ISNULL(컬럼, 기본값) 를 사용하세요.\n예) ISNULL(Email, '')",
  },
  {
    id: 'no-concat-ws',
    pattern: /\bCONCAT_WS\s*\(/i,
    type: 'error',
    message: 'CONCAT_WS() 는 MySQL 함수입니다. T-SQL에서 지원되지 않습니다.',
    suggestion: "CONCAT() 또는 + 연산자를 사용하세요.\n예) FirstName + ' ' + LastName",
  },
  {
    id: 'no-group-concat',
    pattern: /\bGROUP_CONCAT\s*\(/i,
    type: 'error',
    message: 'GROUP_CONCAT() 는 MySQL 함수입니다. T-SQL에서 지원되지 않습니다.',
    suggestion: "STRING_AGG(컬럼, 구분자) 를 사용하세요.\n예) STRING_AGG(Email, ',')",
  },
  {
    id: 'no-char-length',
    pattern: /\bCHAR_LENGTH\s*\(/i,
    type: 'error',
    message: 'CHAR_LENGTH() 는 MySQL 함수입니다. T-SQL에서 지원되지 않습니다.',
    suggestion: 'LEN() 을 사용하세요.',
  },
  {
    id: 'no-locate',
    pattern: /\bLOCATE\s*\(/i,
    type: 'error',
    message: 'LOCATE() 는 MySQL 함수입니다. T-SQL에서 지원되지 않습니다.',
    suggestion: 'CHARINDEX(찾을문자열, 대상문자열) 를 사용하세요.',
  },
  {
    id: 'no-length',
    pattern: /\bLENGTH\s*\(/i,
    type: 'error',
    message: 'LENGTH() 는 MySQL 함수입니다. T-SQL에서 지원되지 않습니다.',
    suggestion: 'LEN() 을 사용하세요.\n예) LEN(Email)',
  },
  {
    id: 'no-substr',
    pattern: /\bSUBSTR\s*\(/i,
    type: 'error',
    message: 'SUBSTR() 는 MySQL/Oracle 함수입니다. T-SQL에서 지원되지 않습니다.',
    suggestion: 'SUBSTRING(문자열, 시작위치, 길이) 를 사용하세요.\n예) SUBSTRING(Email, 1, 5)',
  },
  {
    id: 'no-mod-func',
    pattern: /\bMOD\s*\(/i,
    type: 'error',
    message: 'MOD() 는 MySQL/Oracle 함수입니다. T-SQL에서 지원되지 않습니다.',
    suggestion: '% 연산자를 사용하세요.\n예) MOD(n, 3) → n % 3',
  },
  {
    id: 'no-ceil',
    pattern: /\bCEIL\s*\(/i,
    type: 'error',
    message: 'CEIL() 는 MySQL/PostgreSQL 함수입니다. T-SQL에서 지원되지 않습니다.',
    suggestion: 'CEILING() 을 사용하세요.\n예) CEILING(4.3) → 5',
  },
  {
    id: 'no-if-func',
    pattern: /\bIF\s*\(/i,
    type: 'error',
    message: 'IF() 는 MySQL 함수입니다. T-SQL에서 지원되지 않습니다.',
    suggestion: "IIF(조건, 참값, 거짓값) 또는 CASE WHEN 구문을 사용하세요.\n예) IF(Score > 80, '합격', '불합격') → IIF(Score > 80, '합격', '불합격')",
  },
  {
    id: 'no-str-to-date',
    pattern: /\bSTR_TO_DATE\s*\(/i,
    type: 'error',
    message: 'STR_TO_DATE() 는 MySQL 함수입니다. T-SQL에서 지원되지 않습니다.',
    suggestion: "CONVERT(DATE, '날짜문자열', 스타일) 또는 CAST('날짜' AS DATE) 를 사용하세요.\n예) CONVERT(DATE, '2024-01-01', 23)",
  },
  {
    id: 'no-timestampdiff',
    pattern: /\bTIMESTAMPDIFF\s*\(/i,
    type: 'error',
    message: 'TIMESTAMPDIFF() 는 MySQL 함수입니다. T-SQL에서 지원되지 않습니다.',
    suggestion: 'DATEDIFF(단위, 시작날짜, 종료날짜) 를 사용하세요.\n예) DATEDIFF(DAY, StartDate, GETDATE())',
  },
  {
    id: 'no-repeat',
    pattern: /\bREPEAT\s*\(/i,
    type: 'error',
    message: 'REPEAT() 는 MySQL 함수입니다. T-SQL에서 지원되지 않습니다.',
    suggestion: "REPLICATE(문자열, 반복횟수) 를 사용하세요.\n예) REPLICATE('0', 5)",
  },

  // ════════════════════════════════════════════════════════
  // 4. Oracle 함수/문법 오용
  // ════════════════════════════════════════════════════════
  {
    id: 'no-sysdate',
    pattern: /\bSYSDATE\b/i,
    type: 'error',
    message: 'SYSDATE 는 Oracle 함수입니다. T-SQL에서 지원되지 않습니다.',
    suggestion: 'GETDATE() 를 사용하세요.',
  },
  {
    id: 'no-nvl',
    pattern: /\bNVL\s*\(/i,
    type: 'error',
    message: 'NVL() 는 Oracle 함수입니다. T-SQL에서 지원되지 않습니다.',
    suggestion: 'ISNULL(컬럼, 기본값) 를 사용하세요.',
  },
  {
    id: 'no-nvl2',
    pattern: /\bNVL2\s*\(/i,
    type: 'error',
    message: 'NVL2() 는 Oracle 함수입니다. T-SQL에서 지원되지 않습니다.',
    suggestion: 'IIF(조건, 참값, 거짓값) 또는 CASE WHEN 을 사용하세요.',
  },
  {
    id: 'no-to-char',
    pattern: /\bTO_CHAR\s*\(/i,
    type: 'error',
    message: 'TO_CHAR() 는 Oracle 함수입니다. T-SQL에서 지원되지 않습니다.',
    suggestion: "FORMAT(값, '포맷') 또는 CONVERT(VARCHAR, 값, 스타일) 를 사용하세요.\n예) FORMAT(GETDATE(), 'yyyyMMdd')",
  },
  {
    id: 'no-to-date',
    pattern: /\bTO_DATE\s*\(/i,
    type: 'error',
    message: 'TO_DATE() 는 Oracle 함수입니다. T-SQL에서 지원되지 않습니다.',
    suggestion: "CONVERT(DATE, '날짜문자열', 스타일) 또는 CAST('날짜' AS DATE) 를 사용하세요.",
  },
  {
    id: 'no-to-number',
    pattern: /\bTO_NUMBER\s*\(/i,
    type: 'error',
    message: 'TO_NUMBER() 는 Oracle 함수입니다. T-SQL에서 지원되지 않습니다.',
    suggestion: 'CAST(값 AS DECIMAL) 또는 CONVERT(DECIMAL, 값) 를 사용하세요.',
  },
  {
    id: 'no-decode',
    pattern: /\bDECODE\s*\(/i,
    type: 'error',
    message: 'DECODE() 는 Oracle 함수입니다. T-SQL에서 지원되지 않습니다.',
    suggestion: "CASE WHEN 구문을 사용하세요.\n예) CASE WHEN col='A' THEN 'Apple' ELSE 'Other' END",
  },
  {
    id: 'no-rownum',
    type: 'error',
    message: 'ROWNUM 은 Oracle 문법입니다. T-SQL에서 지원되지 않습니다.',
    suggestion: 'SELECT TOP N 으로 행 수를 제한하거나,\n행 번호가 필요하면 ROW_NUMBER() OVER (ORDER BY ...) 를 사용하세요.',
    check: (sql) => /\bROWNUM\b/i.test(sql) && !/\bROW_NUMBER\b/i.test(sql),
  },
  {
    id: 'no-dual',
    pattern: /\bFROM\s+DUAL\b/i,
    type: 'error',
    message: 'FROM DUAL 은 Oracle 문법입니다.',
    suggestion: 'T-SQL에서는 FROM 절 없이 SELECT 1+1 형태로 사용하세요.',
  },
  {
    id: 'no-connect-by',
    pattern: /\bCONNECT\s+BY\b/i,
    type: 'error',
    message: 'CONNECT BY 는 Oracle 계층 쿼리 문법입니다. T-SQL에서 지원되지 않습니다.',
    suggestion: '재귀 CTE(WITH ... AS)를 사용하세요.',
  },
  {
    id: 'no-instr',
    pattern: /\bINSTR\s*\(/i,
    type: 'error',
    message: 'INSTR() 는 Oracle/MySQL 함수입니다. T-SQL에서 지원되지 않습니다.',
    suggestion: 'CHARINDEX(찾을문자열, 대상문자열) 를 사용하세요.\n※ 인수 순서가 반대입니다.\n예) INSTR(str, sub) → CHARINDEX(sub, str)',
  },
  {
    id: 'no-lpad',
    pattern: /\bLPAD\s*\(/i,
    type: 'error',
    message: 'LPAD() 는 Oracle/MySQL 함수입니다. T-SQL에서 지원되지 않습니다.',
    suggestion: "RIGHT(REPLICATE(채울문자, 길이) + 문자열, 길이) 패턴을 사용하세요.\n예) LPAD(n, 5, '0') → RIGHT(REPLICATE('0', 5) + CAST(n AS VARCHAR), 5)",
  },
  {
    id: 'no-rpad',
    pattern: /\bRPAD\s*\(/i,
    type: 'error',
    message: 'RPAD() 는 Oracle/MySQL 함수입니다. T-SQL에서 지원되지 않습니다.',
    suggestion: "LEFT(문자열 + REPLICATE(채울문자, 길이), 길이) 패턴을 사용하세요.\n예) RPAD(str, 10, ' ') → LEFT(str + REPLICATE(' ', 10), 10)",
  },
  {
    id: 'no-greatest',
    pattern: /\bGREATEST\s*\(/i,
    type: 'error',
    message: 'GREATEST() 는 Oracle/MySQL 함수입니다. T-SQL에서 지원되지 않습니다.',
    suggestion: 'CASE WHEN 또는 IIF() 를 사용하세요.\n예) GREATEST(a, b) → CASE WHEN a > b THEN a ELSE b END',
  },
  {
    id: 'no-least',
    pattern: /\bLEAST\s*\(/i,
    type: 'error',
    message: 'LEAST() 는 Oracle/MySQL 함수입니다. T-SQL에서 지원되지 않습니다.',
    suggestion: 'CASE WHEN 또는 IIF() 를 사용하세요.\n예) LEAST(a, b) → CASE WHEN a < b THEN a ELSE b END',
  },

  // ════════════════════════════════════════════════════════
  // 5. 크로스-DB 오용 (PostgreSQL 등)
  // ════════════════════════════════════════════════════════
  {
    id: 'no-ilike',
    pattern: /\bILIKE\b/i,
    type: 'error',
    message: 'ILIKE 는 PostgreSQL 연산자입니다. T-SQL에서 지원되지 않습니다.',
    suggestion: 'T-SQL의 LIKE는 기본적으로 대소문자를 구분하지 않습니다. LIKE 를 사용하세요.',
  },
  {
    id: 'no-extract',
    pattern: /\bEXTRACT\s*\(\s*(YEAR|MONTH|DAY|HOUR|MINUTE|SECOND)\s+FROM\b/i,
    type: 'error',
    message: 'EXTRACT() 는 PostgreSQL/MySQL 함수입니다. T-SQL에서 지원되지 않습니다.',
    suggestion: 'DATEPART(단위, 날짜) 또는 YEAR()/MONTH()/DAY() 를 사용하세요.\n예) EXTRACT(YEAR FROM date) → DATEPART(YEAR, date) 또는 YEAR(date)',
  },
  {
    id: 'no-position',
    pattern: /\bPOSITION\s*\(/i,
    type: 'error',
    message: 'POSITION() 는 PostgreSQL/MySQL 함수입니다. T-SQL에서 지원되지 않습니다.',
    suggestion: "CHARINDEX(찾을문자열, 대상문자열) 를 사용하세요.\n예) POSITION('@' IN Email) → CHARINDEX('@', Email)",
  },
  {
    id: 'no-cast-signed',
    pattern: /\bCAST\s*\([^)]+\bAS\s+(SIGNED|UNSIGNED)\b/i,
    type: 'error',
    message: 'CAST(x AS SIGNED/UNSIGNED) 는 MySQL 문법입니다. T-SQL에서 지원되지 않습니다.',
    suggestion: 'CAST(x AS INT) 또는 CAST(x AS BIGINT) 를 사용하세요.',
  },
  {
    id: 'no-regexp',
    pattern: /\s(REGEXP|RLIKE)\s/i,
    type: 'error',
    message: 'REGEXP / RLIKE 는 MySQL 정규식 연산자입니다. T-SQL에서 지원되지 않습니다.',
    suggestion: 'LIKE 패턴 매칭을 사용하거나, Script Activity(SSJS)에서 정규식을 처리하세요.',
  },
  {
    id: 'no-current-date',
    pattern: /\bCURRENT_DATE\b/i,
    type: 'error',
    message: 'CURRENT_DATE 는 MySQL/PostgreSQL 문법입니다. T-SQL에서 지원되지 않습니다.',
    suggestion: 'CAST(GETDATE() AS DATE) 를 사용하세요.',
  },
  {
    id: 'no-current-time',
    pattern: /\bCURRENT_TIME\b/i,
    type: 'error',
    message: 'CURRENT_TIME 는 MySQL/PostgreSQL 문법입니다. T-SQL에서 지원되지 않습니다.',
    suggestion: 'CAST(GETDATE() AS TIME) 를 사용하세요.',
  },

  // ════════════════════════════════════════════════════════
  // 6. 주의 / 정보
  // ════════════════════════════════════════════════════════
  {
    id: 'warn-trim',
    pattern: /\bTRIM\s*\(/i,
    type: 'warning',
    message: 'TRIM() 은 SQL Server 2017 미만에서 지원되지 않을 수 있습니다.',
    suggestion: 'SFMC 환경에 따라 LTRIM(RTRIM(컬럼)) 으로 대체하세요.\n예) TRIM(Email) → LTRIM(RTRIM(Email))',
  },
  {
    id: 'warn-no-top',
    type: 'warning',
    message: 'SELECT TOP N 이 없습니다.',
    suggestion: 'SFMC는 최대 처리 행 수가 제한됩니다. TOP 을 명시하는 것이 안전합니다.\n예) SELECT TOP 2500000 c.ContactKey, c.Email\nFROM [Contact_DE] c',
    check: (sql) => /\bSELECT\b/i.test(sql) && !/\bSELECT\s+TOP\b/i.test(sql),
  },
  {
    id: 'datediff-order',
    pattern: /\bDATEDIFF\s*\(/i,
    type: 'info',
    message: 'DATEDIFF() 인수 순서를 확인하세요.',
    suggestion: 'T-SQL: DATEDIFF(단위, 시작날짜, 종료날짜)\n예) DATEDIFF(DAY, BirthDate, GETDATE())\n※ MySQL과 인수 순서가 반대입니다.',
  },
  {
    id: 'missing-comma-select',
    type: 'error',
    message: 'SELECT 컬럼 목록에 콤마가 누락된 것 같습니다.',
    suggestion: '각 컬럼 사이에 콤마(,)를 추가하세요.',
    check: (sql) => {
      const colLines = [];
      let inSelect = false;
      for (const raw of sql.split('\n')) {
        const line = raw.replace(/--[^\n]*/, '').trim();
        if (!line) continue;
        if (/^SELECT\b/i.test(line)) {
          inSelect = true;
          const after = line.replace(/^SELECT\s*(TOP\s+\d+\s*|DISTINCT\s+)?/i, '').trim();
          if (after) colLines.push(after);
          continue;
        }
        if (inSelect) {
          if (/^(FROM|INTO|WHERE|GROUP|HAVING|ORDER|UNION)\b/i.test(line)) break;
          if (/^TOP\s+\d+\s*$/i.test(line)) continue;
          colLines.push(line);
        }
      }
      if (colLines.length < 2) return false;
      for (let i = 1; i < colLines.length; i++) {
        const prev = colLines[i - 1], curr = colLines[i];
        if (!prev.endsWith(',') && !curr.startsWith(',') && /^\w/.test(curr)) return true;
      }
      return false;
    },
  },
];

function validate(sql) {
  if (!sql || !sql.trim()) return [];

  // Strip comments so annotation labels and commented-out code never trigger false positives.
  const sqlClean = sql
    .replace(/\/\*[\s\S]*?\*\//g, '')  // block comments /* */
    .replace(/--[^\n]*/g, '');          // line comments --

  const results = [];

  for (const rule of SFMC_RULES) {
    let matched = false;
    if (typeof rule.check === 'function') {
      matched = rule.check(sqlClean);
    } else {
      matched = rule.pattern.test(sqlClean);
    }

    if (matched) {
      results.push({
        id: rule.id,
        type: rule.type,
        message: rule.message,
        suggestion: rule.suggestion,
      });
    }
  }

  return results;
}

function oracleToTsqlFmt(fmt) {
  return fmt
    .replace(/YYYY/g, 'yyyy')
    .replace(/YY/g,   'yy')
    .replace(/HH24/g, 'HH')
    .replace(/HH/g,   'hh')
    .replace(/MI/g,   'mm')
    .replace(/SS/g,   'ss')
    .replace(/MM/g,   'MM')
    .replace(/DD/g,   'dd')
    .replace(/DAY/g,  'dddd')
    .replace(/MON/g,  'MMM');
}

function mysqlToTsqlFmt(fmt) {
  return fmt
    .replace(/%Y/g, 'yyyy').replace(/%y/g, 'yy')
    .replace(/%m/g, 'MM')  .replace(/%d/g, 'dd')
    .replace(/%H/g, 'HH')  .replace(/%h/g, 'hh')
    .replace(/%i/g, 'mm')  .replace(/%s/g, 'ss')
    .replace(/%W/g, 'dddd').replace(/%b/g, 'MMM');
}

function autoFix(sql) {
  if (!sql || !sql.trim()) return sql;
  let fixed = sql;
  const changes = [];

  function annotate(line, label) {
    if (!line.trim() || line.trim().startsWith('--')) return line;
    const m = line.match(/^([\s\S]*?)\s*-- \[수정\] (.+)$/);
    if (m) return `${m[1]} -- [수정] ${m[2]}, ${label}`;
    return `${line} -- [수정] ${label}`;
  }

  function apply(label, fn) {
    // Run fn() only on the non-comment portion of each line so that annotation
    // labels added by previous apply() calls are never corrupted by later regexes.
    const beforeLines = fixed.split('\n');
    const codeOnly = beforeLines.map(l => l.replace(/--[^\n]*/, '')).join('\n');
    let transformed = codeOnly;
    const savedFixed = fixed;
    fixed = transformed;
    fn();
    transformed = fixed;
    fixed = savedFixed;

    if (transformed === codeOnly) return;
    changes.push(label);

    const transformedLines = transformed.split('\n');
    const codeOnlyLines = codeOnly.split('\n');

    if (beforeLines.length === transformedLines.length) {
      fixed = beforeLines.map((orig, i) => {
        if (transformedLines[i] === codeOnlyLines[i]) return orig;
        // Re-attach any existing annotation suffix, then annotate
        const commentMatch = orig.match(/(--[^\n]*)$/);
        const existingComment = commentMatch ? commentMatch[1] : '';
        const newCode = transformedLines[i].trimEnd();
        const baseWithComment = existingComment ? `${newCode} ${existingComment}` : newCode;
        return annotate(baseWithComment, label);
      }).join('\n');
    } else {
      // Line count changed (e.g. LIMIT removal); annotate first changed line only
      const result = transformedLines.map((tl, i) => {
        const orig = beforeLines[i];
        if (orig === undefined || tl !== codeOnlyLines[i]) return tl;
        return orig;
      });
      for (let i = 0; i < Math.min(beforeLines.length, transformedLines.length); i++) {
        if (transformedLines[i] !== codeOnlyLines[i]) {
          result[i] = annotate(transformedLines[i], label);
          break;
        }
      }
      fixed = result.join('\n');
    }
  }

  apply('SELECT TOP N, 콤마 제거', () => {
    fixed = fixed.replace(/(\bSELECT\s+TOP\s+\d+)\s*,/gi, '$1');
  });
  apply('백틱(`) → 대괄호([])', () => {
    fixed = fixed.replace(/`([^`]+)`/g, '[$1]');
  });
  apply('|| → + (문자열 연결)', () => {
    fixed = fixed.replace(/\s*\|\|\s*/g, ' + ');
  });
  apply('SYSDATE → GETDATE()', () => {
    fixed = fixed.replace(/\bSYSDATE\b/gi, 'GETDATE()');
  });
  apply('NOW() → GETDATE()', () => {
    fixed = fixed.replace(/\bNOW\s*\(\s*\)/gi, 'GETDATE()');
  });
  apply('NVL() → ISNULL()', () => {
    fixed = fixed.replace(/\bNVL\s*\(/gi, 'ISNULL(');
  });
  apply('IFNULL() → ISNULL()', () => {
    fixed = fixed.replace(/\bIFNULL\s*\(/gi, 'ISNULL(');
  });
  apply('TO_CHAR() → FORMAT()', () => {
    fixed = fixed.replace(
      /\bTO_CHAR\s*\(\s*([^,]+?)\s*,\s*'([^']+)'\s*\)/gi,
      (_, expr, fmt) => `FORMAT(${expr.trim()}, '${oracleToTsqlFmt(fmt)}')`
    );
  });
  apply('DATE_FORMAT() → FORMAT()', () => {
    fixed = fixed.replace(
      /\bDATE_FORMAT\s*\(\s*([^,]+?)\s*,\s*'([^']+)'\s*\)/gi,
      (_, expr, fmt) => `FORMAT(${expr.trim()}, '${mysqlToTsqlFmt(fmt)}')`
    );
  });
  apply('DATE_ADD() → DATEADD()', () => {
    fixed = fixed.replace(
      /\bDATE_ADD\s*\(\s*([^,]+?)\s*,\s*INTERVAL\s+(-?\d+)\s+(DAY|MONTH|YEAR|HOUR|MINUTE)\s*\)/gi,
      (_, date, n, unit) => `DATEADD(${unit.toUpperCase()}, ${n}, ${date.trim()})`
    );
  });
  apply('DATE_SUB() → DATEADD()', () => {
    fixed = fixed.replace(
      /\bDATE_SUB\s*\(\s*([^,]+?)\s*,\s*INTERVAL\s+(\d+)\s+(DAY|MONTH|YEAR|HOUR|MINUTE)\s*\)/gi,
      (_, date, n, unit) => `DATEADD(${unit.toUpperCase()}, -${n}, ${date.trim()})`
    );
  });
  apply('LIMIT N → SELECT TOP N', () => {
    const limitMatch = fixed.match(/\bLIMIT\s+(\d+)/i);
    if (limitMatch) {
      const n = limitMatch[1];
      fixed = fixed.replace(/\bLIMIT\s+\d+/i, '').trim();
      if (!/\bSELECT\s+TOP\b/i.test(fixed)) {
        fixed = fixed.replace(/\bSELECT\b/i, `SELECT TOP ${n}`);
      }
    }
  });
  apply('GROUP_CONCAT() → STRING_AGG()', () => {
    fixed = fixed.replace(
      /\bGROUP_CONCAT\s*\(\s*([^,)]+?)\s*(?:SEPARATOR\s*('(?:[^']|'')*'|"[^"]*"))?\s*\)/gi,
      (_, col, sep) => 'STRING_AGG(' + col.trim() + ', ' + (sep || "','") + ')'
    );
  });
  apply('CHAR_LENGTH/LENGTH() → LEN()', () => {
    fixed = fixed.replace(/\bCHAR_LENGTH\s*\(/gi, 'LEN(');
    fixed = fixed.replace(/\bLENGTH\s*\(/gi, 'LEN(');
  });
  apply('LOCATE() → CHARINDEX()', () => {
    fixed = fixed.replace(/\bLOCATE\s*\(/gi, 'CHARINDEX(');
  });
  apply('SUBSTR() → SUBSTRING()', () => {
    fixed = fixed.replace(/\bSUBSTR\s*\(/gi, 'SUBSTRING(');
  });
  apply('TRIM() → LTRIM(RTRIM())', () => {
    fixed = fixed.replace(/\bTRIM\s*\(\s*([^)]+)\s*\)/gi, (_, x) => `LTRIM(RTRIM(${x.trim()}))`);
  });
  apply('# 주석 → -- 주석', () => {
    fixed = fixed.replace(/^(\s*)#(.*)$/gm, '$1--$2');
  });
  apply('MOD() → % 연산자', () => {
    fixed = fixed.replace(/\bMOD\s*\(\s*([^,]+?)\s*,\s*([^)]+?)\s*\)/gi, (_, a, b) => `${a.trim()} % ${b.trim()}`);
  });
  apply('CEIL() → CEILING()', () => {
    fixed = fixed.replace(/\bCEIL\s*\(/gi, 'CEILING(');
  });
  apply('IF() → IIF()', () => {
    fixed = fixed.replace(/\bIF\s*\(/gi, 'IIF(');
  });
  apply('INSTR() → CHARINDEX() (인수 순서 변환)', () => {
    fixed = fixed.replace(
      /\bINSTR\s*\(\s*([^,]+?)\s*,\s*([^)]+?)\s*\)/gi,
      (_, str, sub) => `CHARINDEX(${sub.trim()}, ${str.trim()})`
    );
  });
  apply('EXTRACT() → DATEPART()', () => {
    fixed = fixed.replace(
      /\bEXTRACT\s*\(\s*(YEAR|MONTH|DAY|HOUR|MINUTE|SECOND)\s+FROM\s+([^)]+?)\s*\)/gi,
      (_, unit, date) => `DATEPART(${unit.toUpperCase()}, ${date.trim()})`
    );
  });
  apply('TIMESTAMPDIFF() → DATEDIFF()', () => {
    fixed = fixed.replace(/\bTIMESTAMPDIFF\s*\(/gi, 'DATEDIFF(');
  });
  apply('REPEAT() → REPLICATE()', () => {
    fixed = fixed.replace(/\bREPEAT\s*\(/gi, 'REPLICATE(');
  });
  apply('CURRENT_DATE → CAST(GETDATE() AS DATE)', () => {
    fixed = fixed.replace(/\bCURRENT_DATE\b/gi, 'CAST(GETDATE() AS DATE)');
  });
  apply('CURRENT_TIME → CAST(GETDATE() AS TIME)', () => {
    fixed = fixed.replace(/\bCURRENT_TIME\b/gi, 'CAST(GETDATE() AS TIME)');
  });
  apply('STR_TO_DATE() → CONVERT(DATE, ...)', () => {
    const fmtMap = {
      '%Y-%m-%d':           23,
      '%Y%m%d':            112,
      '%d/%m/%Y':          103,
      '%m/%d/%Y':          101,
      '%Y-%m-%d %H:%i:%s': 120,
      '%d-%m-%Y':          105,
    };
    fixed = fixed.replace(
      /\bSTR_TO_DATE\s*\(\s*([^,]+?)\s*,\s*'([^']+)'\s*\)/gi,
      (_, expr, fmt) => {
        const style = fmtMap[fmt];
        return style
          ? `CONVERT(DATE, ${expr.trim()}, ${style})`
          : `CONVERT(DATE, ${expr.trim()})`;
      }
    );
  });
  apply('ILIKE → LIKE', () => {
    fixed = fixed.replace(/\bILIKE\b/gi, 'LIKE');
  });
  apply('CAST(x AS SIGNED/UNSIGNED) → CAST(x AS INT/BIGINT)', () => {
    fixed = fixed.replace(/\b(CAST\s*\([^)]+\bAS\s+)SIGNED\b/gi, '$1INT');
    fixed = fixed.replace(/\b(CAST\s*\([^)]+\bAS\s+)UNSIGNED\b/gi, '$1BIGINT');
  });
  apply('말미 세미콜론 제거', () => {
    fixed = fixed.replace(/\s*;\s*$/, '');
  });

  return { sql: fixed, changes };
}
