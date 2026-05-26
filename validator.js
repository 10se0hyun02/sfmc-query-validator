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
    check: (sql) => /\bPRINT\b/i.test(sql),
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

  // ════════════════════════════════════════════════════════
  // 5. 주의 / 정보
  // ════════════════════════════════════════════════════════
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
        const line = raw.trim();
        if (!line || line.startsWith('--')) continue;
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

  const results = [];

  for (const rule of SFMC_RULES) {
    let matched = false;
    if (typeof rule.check === 'function') {
      matched = rule.check(sql);
    } else {
      matched = rule.pattern.test(sql);
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
    const beforeLines = fixed.split('\n');
    fn();
    const afterLines = fixed.split('\n');
    if (afterLines.join('\n') === beforeLines.join('\n')) return;
    changes.push(label);

    if (beforeLines.length === afterLines.length) {
      fixed = afterLines.map((line, i) =>
        line !== beforeLines[i] ? annotate(line, label) : line
      ).join('\n');
    } else {
      const result = [...afterLines];
      const minLen = Math.min(beforeLines.length, afterLines.length);
      for (let i = 0; i < minLen; i++) {
        if (result[i] !== beforeLines[i]) { result[i] = annotate(result[i], label); break; }
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
  apply('말미 세미콜론 제거', () => {
    fixed = fixed.replace(/\s*;\s*$/, '');
  });

  return fixed;
}
