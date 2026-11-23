import * as THREE from 'three';

// ============================================================================
// SACRED ZONES — Esiimsi Fortune Stand (ศาลาพระพุทธรูป) & Warm Gold Ubosot Illumination
// ============================================================================

export const ESIIMSI_CONFIG = {
  x: 32.0,
  y: 0.12,
  z: 10.6,
  interactRadius: 2.8
};

export const UBOSOT_BOUNDS = {
  // Inner courtyard bounds (used to step avatar feet cleanly onto the 0.16m tiled floor)
  minX: 7.1,
  maxX: 22.9,
  minZ: -55.9,
  maxZ: -31.1,
  floorY: 0.16
};

export const SALA_BOUNDS = {
  minX: 23.6,
  maxX: 38.4,
  minZ: 7.9,
  maxZ: 18.1,
  floorY: 0.12
};

// 28 Authentic Thai Temple Esiimsi Fortune Slips (ใบเซียมซี 1–28)
export const ESIIMSI_FORTUNES = [
  { num: 1, level: 'ดีมาก', tier: 'great', verse: 'ใบที่หนึ่งสมปองดังใจหมาย\nอุปสรรคทั้งหลายจะคลายสิ้น\nบุญกุศลหนุนนำเป็นอาจิณ\nทรัพย์สินหลั่งไหลมาไม่ขาดมือ', work: 'ผู้ใหญ่เมตตา มีเกณฑ์เลื่อนขั้นหรือได้งานใหม่ถูกใจ', finance: 'โชคลาภเด่น เงินเข้ามือคล่องตัว', love: 'คนโสดมีเกณฑ์พบรัก คนมีคู่หวานชื่น', health: 'แข็งแรง สดใส มีพลังเต็มเปี่ยม', lucky: '19, 91, 09' },
  { num: 2, level: 'ดี', tier: 'good', verse: 'ใบที่สองผ่องใสใต้แสงจันทร์\nความตั้งใจไม่หวั่นจักสำเร็จ\nค่อยทำไปทีละขั้นดังเพชรเม็ด\nผลตอบแทนงามเด็ดเมื่อถึงกาล', work: 'งานเดินหน้าเรื่อย ๆ สำเร็จด้วยความรอบคอบ', finance: 'เก็บออมอยู่ มีรายได้เสริมเข้ามา', love: 'เข้าใจกันดี ค่อย ๆ พัฒนาความสัมพันธ์', health: 'ปกติ ควรพักผ่อนให้ตรงเวลา', lucky: '24, 42, 02' },
  { num: 3, level: 'ดีมาก', tier: 'great', verse: 'ใบที่สามงามล้ำดังทองคำ\nสิ่งดีงามน้อมนำมาเคียงข้าง\nเดินไปไหนมีมิตรคอยนำทาง\nฟ้าเปิดกว้างสมหวังทุกประการ', work: 'โปรเจกต์ที่รอคอยสำเร็จเกินคาด', finance: 'มีลาภลอยจากคนใกล้ชิดหรือการเสี่ยงโชคเบา ๆ', love: 'เสน่ห์แรง มีคนเข้ามาทำความรู้จัก', health: 'สุขภาพดีมาก อารมณ์แจ่มใส', lucky: '36, 63, 39' },
  { num: 4, level: 'ปานกลาง', tier: 'mid', verse: 'ใบที่สี่พึงตั้งสติมั่น\nอย่ารีบด่วนตัดสินในเรื่องใหญ่\nรอเวลาอีกนิดจิตผ่องใส\nทุกปัญหาคลี่คลายด้วยปัญญา', work: 'อย่าใจร้อน ตรวจทานรายละเอียดให้ดีแล้วจะผ่านฉลุย', finance: 'พอหมุนเวียน ควรเลี่ยงรายจ่ายฟุ่มเฟือย', love: 'พูดคุยกันด้วยเหตุผลจะเข้าใจกันมากขึ้น', health: 'ระวังนอนดึกและอาการปวดเมื่อย', lucky: '45, 54, 14' },
  { num: 5, level: 'ดีมาก', tier: 'great', verse: 'ใบที่ห้าฟ้าประทานพรประเสริฐ\nชะตาเปิดรุ่งโรจน์โชติช่วงสี\nทำสิ่งใดราบรื่นและมั่งมี\nตลอดปีสุขสันต์นิรันดร์เทอญ', work: 'ได้โอกาสทองจากผู้ใหญ่หรือพันธมิตร', finance: 'เงินทองไหลมาเทมา ปลดภาระได้ไว', love: 'คู่ครองเกื้อหนุน พาชีวิตก้าวหน้า', health: 'แข็งแรง หายห่วงเรื่องเจ็บป่วย', lucky: '59, 95, 55' },
  { num: 6, level: 'ดี', tier: 'good', verse: 'ใบที่หกพกพาความสุขใจ\nการเดินทางปลอดภัยไร้อุปสรรค\nพบกัลยาณมิตรคอยทายทัก\nช่วยพิทักษ์เกื้อกูลให้รุ่งเรือง', work: 'เด่นเรื่องการเจรจา ติดต่อประสานงานราบรื่น', finance: 'ได้เงินจากน้ำพักน้ำแรง คุ้มค่าเหนื่อย', love: 'มีเกณฑ์ได้ไปเที่ยวด้วยกันอย่างมีความสุข', health: 'แข็งแรงดี ดื่มน้ำมาก ๆ จะยิ่งสดชื่น', lucky: '68, 86, 06' },
  { num: 7, level: 'ปานกลาง', tier: 'mid', verse: 'ใบที่เจ็ดเสร็จช้าแต่ชัวร์แท้\nขออย่าท้อยอมแพ้กลางทางหนา\nความขยันจะนำโชคเข้ามาหา\nเมื่อถึงเวลาฟ้าจะตอบแทนเอง', work: 'เหนื่อยหน่อยช่วงต้น แต่ปลายทางได้คำชม', finance: 'รายรับคงที่ ค่อย ๆ เก็บหอมรอมริบ', love: 'อย่าคิดมากไปเอง เปิดใจคุยกันตรง ๆ', health: 'พักสายตาและออกกำลังกายเบา ๆ บ้าง', lucky: '72, 27, 17' },
  { num: 8, level: 'ดีมาก', tier: 'great', verse: 'ใบที่แปดแผดแสงแห่งความรวย\nดวงชะตาเกื้อช่วยไร้กังวล\nค้าขายดีมีกำไรไม่ขัดสน\nมิ่งมงคลคุ้มครองผองภัยพาล', work: 'ค้าขาย-ธุรกิจคึกคัก ลูกค้าอุดหนุนล้นหลาม', finance: 'ดวงการเงินพุ่งแรง รับทรัพย์ก้อนโต', love: 'อบอุ่นมั่นคง มีข่าวดีในครอบครัว', health: 'สมบูรณ์แข็งแรง กระปรี้กระเปร่า', lucky: '88, 89, 98' },
  { num: 9, level: 'ดีมาก', tier: 'great', verse: 'ใบที่เก้าก้าวหน้าสถาพร\nคำอวยพรสิ่งศักดิ์สิทธิ์สัมฤทธิ์ผล\nคิดสิ่งใดสมจิตพิพิธมนต์\nพ้นความจนพบสุขทุกคืนวัน', work: 'ก้าวกระโดดในสายงาน มีชื่อเสียงเป็นที่ยอมรับ', finance: 'มั่งคั่งมั่นคง มีเงินเก็บเพิ่มพูน', love: 'พบรักแท้ที่เข้าใจและคอยสนับสนุน', health: 'สุขภาพดีเยี่ยม ใจสงบเป็นสุข', lucky: '99, 90, 09' },
  { num: 10, level: 'ดี', tier: 'good', verse: 'ใบที่สิบหยิบจับสิ่งใดคล่อง\nเงินและทองหมุนเวียนไม่ขาดสาย\nแม้งานหนักแต่ผลลัพธ์ช่างสบาย\nยิ้มรับได้ข่าวดีเร็ววันนี้', work: 'งานที่ค้างคาจะปิดจบได้สวยงาม', finance: 'มีเงินพิเศษหรือของขวัญถูกใจเข้ามา', love: 'มิตรภาพแปรเปลี่ยนเป็นความผูกพันดี ๆ', health: 'แข็งแรงดี ระวังทานของมันมากเกินไป', lucky: '10, 01, 18' },
  { num: 11, level: 'ดี', tier: 'good', verse: 'ใบสิบเอ็ดเด็ดเดี่ยวและมั่นคง\nความซื่อตรงนำทางสู่ความหมาย\nมีคนช่วยชี้แนะอยู่ไม่ไกล\nทุกข์มลายเหลือไว้แต่รอยยิ้ม', work: 'เพื่อนร่วมงานช่วยเหลือดี ทำงานเป็นทีมราบรื่น', finance: 'วางแผนการเงินได้ดี มีเงินเหลือเก็บ', love: 'ต่างฝ่ายต่างใส่ใจกันมากขึ้น', health: 'ร่างกายแข็งแรง จิตใจเบิกบาน', lucky: '11, 15, 51' },
  { num: 12, level: 'ปานกลาง', tier: 'mid', verse: 'ใบสิบสองตรองดูให้ถ้วนถี่\nเรื่องคำพูดวาจาพาเป็นศรี\nพูดจาหวานนุ่มนวลล้วนพาดี\nจะมากมีคนรักและเมตตา', work: 'สื่อสารให้ชัดเจนจะช่วยลดความเข้าใจผิด', finance: 'งดให้ยืมเงินชั่วคราวจะสบายใจกว่า', love: 'ใจเย็นและรับฟังกันให้มากแล้วจะหวานชื่น', health: 'ดูแลเรื่องการนอนหลับให้เพียงพอ', lucky: '12, 21, 26' },
  { num: 13, level: 'ดีมาก', tier: 'great', verse: 'ใบสิบสามงามเด่นเป็นสง่า\nบุญรักษาเทวดาคอยอุ้มชู\nศัตรูแพ้พ่ายมิอาจสู้\nความเฟื่องฟูมาเยือนถึงเรือนชาน', work: 'ชนะการแข่งขัน สอบผ่าน หรือได้งานที่เล็งไว้', finance: 'มีเกณฑ์รับทรัพย์แบบไม่คาดฝัน', love: 'คนรักเอาอกเอาใจเป็นพิเศษ', health: 'สดชื่นแข็งแรง มีสง่าราศี', lucky: '13, 31, 38' },
  { num: 14, level: 'ดี', tier: 'good', verse: 'ใบสิบสี่มีลาภจากการเดิน\nออกท่องเที่ยวเพลิดเพลินใจแจ่มใส\nได้ไอเดียสร้างสรรค์ไม่เหมือนใคร\nนำไปใช้ต่อยอดเป็นเงินทอง', work: 'ความคิดสร้างสรรค์โดดเด่น ผู้ใหญ่ชื่นชม', finance: 'รายได้จากงานเสริมหรืองานอิสระดีมาก', love: 'มีโอกาสเจอคนถูกใจระหว่างเดินทางหรืองานบุญ', health: 'แข็งแรงดี เปลี่ยนบรรยากาศแล้วสดชื่นขึ้น', lucky: '14, 41, 49' },
  { num: 15, level: 'ดีมาก', tier: 'great', verse: 'ใบสิบห้าฟ้าเพ็ญเด่นสกาว\nดุจแสงดาวส่องทางกลางคืนค่ำ\nสมปรารถนาในสิ่งอันดีงาม\nทุกโมงยามสุขล้นพ้นทุกข์ภัย', work: 'ทุกอย่างเข้าที่เข้าทาง มีความสุขกับงานที่ทำ', finance: 'คล่องมือมาก มีเงินทำบุญและดูแลครอบครัว', love: 'รักลงตัว อบอุ่นใจและเข้าใจกันลึกซึ้ง', health: 'สุขภาพกายใจสมดุลดีเยี่ยม', lucky: '15, 51, 59' },
  { num: 16, level: 'ดี', tier: 'good', verse: 'ใบสิบหกตกน้ำไม่เคยไหล\nตกกองไฟไม่ไหม้เพราะบุญหนุน\nเคยช่วยเหลือผู้อื่นด้วยเกื้อกูล\nผลใบบุญกลับมาตอบแทนไว', work: 'มีคนเก่า ๆ หรือคนรู้จักยื่นมือมาช่วย', finance: 'ได้เงินคืนหรือได้ผลตอบแทนที่รอคอย', love: 'ความจริงใจชนะใจอีกฝ่ายได้เสมอ', health: 'ฟื้นตัวไว แข็งแรงขึ้นเรื่อย ๆ', lucky: '16, 61, 69' },
  { num: 17, level: 'ปานกลาง', tier: 'mid', verse: 'ใบสิบเจ็ดเสร็จกิจด้วยใจเย็น\nยามลำเค็ญอย่าเพิ่งหวั่นไหวหนา\nเมฆหมอกจางตะวันจักทอแสงมา\nไม่ช้าหนาเรื่องร้ายกลายเป็นดี', work: 'ผ่านช่วงวุ่นวายไปได้แล้วงานจะเบาลงมาก', finance: 'ประคองตัวได้ดี ปลายเดือนจะคล่องขึ้น', love: 'ให้พื้นที่ส่วนตัวกันบ้างแล้วจะคิดถึงกันยิ่งขึ้น', health: 'ระวังอากาศเปลี่ยนแปลงและดื่มน้ำอุ่น', lucky: '17, 71, 74' },
  { num: 18, level: 'ดีมาก', tier: 'great', verse: 'ใบสิบแปดแจ่มแจ้งดังแสงทอง\nสิ่งหมายปองใกล้มาถึงมือแล้ว\nบุญลอยกระทงส่งให้คลาดแคล้ว\nดวงเพริศแพร้วโชคดีตลอดปี', work: 'ข่าวดีเรื่องงานหรือการเงินกำลังเดินทางมาถึง', finance: 'มีโชคจากตัวเลขหรือรางวัลเล็ก ๆ น้อย ๆ', love: 'หวานชื่นเหมือนเพิ่งเริ่มคบกันใหม่ ๆ', health: 'แข็งแรงสดใส ไม่มีเรื่องน่ากังวล', lucky: '18, 81, 89' },
  { num: 19, level: 'ดีมาก', tier: 'great', verse: 'ใบสิบเก้าก้าวไกลไร้ขวากหนาม\nมีคนถามไถ่ด้วยความห่วงใย\nทำธุรกิจรุ่งเรืองและก้าวไกล\nสมดังใจอธิษฐานคืนวันเพ็ญ', work: 'ขยายงาน ขยายโอกาสได้สวย มีคนสนับสนุน', finance: 'เงินเข้าหลายทาง มั่นคงขึ้นอย่างเห็นได้ชัด', love: 'คนโสดมีคนแอบปลื้ม คนมีคู่รักเหนียวแน่น', health: 'แข็งแรง มีพลังบวกเหลือล้น', lucky: '19, 91, 96' },
  { num: 20, level: 'ดี', tier: 'good', verse: 'ใบยี่สิบหยิบโชคมาใส่ถุง\nชีวิตพุ่งสดใสไม่หม่นหมอง\nหมั่นทำดีมีเมตตาตามครรลอง\nเงินและทองจักอยู่คู่กายา', work: 'ได้เรียนรู้ทักษะใหม่ ๆ ที่ช่วยเพิ่มรายได้', finance: 'พอมีพอกินและมีเหลือเก็บเพื่ออนาคต', love: 'เรียบง่ายแต่อบอุ่นใจ อยู่ด้วยกันแล้วสบายใจ', health: 'ปกติสุขดี ยิ้มบ่อย ๆ ยิ่งอายุยืน', lucky: '20, 02, 28' },
  { num: 21, level: 'ดี', tier: 'good', verse: 'ใบยี่สิบเอ็ดเด็ดดอกไม้หอม\nคนรายล้อมเอ็นดูและเมตตา\nขอพรพระสิ่งใดให้ตั้งจิตหนา\nไม่เกินช้าจักได้สมอารมณ์', work: 'ผู้ใหญ่เห็นความตั้งใจและมอบหมายงานสำคัญ', finance: 'มีรายรับเพิ่มจากความสามารถเฉพาะตัว', love: 'ได้รับของขวัญหรือคำหวานที่ทำให้ยิ้มได้ทั้งวัน', health: 'แข็งแรงดี ควรยืดเส้นยืดสายทุกเช้า', lucky: '21, 12, 29' },
  { num: 22, level: 'ปานกลาง', tier: 'mid', verse: 'ใบยี่สิบสองมองการณ์ให้กว้างไกล\nอย่าหวั่นไหวกับคำคนรอบข้าง\nเชื่อมั่นในความดีที่ตนสร้าง\nแล้วเส้นทางจะนำสู่ความเจริญ', work: 'โฟกัสเป้าหมายของตัวเองแล้วจะสำเร็จสวยงาม', finance: 'จัดระเบียบรายจ่ายได้ดีขึ้นมาก', love: 'เชื่อใจกันและกัน อย่าฟังคำยุแยง', health: 'ผ่อนคลายความเครียด ฟังเพลงเบา ๆ จะดีมาก', lucky: '22, 25, 52' },
  { num: 23, level: 'ดีมาก', tier: 'great', verse: 'ใบยี่สิบสามความสุขมาเคาะประตู\nสิ่งดีงามพรั่งพรูไม่หยุดหย่อน\nค่ำคืนนี้ลอยทุกข์และอาวรณ์\nรับพรพระสถาพรตลอดไป', work: 'งานราบรื่นเกินคาด มีโอกาสดีเข้ามาไม่ขาด', finance: 'รับทรัพย์รับโชค เงินทองไม่ขาดมือ', love: 'ความรักเบ่งบาน มีช่วงเวลาที่น่าจดจำ', health: 'แข็งแรง สดใส เปล่งปลั่ง', lucky: '23, 32, 24' },
  { num: 24, level: 'ดีมาก', tier: 'great', verse: 'ใบยี่สิบสี่ศรีสุขสวัสดิ์\nบุญสมบัติติดตัวมาแต่หลัง\nคิดทำการสิ่งใดได้ดังหวัง\nเปี่ยมพลังความสำเร็จทุกทิศทาง', work: 'ได้ร่วมงานกับคนเก่ง พาโปรเจกต์ปังสุด ๆ', finance: 'โชคลาภเด่นชัด การเงินหมุนคล่องมาก', love: 'ครอบครัวและคนรักคอยเป็นกำลังใจให้เสมอ', health: 'สุขภาพดีเยี่ยม ใจสงบร่มเย็น', lucky: '24, 42, 48' },
  { num: 25, level: 'ดี', tier: 'good', verse: 'ใบยี่สิบห้ารักษาความดีไว้\nแม้นอยู่ไกลบ้านเรือนก็ไม่เหงา\nมีเพื่อนดีคอยเคียงข้างคลายทุกข์เศร้า\nเรื่องหนักเบาผ่านพ้นอย่างง่ายดาย', work: 'ได้รับความร่วมมืออย่างดีจากคนรอบตัว', finance: 'มีเงินใช้ไม่ขาดมือ มีโชคเล็ก ๆ พอชื่นใจ', love: 'ได้พบปะสังสรรค์และสานสัมพันธ์ดี ๆ', health: 'แข็งแรงดี ทานอาหารให้ครบมื้อ', lucky: '25, 52, 57' },
  { num: 26, level: 'ดี', tier: 'good', verse: 'ใบยี่สิบหกยกจิตให้ผ่องแผ้ว\nเรื่องกังวลผ่านแล้วอย่าเก็บไว้\nเริ่มต้นใหม่วันนี้ด้วยใจใส\nความสำเร็จอยู่ไม่ไกลเกินเอื้อมมือ', work: 'เริ่มสิ่งใหม่ ๆ ได้ดี มีแนวโน้มเติบโตสูง', finance: 'ค่อย ๆ ดีขึ้นอย่างมั่นคง ปลดหนี้ได้ไว', love: 'ลืมอดีตแล้วเปิดใจรับสิ่งดี ๆ ที่กำลังเข้ามา', health: 'จิตใจแจ่มใส ร่างกายก็แข็งแรงตาม', lucky: '26, 62, 66' },
  { num: 27, level: 'ดีมาก', tier: 'great', verse: 'ใบยี่สิบเจ็ดเพชรแท้ย่อมส่องแสง\nความสามารถแสดงให้คนเห็น\nไม่ต้องเร่งไม่ต้องรีบให้ลำเค็ญ\nดวงโดดเด่นรับทรัพย์รับชื่อเสียง', work: 'ผลงานเข้าตาผู้ใหญ่ มีเกณฑ์ได้รางวัลหรือโบนัส', finance: 'การเงินเฟื่องฟู มีโอกาสลงทุนที่ได้กำไรดี', love: 'มีเสน่ห์น่าคบหา ความรักราบรื่นสดใส', health: 'แข็งแรง กระฉับกระเฉง', lucky: '27, 72, 79' },
  { num: 28, level: 'ดีมาก', tier: 'great', verse: 'ใบยี่สิบแปดสมบูรณ์พูนสวัสดิ์\nบุญวัดทุ่งท่าช้างช่วยคุ้มเกล้า\nความทุกข์โศกโรคภัยจงบางเบา\nเหลือแต่ความสุขเร้าตลอดกาล', work: 'สำเร็จลุล่วงทุกเป้าหมาย สมปรารถนาทุกด้าน', finance: 'เฮง ปัง รวย มีโชคใหญ่ส่งท้ายปี', love: 'รักมั่นคงยืนยาว เปี่ยมด้วยความเข้าใจ', health: 'แข็งแรงอายุยืนยาว ปราศจากโรคภัย', lucky: '28, 82, 88' }
];

