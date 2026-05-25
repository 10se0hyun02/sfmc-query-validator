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
