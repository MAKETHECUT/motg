MOTG — קבצי JS להעלאה ל-Git / jsDelivr
=====================================

העלה את כל הקבצים בתיקייה הזו (אותה רמה ב-repo — לא בתת-תיקייה),
אלא אם ב-git אתה שומר אותם תחת motg-js-upload/ — אז ב-jsDelivr הנתיבים
יהיו .../motg-js-upload/app.js ו-importים ישברו. מומלץ: שורש ה-repo.

קבצים (חובה):
  app.js           ← רק זה מקושר ב-Webflow Footer
  motg-boot.js
  motg-page.js
  motg-core.js
  motg-scroll.js
  motg-videos.js
  motg-motion.js

אופציונלי (Webflow → Head, פעם אחת):
  motg-vimeo-head.js
  motg-scroll-head.js   ← refresh תמיד מתחיל מלמעלה (מומלץ)

Webflow Footer:
  <script type="module" src="https://cdn.jsdelivr.net/gh/MAKETHECUT/motg@<COMMIT>/app.js"></script>

חשוב: type="module" + GSAP/ScrollTrigger/SplitText לפני app.js.

אחרי push — עדכן @<COMMIT> ו-Publish.
