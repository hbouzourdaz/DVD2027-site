# موقع مكتبة فيزياء سطيف

المستودع الصغير للموقع. يُنشر على Vercel ولا يحتوي على الملفات الفعلية.

## البنية المعمارية

| المستودع | الدور | الحجم |
|---|---|---|
| **هذا المستودع** (الموقع) | index.html + لا.html + data.js + data.json → Vercel | ~6 MB |
| `hbouzourdaz/DVD2027` | الملفات الفعلية فقط (public) → تُخدَّم عبر روابط raw | ~9.2 GB |

روابط «فتح الملف» في الموقع تُبنى هكذا:

```
https://raw.githubusercontent.com/hbouzourdaz/DVD2027/main/files/<المسار المرمّز>
```

وهذا يفسّر لماذا يجب أن يبقى مستودع `DVD2027` **عاماً** — الروابط لا تعمل للمستودعات الخاصة.

## الملفات

```
E:\DVD2027-site\
├─ index.html            الموقع الرئيسي (مستودع الملفات عبر raw)
├─ لا.html               نسخة الموقع الثاني
├─ data.js               بيانات الملفات (يُحمَّل مباشرة)
├─ data.json             نسخة JSON احتياطية
├─ scripts/generate-data.js   يولّد data.js و data.json من E:\DVD2027\files
└─ README.md
```

## إعادة توليد البيانات (بعد إضافة/تعديل الملفات)

البيانات تولَّد من مجلد الملفات في **المستودع الكبير**:

```bash
node E:\DVD2027\scripts\generate-data.js E:\DVD2027\files E:\DVD2027\data.json
```

ثم انسخ `data.js` و `data.json` إلى هذا المستودع وادفعهما:

```bash
copy E:\DVD2027\data.js   E:\DVD2027-site\data.js
copy E:\DVD2027\data.json E:\DVD2027-site\data.json
git add -A
git commit -m "تحديث الفهرس"
git push
```

بعد الدفع يُعاد نشر الموقع تلقائياً على Vercel.

## التجربة محلياً

```bash
npx serve E:\DVD2027-site
```

ملاحظة: روابط «فتح الملف» تتطلب اتصالاً بالإنترنت لأنها تحمّل من GitHub raw.

## النشر على Vercel

1. على [vercel.com](https://vercel.com): **Add New → Project**.
2. استورد هذا المستودع.
3. Framework Preset: **Other**، Output Directory: **/**.
4. **Deploy** — يتم النشر في ثوانٍ لأن المشروع صغير.
