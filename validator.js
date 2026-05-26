const SFMC_RULES = [
  {
    id: 'no-limit',
    pattern: /\bLIMIT\s+\d+/i,
    type: 'error',
    message: 'LIMIT은 SFMC T-SQL에서 지원되지 않습니다.',
    suggestion: 'SELECT TOP N ... 형식으로 변경하세요.\n예) SELECT TOP 100 * FROM Contact',
  },
  {
    id: 'no-now',
    pattern: /\bNOW\s*\(\s*\)/i,
    type: 'error',
    message: 'NOW()는 SFMC T-SQL에서 지원되지 않습니다.',
    suggestion: 'GETDATE() 를 사용하세요.\n예) WHERE EventDate >= GETDATE()',
  },
  {
    id: 'no-date-add',
    pattern: /\bDATE_ADD\s*\(/i,
    type: 'error',
    message: 'DATE_ADD()는 SFMC T-SQL에서 지원되지 않습니다.',
    suggestion: 'DATEADD(unit, n, date) 를 사용하세요.\n예) DATEADD(DAY, -30, GETDATE())',
  },
  {
    id: 'no-date-sub',
    pattern: /\bDATE_SUB\s*\(/i,
    type: 'error',
    message: 'DATE_SUB()는 SFMC T-SQL에서 지원되지 않습니다.',
    suggestion: 'DATEADD(unit, -n, date) 를 사용하세요.\n예) DATEADD(DAY, -30, GETDATE())',
  },
  {
    id: 'no-ifnull',
    pattern: /\bIFNULL\s*\(/i,
    type: 'error',
    message: 'IFNULL()은 SFMC T-SQL에서 지원되지 않습니다.',
    suggestion: 'ISNULL(컬럼, 기본값) 를 사용하세요.\n예) ISNULL(Email, \'없음\')',
  },
  {
    id: 'no-concat-ws',
    pattern: /\bCONCAT_WS\s*\(/i,
    type: 'error',
    message: 'CONCAT_WS()는 SFMC T-SQL에서 지원되지 않습니다.',
    suggestion: 'CONCAT() 또는 + 연산자를 사용하세요.\n예) FirstName + \' \' + LastName',
  },
  {
    id: 'no-group-concat',
    pattern: /\bGROUP_CONCAT\s*\(/i,
    type: 'error',
    message: 'GROUP_CONCAT()은 SFMC T-SQL에서 지원되지 않습니다.',
    suggestion: 'STRING_AGG(컬럼, 구분자) 를 사용하세요.\n예) STRING_AGG(Email, \',\')',
  },
  {
    id: 'no-backtick',
    pattern: /`/,
    type: 'error',
    message: '백틱(`)은 SFMC T-SQL에서 지원되지 않습니다.',
    suggestion: '테이블/컬럼명 감싸기: 대괄호 [] 또는 쌍따옴표 "" 를 사용하세요.\n예) [Contact DE], "Email"',
  },
  {
    id: 'missing-into',
    pattern: /^(?![\s\S]*\bINTO\b)/i,
    type: 'warning',
    message: 'INTO 절이 없습니다.',
    suggestion: 'Query Activity는 결과를 저장할 DE가 필요합니다.\n예) SELECT ... INTO [Result DE] FROM ...',
    check: (sql) => {
      const trimmed = sql.trim();
      if (!trimmed.toUpperCase().startsWith('SELECT')) return false;
      return !/\bINTO\b/i.test(trimmed);
    },
  },
  {
    id: 'select-star',
    pattern: /SELECT\s+\*/i,
    type: 'warning',
    message: 'SELECT * 는 성능 저하를 유발할 수 있습니다.',
    suggestion: '필요한 컬럼만 명시적으로 지정하는 것을 권장합니다.\n예) SELECT ContactKey, Email, Name FROM ...',
  },
  {
    id: 'no-top-with-select-star',
    pattern: /SELECT\s+\*\s+(?!TOP)/i,
    type: 'warning',
    message: '결과 행 수 제한이 없습니다.',
    suggestion: 'TOP N 을 사용해 반환 행 수를 제한하세요.\n예) SELECT TOP 1000 * FROM ...',
    check: (sql) => /SELECT\s+\*/i.test(sql) && !/SELECT\s+TOP\s+\d+/i.test(sql),
  },
  {
    id: 'datediff-order',
    pattern: /\bDATEDIFF\s*\(/i,
    type: 'info',
    message: 'DATEDIFF() 인수 순서를 확인하세요.',
    suggestion: 'SFMC T-SQL: DATEDIFF(단위, 시작날짜, 종료날짜)\n예) DATEDIFF(DAY, StartDate, GETDATE())',
  },
  {
    id: 'missing-comma-select',
    type: 'error',
    message: 'SELECT 컬럼 목록에 콤마가 누락된 것 같습니다.',
    suggestion: '각 컬럼 사이에 콤마(,)를 추가하세요.\n예) SELECT col1,\n    col2\nFROM ...',
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
          if (/^TOP\s+\d+\s*$/i.test(line)) continue; // SELECT 다음 줄에 TOP N만 있는 경우
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
  {
    id: 'missing-comma-insert',
    type: 'error',
    message: 'INSERT 컬럼 또는 VALUES 목록에 콤마가 누락된 것 같습니다.',
    suggestion: '각 항목 사이에 콤마(,)를 추가하세요.\n예) INSERT INTO t (col1, col2) VALUES (val1, val2)',
    check: (sql) => {
      if (!/\bINSERT\b/i.test(sql)) return false;
      const hasMissing = (block) => {
        const lines = block.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('--'));
        for (let i = 1; i < lines.length; i++) {
          const prev = lines[i - 1], curr = lines[i];
          if (!prev.endsWith(',') && !curr.startsWith(',') && /^\w/.test(curr)) return true;
        }
        return false;
      };
      const colMatch = sql.match(/INSERT\s+INTO\s+\S+\s*\(([\s\S]+?)\)\s*(?:VALUES|SELECT)/i);
      const valMatch = sql.match(/\bVALUES\s*\(([\s\S]+?)\)\s*;?\s*$/i);
      return (colMatch && hasMissing(colMatch[1])) || (valMatch && hasMissing(valMatch[1]));
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

  // 백틱 → 대괄호
  fixed = fixed.replace(/`([^`]+)`/g, '[$1]');

  // Oracle SYSDATE → GETDATE()
  fixed = fixed.replace(/\bSYSDATE\b/gi, 'GETDATE()');

  // NOW() → GETDATE()
  fixed = fixed.replace(/\bNOW\s*\(\s*\)/gi, 'GETDATE()');

  // Oracle NVL → ISNULL
  fixed = fixed.replace(/\bNVL\s*\(/gi, 'ISNULL(');

  // IFNULL → ISNULL
  fixed = fixed.replace(/\bIFNULL\s*\(/gi, 'ISNULL(');

  // Oracle TO_CHAR(date, 'fmt') → FORMAT(date, 'tsqlfmt')
  fixed = fixed.replace(
    /\bTO_CHAR\s*\(\s*([^,]+?)\s*,\s*'([^']+)'\s*\)/gi,
    (_, expr, fmt) => `FORMAT(${expr.trim()}, '${oracleToTsqlFmt(fmt)}')`
  );

  // MySQL DATE_FORMAT(date, '%fmt') → FORMAT(date, 'tsqlfmt')
  fixed = fixed.replace(
    /\bDATE_FORMAT\s*\(\s*([^,]+?)\s*,\s*'([^']+)'\s*\)/gi,
    (_, expr, fmt) => `FORMAT(${expr.trim()}, '${mysqlToTsqlFmt(fmt)}')`
  );

  // DATE_ADD(date, INTERVAL n UNIT) → DATEADD(UNIT, n, date)
  fixed = fixed.replace(
    /\bDATE_ADD\s*\(\s*([^,]+?)\s*,\s*INTERVAL\s+(-?\d+)\s+(DAY|MONTH|YEAR|HOUR|MINUTE)\s*\)/gi,
    (_, date, n, unit) => `DATEADD(${unit.toUpperCase()}, ${n}, ${date.trim()})`
  );

  // DATE_SUB(date, INTERVAL n UNIT) → DATEADD(UNIT, -n, date)
  fixed = fixed.replace(
    /\bDATE_SUB\s*\(\s*([^,]+?)\s*,\s*INTERVAL\s+(\d+)\s+(DAY|MONTH|YEAR|HOUR|MINUTE)\s*\)/gi,
    (_, date, n, unit) => `DATEADD(${unit.toUpperCase()}, -${n}, ${date.trim()})`
  );

  // LIMIT N → SELECT TOP N
  const limitMatch = fixed.match(/\bLIMIT\s+(\d+)/i);
  if (limitMatch) {
    const n = limitMatch[1];
    fixed = fixed.replace(/\bLIMIT\s+\d+/i, '').trim();
    if (!/\bSELECT\s+TOP\b/i.test(fixed)) {
      fixed = fixed.replace(/\bSELECT\b/i, `SELECT TOP ${n}`);
    }
  }

  // GROUP_CONCAT → STRING_AGG
  fixed = fixed.replace(
    /\bGROUP_CONCAT\s*\(\s*([^,)]+?)\s*(?:SEPARATOR\s*('(?:[^']|'')*'|"[^"]*"))?\s*\)/gi,
    (_, col, sep) => 'STRING_AGG(' + col.trim() + ', ' + (sep || "','") + ')'
  );

  // CHAR_LENGTH / LENGTH → LEN
  fixed = fixed.replace(/\bCHAR_LENGTH\s*\(/gi, 'LEN(');
  fixed = fixed.replace(/\bLENGTH\s*\(/gi, 'LEN(');

  // LOCATE → CHARINDEX
  fixed = fixed.replace(/\bLOCATE\s*\(/gi, 'CHARINDEX(');

  // SUBSTR → SUBSTRING
  fixed = fixed.replace(/\bSUBSTR\s*\(/gi, 'SUBSTRING(');

  // TRIM(x) → LTRIM(RTRIM(x))
  fixed = fixed.replace(/\bTRIM\s*\(\s*([^)]+)\s*\)/gi, (_, x) => `LTRIM(RTRIM(${x.trim()}))`);

  // || → + (문자열 연결 연산자)
  fixed = fixed.replace(/\s*\|\|\s*/g, ' + ');

  // #주석 → -- 주석 (행 시작 기준)
  fixed = fixed.replace(/^(\s*)#(.*)$/gm, '$1--$2');

  // MOD(a, b) → a % b
  fixed = fixed.replace(/\bMOD\s*\(\s*([^,]+?)\s*,\s*([^)]+?)\s*\)/gi, (_, a, b) => `${a.trim()} % ${b.trim()}`);

  // 말미 세미콜론 제거 (T-SQL Query Activity 불필요)
  fixed = fixed.replace(/\s*;\s*$/, '');

  return fixed;
}
