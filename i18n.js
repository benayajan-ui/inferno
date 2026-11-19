// Languages of the site and the game: Hebrew (the source), English, Italian.
// The Hebrew text lives in the pages and scripts; this table gives every interface string its English and Italian.
// A change to any Hebrew string is made here too (the key must stay identical to the Hebrew in the page), in both languages.
// The long texts are in stops.en.js / stops.it.js (stations) and game.lang.js (spoken lines).
(function () {
  const LANGS = { he: 'עברית', en: 'English', it: 'Italiano' }, KEY = 'inferno_lang';
  const q = new URLSearchParams(location.search).get('lang');
  let lang = null;
  try { lang = localStorage.getItem(KEY); } catch (e) {}
  if (q && LANGS[q]) { lang = q; try { localStorage.setItem(KEY, q); } catch (e) {} }
  // a first visit opens in the browser's language: Hebrew, Italian, otherwise English
  if (!LANGS[lang]) { const n = (navigator.languages && navigator.languages[0]) || navigator.language || 'he'; lang = /^(he|iw)/i.test(n) ? 'he' : /^it/i.test(n) ? 'it' : 'en'; }
  const col = lang === 'en' ? 0 : lang === 'it' ? 1 : -1;
  document.documentElement.lang = lang; document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';

  //  Hebrew: [English, Italiano]
  const D = {
    // --- both pages ---
    'תהום הגיהנום': ['The Abyss of Hell', 'La Voragine dell\'Inferno'],
    'משחק · תהום הגיהנום': ['Game · The Abyss of Hell', 'Gioco · La Voragine dell\'Inferno'],
    'מסע תלת־ממדי במפת הגיהנום של בוטיצ\'לי, לפי התופת של דנטה': ['A journey in 3D through Botticelli\'s Map of Hell, after Dante\'s Inferno', 'Un viaggio in 3D nella Mappa dell\'Inferno di Botticelli, dall\'Inferno di Dante'],
    'מסע תלת־ממדי במפת הגיהנום של סנדרו בוטיצ\'לי, לפי "התופת" של דנטה': ['A journey in 3D through Sandro Botticelli\'s Map of Hell, after Dante\'s "Inferno"', 'Un viaggio in 3D nella Mappa dell\'Inferno di Sandro Botticelli, dall\'"Inferno" di Dante'],
    'גרירה: מבט מסביב · גלגלת: זום · לחיצה ימנית: הזזה': ['Drag: look around · Wheel: zoom · Right click: pan', 'Trascina: guarda intorno · Rotella: zoom · Clic destro: sposta'],
    'תחנות המסע': ['Stations of the journey', 'Stazioni del viaggio'],
    'לחיצה מקפלת או פותחת את הפירוט': ['Click to fold or open the details', 'Un clic chiude o apre i dettagli'],
    'מזער': ['Minimise', 'Riduci'],
    'מזער ▴': ['Minimise ▴', 'Riduci ▴'],
    'לפירוט ▾': ['Details ▾', 'Dettagli ▾'],
    'תתי־פרקים': ['Sections', 'Sezioni'],
    'הקטע המתאים בציור של בוטיצ\'לי. לחיצה מגדילה.': ['The matching part of Botticelli\'s painting. Click to enlarge.', 'La parte corrispondente del dipinto di Botticelli. Un clic la ingrandisce.'],
    'הקטע בציור של בוטיצ\'לי:': ['The part of Botticelli\'s painting:', 'La parte del dipinto di Botticelli:'],
    'תחנות': ['Stations', 'Stazioni'],
    'הקודם': ['Previous', 'Indietro'],
    'הבא': ['Next', 'Avanti'],
    'מסע מודרך': ['Guided journey', 'Viaggio guidato'],
    'השהה': ['Pause', 'Pausa'],
    'מההתחלה': ['From the start', 'Dall\'inizio'],
    'סגירה': ['Close', 'Chiudi'],
    'קרדיטים': ['Credits', 'Crediti'],
    'הציור המקורי': ['Original painting', 'Dipinto originale'],
    'צליל: פועל': ['Sound: on', 'Suono: sì'],
    'מבט לפי תנועת הטלפון: פועל': ['Look by moving the phone: on', 'Sguardo muovendo il telefono: sì'],
    'מבט לפי תנועת הטלפון: כבוי': ['Look by moving the phone: off', 'Sguardo muovendo il telefono: no'],
    'צליל: כבוי': ['Sound: off', 'Suono: no'],
    'משחק (בהקמה)': ['Game (in progress)', 'Gioco (in lavorazione)'],
    'כל המעגל': ['Whole circle', 'Tutto il cerchio'],
    'במודל:': ['In the model:', 'Nel modello:'],
    'סנדרו בוטיצ\'לי, מפת הגיהנום, סוף המאה ה־15. ספריית הוותיקן.': ['Sandro Botticelli, Map of Hell, late 15th century. Vatican Library.', 'Sandro Botticelli, Mappa dell\'Inferno, fine del Quattrocento. Biblioteca Vaticana.'],
    'לחיצה על הציור מגדילה.': ['Click the painting to enlarge.', 'Un clic sul dipinto lo ingrandisce.'],
    'הציור: סנדרו בוטיצ\'לי, "מפת הגיהנום", סוף המאה ה־15, ספריית הוותיקן. הצילום מוויקישיתוף, נחלת הכלל.': ['The painting: Sandro Botticelli, "Map of Hell", late 15th century, Vatican Library. Photograph from Wikimedia Commons, public domain.', 'Il dipinto: Sandro Botticelli, "Mappa dell\'Inferno", fine del Quattrocento, Biblioteca Vaticana. Fotografia da Wikimedia Commons, pubblico dominio.'],
    'הטקסט: דנטה אליגיירי, "התופת". הציטוטים באיטלקית מן המקור; התרגום לעברית חופשי.': ['The text: Dante Alighieri, "Inferno". The Italian quotations are from the original; the English translations are free.', 'Il testo: Dante Alighieri, "Inferno". Le citazioni sono tratte dall\'originale.'],
    'שלוש החיות ביער, מודלים מ-Sketchfab ברישיון CC Attribution: "Marble Lion of Delos" מאת iedu360.eu, "Puma Gray" מאת Novaky, "Howling Wolf Sculpture" מאת towerdweller.': ['The three beasts in the wood, models from Sketchfab under CC Attribution: "Marble Lion of Delos" by iedu360.eu, "Puma Gray" by Novaky, "Howling Wolf Sculpture" by towerdweller.', 'Le tre fiere nella selva, modelli da Sketchfab con licenza CC Attribution: "Marble Lion of Delos" di iedu360.eu, "Puma Gray" di Novaky, "Howling Wolf Sculpture" di towerdweller.'],
    'מרקמי הסלע והלבנים: Poly Haven (CC0).': ['Rock and brick textures: Poly Haven (CC0).', 'Texture della roccia e dei mattoni: Poly Haven (CC0).'],
    'הצליל: פסקול אווירה שנוצר בדפדפן בזמן אמת, בלי קובצי מוזיקה.': ['Sound: an ambient score generated live in the browser, with no music files.', 'Il suono: un sottofondo d\'atmosfera generato dal browser in tempo reale, senza file musicali.'],
    'שאר הפסלים נוצרו במחוללי תלת־ממד; המבנה, ההצבה והתנועה נבנו ב-Blender. התצוגה: three.js.': ['The other statues were made with 3D generators; the structure, placement and motion were built in Blender. Display: three.js.', 'Le altre statue sono state create con generatori 3D; la struttura, la disposizione e il movimento sono stati realizzati in Blender. Visualizzazione: three.js.'],
    'טוען את המודל…': ['Loading the model…', 'Caricamento del modello…'],
    'טעינת המודל נכשלה. את הדף צריך לפתוח דרך שרת (http), לא כקובץ מקומי.': ['The model failed to load. The page has to be opened through a server (http), not as a local file.', 'Il caricamento del modello non è riuscito. La pagina va aperta tramite un server (http), non come file locale.'],
    'מפת הגיהנום של בוטיצ\'לי כמרחב תלת־ממדי: תשעה מעגלים, אלפי פסלי שיש, ומסע אחד מן היער האפל ועד לוציפר שבקרח.': ['Botticelli\'s Map of Hell as a space in 3D: nine circles, thousands of marble statues, and one journey from the dark wood down to Lucifer in the ice.', 'La Mappa dell\'Inferno di Botticelli come spazio in 3D: nove cerchi, migliaia di statue di marmo, e un solo viaggio dalla selva oscura fino a Lucifero nel ghiaccio.'],
    'להתחיל את המסע': ['Begin the journey', 'Inizia il viaggio'],
    'סיור חופשי': ['Free tour', 'Visita libera'],
    // --- the game page ---
    'המחברת 0/5': ['Notebook 0/5', 'Taccuino 0/5'],
    'המחברת': ['Notebook', 'Taccuino'],
    'W A S D או גלגלת ללכת · עכבר להביט · Shift לרוץ · N למחברת': ['W A S D or wheel to walk · Mouse to look · Shift to run · N for the notebook', 'W A S D o rotella per camminare · Mouse per guardare · Shift per correre · N per il taccuino'],
    '· לחיצה על המסך ממשיכה': ['· Click the screen to continue', '· Un clic sullo schermo per continuare'],
    'השורות שנאספו בדרך. לחיצה סוגרת.': ['The lines gathered on the way. Click to close.', 'I versi raccolti lungo il cammino. Un clic per chiudere.'],
    'סוף הדוגמה': ['End of the demo', 'Fine della demo'],
    'סוף הפרק הראשון': ['End of chapter one', 'Fine del primo capitolo'],
    'לשחק שוב': ['Play again', 'Gioca di nuovo'],
    'לאתר': ['To the site', 'Al sito'],
    'וירגיליוס': ['Virgil', 'Virgilio'],
    'דנטה': ['Dante', 'Dante'],
    'תפריט': ['Menu', 'Menu'],
    'הפסקה': ['Paused', 'Pausa'],
    'להמשיך': ['Continue', 'Continua'],
    'לקפוץ לשלב:': ['Jump to a stage:', 'Vai a una tappa:'],
    'היער והשער': ['The wood and the gate', 'La selva e la porta'],
    'לימבו': ['Limbo', 'Limbo'],
    'התאוותנים': ['The Lustful', 'I lussuriosi'],
    'הגרגרנים': ['The Gluttons', 'I golosi'],
    'הקמצנים': ['The Misers', 'Gli avari'],
    'הסטיקס ודיס': ['The Styx and Dis', 'Lo Stige e Dite'],
    'W A S D או גלגלת ללכת · עכבר להביט · Shift לרוץ · N למחברת · P להפסקה': ['W A S D or wheel to walk · Mouse to look · Shift to run · N for the notebook · P to pause', 'W A S D o rotella per camminare · Mouse per guardare · Shift per correre · N per il taccuino · P per la pausa'],
    'חזרה לאתר': ['Back to the site', 'Torna al sito'],
    'דוגמה ראשונה של המשחק: אתה דנטה. לך אחרי וירגיליוס מן היער, דרך השער, אל חוף האכרון, בסירה של כארון, ולמטה דרך חמשת המעגלים הראשונים, עד שער העיר דיס. כעשרים דקות.': ['A first demo of the game: you are Dante. Follow Virgil from the wood, through the gate, to the shore of the Acheron, across in Charon\'s boat, and down through the first five circles to the gate of the city of Dis. About twenty minutes.', 'Una prima demo del gioco: tu sei Dante. Segui Virgilio dalla selva, attraverso la porta, fino alla riva dell\'Acheronte, sulla barca di Caronte, e giù per i primi cinque cerchi, fino alla porta della città di Dite. Circa venti minuti.'],
    'מקלדת: W A S D או גלגלת העכבר ללכת · עכבר להביט · Shift לרוץ · N למחברת · Esc לשחרר את העכבר': ['Keyboard: W A S D or the mouse wheel to walk · Mouse to look · Shift to run · N for the notebook · Esc to release the mouse', 'Tastiera: W A S D o rotella del mouse per camminare · Mouse per guardare · Shift per correre · N per il taccuino · Esc per liberare il mouse'],
    'טלפון: נגיעה בעיגול הולכת קדימה, הטיה שלו לצדדים פונה ומשיכה למטה חוזרת אחורה · גרירה בשאר המסך מסובבת את המבט · שלט משחק נתמך': ['Phone: touch the circle to walk ahead, lean it sideways to turn, pull it down to step back · Drag anywhere else to look around · Game controllers are supported', 'Telefono: tocca il cerchio per andare avanti, inclinalo di lato per girare, tiralo in basso per tornare indietro · Trascina sul resto dello schermo per guardare intorno · I controller sono supportati'],
    'הקשב לווירגיליוס. אפשר להביט סביב': ['Listen to Virgil. You can look around', 'Ascolta Virgilio. Puoi guardarti intorno'],
    'אצבע בצד שמאל: הליכה לכל כיוון · אצבע בצד ימין: מבט': ['Left thumb: walk any way · Right thumb: look', 'Dito a sinistra: cammina · Dito a destra: guarda'],
    'דלג': ['Skip', 'Salta'],
    'מומלץ לסובב את הטלפון לרוחב': ['Best played with the phone turned sideways', 'Meglio giocare con il telefono in orizzontale'],
    'תעודת סיום': ['Certificate', 'Attestato'],
    'מן היער האפל עד שער העיר דיס': ['From the dark wood to the gate of the city of Dis', 'Dalla selva oscura alla porta della città di Dite'],
    'ומשם יצאנו לראות שוב את הכוכבים.': ['And from there we came out to see the stars again.', 'E quindi uscimmo a riveder le stelle.'],
    'להתחיל ללכת': ['Start walking', 'Inizia a camminare'],
    'להתחיל מכאן': ['Start from here', 'Inizia da qui'],
    'להמשיך מהמעגל הראשון': ['Continue from the first circle', 'Continua dal primo cerchio'],
    'להמשיך מהמעגל השני': ['Continue from the second circle', 'Continua dal secondo cerchio'],
    'להמשיך מהמעגל השלישי': ['Continue from the third circle', 'Continua dal terzo cerchio'],
    'להמשיך מהמעגל הרביעי': ['Continue from the fourth circle', 'Continua dal quarto cerchio'],
    'להמשיך מהמעגל החמישי': ['Continue from the fifth circle', 'Continua dal quinto cerchio'],
    // --- the game: tasks, titles, messages ---
    'הקשב לווירגיליוס': ['Listen to Virgil', 'Ascolta Virgilio'],
    'המדרגות סגורות. קודם משלימים את המשימה כאן': ['The stairs are closed. Finish the task here first', 'La scala è chiusa. Prima completa il compito qui'],
    'התופת': ['Inferno', 'Inferno'],
    'מתוך': ['of', 'di'],
    'שורות במחברת': ['lines in the notebook', 'versi nel taccuino'],
    'דקות': ['minutes', 'minuti'],
    'דקה אחת': ['1 minute', '1 minuto'],
    'לך אחרי וירגיליוס אל השער': ['Follow Virgil to the gate', 'Segui Virgilio fino alla porta'],
    'היער האפל': ['The Dark Wood', 'La selva oscura'],
    'בחצי דרכם של חיינו': ['Midway on the road of our life', 'Nel mezzo del cammin di nostra vita'],
    'באמצע חיי מצאתי את עצמי ביער חשוך, כי איבדתי את הדרך.': ['In the middle of my life I found myself in a dark wood, for I had lost the way.', 'A metà della mia vita mi ritrovai in una selva oscura, perché avevo perso la strada.'],
    'הניחו כל תקווה, אתם הנכנסים': ['Abandon all hope, you who enter', 'Lasciate ogne speranza, voi ch\'intrate'],
    'הכתובת על השער': ['The inscription on the gate', 'L\'iscrizione sulla porta'],
    'רד במנהרה אל שפת התהום, והבט למטה': ['Go down the tunnel to the rim of the abyss, and look down', 'Scendi nella galleria fino all\'orlo dell\'abisso, e guarda giù'],
    'גש לסירה שעל שפת הנהר': ['Go to the boat at the river\'s edge', 'Va\' alla barca sulla riva del fiume'],
    'המבוא': ['The Vestibule', 'Il vestibolo'],
    'חוף האכרון': ['The shore of the Acheron', 'La riva dell\'Acheronte'],
    'הבט אל התהום': ['Look into the abyss', 'Guarda nell\'abisso'],
    'הבט אל התהום · רווח מחזיר אליך את המבט': ['Look into the abyss · Space gives you back the view', 'Guarda nell\'abisso · Spazio ti restituisce la visuale'],
    'התקרב לאחת הדמויות במבואה': ['Go near one of the figures in the vestibule', 'Avvicinati a una delle figure nel vestibolo'],
    'הער את הנשמות שעומדות ליד המים': ['Wake the souls standing by the water', 'Sveglia le anime che stanno vicino all\'acqua'],
    'עלה לסירה': ['Get in the boat', 'Sali sulla barca'],
    'רד במדרגות אל לימבו, המעגל הראשון': ['Go down the stairs to Limbo, the first circle', 'Scendi la scala fino al Limbo, il primo cerchio'],
    'המעגל הראשון': ['The first circle', 'Il primo cerchio'],
    'המעגל השני': ['The second circle', 'Il secondo cerchio'],
    'המעגל השלישי': ['The third circle', 'Il terzo cerchio'],
    'המעגל הרביעי': ['The fourth circle', 'Il quarto cerchio'],
    'המעגל החמישי': ['The fifth circle', 'Il quinto cerchio'],
    'לך עם וירגיליוס אל ארבעת המשוררים': ['Go with Virgil to the four poets', 'Va\' con Virgilio dai quattro poeti'],
    'הומרוס': ['Homer', 'Omero'], 'הורטיוס': ['Horace', 'Orazio'], 'אובידיוס': ['Ovid', 'Ovidio'], 'לוקנוס': ['Lucan', 'Lucano'],
    'מצא את המשורר שמתחת לסימן החרב': ['Find the poet beneath the sign of the sword', 'Trova il poeta sotto il segno della spada'],
    'מצא את המשורר שמתחת לסימן הנבל': ['Find the poet beneath the sign of the lyre', 'Trova il poeta sotto il segno della lira'],
    'מצא את המשורר שמתחת לסימן הענף': ['Find the poet beneath the sign of the branch', 'Trova il poeta sotto il segno del ramo'],
    'מצא את המשורר שמתחת לסימן הנשר': ['Find the poet beneath the sign of the eagle', 'Trova il poeta sotto il segno dell\'aquila'],
    'רד במדרגות אל המעגל השני': ['Go down the stairs to the second circle', 'Scendi la scala fino al secondo cerchio'],
    'גש אל מינוס בכניסה למעגל': ['Go to Minos at the entrance to the circle', 'Va\' da Minosse all\'ingresso del cerchio'],
    'המשך אחרי וירגיליוס': ['Keep following Virgil', 'Continua a seguire Virgilio'],
    'הבט אל שתי הנשמות שעפות יחד': ['Look at the two souls flying together', 'Guarda le due anime che volano insieme'],
    'אסוף חופן בוץ מאחת הערמות': ['Gather a handful of mud from one of the heaps', 'Raccogli una manciata di fango da uno dei mucchi'],
    'התקרב לקרברוס וזרוק לו את הבוץ': ['Go near Cerberus and throw him the mud', 'Avvicinati a Cerbero e gettagli il fango'],
    'עבור ליד קרברוס אל המדרגות': ['Go past Cerberus to the stairs', 'Passa accanto a Cerbero fino alla scala'],
    'הקמצנים והבזבזנים': ['Misers and Spendthrifts', 'Avari e prodighi'],
    'לך אחרי וירגיליוס אל דוחפי הסלעים': ['Follow Virgil to the rock-pushers', 'Segui Virgilio da quelli che spingono i massi'],
    'עצור ליד וירגיליוס': ['Stop beside Virgil', 'Fermati accanto a Virgilio'],
    'נסה לדבר עם שלושה מדוחפי הסלעים': ['Try to speak with three of the rock-pushers', 'Prova a parlare con tre di quelli che spingono i massi'],
    'רד במדרגות אל הביצה': ['Go down the stairs to the marsh', 'Scendi la scala fino alla palude'],
    'הסטיקס': ['The Styx', 'Lo Stige'],
    'עלה לסירה של פלגיאס': ['Get in Phlegyas\'s boat', 'Sali sulla barca di Flegiàs'],
    'הסתובב והפנה את הגב למגדל': ['Turn round, with your back to the tower', 'Voltati e da\' le spalle alla torre'],
    'הבט אל המים ליד הסירה': ['Look at the water by the boat', 'Guarda l\'acqua vicino alla barca'],
  };

  const norm = (s) => s.replace(/[‎‏]/g, '').replace(/\s+/g, ' ').trim();
  const HEB = /[֐-׿]/;
  // t('…'): the string in the page's language. A trailing counter (" · 2/3") is kept as it is.
  function t(s) {
    if (col < 0 || !s || !HEB.test(s)) return s;
    const k = norm(s); if (D[k]) return D[k][col];
    const m = /^(.*) · (\d+\/\d+)$/.exec(k); if (m && D[m[1]]) return D[m[1]][col] + ' · ' + m[2];
    console.warn('i18n: no translation for', s); return s;
  }
  // translate what is written in the page itself: text, and the attributes people read or hear
  function apply(root) {
    if (col < 0) return;
    const w = document.createTreeWalker(root || document.body, NodeFilter.SHOW_TEXT); const nodes = []; while (w.nextNode()) nodes.push(w.currentNode);
    for (const n of nodes) { const p = n.parentNode && n.parentNode.nodeName; if (p === 'SCRIPT' || p === 'STYLE') continue;
      const k = norm(n.nodeValue); if (k && D[k]) n.nodeValue = n.nodeValue.replace(n.nodeValue.trim(), D[k][col]); }
    for (const e of (root || document).querySelectorAll('[aria-label],[title],[alt]')) for (const a of ['aria-label', 'title', 'alt']) { const v = e.getAttribute(a); if (v && D[norm(v)]) e.setAttribute(a, D[norm(v)][col]); }
    if (!root) { document.title = t(document.title); const m = document.querySelector('meta[name=description]'); if (m) m.content = t(m.content); }
  }

  // the language choice: under the buttons of the opening screen, in the game's pause screen, and in the credits
  function choose(l) { try { localStorage.setItem(KEY, l); } catch (e) {} const u = new URL(location.href); u.searchParams.set('lang', l); location.href = u.href; }
  function picker() {
    const d = document.createElement('div'); d.className = 'langs'; d.setAttribute('role', 'group'); d.setAttribute('aria-label', 'Language · שפה · Lingua');
    for (const l of Object.keys(LANGS)) { const b = document.createElement('button'); b.type = 'button'; b.textContent = LANGS[l]; b.lang = l;
      if (l === lang) b.setAttribute('aria-current', 'true'); else b.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); choose(l); });
      d.appendChild(b); }
    return d;
  }
  const css = document.createElement('style');
  css.textContent = `
  .langs { display:flex; gap:6px; justify-content:center; margin-top:18px; }
  .langs button { border:0; background:none; padding:4px 10px; font-size:14px; color:var(--dim); border-bottom:1px solid transparent; border-radius:0; }
  .langs button:hover { color:var(--ink); }
  .langs button[aria-current] { color:var(--gold); border-bottom-color:var(--gold); cursor:default; }
  html[dir=ltr] #rail button { text-align:left; }
  html[dir=ltr] #card blockquote .it, html[dir=ltr] #gList i { text-align:left; }
  html[dir=ltr] #card h2::after { background:linear-gradient(to right, var(--gold), rgba(227,168,60,0)); }
  html[dir=ltr] #dots { direction:ltr; }
  html.site[dir=ltr] #paint { left:70px; } html.site[dir=ltr] #snd { left:178px; } html.site[dir=ltr] #gameLink { left:256px; }
  html[lang=en] #gTask::before { content:"YOUR TASK"; } html[lang=it] #gTask::before { content:"IL TUO COMPITO"; }
  @media (max-width:720px) { html.site[dir=ltr] #credit { left:14px; top:40px; } html.site[dir=ltr] #paint { left:70px; top:40px; } html.site[dir=ltr] #snd { left:178px; top:40px; } }`;
  document.head.appendChild(css); if (document.getElementById('gameLink')) document.documentElement.classList.add('site');
  apply();
  for (const sel of ['#load > div', '#gPause > div', '#credits']) { const host = document.querySelector(sel); if (host) host.appendChild(picker()); }

  window.I18N = { LANG: lang, t, apply };
})();