// ----------------------------------------------------------------------------
// 1. 3D Esiimsi Fortune Stand inside Sala Buddha (ศาลาพระพุทธรูป)
// ----------------------------------------------------------------------------

function createEsiimsiSignTex() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 96;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#7f1d1d';
  ctx.fillRect(0, 0, 256, 96);
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 6;
  ctx.strokeRect(5, 5, 246, 86);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '800 38px "Noto Sans Thai", sans-serif';
  ctx.fillStyle = '#fef08a';
  ctx.fillText('🎋 เซียมซี', 128, 40);
  ctx.font = '600 18px "Noto Sans Thai", sans-serif';
  ctx.fillStyle = '#fde68a';
  ctx.fillText('เสี่ยงทายดวงชะตา', 128, 74);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function buildEsiimsiStand(scene, addCollisionBox) {
  const root = new THREE.Group();
  root.name = 'SalaEsiimsiStand';
  root.position.set(ESIIMSI_CONFIG.x, ESIIMSI_CONFIG.y, ESIIMSI_CONFIG.z);
  root.rotation.y = -Math.PI * 0.35; // Angled invitingly toward players entering the pavilion

  const redLacquerMat = new THREE.MeshStandardMaterial({
    color: 0x991b1b,
    roughness: 0.42,
    emissive: 0x3b0909,
    emissiveIntensity: 0.35
  });
  const goldTrimMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    roughness: 0.3,
    metalness: 0.5,
    emissive: 0x6b3d05,
    emissiveIntensity: 0.4
  });
  const bambooMat = new THREE.MeshStandardMaterial({
    color: 0xfde68a,
    roughness: 0.7,
    emissive: 0x4a3512,
    emissiveIntensity: 0.3
  });
  const tipRedMat = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    roughness: 0.45,
    emissive: 0x5c0c0c,
    emissiveIntensity: 0.35
  });

  // Ornate red-gold fortune table (0.95m x 0.78m x 0.55m)
  const tableTop = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.07, 0.56), redLacquerMat);
  tableTop.position.y = 0.76;
  root.add(tableTop);

  const trimBand = new THREE.Mesh(new THREE.BoxGeometry(0.99, 0.03, 0.59), goldTrimMat);
  trimBand.position.y = 0.72;
  root.add(trimBand);

  const cabinet = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.72, 0.46), redLacquerMat);
  cabinet.position.y = 0.36;
  root.add(cabinet);

  // Small fortune slip cubby grid on the right half of the table
  const slipBox = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.34, 0.24), redLacquerMat);
  slipBox.position.set(0.24, 0.96, -0.06);
  root.add(slipBox);
  const slipPaper = new THREE.Mesh(
    new THREE.BoxGeometry(0.31, 0.28, 0.03),
    new THREE.MeshStandardMaterial({ color: 0xfef3c7, emissive: 0x4a3d1a, emissiveIntensity: 0.35 })
  );
  slipPaper.position.set(0.24, 0.96, 0.06);
  root.add(slipPaper);

  // Two Red Bamboo Esiimsi Shaker Cups with numbered bamboo sticks sticking out!
  for (const cx of [-0.24, -0.02]) {
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.056, 0.22, 12), redLacquerMat);
    cup.position.set(cx, 0.9, 0.08);
    root.add(cup);

    const goldRing = new THREE.Mesh(new THREE.TorusGeometry(0.068, 0.01, 6, 14), goldTrimMat);
    goldRing.rotation.x = Math.PI / 2;
    goldRing.position.set(cx, 1.0, 0.08);
    root.add(goldRing);

    for (let s = 0; s < 9; s++) {
      const ang = (s / 9) * Math.PI * 2;
      const rad = 0.025 + (s % 2) * 0.015;
      const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.26, 5), bambooMat);
      stick.position.set(cx + Math.cos(ang) * rad, 1.04 + (s % 3) * 0.012, 0.08 + Math.sin(ang) * rad);
      stick.rotation.set(Math.sin(ang) * 0.16, 0, -Math.cos(ang) * 0.16);
      root.add(stick);

      const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.0065, 0.0065, 0.035, 5), tipRedMat);
      tip.position.set(cx + Math.cos(ang) * (rad + 0.018), 1.16 + (s % 3) * 0.012, 0.08 + Math.sin(ang) * (rad + 0.018));
      root.add(tip);
    }
  }

  // Front Golden-Red Sign Plaque ("🎋 เซียมซี")
  const signTex = createEsiimsiSignTex();
  const signMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(0.72, 0.27),
    new THREE.MeshBasicMaterial({ map: signTex, side: THREE.DoubleSide })
  );
  signMesh.position.set(0, 0.52, 0.245);
  root.add(signMesh);

  // Elevated floating signboard above slip box so it's easy to spot from across the pavilion
  const topSign = new THREE.Mesh(
    new THREE.PlaneGeometry(0.68, 0.25),
    new THREE.MeshBasicMaterial({ map: signTex, side: THREE.DoubleSide })
  );
  topSign.position.set(0.02, 1.38, -0.06);
  root.add(topSign);

  scene.add(root);

  if (typeof addCollisionBox === 'function') {
    addCollisionBox(
      ESIIMSI_CONFIG.x - 0.52,
      ESIIMSI_CONFIG.x + 0.52,
      ESIIMSI_CONFIG.z - 0.42,
      ESIIMSI_CONFIG.z + 0.42,
      'sala-esiimsi-stand'
    );
  }

  return { root };
}

