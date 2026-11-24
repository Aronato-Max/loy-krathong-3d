// ============================================================================
// THAI & ENGLISH PROFANITY FILTER (Client-Side Instant Check — mirrors server)
// ============================================================================

const THAI_SUBSTRINGS = [
  'เหี้ย', 'เหีย้', 'เหี้e', 'เxี้ย', 'เxีย', 'เชี่ย', 'เชี้ย', 'เชีย้',
  'สัส', 'สัz', 'สัดเอ้ย', 'ไอ้สัด', 'อีสัด', 'อิสัด', 'สัตว์นรก',
  'ควย', 'คxย', 'คuย', 'ควE',
  'เย็ด', 'เy็ด', 'เยด', 'เย็x',
  'เงี่ยน', 'กะหรี่', 'กระหรี่', 'กxหรี่',
  'แม่ง', 'พ่อง', 'แม่มึง', 'พ่อมึง', 'มึง',
  'อีดอก', 'อิดอก', 'ดอกทอง', 'ตอแหล', 'สถุล', 'ระยำ', 'จัญไร', 'อัปรีย์',
  'ชิบหาย', 'ฉิบหาย', 'ส้นตีน', 'หน้าหี', 'หัวควย', 'เลียหี', 'หีแตด',
  'หีเหม็น', 'หีดำ', 'หีใหญ่', 'อีหี', 'ไอ้หี', 'ขายหี', 'แตด', 'ชักว่าว',
  'อีแรด', 'ไอ้เวร', 'อีเวร', 'ไอ้บ้า', 'อีบ้า', 'ไอ้โง่', 'อีโง่',
  'ไอ้ควาย', 'อีควาย', 'ไอ้หมา', 'อีหมา', 'ไอ้เปรต', 'อีเปรต', 'ไอ้หน้าหมา',
  'ไอ้เหี้ย', 'อีเหี้ย', 'ไอ้สัส', 'อีสัส', 'ไอ้เชี่ย', 'อีเชี่ย',
  'ไอ้ชั่ว', 'อีชั่ว', 'ไอ้เลว', 'อีเลว', 'สวะ', 'สันดาน', 'หน้าด้าน',
  'ปัญญาอ่อน', 'อมควย', 'ดูดควย', 'ชักควย', 'ควยแข็ง', 'แตกใน', 'น้ำเงี่ยน',
  'เย็ดแม่', 'เย็ดพ่อ', 'หำใหญ่', 'ขยะสังคม'
];

const THAI_EXACT_TOKENS = new Set([
  'หี', 'กู', 'สัด', 'หำ', 'ตีน', 'ชห', 'คว', 'เหีย', 'เยด'
]);

const EN_SUBSTRINGS = [
  'fuck', 'fuk', 'fck', 'motherfucker', 'bullshit', 'asshole', 'bitch',
  'cunt', 'whore', 'nigger', 'nigga', 'blowjob', 'handjob', 'pornhub',
  'hentai', 'dildo', 'penis', 'vagina'
];

const EN_WORD_RE = /\b(shit|dick|cock|pussy|slut|bastard|wtf|stfu|porn|boobs|cum|milf|xxx|fag|faggot|retard)\b/i;

function normalizeTextForCheck(raw) {
  const base = String(raw || '')
    .normalize('NFC')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .toLowerCase();

  const spaced = base
    .replace(/[.,_\-*/\\|!@#$%^&()+=~`'"[\]{}:;<>?]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const compact = base
    .replace(/[\s.,_\-*/\\|!@#$%^&()+=~`'"[\]{}:;<>?]+/g, '')
    .replace(/(.)\1{2,}/g, '$1$1');

  const compactSingle = compact.replace(/(.)\1+/g, '$1');

  const leetSpaced = base
    .replace(/0/g, 'o')
    .replace(/1/g, 'i')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/5/g, 's')
    .replace(/7/g, 't')
    .replace(/@/g, 'a')
    .replace(/\$/g, 's')
    .replace(/[.,_\-*/\\|!#%^&()+=~`'"[\]{}:;<>?]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const leetCompact = leetSpaced.replace(/\s+/g, '').replace(/(.)\1+/g, '$1');

  return { spaced, compact, compactSingle, leetSpaced, leetCompact };
}

export function containsProfanity(raw) {
  if (!raw || typeof raw !== 'string') return false;
  const { spaced, compact, compactSingle, leetSpaced, leetCompact } = normalizeTextForCheck(raw);
  if (!compact) return false;

  for (let i = 0; i < THAI_SUBSTRINGS.length; i++) {
    const bad = THAI_SUBSTRINGS[i];
    if (compact.includes(bad) || compactSingle.includes(bad)) {
      return true;
    }
  }

  if (THAI_EXACT_TOKENS.has(compact) || THAI_EXACT_TOKENS.has(compactSingle)) {
    return true;
  }
  const tokens = spaced.split(' ');
  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i].replace(/(.)\1{2,}/g, '$1');
    if (THAI_EXACT_TOKENS.has(tokens[i]) || THAI_EXACT_TOKENS.has(tok)) {
      return true;
    }
  }

  for (let i = 0; i < EN_SUBSTRINGS.length; i++) {
    if (leetCompact.includes(EN_SUBSTRINGS[i])) {
      return true;
    }
  }

  if (EN_WORD_RE.test(spaced) || EN_WORD_RE.test(leetSpaced)) {
    return true;
  }

  return false;
}
