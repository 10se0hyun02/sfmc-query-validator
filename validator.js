// SFMC SQL Query Activity (Automation Studio) T-SQL 규칙
const SFMC_RULES = [
  // ── Query Activity 구조 ──────────────────────────────────────────
  {
    id: 'no-dml',
    type: 'error',
    message: 'SQL Query Activity에서는 UPDATE / DELETE 를 사용할 수 없습니다.',
    suggestion: 'Query Activity는 SELECT ... INTO [Result DE] 구조만 지원합니다.\nUPDATE/DELETE가 필요하면 Script Activity(SSJS)를 사용하세요.',
    check: (sql) => /^\s*(UPDATE|DELETE)\b/im.test(sql),
  },
  {
    id: 'no-ddl',
    type: 'error',
    message: 'SQL Query Activity에서는 DDL(CREATE / DROP / ALTER)을 사용할 수 없습니다.',
    suggestion: 'Query Activity는 SELECT ... INTO [Result DE] 구조만 지원합니다.',
    check: (sql) => /^\s*(CREATE|DROP|ALTER)\b/im.test(sql),
  },
  {
    id: 'no-exec',
    type: 'error',
    message: 'SQL Query Activity에서는 EXEC / EXECUTE를 사용할 수 없습니다.',
    suggestion: '저장 프로시저 호출은 지원되지 않습니다.',
    check: (sql) => /^\s*EXEC(UTE)?\b/im.test(sql),
  },
  {
    id: 'no-temp-table',
    type: 'error',
    message: '임시 테이블(#temp)은 SQL Query Activity에서 지원되지 않습니다.',
    suggestion: '임시 결과는 별도 Data Extension에 저장하세요.',
    check: (sql) => /#\w+/.test(sql),
  },
  // ── 잘못된 구문 ─────────────────────────────────────────────────
  {
    id: 'select-top-comma',
    pattern: /\bSELECT\s+TOP\s+\d+\s*,/i,
    type: 'error',
    message: 'SELECT TOP N 바로 뒤에 콤마(,)가 있습니다.',
    suggestion: 'TOP N 다음에는 바로 컬럼명이 와야 합니다.\n예) SELECT TOP 1000\n    c.ContactKey,\n    c.Email',
  },
  {
    id: 'no-backtick',
    pattern: /`/,
    type: 'error',
    message: '백틱(`)은 SFMC T-SQL에서 지원되지 않습니다.',
    suggestion: '식별자는 대괄호 [] 로 감싸세요.\n예) [Contact DE], [Email Address]',
  },
  {
    id: 'select-star',
    pattern: /SELECT\s+(TOP\s+\d+\s+)?\*/i,
    type: 'warning',
    message: 'SELECT * 는 성능 저하를 유발할 수 있습니다.',
    suggestion: '필요한 컬럼만 명시적으로 지정하세요.\n예) SELECT TOP 1000 c.ContactKey, c.Email FROM ...',
  },

  // ── MySQL / Oracle 함수 오용 ────────────────────────────────────
  {
    id: 'no-limit',
    pattern: /\bLIMIT\s+\d+/i,
    type: 'error',
    message: 'LIMIT은 T-SQL에서 지원되지 않습니다.',
    suggestion: 'SELECT TOP N 을 사용하세요.\n예) SELECT TOP 1000 ...',
  },
  {
    id: 'no-now',
    pattern: /\bNOW\s*\(\s*\)/i,
    type: 'error',
    message: 'NOW()는 T-SQL에서 지원되지 않습니다.',
    suggestion: 'GETDATE() 를 사용하세요.',
  },
  {
    id: 'no-date-add',
    pattern: /\bDATE_ADD\s*\(/i,
    type: 'error',
    message: 'DATE_ADD()는 T-SQL에서 지원되지 않습니다.',
    suggestion: 'DATEADD(단위, N, 날짜) 를 사용하세요.\n예) DATEADD(DAY, -30, GETDATE())',
  },
  {
    id: 'no-date-sub',
    pattern: /\bDATE_SUB\s*\(/i,
    type: 'error',
    message: 'DATE_SUB()는 T-SQL에서 지원되지 않습니다.',
    suggestion: 'DATEADD(단위, -N, 날짜) 를 사용하세요.\n예) DATEADD(DAY, -30, GETDATE())',
  },
  {
    id: 'no-ifnull',
    pattern: /\bIFNULL\s*\(/i,
    type: 'error',
    message: 'IFNULL()은 T-SQL에서 지원되지 않습니다.',
    suggestion: 'ISNULL(컬럼, 기본값) 를 사용하세요.\n예) ISNULL(Email, \'없음\')',
  },
  {
    id: 'no-concat-ws',
    pattern: /\bCONCAT_WS\s*\(/i,
    type: 'error',
    message: 'CONCAT_WS()는 T-SQL에서 지원되지 않습니다.',
    suggestion: 'CONCAT() 또는 + 연산자를 사용하세요.\n예) FirstName + \' \' + LastName',
  },
  {
    id: 'no-group-concat',
    pattern: /\bGROUP_CONCAT\s*\(/i,
    type: 'error',
    message: 'GROUP_CONCAT()은 T-SQL에서 지원되지 않습니다.',
    suggestion: 'STRING_AGG(컬럼, 구분자) 를 사용하세요.\n예) STRING_AGG(Email, \',\')',
  },

  // ── 주의 사항 ───────────────────────────────────────────────────
  {
    id: 'datediff-order',
    pattern: /\bDATEDIFF\s*\(/i,
    type: 'info',
    message: 'DATEDIFF() 인수 순서를 확인하세요.',
    suggestion: 'T-SQL: DATEDIFF(단위, 시작날짜, 종료날짜)\n예) DATEDIFF(DAY, BirthDate, GETDATE())',
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
          const after = line.replace(/^SELECT\s+(TOP\s+\d+\s*|DISTINCT\s+)?/i, '').trim();
          if (after) colLines.push(after);
          continue;
        }
        if (inSelect) {
          if (/^(FROM|INTO|WHERE|GROUP|HAVING|ORDER)\b/i.test(line)) break;
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

  function apply(label, fn) {
    const before = fixed;
    fn();
    if (fixed !== before) changes.push(label);
  }

  apply('SELECT TOP N, 콤마 제거', () => {
    fixed = fixed.replace(/(\bSELECT\s+TOP\s+\d+)\s*,/gi, '$1');
  });
  apply('백틱(`) → 대괄호([])', () => {
    fixed = fixed.replace(/`([^`]+)`/g, '[$1]');
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
  apply('|| → + (문자열 연결)', () => {
    fixed = fixed.replace(/\s*\|\|\s*/g, ' + ');
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

  if (changes.length > 0) {
    fixed = '-- [자동교정] ' + changes.join(' | ') + '\n' + fixed;
  }

  return fixed;
}
