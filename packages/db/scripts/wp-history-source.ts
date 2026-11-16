// Read only the three learning-history tables; never execute SQL from the backup.
export const HISTORY_TABLES = ["stm_lms_user_courses", "stm_lms_user_lessons", "stm_lms_user_quizzes"] as const;
export type HistoryRow = Record<string, string | number | null>;

export function readHistoryTable(sql: string, suffix: typeof HISTORY_TABLES[number]): HistoryRow[] {
  const table = `lLJ_${suffix}`;
  const ddl = sql.match(new RegExp("CREATE TABLE `" + table + "` \\(([\\s\\S]*?)\\) ENGINE="));
  if (!ddl) throw new Error(`Missing schema: ${table}`);
  const columns = [...ddl[1]!.matchAll(/^\s*`([^`]+)`/gm)].map((m) => m[1]!);
  const rows: HistoryRow[] = [];
  const marker = `INSERT INTO \`${table}\` VALUES `;
  let offset = 0;
  while ((offset = sql.indexOf(marker, offset)) !== -1) {
    let i = offset + marker.length;
    for (;;) {
      while (/\s|,/.test(sql[i] ?? "") && i < sql.length) i++;
      if (sql[i] === ";") { offset = i + 1; break; }
      if (sql[i++] !== "(") throw new Error(`Invalid row: ${table}`);
      const values: (string | number | null)[] = [];
      for (;;) {
        while (/\s/.test(sql[i] ?? "") && i < sql.length) i++;
        const quote = sql[i];
        let value: string | number | null;
        if (quote === "'" || quote === '"') {
          i++;
          let text = "", closed = false;
          while (i < sql.length) {
            const ch = sql[i++]!;
            if (ch === "\\") {
              const escaped = sql[i++];
              if (escaped === undefined) throw new Error("Truncated escape");
              text += ({ n: "\n", r: "\r", t: "\t", "0": "\0", b: "\b", Z: "\x1a" } as Record<string, string>)[escaped] ?? escaped;
            } else if (ch === quote) {
              if (sql[i] === quote) { text += quote; i++; }
              else { closed = true; break; }
            } else text += ch;
          }
          if (!closed) throw new Error("Unterminated SQL string");
          value = text;
        } else {
          const start = i;
          while (i < sql.length && sql[i] !== "," && sql[i] !== ")") i++;
          const token = sql.slice(start, i).trim();
          if (token === "NULL") value = null;
          else if (/^-?\d+(\.\d+)?$/.test(token)) value = Number(token);
          else throw new Error(`Unsupported SQL value: ${table}`);
        }
        values.push(value);
        while (/\s/.test(sql[i] ?? "") && i < sql.length) i++;
        const delimiter = sql[i++];
        if (delimiter === ")") break;
        if (delimiter !== ",") throw new Error(`Invalid delimiter: ${table}`);
      }
      if (values.length !== columns.length) throw new Error(`Column count mismatch: ${table}`);
      rows.push(Object.fromEntries(columns.map((name, index) => [name, values[index]!])));
    }
  }
  return rows;
}

export function unixDate(value: unknown): Date | null {
  const seconds = Number(value);
  const date = new Date(seconds * 1000);
  return seconds > 0 && Number.isFinite(date.getTime()) ? date : null;
}

export function mergeEnrollment(row: HistoryRow, old?: { progressPercent: number; completedAt: Date | null; createdAt: Date }) {
  const percent = Number(row.progress_percent);
  if (!Number.isInteger(percent) || percent < 0 || percent > 100) throw new Error("Invalid source progress");
  const started = unixDate(row.start_time);
  if (!old && !started) throw new Error("Missing enrollment start date; refusing to fabricate a registration date");
  return {
    progressPercent: Math.max(old?.progressPercent ?? 0, percent),
    completedAt: old?.completedAt ?? (percent === 100 ? unixDate(row.end_time) ?? started : null),
    createdAt: old?.createdAt ?? started!,
  };
}

export function quizDate(value: unknown, offset: string): Date | null {
  if (!/^[+-](0\d|1[0-4]):[0-5]\d$/.test(offset)) throw new Error("Expected explicit source UTC offset, e.g. +09:00");
  if (typeof value !== "string" || !/^\d{4}-\d\d-\d\d \d\d:\d\d:\d\d$/.test(value)) return null;
  // This backup has no SET TIME_ZONE declaration; the operator supplies its timezone.
  const date = new Date(value.replace(" ", "T") + offset);
  return Number.isFinite(date.getTime()) ? date : null;
}