// ----------------------------------------------------------------------------
// 2. Warm Gold Architectural Night Lighting for Ubosot (อุโบสถ)
// ----------------------------------------------------------------------------

function createWarmBeamTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 256, 0, 0);
  grad.addColorStop(0, 'rgba(255, 224, 130, 0.42)');
  grad.addColorStop(0.35, 'rgba(251, 191, 36, 0.20)');
  grad.addColorStop(0.75, 'rgba(245, 158, 11, 0.06)');
  grad.addColorStop(1, 'rgba(245, 158, 11, 0.0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 256);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createGroundHaloTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(64, 64, 4, 64, 64, 64);
  grad.addColorStop(0, 'rgba(255, 232, 150, 0.65)');
  grad.addColorStop(0.45, 'rgba(251, 191, 36, 0.22)');
  grad.addColorStop(1, 'rgba(245, 158, 11, 0.0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function enhanceUbosotModel(ubosotModel) {
  if (!ubosotModel) return;
  // Add a dignified Warm Gold architectural night wash directly onto Ubosot materials
  // so it shines clearly from afar even in Mobile Low Graphics mode!
  ubosotModel.traverse((obj) => {
    if (!obj.isMesh || !obj.material) return;
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
    const name = (obj.name || '').toLowerCase();
    const isGoldPart = name.includes('gold') || name.includes('ornament') || name.includes('dharma');
    const isRoofOrWall =
      name.includes('hall') ||
      name.includes('column') ||
      name.includes('roof') ||
      name.includes('gable') ||
      name.includes('gate') ||
      name.includes('plinth');

    for (const m of mats) {
      if (!m || !m.emissive) continue;
      if (isGoldPart) {
        m.emissive.setHex(0x8a5c10);
        m.emissiveIntensity = 0.62;
      } else if (isRoofOrWall) {
        m.emissive.setHex(0x4a3818);
        m.emissiveIntensity = 0.42;
      } else {
        m.emissive.setHex(0x342914);
        m.emissiveIntensity = 0.28;
      }
      if (obj.userData._stdMat && obj.userData._stdMat !== m && obj.userData._stdMat.emissive) {
        obj.userData._stdMat.emissive.copy(m.emissive);
        obj.userData._stdMat.emissiveIntensity = m.emissiveIntensity;
      }
    }
  });
}

export function buildUbosotLighting(scene, lowGraphics = false) {
  const root = new THREE.Group();
  root.name = 'UbosotWarmGoldLighting';
  const cx = 15.0;
  const cz = -43.5;

  // 1) 8 Warm-Gold Architectural Uplight Fixtures + Upward Soft Golden Light Cones around Ubosot!
  const uplightPositions = [
    // Front facade (South) — flanks the grand staircase & gable
    { x: cx - 3.6, z: cz + 8.6, rotX: -0.18, rotZ: 0.08 },
    { x: cx + 3.6, z: cz + 8.6, rotX: -0.18, rotZ: -0.08 },
    // East & West colonnade uplights
    { x: cx + 5.7, z: cz + 4.0, rotX: 0, rotZ: 0.2 },
    { x: cx + 5.7, z: cz - 4.0, rotX: 0, rotZ: 0.2 },
    { x: cx - 5.7, z: cz + 4.0, rotX: 0, rotZ: -0.2 },
    { x: cx - 5.7, z: cz - 4.0, rotX: 0, rotZ: -0.2 },
    // Rear facade (North)
    { x: cx - 3.4, z: cz - 8.6, rotX: 0.18, rotZ: 0.08 },
    { x: cx + 3.4, z: cz - 8.6, rotX: 0.18, rotZ: -0.08 }
  ];

  const fixtureGeo = new THREE.BoxGeometry(0.32, 0.16, 0.22);
  const fixtureMat = new THREE.MeshStandardMaterial({ color: 0x292524, roughness: 0.5, metalness: 0.5 });
  const fixtureInst = new THREE.InstancedMesh(fixtureGeo, fixtureMat, uplightPositions.length);

  const lensGeo = new THREE.PlaneGeometry(0.24, 0.14);
  const lensMat = new THREE.MeshBasicMaterial({ color: 0xfff5cc });
  const lensInst = new THREE.InstancedMesh(lensGeo, lensMat, uplightPositions.length);

  const beamTex = createWarmBeamTexture();
  const beamGeo = new THREE.ConeGeometry(1.75, 5.6, 12, 1, true);
  beamGeo.translate(0, 2.8, 0);
  const beamMat = new THREE.MeshBasicMaterial({
    map: beamTex,
    color: 0xffd670,
    transparent: true,
    opacity: 0.55,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const beamInst = new THREE.InstancedMesh(beamGeo, beamMat, uplightPositions.length);

  const haloTex = createGroundHaloTexture();
  const haloGeo = new THREE.PlaneGeometry(3.4, 3.4);
  haloGeo.rotateX(-Math.PI / 2);
  const haloMat = new THREE.MeshBasicMaterial({
    map: haloTex,
    transparent: true,
    opacity: 0.72,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const haloInst = new THREE.InstancedMesh(haloGeo, haloMat, uplightPositions.length);

  const dummy = new THREE.Object3D();
  uplightPositions.forEach((p, i) => {
    dummy.position.set(p.x, 0.24, p.z);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    fixtureInst.setMatrixAt(i, dummy.matrix);

    dummy.position.set(p.x, 0.33, p.z);
    dummy.rotation.set(-Math.PI / 2, 0, 0);
    dummy.updateMatrix();
    lensInst.setMatrixAt(i, dummy.matrix);

    dummy.position.set(p.x, 0.3, p.z);
    dummy.rotation.set(p.rotX, 0, p.rotZ);
    dummy.updateMatrix();
    beamInst.setMatrixAt(i, dummy.matrix);

    dummy.position.set(p.x, 0.21, p.z);
    dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix();
    haloInst.setMatrixAt(i, dummy.matrix);
  });
  [fixtureInst, lensInst, beamInst, haloInst].forEach((m) => {
    m.instanceMatrix.needsUpdate = true;
    root.add(m);
  });

  // 2) 12 Warm Golden Temple Wall Pillar Globes around Kampheng Kaeo corners & arched gates!
  const globePositions = [
    // 4 Kampheng Kaeo corners
    [cx - 8.15, 1.62, cz - 12.7],
    [cx + 8.15, 1.62, cz - 12.7],
    [cx - 8.15, 1.62, cz + 12.7],
    [cx + 8.15, 1.62, cz + 12.7],
    // Flanking South Gate (front entrance)
    [cx - 1.55, 1.72, cz + 12.7],
    [cx + 1.55, 1.72, cz + 12.7],
    // Flanking North Gate
    [cx - 1.55, 1.72, cz - 12.7],
    [cx + 1.55, 1.72, cz - 12.7],
    // Flanking East Gate (aligned with rear side arch at cz - 6.0)
    [cx + 8.15, 1.72, cz - 7.55],
    [cx + 8.15, 1.72, cz - 4.45],
    // Flanking West Gate (aligned with rear side arch at cz - 6.0)
    [cx - 8.15, 1.72, cz - 7.55],
    [cx - 8.15, 1.72, cz - 4.45]
  ];
  const globeInst = new THREE.InstancedMesh(
    new THREE.SphereGeometry(0.17, 10, 8),
    new THREE.MeshBasicMaterial({ color: 0xffe89e }),
    globePositions.length
  );
  const globeHaloInst = new THREE.InstancedMesh(
    new THREE.SphereGeometry(0.42, 8, 6),
    new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    }),
    globePositions.length
  );
  globePositions.forEach(([gx, gy, gz], i) => {
    dummy.position.set(gx, gy, gz);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    globeInst.setMatrixAt(i, dummy.matrix);
    globeHaloInst.setMatrixAt(i, dummy.matrix);
  });
  globeInst.instanceMatrix.needsUpdate = true;
  globeHaloInst.instanceMatrix.needsUpdate = true;
  root.add(globeInst, globeHaloInst);

  // 3) Dedicated Warm Golden Floodlight illuminating the front facade & golden gable!
  const frontFloodLight = new THREE.PointLight(0xffd27a, lowGraphics ? 0 : 62, 34, 1.25);
  frontFloodLight.position.set(cx, 5.4, cz + 10.6);
  root.add(frontFloodLight);

  scene.add(root);
  return { root, frontFloodLight };
}

export function setUbosotLightingMode(ubosotLightState, lowGraphics) {
  if (!ubosotLightState || !ubosotLightState.frontFloodLight) return;
  ubosotLightState.frontFloodLight.intensity = lowGraphics ? 0 : 62;
}
