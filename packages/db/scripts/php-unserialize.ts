// WordPress 메타의 PHP serialize 문자열 파서 (배열·문자열·숫자·불리언·null 만 지원).
// 문자열 길이는 UTF-8 바이트 기준이라 Buffer 로 읽는다.
export function unserialize(input: string): unknown {
  if (!input) return null;
  const buf = Buffer.from(input, "utf8");
  let i = 0;
  const readUntil = (ch: string) => {
    const end = buf.indexOf(ch, i);
    const s = buf.toString("utf8", i, end);
    i = end + 1;
    return s;
  };
  const parse = (): unknown => {
    const type = String.fromCharCode(buf[i]);
    i += 2; // "x:"
    switch (type) {
      case "N":
        return null;
      case "b":
        return readUntil(";") === "1";
      case "i":
      case "d":
        return Number(readUntil(";"));
      case "s": {
        const len = Number(readUntil(":"));
        i += 1; // opening quote
        const s = buf.toString("utf8", i, i + len);
        i += len + 2; // closing quote + ;
        return s;
      }
      case "a": {
        const n = Number(readUntil(":"));
        i += 1; // {
        const obj: Record<string, unknown> = {};
        for (let k = 0; k < n; k++) {
          const key = parse() as string | number;
          obj[String(key)] = parse();
        }
        i += 1; // }
        const keys = Object.keys(obj);
        return keys.every((k, idx) => k === String(idx)) ? keys.map((k) => obj[k]) : obj;
      }
      default:
        throw new Error(`unsupported php serialize type "${type}" at ${i}`);
    }
  };
  try {
    return parse();
  } catch {
    return null;
  }
}
