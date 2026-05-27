let SQL = null;

async function initSql() {
  if (SQL) return SQL;
  SQL = await initSqlJs({
    locateFile: (file) =>
      `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/${file}`,
  });
  return SQL;
}

function parseCSV(text) {
  const lines = text.trim().split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return { columns: [], rows: [] };

  const columns = lines[0].split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''));
  const rows = lines.slice(1).map((line) => {
    const values = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"' || ch === "'") {
        inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    values.push(current.trim());
    return values;
  });

  return { columns, rows };
}

function stripInto(sql) {
  // SFMC Query Activity 전용 INTO 절 제거: SELECT ... INTO [ResultDE] FROM ...
  return sql.replace(/\bINTO\s+(\[[\w\s]+\]|[\w]+)/gi, '');
}

function convertBracketIdents(sql) {
  // [Table Name] → "Table Name" (SQLite 호환)
  return sql.replace(/\[([^\]]+)\]/g, '"$1"');
}

function convertSfmcFunctions(sql) {
  // GETDATE() → datetime('now') for SQLite
  let s = sql.replace(/\bGETDATE\s*\(\s*\)/gi, "datetime('now')");
  // DATEADD(DAY, n, date) → date(date, '+n days') — 단순 변환, 복잡한 케이스는 제한됨
  s = s.replace(/\bDATEADD\s*\(\s*DAY\s*,\s*(-?\d+)\s*,\s*([^)]+)\)/gi, (_, n, d) => {
    const days = parseInt(n);
    const op = days >= 0 ? `'+${days} days'` : `'${days} days'`;
    return `date(${d.trim()}, ${op})`;
  });
  return s;
}

async function runMock(sql, tables) {
  await initSql();

  const db = new SQL.Database();

  try {
    // 테이블 생성 및 데이터 삽입
    for (const { name, csv } of tables) {
      const { columns, rows } = parseCSV(csv);
      if (columns.length === 0) continue;

      const safeName = name.replace(/[^a-zA-Z0-9_가-힣]/g, '_');
      const colDefs = columns.map((c) => `"${c}" TEXT`).join(', ');
      db.run(`CREATE TABLE IF NOT EXISTS "${safeName}" (${colDefs})`);

      for (const row of rows) {
        const placeholders = columns.map(() => '?').join(', ');
        const padded = columns.map((_, i) => (row[i] !== undefined ? row[i] : ''));
        db.run(`INSERT INTO "${safeName}" VALUES (${placeholders})`, padded);
      }
    }

    // 쿼리 전처리
    let execSql = stripInto(sql);
    execSql = convertBracketIdents(execSql);
    execSql = convertSfmcFunctions(execSql);

    const result = db.exec(execSql);

    if (!result || result.length === 0) {
      return { columns: [], rows: [], rowCount: 0 };
    }

    const { columns, values } = result[0];
    return { columns, rows: values, rowCount: values.length };
  } finally {
    db.close();
  }
}
