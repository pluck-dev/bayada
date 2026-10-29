import { createHash, createHmac } from "node:crypto";
import { compare } from "bcryptjs";

// bestcareacademy.com 에서 옮겨 온 회원은 WordPress 비밀번호 해시를 그대로 갖고 있다.
// - "$wp$2y$..." : WordPress 6.8+ (bcrypt of base64(HMAC-SHA384(pw, "wp-sha384")))
// - "$P$..."     : 예전 phpass portable hash
// 검증에 성공하면 호출 측에서 bcrypt 로 다시 저장한다 (needsRehash).

const ITOA64 = "./0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

function phpassEncode64(input: Buffer, count: number): string {
  let out = "";
  let i = 0;
  // noUncheckedIndexedAccess: 범위 밖 바이트는 0 으로 본다
  const at = (n: number) => input[n] ?? 0;
  const ch = (n: number) => ITOA64[n & 0x3f]!;
  do {
    let value = at(i++);
    out += ch(value);
    if (i < count) value |= at(i) << 8;
    out += ch(value >> 6);
    if (i++ >= count) break;
    if (i < count) value |= at(i) << 16;
    out += ch(value >> 12);
    if (i++ >= count) break;
    out += ch(value >> 18);
  } while (i < count);
  return out;
}

function phpassCheck(password: string, stored: string): boolean {
  const countLog2 = ITOA64.indexOf(stored.charAt(3));
  if (countLog2 < 7 || countLog2 > 30) return false;
  const salt = stored.slice(4, 12);
  const pw = Buffer.from(password, "utf8");
  let hash = createHash("md5").update(salt).update(pw).digest();
  for (let n = 1 << countLog2; n > 0; n--) {
    hash = createHash("md5").update(hash).update(pw).digest();
  }
  return stored.slice(0, 12) + phpassEncode64(hash, 16) === stored;
}

export async function verifyPassword(
  password: string,
  stored: string
): Promise<{ valid: boolean; needsRehash: boolean }> {
  if (stored.startsWith("$wp$")) {
    const prehashed = createHmac("sha384", "wp-sha384").update(password).digest("base64");
    // PHP 의 $2y$ 는 bcryptjs 의 $2a$ 와 같은 알고리즘이다
    const valid = await compare(prehashed, stored.slice(3).replace(/^\$2y\$/, "$2a$"));
    return { valid, needsRehash: valid };
  }
  if (stored.startsWith("$P$") || stored.startsWith("$H$")) {
    const valid = phpassCheck(password, stored);
    return { valid, needsRehash: valid };
  }
  return { valid: await compare(password, stored.replace(/^\$2y\$/, "$2a$")), needsRehash: false };
}
