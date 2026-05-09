/*
   EGLISE FOI SAINTE - Frontend connecte au backend securise
*/

let socket = null;
let pushSubscription = null;
const PUSH_STORAGE_KEY = 'foisainte_push_subscribed';

const MESSAGES_DU_JOUR = [
  // INSPIRATION
  { type:'inspiration', texte:"Jésus a dit : Je suis la lumière du monde. Celui qui me suit ne marchera pas dans les ténèbres, mais il aura la lumière de la vie.", ref:'Jean 8:12' },
  { type:'inspiration', texte:"En Jésus-Christ, vous êtes une nouvelle créature. Les choses anciennes sont passées, voici, toutes choses sont devenues nouvelles.", ref:'2 Corinthiens 5:17' },
  { type:'inspiration', texte:"Je puis tout par Christ qui me fortifie. Rien n'est impossible à celui qui croit en Son nom.", ref:'Philippiens 4:13' },
  { type:'inspiration', texte:"Jésus est le même hier, aujourd'hui et éternellement. Sa fidélité ne fait jamais défaut.", ref:'Hébreux 13:8' },
  { type:'inspiration', texte:"Car Dieu n'a pas donné un esprit de timidité, mais un esprit de force, d'amour et de sagesse, par Jésus-Christ notre Seigneur.", ref:'2 Timothée 1:7' },
  { type:'inspiration', texte:"L'Éternel est ma lumière et mon salut. De qui aurais-je crainte ? Jésus est ma forteresse.", ref:'Psaumes 27:1' },
  { type:'inspiration', texte:"Cherchez premièrement le royaume de Dieu et sa justice, et toutes ces choses vous seront données par-dessus. Jésus l'a promis.", ref:'Matthieu 6:33' },
  { type:'inspiration', texte:"Jésus a dit : Je vous laisse la paix, je vous donne ma paix. Je ne vous la donne pas comme le monde la donne.", ref:'Jean 14:27' },
  { type:'inspiration', texte:"Dieu a tant aimé le monde qu'il a donné son Fils unique Jésus, afin que quiconque croit en lui ne périsse point.", ref:'Jean 3:16' },
  { type:'inspiration', texte:"Venez à moi, vous tous qui êtes fatigus et chargés, et je vous donnerai du repos, dit Jésus.", ref:'Matthieu 11:28' },
  { type:'inspiration', texte:"Jésus est le chemin, la vérité et la vie. Personne ne vient au Père que par lui.", ref:'Jean 14:6' },
  { type:'inspiration', texte:"Celui qui demeure en Jésus et en qui Jésus demeure porte beaucoup de fruit, car sans lui vous ne pouvez rien faire.", ref:'Jean 15:5' },
  { type:'inspiration', texte:"Jésus-Christ nous a libérés pour que nous soyons libres. Demeurez donc fermes dans cette liberté.", ref:'Galates 5:1' },
  { type:'inspiration', texte:"Nous savons que toutes choses concourent au bien de ceux qui aiment Dieu, qui sont appelés selon son dessein en Jésus-Christ.", ref:'Romains 8:28' },
  // PRIÈRE
  { type:'priere', texte:"Jésus nous enseigne : Demandez et l'on vous donnera, cherchez et vous trouverez, frappez et l'on vous ouvrira.", ref:'Matthieu 7:7' },
  { type:'priere', texte:"Ne vous inquiétez de rien, mais en toute chose faites connaître vos besoins à Dieu par des prières, au nom de Jésus-Christ.", ref:'Philippiens 4:6' },
  { type:'priere', texte:"Car là où deux ou trois sont assemblés en mon nom, Jésus a dit : je suis au milieu d'eux.", ref:'Matthieu 18:20' },
  { type:'priere', texte:"L'Esprit de Jésus-Christ intercède pour nous avec des soupirs inexprimables. Dieu sonde les cœurs et exauce.", ref:'Romains 8:26-27' },
  { type:'priere', texte:"Priez sans cesse. Rendez grâces en toutes choses, car c'est à votre égard la volonté de Dieu en Jésus-Christ.", ref:'1 Thessaloniciens 5:17-18' },
  { type:'priere', texte:"Si vous demeurez en moi et que mes paroles demeurent en vous, demandez ce que vous voudrez, dit Jésus, et cela vous sera accordé.", ref:'Jean 15:7' },
  { type:'priere', texte:"Approchons-nous donc avec assurance du trône de la grâce, afin d'obtenir miséricorde par Jésus-Christ notre grand sacrificateur.", ref:'Hébreux 4:16' },
  { type:'priere', texte:"Jésus s'étant retiré dans un lieu écarté, priait. Suivons son exemple et cherchons le Père dans le secret.", ref:'Luc 5:16' },
  { type:'priere', texte:"La prière fervente du juste a une grande efficace. Priez au nom de Jésus avec foi et persevérance.", ref:'Jacques 5:16' },
  { type:'priere', texte:"Tout ce que vous demanderez en mon nom, dit Jésus, je le ferai, afin que le Père soit glorifié dans le Fils.", ref:'Jean 14:13' },
  // EXHORTATION
  { type:'exhortation', texte:"Soyez forts et courageux ! Ne vous effrayez pas, car l'Éternel votre Dieu est avec vous. Jésus ne vous abandonnera jamais.", ref:'Josué 1:9' },
  { type:'exhortation', texte:"Revêtez-vous de toutes les armes de Dieu pour pouvoir tenir ferme contre les ruses du diable. Jésus a déjà vaincu.", ref:'Ephésiens 6:11' },
  { type:'exhortation', texte:"Ne vous conformez pas au siècle présent, mais soyez transformés par le renouvellement de l'intelligence, selon Jésus-Christ.", ref:'Romains 12:2' },
  { type:'exhortation', texte:"Courons avec persévérance dans la carrière qui nous est proposée, ayant les yeux fixés sur Jésus, l'auteur et le consomâteur de la foi.", ref:'Hébreux 12:1-2' },
  { type:'exhortation', texte:"Soyez sobres et veillez. Votre adversaire le diable rôde. Résistez-lui fermes dans la foi, par la puissance de Jésus.", ref:'1 Pierre 5:8-9' },
  { type:'exhortation', texte:"Que personne ne vous séduise. Demeurez en Jésus-Christ, car celui qui pratique la justice est juste, comme lui est juste.", ref:'1 Jean 3:7' },
  { type:'exhortation', texte:"Fortifiez-vous dans le Seigneur et dans sa force toute-puissante. Jésus est votre bouclier et votre victoire.", ref:'Ephésiens 6:10' },
  { type:'exhortation', texte:"Ne vous lassez pas de faire le bien, car nous moissonnerons au temps convenable si nous ne nous relâchons pas. Jésus récompense.", ref:'Galates 6:9' },
  { type:'exhortation', texte:"Que votre lumière luise ainsi devant les hommes, afin qu'ils voient vos bonnes œuvres et glorifient Jésus votre Père.", ref:'Matthieu 5:16' },
  { type:'exhortation', texte:"Soyez dans la joie, priez sans cesse, rendez grâces en tout. C'est la volonté de Dieu en Jésus-Christ à votre égard.", ref:'1 Thessaloniciens 5:16-18' },
  // REPENTANCE
  { type:'repentance', texte:"Si nous confessons nos péchés, Jésus est fidèle et juste pour nous les pardonner et nous purifier de toute iniquité.", ref:'1 Jean 1:9' },
  { type:'repentance', texte:"Jésus est venu appeler non les justes, mais les pécheurs à la repentance. Sa miséricorde est nouvelle chaque matin.", ref:'Luc 5:32' },
  { type:'repentance', texte:"Revenez à moi de tout votre cœur, dit l'Éternel. Jésus-Christ est prêt à vous recevoir et à vous restaurer.", ref:'Joël 2:12' },
  { type:'repentance', texte:"Autant l'orient est éloigné de l'occident, autant Jésus éloigne de nous nos transgressions. Sa grâce est infinie.", ref:'Psaumes 103:12' },
  { type:'repentance', texte:"Il n'y a donc maintenant aucune condamnation pour ceux qui sont en Jésus-Christ. Son sang nous purifie de tout péché.", ref:'Romains 8:1' },
  { type:'repentance', texte:"Jésus a dit : Je ne suis pas venu pour condamner le monde, mais pour que le monde soit sauvé par moi. Venez à lui.", ref:'Jean 3:17' },
  { type:'repentance', texte:"Que le méchant abandonne sa voie et l'homme d'iniquité ses pensées. Qu'il retourne à Jésus qui lui pardonnera abondamment.", ref:'Esaïe 55:7' },
  { type:'repentance', texte:"Les sacrifices agréables à Dieu sont un esprit brisé. Jésus ne rejette pas le cœur brisé et contrit.", ref:'Psaumes 51:17' },
  // LOUANGE
  { type:'louange', texte:"Louez l'Éternel ! Chantez à Jésus un cantique nouveau, car il a fait des merveilles. Sa victoire est éternelle.", ref:'Psaumes 98:1' },
  { type:'louange', texte:"Que tout ce qui respire loue l'Éternel ! Jésus est digne de toute gloire, de tout honneur et de toute adoration.", ref:'Psaumes 150:6' },
  { type:'louange', texte:"Rendez grâces à Dieu le Père, au nom de notre Seigneur Jésus-Christ, en toutes choses et en tout temps.", ref:'Ephésiens 5:20' },
  { type:'louange', texte:"Jésus est le Roi des rois et le Seigneur des seigneurs. Tout genou fléchira et toute langue confessera sa gloire.", ref:'Philippiens 2:10-11' },
  { type:'louange', texte:"Entrez dans ses portes avec des actions de grâces. C'élébrez Jésus, bénissez son nom, car il est bon et sa miséricorde dure à jamais.", ref:'Psaumes 100:4-5' },
  { type:'louange', texte:"Digne est l'Agneau Jésus qui a été immolé de recevoir la puissance, la richesse, la sagesse, la force, l'honneur et la gloire.", ref:'Apocalypse 5:12' },
  { type:'louange', texte:"Mon âme, bénis l'Éternel ! Que tout ce qui est en moi bénisse Jésus et n'oublie aucun de ses bienfaits.", ref:'Psaumes 103:1-2' },
  // PROMESSE
  { type:'promesse', texte:"Jésus a promis : Je ne vous laisserai pas orphelins, je viendrai à vous. Sa présence est avec vous chaque jour.", ref:'Jean 14:18' },
  { type:'promesse', texte:"Car je connais les projets que j'ai formés sur vous, dit l'Éternel, projets de paix et non de malheur. Jésus accomplit ses promesses.", ref:'Jérémie 29:11' },
  { type:'promesse', texte:"Jésus a dit : Voici, je suis avec vous tous les jours, jusqu'à la fin du monde. Vous n'êtes jamais seuls.", ref:'Matthieu 28:20' },
  { type:'promesse', texte:"Celui qui a commencé en vous cette bonne œuvre la rendra parfaite jusqu'au jour de Jésus-Christ. Il ne vous abandonne pas.", ref:'Philippiens 1:6' },
  { type:'promesse', texte:"Jésus a promis : Dans la maison de mon Père il y a plusieurs demeures. Je vais vous préparer une place.", ref:'Jean 14:2' },
  { type:'promesse', texte:"L'Éternel est près de ceux qui ont le cœur brisé. Jésus sauve ceux qui ont l'esprit dans l'abattement.", ref:'Psaumes 34:18' },
  { type:'promesse', texte:"Dieu essuiera toute larme de leurs yeux. Jésus a vaincu la mort. Il n'y aura plus ni deuil, ni cri, ni douleur.", ref:'Apocalypse 21:4' },
  // FOI
  { type:'foi', texte:"La foi est une ferme assurance des choses qu'on espère. Par elle, nous croyons que Jésus-Christ est Seigneur et Sauveur.", ref:'Hébreux 11:1' },
  { type:'foi', texte:"Jésus lui dit : Si tu peux croire, tout est possible à celui qui croit. Avance dans la foi aujourd'hui.", ref:'Marc 9:23' },
  { type:'foi', texte:"Nous marchons par la foi et non par la vue. Jésus-Christ est notre ancre, notre certitude et notre espérance.", ref:'2 Corinthiens 5:7' },
  { type:'foi', texte:"Sans la foi il est impossible de lui être agréable. Celui qui s'approche de Dieu par Jésus doit croire qu'il existe et qu'il récompense.", ref:'Hébreux 11:6' },
  { type:'foi', texte:"Jésus a dit : Si vous avez de la foi comme un grain de moutarde, rien ne vous sera impossible. Croyez sans douter.", ref:'Matthieu 17:20' },
  { type:'foi', texte:"La foi vient de ce qu'on entend, et ce qu'on entend vient de la parole de Jésus-Christ. Nourrissez votre foi chaque jour.", ref:'Romains 10:17' },
  { type:'foi', texte:"Ayez foi en Dieu. Jésus vous dit : quiconque dira à cette montagne de se jeter à la mer, et ne doutera point, verra la chose se faire.", ref:'Marc 11:22-23' },
];

const TYPE_CONFIG = {
  inspiration: { icon: 'fa-sun',           label: 'INSPIRATION',  color: '#d4af37' },
  priere:      { icon: 'fa-hands-praying',  label: 'PRIÈRE',       color: '#9b59b6' },
  exhortation: { icon: 'fa-fire',           label: 'EXHORTATION',  color: '#e67e22' },
  repentance:  { icon: 'fa-heart-crack',    label: 'REPENTANCE',   color: '#e74c3c' },
  louange:     { icon: 'fa-music',          label: 'LOUANGE',      color: '#1abc9c' },
  promesse:    { icon: 'fa-scroll',         label: 'PROMESSE',     color: '#3498db' },
  foi:         { icon: 'fa-cross',          label: 'FOI',          color: '#f39c12' },
};

function getDailyMessage() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  return MESSAGES_DU_JOUR[dayOfYear % MESSAGES_DU_JOUR.length];
}

const AGENDA = [
  { date: 'Dimanche 27 avril', type: 'Culte principal', titre: 'La puissance de la Foi', heure: '10h00 - 13h00' },
  { date: 'Mercredi 30 avril', type: 'Etude biblique', titre: 'Le livre de Job - Session 4', heure: '19h00 - 20h30' },
  { date: 'Vendredi 2 mai', type: 'Veillee de priere', titre: "Nuit de priere et d'adoration", heure: '21h00 - 00h00' },
  { date: 'Dimanche 4 mai', type: 'Culte principal', titre: "Marcher dans l'Esprit", heure: '10h00 - 13h00' },
];

const APP_STATE = {
  verse: null,
  live: {
    streamUrl: '',
    liveVerseText: '',
    liveVideoId: '',
    isLive: false,
  },
  donations: {
    currency: 'XOF',
    orangeMoneyNumber: '',
    orangeMoneyName: '',
    waveNumber: '',
    mtnNumber: '',
    paypalUrl: '',
    cinetpayUrl: '',
    flutterwaveUrl: '',
    skrillUrl: '',
    bankDetails: '',
    cashNote: '',
    showOrange: true,
    showWave: true,
    showMtn: true,
    showPayPal: true,
    showCinetPay: false,
    showFlutterwave: false,
    showSkrill: false,
    showBank: false,
    showCash: false,
  },
  replays: [],
  intentions: [],
  agenda: [],
  eglise: {},
  adminPrayers: [],
  editingReplayId: null,
  editingAgendaId: null,
  stats: {
    totalVisits: 0,
    uniqueVisitorsToday: 0,
    chatMessages: 0,
    prayerRequests: 0,
  },
  adminStatus: {
    authenticated: false,
    needsSetup: true,
  },
};

let chatOpen = true;
let chatMessages = [];
const VISITOR_STORAGE_KEY = 'foisainte_visitor_id';
const CHAT_NAME_KEY = 'foisainte_chat_name';

document.addEventListener('DOMContentLoaded', async () => {
  initAgenda();
  initHomeClock();
  initCharCount();
  initLiveChat();
  handleHashNav();
  registerServiceWorker();

  await loadPublicContent();
  await initStats();
  await initAdmin();

  applyPublicContentToUI();
  updateStatsUi();
  checkLiveStatus();

  // Proposer les notifications après 5 secondes
  setTimeout(() => {
    if ('Notification' in window && Notification.permission === 'default' && !localStorage.getItem(PUSH_STORAGE_KEY)) {
      const banner = document.getElementById('push-banner');
      if (banner) banner.style.display = 'flex';
    }
  }, 5000);
});

async function api(path, options = {}) {
  const response = await fetch(path, {
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const err = new Error((data && data.error) || 'REQUEST_FAILED');
    err.status = response.status;
    err.payload = data;
    throw err;
  }

  return data;
}

function showSection(id, linkEl) {
  document.querySelectorAll('.section').forEach((s) => s.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach((l) => l.classList.remove('active'));

  const el = document.getElementById('section-' + id);
  if (el) {
    el.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (linkEl) linkEl.classList.add('active');
  document.getElementById('nav').classList.remove('open');
  history.replaceState(null, '', '#' + id);
}

function toggleMenu() {
  document.getElementById('nav').classList.toggle('open');
}

function handleHashNav() {
  const hash = location.hash.replace('#', '');
  const validIds = ['accueil', 'eglise', 'live', 'replays', 'priere', 'don', 'admin'];
  if (hash && validIds.includes(hash)) {
    const link = document.querySelector(`[href="#${hash}"]`);
    showSection(hash, link);
  }
}

function initHomeClock() {
  const timeEl = document.getElementById('hero-clock-time');
  const dateEl = document.getElementById('hero-clock-date');
  if (!timeEl || !dateEl) return;

  const updateClock = () => {
    const now = new Date();
    timeEl.textContent = now.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    dateEl.textContent = now.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  updateClock();
  setInterval(updateClock, 1000);
}

function initAgenda() {
  const grid = document.getElementById('agenda-grid');
  if (!grid) return;
  renderAgenda(APP_STATE.agenda);
}

function renderAgenda(items) {
  const grid = document.getElementById('agenda-grid');
  if (!grid) return;

  const typeMap = (type) => {
    const t = type.toLowerCase();
    if (t.includes('culte')) return 'culte';
    if (t.includes('étude') || t.includes('etude') || t.includes('biblique')) return 'etude';
    if (t.includes('veillée') || t.includes('veillee') || t.includes('prière') || t.includes('priere')) return 'veillee';
    return 'culte';
  };

  grid.innerHTML = items.map((ev) => `
    <div class="agenda-card" data-type="${typeMap(ev.type)}">
      <div class="agenda-date">${escapeHtml(ev.date_text)}</div>
      <div class="agenda-type">${escapeHtml(ev.type)}</div>
      <div class="agenda-titre">${escapeHtml(ev.titre)}</div>
      <div class="agenda-heure"><i class="fa-regular fa-clock"></i> ${escapeHtml(ev.heure)}</div>
    </div>
  `).join('');
}

function applyPublicContentToUI() {
  const daily = getDailyMessage();
  const verse = APP_STATE.verse || daily;
  const type = verse.type || daily.type || 'inspiration';
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.inspiration;

  const label = document.getElementById('message-type-label');
  const verseText = document.getElementById('verset-texte');
  const verseRef = document.getElementById('verset-ref');
  const liveVerse = document.getElementById('live-verset-display');
  const frame = document.getElementById('yt-live-frame');

  if (label) {
    label.innerHTML = `<i class="fa-solid ${cfg.icon}"></i> <span style="color:${cfg.color};letter-spacing:2px">${cfg.label} DU JOUR</span>`;
  }
  if (verseText) verseText.textContent = verse.texte;
  if (verseRef) verseRef.textContent = `- ${verse.ref} -`;
  if (liveVerse) liveVerse.textContent = APP_STATE.live.liveVerseText || `"${verse.texte}" - ${verse.ref}`;
  if (frame && APP_STATE.live.streamUrl) frame.src = APP_STATE.live.streamUrl;

  renderDonationMethods();
  renderIntentions();
  renderReplays();
  renderAgenda(APP_STATE.agenda);
  renderEglise(APP_STATE.eglise);
}

function renderDonationMethods() {
  const grid = document.getElementById('don-grid');
  if (!grid) return;

  const d = APP_STATE.donations || {};
  const currency = escapeHtml(d.currency || 'XOF');
  const cards = [];

  const mmNetworks = [];
  if (d.showOrange && d.orangeMoneyNumber) mmNetworks.push({ type: 'orange', label: 'Orange Money', number: d.orangeMoneyNumber, color: '#FF6600', text: '#fff' });
  if (d.showWave && d.waveNumber)         mmNetworks.push({ type: 'wave',   label: 'Wave',         number: d.waveNumber,         color: '#1DC5C9', text: '#fff' });
  if (d.showMtn && d.mtnNumber)           mmNetworks.push({ type: 'mtn',    label: 'MTN Money',    number: d.mtnNumber,          color: '#FFCB00', text: '#000' });

  if (mmNetworks.length > 0) {
    const first = mmNetworks[0];
    const networksJson = escapeHtml(JSON.stringify(mmNetworks));
    const tabs = mmNetworks.map((n, i) => `
      <button class="mm-tab${i === 0 ? ' mm-tab--active' : ''}"
        data-type="${n.type}" data-label="${n.label}"
        data-number="${escapeHtml(n.number)}" data-color="${n.color}" data-text="${n.text}"
        onclick="switchMobileNetwork(this)">
        ${n.label}
      </button>`).join('');

    cards.push(`
      <div class="don-card don-card--mobile">
        <div class="don-brand-header" id="mm-header" style="background:${first.color}">
          <i class="fa-solid fa-mobile-screen don-brand-icon" id="mm-icon" style="color:${first.text}"></i>
          <span class="don-brand-name" id="mm-brand-name" style="color:${first.text}">Mobile Money</span>
        </div>
        <div class="don-method">
          ${mmNetworks.length > 1 ? `<div class="mm-tabs">${tabs}</div>` : ''}
          <p class="mm-network-label">Réseau sélectionné : <strong id="mm-network-name">${first.label}</strong></p>
          <div class="don-numero" id="mm-numero">${escapeHtml(first.number)}</div>
          <p>Choisissez un montant :</p>
          <div class="don-amounts">
            <button class="btn-amount" onclick="selectAmount(this, 500, 'don-mm-amount')">500 ${currency}</button>
            <button class="btn-amount" onclick="selectAmount(this, 1000, 'don-mm-amount')">1000 ${currency}</button>
            <button class="btn-amount" onclick="selectAmount(this, 2000, 'don-mm-amount')">2000 ${currency}</button>
            <button class="btn-amount" onclick="selectAmount(this, 5000, 'don-mm-amount')">5000 ${currency}</button>
          </div>
          <input type="number" id="don-mm-amount" placeholder="Autre montant (${currency})" min="1" class="don-input" />
          <button class="don-btn-brand" id="mm-pay-btn"
            style="--brand:${first.color};color:${first.text}"
            data-type="${first.type}" data-number="${escapeHtml(first.number)}">
            <i class="fa-solid fa-arrow-up-right-from-square"></i>
            <span id="mm-pay-label">Payer avec ${first.label}</span>
          </button>
          <button class="don-btn-copy" id="mm-copy-btn">
            <i class="fa-solid fa-copy"></i> Copier le numero
          </button>
        </div>
      </div>
    `);
  }

  if (d.showPayPal && d.paypalUrl) {
    const amountInputId = 'don-paypal-amount';
    cards.push(`
      <div class="don-card don-card--paypal">
        <div class="don-brand-header" style="background:#003087">
          <i class="fa-brands fa-paypal don-brand-icon"></i>
          <span class="don-brand-name">PayPal</span>
        </div>
        <div class="don-method">
          <p>Faites un don securise en ligne :</p>
          <div class="don-amounts">
            <button class="btn-amount" onclick="selectAmount(this, 1000, '${amountInputId}')">1000 ${currency}</button>
            <button class="btn-amount" onclick="selectAmount(this, 2000, '${amountInputId}')">2000 ${currency}</button>
            <button class="btn-amount" onclick="selectAmount(this, 5000, '${amountInputId}')">5000 ${currency}</button>
            <button class="btn-amount" onclick="selectAmount(this, 10000, '${amountInputId}')">10000 ${currency}</button>
          </div>
          <input type="number" id="${amountInputId}" placeholder="Autre montant (${currency})" min="1" class="don-input" />
          <button class="don-btn-brand" style="--brand:#009cde" onclick="openDonationLink(${JSON.stringify(d.paypalUrl)}, 'amount', '${amountInputId}')">
            <i class="fa-brands fa-paypal"></i> Donner par PayPal
          </button>
        </div>
      </div>
    `);
  }

  if (d.showCinetPay && d.cinetpayUrl) {
    const amountInputId = 'don-cinetpay-amount';
    cards.push(`
      <div class="don-card don-card--cinetpay">
        <div class="don-brand-header" style="background:#e4002b">
          <i class="fa-solid fa-credit-card don-brand-icon"></i>
          <span class="don-brand-name">CinetPay</span>
        </div>
        <div class="don-method">
          <p>Paiement Mobile Money / carte :</p>
          <input type="number" id="${amountInputId}" placeholder="Montant (${currency})" min="1" class="don-input" />
          <button class="don-btn-brand" style="--brand:#e4002b" onclick="openDonationLink(${JSON.stringify(d.cinetpayUrl)}, 'amount', '${amountInputId}')">
            <i class="fa-solid fa-arrow-up-right-from-square"></i> Payer avec CinetPay
          </button>
        </div>
      </div>
    `);
  }

  if (d.showFlutterwave && d.flutterwaveUrl) {
    const amountInputId = 'don-flutterwave-amount';
    cards.push(`
      <div class="don-card don-card--flutterwave">
        <div class="don-brand-header" style="background:#f5a623">
          <i class="fa-solid fa-bolt don-brand-icon" style="color:#000"></i>
          <span class="don-brand-name" style="color:#000">Flutterwave</span>
        </div>
        <div class="don-method">
          <p>Paiement en ligne pour la diaspora :</p>
          <input type="number" id="${amountInputId}" placeholder="Montant (${currency})" min="1" class="don-input" />
          <button class="don-btn-brand" style="--brand:#f5a623;color:#000" onclick="openDonationLink(${JSON.stringify(d.flutterwaveUrl)}, 'amount', '${amountInputId}')">
            <i class="fa-solid fa-arrow-up-right-from-square"></i> Payer avec Flutterwave
          </button>
        </div>
      </div>
    `);
  }

  if (d.showSkrill && d.skrillUrl) {
    const amountInputId = 'don-skrill-amount';
    cards.push(`
      <div class="don-card don-card--skrill">
        <div class="don-brand-header" style="background:#862165">
          <i class="fa-solid fa-wallet don-brand-icon"></i>
          <span class="don-brand-name">Skrill</span>
        </div>
        <div class="don-method">
          <p>Paiement en ligne international :</p>
          <input type="number" id="${amountInputId}" placeholder="Montant (${currency})" min="1" class="don-input" />
          <button class="don-btn-brand" style="--brand:#862165" onclick="openDonationLink(${JSON.stringify(d.skrillUrl)}, 'amount', '${amountInputId}')">
            <i class="fa-solid fa-arrow-up-right-from-square"></i> Payer avec Skrill
          </button>
        </div>
      </div>
    `);
  }

  if (d.showBank && d.bankDetails) {
    cards.push(`
      <div class="don-card don-card--bank">
        <div class="don-brand-header" style="background:#1a3a5c">
          <i class="fa-solid fa-building-columns don-brand-icon"></i>
          <span class="don-brand-name">Virement bancaire</span>
        </div>
        <div class="don-method">
          <p class="don-bank-details">${escapeHtml(d.bankDetails).replace(/\n/g, '<br>')}</p>
        </div>
      </div>
    `);
  }

  if (d.showCash && d.cashNote) {
    cards.push(`
      <div class="don-card don-card--cash">
        <div class="don-brand-header" style="background:#2a6e2a">
          <i class="fa-solid fa-hand-holding-dollar don-brand-icon"></i>
          <span class="don-brand-name">Offrandes en especes</span>
        </div>
        <div class="don-method">
          <p>${escapeHtml(d.cashNote)}</p>
        </div>
      </div>
    `);
  }

  if (!cards.length) {
    grid.innerHTML = '<div class="don-card"><h3><i class="fa-solid fa-circle-info"></i> Dons indisponibles</h3><div class="don-method"><p>Les modes de paiement seront bientot disponibles. Merci pour votre soutien.</p></div></div>';
    return;
  }

  grid.innerHTML = cards.join('');

  // Initialiser les boutons Mobile Money après injection dans le DOM
  const payBtn = document.getElementById('mm-pay-btn');
  const copyBtn = document.getElementById('mm-copy-btn');
  if (payBtn) {
    payBtn.addEventListener('click', mmPay);
  }
  if (copyBtn) {
    const num = payBtn ? payBtn.dataset.number : '';
    copyBtn.addEventListener('click', () => copyNumber(num));
  }
}

function renderReplays() {
  const grid = document.getElementById('replay-grid');
  if (!grid) return;

  grid.innerHTML = APP_STATE.replays.map((r) => `
    <a class="replay-card" href="https://youtube.com/watch?v=${encodeURIComponent(r.id)}" target="_blank">
      <div class="replay-thumb">
        <img src="https://img.youtube.com/vi/${encodeURIComponent(r.id)}/hqdefault.jpg" alt="${escapeHtml(r.titre)}" loading="lazy" />
        <div class="replay-play-btn"><i class="fa-solid fa-circle-play"></i></div>
      </div>
      <div class="replay-info">
        <div class="replay-titre">${escapeHtml(r.titre)}</div>
        <div class="replay-date"><i class="fa-regular fa-calendar"></i> ${escapeHtml(r.date)}</div>
      </div>
    </a>
  `).join('');
}

function initLiveChat() {
  // Restaurer le prénom sauvegardé
  const savedName = localStorage.getItem(CHAT_NAME_KEY);
  const nameInput = document.getElementById('chat-name');
  if (nameInput && savedName) nameInput.value = savedName;
  if (nameInput) {
    nameInput.addEventListener('change', () => {
      localStorage.setItem(CHAT_NAME_KEY, nameInput.value.trim());
    });
  }

  // Connexion Socket.io
  socket = window.io ? window.io() : null;
  if (!socket) return;

  socket.on('connect', () => {
    updateChatCount();
  });

  socket.on('disconnect', () => {
    updateChatCount();
  });

  socket.on('chat:history', (messages) => {
    chatMessages = [];
    const container = document.getElementById('chat-messages');
    if (container) container.innerHTML = '';
    messages.forEach((msg) => renderChatMessage(msg));
  });

  socket.on('chat:message', (msg) => {
    renderChatMessage(msg);
  });
}

function addChatMessage(name, text) {
  renderChatMessage({ name, text, ts: Date.now() });
}

function renderChatMessage(msg) {
  const container = document.getElementById('chat-messages');
  if (!container) return;

  const name = msg.name || 'Anonyme';
  const text = msg.text || '';
  const initials = name.substring(0, 2).toUpperCase();
  const colors = ['#1565C0', '#1B5E20', '#4A148C', '#BF360C', '#006064', '#37474F'];
  const color = colors[name.charCodeAt(0) % colors.length];

  const div = document.createElement('div');
  div.className = 'chat-msg';
  div.innerHTML = `
    <div class="chat-avatar" style="background:${color}">${initials}</div>
    <div class="chat-bubble">
      <div class="chat-bubble-name">${escapeHtml(name)}</div>
      <div class="chat-bubble-text">${escapeHtml(text)}</div>
    </div>
  `;

  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  chatMessages.push(msg);
  updateChatCount();
}

async function sendChatMessage() {
  const input = document.getElementById('chat-input');
  const nameInput = document.getElementById('chat-name');
  if (!input) return;

  const text = input.value.trim();
  if (!text) return;

  const name = (nameInput && nameInput.value.trim()) || localStorage.getItem(CHAT_NAME_KEY) || 'Anônyme';
  if (nameInput && nameInput.value.trim()) {
    localStorage.setItem(CHAT_NAME_KEY, nameInput.value.trim());
  }

  input.value = '';
  input.focus();

  if (socket && socket.connected) {
    socket.emit('chat:send', { name, text });
  } else {
    // Fallback local si socket non connecté
    addChatMessage(name, text);
    try {
      await api('/api/public/stats/chat', { method: 'POST', body: '{}' });
    } catch { /* ignore */ }
  }
}

function toggleChat() {
  chatOpen = !chatOpen;
  const panel = document.getElementById('live-chat-panel');
  if (panel) panel.style.display = chatOpen ? 'flex' : 'none';
}

function updateChatCount() {
  const countEl = document.getElementById('chat-count');
  if (!countEl) return;
  const connected = (socket && socket.connected) ? 1 : 0;
  const msgs = chatMessages.length;
  countEl.textContent = msgs > 0 ? `${msgs} message${msgs > 1 ? 's' : ''}` : (connected ? 'Connecté' : 'Hors ligne');
}

function checkLiveStatus() {
  const isLive = Boolean(APP_STATE.live.isLive);
  const badge = document.getElementById('live-badge');
  const notif = document.getElementById('notif-bar');
  const notifText = document.getElementById('notif-text');
  const viewers = document.getElementById('viewers-count');

  if (viewers) viewers.textContent = String(APP_STATE.stats.uniqueVisitorsToday || 0);

  if (isLive) {
    if (badge) badge.style.display = 'inline-flex';
    if (notif && notifText) {
      notifText.textContent = 'Le culte est en cours EN DIRECT - Rejoignez-nous maintenant !';
      notif.style.display = 'flex';
    }
  } else {
    if (badge) badge.style.display = 'none';
    if (notif) notif.style.display = 'none';
  }
}

function renderIntentions() {
  const list = document.getElementById('intentions-list');
  if (!list) return;

  list.innerHTML = APP_STATE.intentions.map((i) => `
    <div class="intention-card">
      <div class="intention-name"><i class="fa-solid fa-hands-praying"></i> ${escapeHtml(i.name)} :</div>
      <div class="intention-text">${escapeHtml(i.text)}</div>
    </div>
  `).join('');
}

async function submitPriere(e) {
  e.preventDefault();

  const prenom = document.getElementById('prenom').value.trim();
  const demande = document.getElementById('demande').value.trim();
  const partager = document.getElementById('partager').checked;

  if (!prenom || !demande) return;

  try {
    await api('/api/public/prayers', {
      method: 'POST',
      body: JSON.stringify({ name: prenom, text: demande, share: partager }),
    });

    await loadPublicContent();
    await refreshStats();

    document.getElementById('priere-form').style.display = 'none';
    document.getElementById('priere-success').style.display = 'flex';
    showToast('Votre demande de priere a ete envoyee.');

    setTimeout(() => {
      document.getElementById('priere-form').style.display = 'block';
      document.getElementById('priere-success').style.display = 'none';
      document.getElementById('priere-form').reset();
      document.getElementById('char-count').textContent = '0 / 500';
    }, 5000);
  } catch {
    showToast('Impossible de transmettre la demande pour le moment.');
  }
}

function initCharCount() {
  const textarea = document.getElementById('demande');
  const counter = document.getElementById('char-count');
  if (!textarea || !counter) return;

  textarea.addEventListener('input', () => {
    counter.textContent = `${textarea.value.length} / 500`;
  });
}

function selectAmount(btn, amount, targetInputId) {
  const group = btn.closest('.don-amounts');
  if (group) {
    group.querySelectorAll('.btn-amount').forEach((b) => b.classList.remove('selected'));
  }
  btn.classList.add('selected');

  const input = document.getElementById(targetInputId);
  if (input) input.value = amount;
}

function openDonationLink(url, amountParam, amountInputId) {
  if (!url) {
    showToast('Lien de paiement non configure.');
    return;
  }

  let finalUrl = url;
  const input = document.getElementById(amountInputId);
  const amount = Number(input?.value || 0);

  if (amount > 0 && amountParam) {
    try {
      const parsed = new URL(url, window.location.origin);
      parsed.searchParams.set(amountParam, String(amount));
      finalUrl = parsed.toString();
    } catch {
      // Laisser l'URL originale si parsing impossible
      finalUrl = url;
    }
  }

  window.open(finalUrl, '_blank', 'noopener,noreferrer');
}

function copyNumber(number) {
  navigator.clipboard.writeText(number).then(() => {
    showToast('Numero copie : ' + number);
  }).catch(() => {
    showToast('Numero : ' + number);
  });
}

function openMobilePayment(type, number, amountInputId) {
  const input = document.getElementById(amountInputId);
  const amount = input ? parseInt(input.value, 10) : 0;
  if (!amount || amount < 1) {
    showToast('Veuillez choisir ou saisir un montant.');
    if (input) input.focus();
    return;
  }
  const num = number.replace(/\s/g, '');
  let url = '';
  if (type === 'orange') {
    url = 'tel:*144*1*' + num + '*' + amount + '%23';
  } else if (type === 'wave') {
    url = 'https://pay.wave.com/m/' + num + '?amount=' + amount;
  } else if (type === 'mtn') {
    url = 'tel:*133*' + num + '*' + amount + '%23';
  }
  if (url) {
    const a = document.createElement('a');
    a.href = url;
    if (url.startsWith('http')) {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    }
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    if (url.startsWith('tel:')) {
      showToast('Ouverture en cours... Si rien ne se passe, copiez le numero.');
    }
  }
}

function switchMobileNetwork(btn) {
  const { type, label, number, color, text } = btn.dataset;

  // Onglets : actif / inactif
  btn.closest('.mm-tabs').querySelectorAll('.mm-tab').forEach(t => {
    t.classList.remove('mm-tab--active');
    t.style.background = '';
    t.style.color = '';
    t.style.borderColor = '';
  });
  btn.classList.add('mm-tab--active');
  btn.style.background = color;
  btn.style.color = text;
  btn.style.borderColor = 'transparent';

  // En-tête couleur
  const header = document.getElementById('mm-header');
  if (header) header.style.background = color;
  const icon = document.getElementById('mm-icon');
  if (icon) icon.style.color = text;
  const brandName = document.getElementById('mm-brand-name');
  if (brandName) { brandName.textContent = 'Mobile Money'; brandName.style.color = text; }

  // Numéro affiché
  const numero = document.getElementById('mm-numero');
  if (numero) numero.textContent = number;

  // Label réseau
  const netName = document.getElementById('mm-network-name');
  if (netName) netName.textContent = label;

  // Bouton Payer
  const payBtn = document.getElementById('mm-pay-btn');
  if (payBtn) {
    payBtn.style.setProperty('--brand', color);
    payBtn.style.color = text;
    payBtn.dataset.type = type;
    payBtn.dataset.number = number;
    const lbl = document.getElementById('mm-pay-label');
    if (lbl) lbl.textContent = `Payer avec ${label}`;
  }

  // Bouton Copier
  const copyBtn = document.getElementById('mm-copy-btn');
  if (copyBtn) {
    copyBtn.onclick = () => copyNumber(number);
  }
}

function mmPay() {
  const btn = document.getElementById('mm-pay-btn');
  if (!btn) return;
  openMobilePayment(btn.dataset.type, btn.dataset.number, 'don-mm-amount');
}

async function loadPublicContent() {
  try {
    const data = await api('/api/public/content');
    APP_STATE.verse = data.verse || null;
    APP_STATE.live = data.live || APP_STATE.live;
    APP_STATE.donations = data.donations || APP_STATE.donations;
    APP_STATE.replays = Array.isArray(data.replays) ? data.replays : [];
    APP_STATE.intentions = Array.isArray(data.intentions) ? data.intentions : [];
    APP_STATE.agenda = Array.isArray(data.agenda) ? data.agenda : [];
    APP_STATE.eglise = data.eglise || APP_STATE.eglise;
    applyPublicContentToUI();
    checkLiveStatus();
  } catch {
    showToast('Impossible de charger certaines donnees publiques.');
  }
}

async function initStats() {
  let visitorId = localStorage.getItem(VISITOR_STORAGE_KEY);

  try {
    const data = await api('/api/public/stats/visit', {
      method: 'POST',
      body: JSON.stringify({ visitorId: visitorId || '' }),
    });

    if (data.visitorId) {
      visitorId = data.visitorId;
      localStorage.setItem(VISITOR_STORAGE_KEY, visitorId);
    }

    if (data.stats) APP_STATE.stats = data.stats;
  } catch {
    // Fallback silencieux
  }
}

async function refreshStats() {
  try {
    APP_STATE.stats = await api('/api/public/stats');
    updateStatsUi();
    checkLiveStatus();
  } catch {
    // Ignore
  }
}

function updateStatsUi() {
  const visits = document.getElementById('stat-visits');
  const uniqueDay = document.getElementById('stat-unique-day');
  const chat = document.getElementById('stat-chat');
  const prayers = document.getElementById('stat-prayers');

  if (visits) visits.textContent = String(APP_STATE.stats.totalVisits || 0);
  if (uniqueDay) uniqueDay.textContent = String(APP_STATE.stats.uniqueVisitorsToday || 0);
  if (chat) chat.textContent = String(APP_STATE.stats.chatMessages || 0);
  if (prayers) prayers.textContent = String(APP_STATE.stats.prayerRequests || 0);
}

async function initAdmin() {
  const input = document.getElementById('admin-pass');
  const userInput = document.getElementById('admin-user');
  if (input) {
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') adminLogin();
    });
  }
  if (userInput) {
    userInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') adminLogin();
    });
  }

  await refreshAdminStatus();

  if (APP_STATE.adminStatus.authenticated) {
    openAdminDashboard();
    await loadAdminDashboard();
  } else {
    closeAdminDashboard();
    if (input) {
      input.placeholder = APP_STATE.adminStatus.needsSetup ? 'Choisir un mot de passe (premier accès)' : 'Mot de passe';
    }
    if (userInput) {
      userInput.placeholder = APP_STATE.adminStatus.needsSetup ? 'Choisir un identifiant' : 'Identifiant';
    }
  }
}

async function refreshAdminStatus() {
  try {
    APP_STATE.adminStatus = await api('/api/admin/status');
  } catch {
    APP_STATE.adminStatus = { authenticated: false, needsSetup: true };
  }
}

async function adminLogin() {
  const input = document.getElementById('admin-pass');
  const userInput = document.getElementById('admin-user');
  if (!input) return;

  const username = (userInput && userInput.value.trim()) || '';
  const password = input.value.trim();

  if (!username) {
    showToast('Saisissez un identifiant.');
    if (userInput) userInput.focus();
    return;
  }
  if (!password) {
    showToast('Saisissez un mot de passe.');
    return;
  }

  try {
    await refreshAdminStatus();
    const endpoint = APP_STATE.adminStatus.needsSetup ? '/api/admin/setup' : '/api/admin/login';
    await api(endpoint, {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    input.value = '';
    if (userInput) userInput.value = '';
    await refreshAdminStatus();
    openAdminDashboard();
    await loadAdminDashboard();
    showToast('Connexion admin réussie.');
  } catch (err) {
    if (err.status === 429) {
      showToast('Trop de tentatives. Réessayez plus tard.');
      return;
    }
    if (err.payload?.error === 'USERNAME_TOO_SHORT') {
      showToast('L\'identifiant doit faire au moins 3 caractères.');
      return;
    }
    if (err.payload?.error === 'PASSWORD_TOO_SHORT') {
      showToast('Le mot de passe doit faire au moins 12 caractères.');
      return;
    }
    showToast('Identifiant ou mot de passe incorrect.');
    await refreshAdminStatus();
  }
}

async function adminLogout() {
  try {
    await api('/api/admin/logout', { method: 'POST', body: '{}' });
  } catch {
    // Ignore
  }

  await refreshAdminStatus();
  closeAdminDashboard();
  showToast('Session administrateur fermee.');
}

async function changeAdminPassword() {
  const currentPass = document.getElementById('sec-current-pass');
  const newPass = document.getElementById('sec-new-pass');
  const confirmPass = document.getElementById('sec-confirm-pass');
  const newUsername = document.getElementById('sec-new-username');

  if (!currentPass || !newPass || !confirmPass) return;

  const current = currentPass.value.trim();
  const next = newPass.value.trim();
  const confirm = confirmPass.value.trim();
  const username = newUsername ? newUsername.value.trim() : '';

  if (!current) { showToast('Saisissez votre mot de passe actuel.'); return; }
  if (next.length < 12) { showToast('Le nouveau mot de passe doit faire au moins 12 caractères.'); return; }
  if (next !== confirm) { showToast('Les deux mots de passe ne correspondent pas.'); return; }
  if (username && username.length < 3) { showToast('Le nouvel identifiant doit faire au moins 3 caractères.'); return; }

  try {
    await api('/api/admin/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword: current, newPassword: next, newUsername: username || undefined }),
    });
    currentPass.value = '';
    newPass.value = '';
    confirmPass.value = '';
    if (newUsername) newUsername.value = '';
    showToast('Identifiants changés. Reconnectez-vous.');
    await refreshAdminStatus();
    closeAdminDashboard();
  } catch (err) {
    if (err.status === 401) {
      showToast('Mot de passe actuel incorrect.');
    } else if (err.status === 400) {
      showToast('Le nouveau mot de passe doit faire au moins 12 caractères.');
    } else {
      showToast('Erreur lors du changement des identifiants.');
    }
  }
}

function initPasswordStrength() {
  const input = document.getElementById('sec-new-pass');
  const bar = document.getElementById('sec-strength-bar');
  const fill = document.getElementById('sec-strength-fill');
  const label = document.getElementById('sec-strength-label');
  if (!input || !bar || !fill || !label) return;

  input.addEventListener('input', () => {
    const v = input.value;
    if (!v) { bar.style.display = 'none'; label.textContent = ''; return; }
    bar.style.display = 'block';

    let score = 0;
    if (v.length >= 12) score++;
    if (v.length >= 16) score++;
    if (/[A-Z]/.test(v)) score++;
    if (/[0-9]/.test(v)) score++;
    if (/[^A-Za-z0-9]/.test(v)) score++;

    const levels = [
      { pct: '20%', color: '#e53e3e', txt: 'Très faible' },
      { pct: '40%', color: '#dd6b20', txt: 'Faible' },
      { pct: '60%', color: '#d69e2e', txt: 'Moyen' },
      { pct: '80%', color: '#38a169', txt: 'Fort' },
      { pct: '100%', color: '#2f855a', txt: 'Très fort' },
    ];
    const lvl = levels[Math.min(score, 4)];
    fill.style.width = lvl.pct;
    fill.style.background = lvl.color;
    label.textContent = lvl.txt;
    label.style.color = lvl.color;
  });
}

function openAdminDashboard() {
  const loginCard = document.getElementById('admin-login-card');
  const dashboard = document.getElementById('admin-dashboard');
  if (loginCard) loginCard.style.display = 'none';
  if (dashboard) dashboard.style.display = 'block';
  // Ouvrir le premier panneau par défaut
  showAdminPanel('verset');
}

function closeAdminDashboard() {
  const loginCard = document.getElementById('admin-login-card');
  const dashboard = document.getElementById('admin-dashboard');
  if (loginCard) loginCard.style.display = 'block';
  if (dashboard) dashboard.style.display = 'none';
}

function showAdminPanel(panelId, btnEl) {
  // Masquer tous les panneaux
  document.querySelectorAll('.admin-panel').forEach((p) => p.classList.remove('active'));
  // Désactiver tous les boutons du sidebar
  document.querySelectorAll('.admin-sidenav-item').forEach((b) => b.classList.remove('active'));

  // Afficher le panneau cible
  const panel = document.getElementById('admin-panel-' + panelId);
  if (panel) panel.classList.add('active');

  // Activer le bouton correspondant
  if (btnEl) {
    btnEl.classList.add('active');
  } else {
    const sideBtn = document.querySelector(`.admin-sidenav-item[onclick*="'${panelId}'"]`);
    if (sideBtn) sideBtn.classList.add('active');
  }

  // Fermer le sidebar sur mobile après sélection
  const sidebar = document.getElementById('admin-sidebar');
  if (sidebar && window.innerWidth < 900) {
    sidebar.classList.remove('open');
  }
}

function toggleAdminSidebar() {
  const sidebar = document.getElementById('admin-sidebar');
  if (sidebar) sidebar.classList.toggle('open');
}

async function loadAdminDashboard() {
  try {
    const data = await api('/api/admin/dashboard');

    APP_STATE.verse = data.verse || APP_STATE.verse;
    APP_STATE.live = data.live || APP_STATE.live;
    APP_STATE.donations = data.donations || APP_STATE.donations;
    APP_STATE.replays = Array.isArray(data.replays) ? data.replays : APP_STATE.replays;
    APP_STATE.adminPrayers = Array.isArray(data.prayers) ? data.prayers : [];
    APP_STATE.agenda = Array.isArray(data.agenda) ? data.agenda : APP_STATE.agenda;
    APP_STATE.eglise = data.eglise || APP_STATE.eglise;
    APP_STATE.stats = data.stats || APP_STATE.stats;

    fillAdminForms();
    renderAdminReplays();
    renderAdminPrayers();
    renderAdminAgenda();
    fillEgliseForms();
    updateStatsUi();
    applyPublicContentToUI();
    checkLiveStatus();
    await loadPushStats();
    await loadPushSchedule();
    initPasswordStrength();
  } catch (err) {
    if (err.status === 401) {
      await refreshAdminStatus();
      closeAdminDashboard();
      showToast('Session admin expiree.');
      return;
    }
    showToast('Impossible de charger le tableau de bord admin.');
  }
}

function fillAdminForms() {
  const verseText = document.getElementById('admin-verset-texte');
  const verseRef = document.getElementById('admin-verset-ref');
  const streamUrl = document.getElementById('admin-stream-url');
  const liveVerse = document.getElementById('admin-live-verse');
  const liveVideoId = document.getElementById('admin-live-video-id');
  const isLive = document.getElementById('admin-is-live');

  const donCurrency = document.getElementById('don-currency');
  const donOrangeNumber = document.getElementById('don-orange-number');
  const donOrangeName = document.getElementById('don-orange-name');
  const donWaveNumber = document.getElementById('don-wave-number');
  const donMtnNumber = document.getElementById('don-mtn-number');
  const donPaypalUrl = document.getElementById('don-paypal-url');
  const donCinetpayUrl = document.getElementById('don-cinetpay-url');
  const donFlutterwaveUrl = document.getElementById('don-flutterwave-url');
  const donSkrillUrl = document.getElementById('don-skrill-url');
  const donBankDetails = document.getElementById('don-bank-details');
  const donCashNote = document.getElementById('don-cash-note');
  const donShowOrange = document.getElementById('don-show-orange');
  const donShowWave = document.getElementById('don-show-wave');
  const donShowMtn = document.getElementById('don-show-mtn');
  const donShowPayPal = document.getElementById('don-show-paypal');
  const donShowCinetPay = document.getElementById('don-show-cinetpay');
  const donShowFlutterwave = document.getElementById('don-show-flutterwave');
  const donShowSkrill = document.getElementById('don-show-skrill');
  const donShowBank = document.getElementById('don-show-bank');
  const donShowCash = document.getElementById('don-show-cash');

  if (verseText) verseText.value = APP_STATE.verse ? APP_STATE.verse.texte : '';
  if (verseRef) verseRef.value = APP_STATE.verse ? APP_STATE.verse.ref : '';
  const msgType = document.getElementById('admin-message-type');
  if (msgType) msgType.value = APP_STATE.verse?.type || getDailyMessage().type || 'inspiration';
  if (streamUrl) streamUrl.value = APP_STATE.live.streamUrl || '';
  if (liveVerse) liveVerse.value = APP_STATE.live.liveVerseText || '';
  if (liveVideoId) liveVideoId.value = APP_STATE.live.liveVideoId || '';
  if (isLive) isLive.checked = Boolean(APP_STATE.live.isLive);

  if (donCurrency) donCurrency.value = APP_STATE.donations.currency || 'XOF';
  if (donOrangeNumber) donOrangeNumber.value = APP_STATE.donations.orangeMoneyNumber || '';
  if (donOrangeName) donOrangeName.value = APP_STATE.donations.orangeMoneyName || '';
  if (donWaveNumber) donWaveNumber.value = APP_STATE.donations.waveNumber || '';
  if (donMtnNumber) donMtnNumber.value = APP_STATE.donations.mtnNumber || '';
  if (donPaypalUrl) donPaypalUrl.value = APP_STATE.donations.paypalUrl || '';
  if (donCinetpayUrl) donCinetpayUrl.value = APP_STATE.donations.cinetpayUrl || '';
  if (donFlutterwaveUrl) donFlutterwaveUrl.value = APP_STATE.donations.flutterwaveUrl || '';
  if (donSkrillUrl) donSkrillUrl.value = APP_STATE.donations.skrillUrl || '';
  if (donBankDetails) donBankDetails.value = APP_STATE.donations.bankDetails || '';
  if (donCashNote) donCashNote.value = APP_STATE.donations.cashNote || '';
  if (donShowOrange) donShowOrange.checked = Boolean(APP_STATE.donations.showOrange);
  if (donShowWave) donShowWave.checked = Boolean(APP_STATE.donations.showWave);
  if (donShowMtn) donShowMtn.checked = Boolean(APP_STATE.donations.showMtn);
  if (donShowPayPal) donShowPayPal.checked = Boolean(APP_STATE.donations.showPayPal);
  if (donShowCinetPay) donShowCinetPay.checked = Boolean(APP_STATE.donations.showCinetPay);
  if (donShowFlutterwave) donShowFlutterwave.checked = Boolean(APP_STATE.donations.showFlutterwave);
  if (donShowSkrill) donShowSkrill.checked = Boolean(APP_STATE.donations.showSkrill);
  if (donShowBank) donShowBank.checked = Boolean(APP_STATE.donations.showBank);
  if (donShowCash) donShowCash.checked = Boolean(APP_STATE.donations.showCash);
}

async function saveDonationsSettings() {
  const payload = {
    currency: document.getElementById('don-currency')?.value?.trim() || 'XOF',
    orangeMoneyNumber: document.getElementById('don-orange-number')?.value?.trim() || '',
    orangeMoneyName: document.getElementById('don-orange-name')?.value?.trim() || '',
    waveNumber: document.getElementById('don-wave-number')?.value?.trim() || '',
    mtnNumber: document.getElementById('don-mtn-number')?.value?.trim() || '',
    paypalUrl: document.getElementById('don-paypal-url')?.value?.trim() || '',
    cinetpayUrl: document.getElementById('don-cinetpay-url')?.value?.trim() || '',
    flutterwaveUrl: document.getElementById('don-flutterwave-url')?.value?.trim() || '',
    skrillUrl: document.getElementById('don-skrill-url')?.value?.trim() || '',
    bankDetails: document.getElementById('don-bank-details')?.value?.trim() || '',
    cashNote: document.getElementById('don-cash-note')?.value?.trim() || '',
    showOrange: Boolean(document.getElementById('don-show-orange')?.checked),
    showWave: Boolean(document.getElementById('don-show-wave')?.checked),
    showMtn: Boolean(document.getElementById('don-show-mtn')?.checked),
    showPayPal: Boolean(document.getElementById('don-show-paypal')?.checked),
    showCinetPay: Boolean(document.getElementById('don-show-cinetpay')?.checked),
    showFlutterwave: Boolean(document.getElementById('don-show-flutterwave')?.checked),
    showSkrill: Boolean(document.getElementById('don-show-skrill')?.checked),
    showBank: Boolean(document.getElementById('don-show-bank')?.checked),
    showCash: Boolean(document.getElementById('don-show-cash')?.checked),
  };

  try {
    const data = await api('/api/admin/donations', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    APP_STATE.donations = data.donations || payload;
    renderDonationMethods();
    showToast('Modes de paiement mis a jour.');
  } catch {
    showToast('Impossible de sauvegarder les modes de paiement.');
  }
}

async function saveAdminVerse() {
  const textInput = document.getElementById('admin-verset-texte');
  const refInput = document.getElementById('admin-verset-ref');
  if (!textInput || !refInput) return;

  const texte = textInput.value.trim();
  const ref = refInput.value.trim();
  if (!texte || !ref) {
    showToast('Saisissez texte et reference.');
    return;
  }

  try {
    await api('/api/admin/verse', {
      method: 'PUT',
      body: JSON.stringify({ texte, ref }),
    });
    APP_STATE.verse = { texte, ref };
    applyPublicContentToUI();
    showToast('Verset du jour mis a jour.');
  } catch {
    showToast('Impossible de sauvegarder le verset.');
  }
}

function applyVerseToLive() {
  const textInput = document.getElementById('admin-verset-texte');
  const refInput = document.getElementById('admin-verset-ref');
  const liveInput = document.getElementById('admin-live-verse');
  if (!textInput || !refInput || !liveInput) return;

  const texte = textInput.value.trim();
  const ref = refInput.value.trim();
  if (!texte || !ref) {
    showToast('Enregistrez d\'abord le verset.');
    return;
  }

  liveInput.value = `"${texte}" - ${ref}`;
  saveLiveSettings();
}

function extractYoutubeId(input) {
  const val = input.value.trim();
  const match = val.match(
    /(?:youtube\.com\/(?:watch\?v=|live\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  );
  if (match) {
    input.value = match[1];
    input.style.borderColor = 'rgba(52,176,103,.7)';
  } else {
    input.style.borderColor = '';
  }
}

async function saveLiveSettings() {
  const streamInput = document.getElementById('admin-stream-url');
  const liveVerseInput = document.getElementById('admin-live-verse');
  const liveVideoIdInput = document.getElementById('admin-live-video-id');
  const isLiveCheckbox = document.getElementById('admin-is-live');
  if (!streamInput || !liveVerseInput || !liveVideoIdInput || !isLiveCheckbox) return;

  const payload = {
    streamUrl: streamInput.value.trim(),
    liveVerseText: liveVerseInput.value.trim(),
    liveVideoId: liveVideoIdInput.value.trim(),
    isLive: isLiveCheckbox.checked,
  };

  try {
    await api('/api/admin/live', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });

    APP_STATE.live = payload;
    applyPublicContentToUI();
    checkLiveStatus();
    showToast('Parametres live appliques.');
  } catch {
    showToast('Impossible de mettre a jour le live.');
  }
}

async function addReplayFromAdmin() {
  const idInput = document.getElementById('admin-replay-id');
  const titleInput = document.getElementById('admin-replay-title');
  const dateInput = document.getElementById('admin-replay-date');
  if (!idInput || !titleInput || !dateInput) return;

  const id = idInput.value.trim();
  const titre = titleInput.value.trim();
  const date = dateInput.value.trim();

  if (!id || !titre || !date) {
    showToast('Completez les 3 champs du replay.');
    return;
  }

  try {
    if (APP_STATE.editingReplayId) {
      await api(`/api/admin/replays/${APP_STATE.editingReplayId}`, {
        method: 'PUT',
        body: JSON.stringify({ id, titre, date }),
      });
      showToast('Replay modifie.');
    } else {
      await api('/api/admin/replays', {
        method: 'POST',
        body: JSON.stringify({ id, titre, date }),
      });
      showToast('Replay ajoute.');
    }

    idInput.value = '';
    titleInput.value = '';
    dateInput.value = '';
    APP_STATE.editingReplayId = null;
    cancelEditReplay();
    await loadPublicContent();
    await loadAdminDashboard();
  } catch {
    showToast('Operation impossible.');
  }
}

function editReplay(dbId, id, titre, date) {
  APP_STATE.editingReplayId = dbId;
  document.getElementById('admin-replay-id').value = id;
  document.getElementById('admin-replay-title').value = titre;
  document.getElementById('admin-replay-date').value = date;
  const btn = document.querySelector('[onclick="addReplayFromAdmin()"]');
  if (btn) btn.textContent = 'Enregistrer les modifications';
  renderAdminReplays();
}

function cancelEditReplay() {
  APP_STATE.editingReplayId = null;
  document.getElementById('admin-replay-id').value = '';
  document.getElementById('admin-replay-title').value = '';
  document.getElementById('admin-replay-date').value = '';
  const btn = document.querySelector('[onclick="addReplayFromAdmin()"]');
  if (btn) btn.textContent = 'Ajouter le replay';
  renderAdminReplays();
}

async function removeReplay(dbId) {
  if (!confirm('Supprimer ce replay ?')) return;
  try {
    await api(`/api/admin/replays/${dbId}`, { method: 'DELETE' });
    if (APP_STATE.editingReplayId === dbId) {
      cancelEditReplay();
    }
    await loadPublicContent();
    await loadAdminDashboard();
    showToast('Replay supprime.');
  } catch {
    showToast('Suppression du replay impossible.');
  }
}

function renderAdminReplays() {
  const list = document.getElementById('admin-replays-list');
  if (!list) return;

  if (!APP_STATE.replays.length) {
    list.innerHTML = '<p class="admin-empty">Aucun replay.</p>';
    return;
  }

  list.innerHTML = APP_STATE.replays.map((video) => `
    <div class="admin-list-item" style="${APP_STATE.editingReplayId === video.dbId ? 'background:rgba(200,169,81,.1);border:1px solid rgba(200,169,81,.3)' : ''}">
      <div>
        <strong>${escapeHtml(video.titre)}</strong>
        <small>${escapeHtml(video.date)} - ID: ${escapeHtml(video.id)}</small>
      </div>
      <div style="display:flex;gap:.5rem;flex-wrap:wrap">
        <button class="btn-secondary" onclick="editReplay(${Number(video.dbId)}, '${video.id.replace(/'/g, "\\'")}', '${video.titre.replace(/'/g, "\\'")}', '${video.date.replace(/'/g, "\\'")}')" style="flex:1;min-width:80px">${APP_STATE.editingReplayId === video.dbId ? 'En édition ✎' : 'Éditer'}</button>
        <button class="btn-secondary" onclick="removeReplay(${Number(video.dbId)})" style="flex:1;min-width:80px">Supprimer</button>
      </div>
    </div>
  `).join('');
}

function renderAdminAgenda() {
  const list = document.getElementById('admin-agenda-list');
  if (!list) return;

  if (!APP_STATE.agenda.length) {
    list.innerHTML = '<p class="admin-empty"><i class="fa-regular fa-calendar-xmark"></i> Aucun événement programmé.</p>';
    return;
  }

  const typeColors = {
    'culte': { bg: 'rgba(212,90,0,.18)', border: 'rgba(212,90,0,.5)', color: '#ff8c3a' },
    'etude': { bg: 'rgba(0,87,183,.18)', border: 'rgba(0,87,183,.5)', color: '#7ab3ff' },
    'veillee': { bg: 'rgba(91,14,166,.18)', border: 'rgba(91,14,166,.5)', color: '#c084fc' },
    'default': { bg: 'rgba(200,169,81,.12)', border: 'rgba(200,169,81,.4)', color: '#edd88f' },
  };
  const getTypeKey = (t) => {
    const s = t.toLowerCase();
    if (s.includes('culte')) return 'culte';
    if (s.includes('etude') || s.includes('étude')) return 'etude';
    if (s.includes('veillee') || s.includes('veillée') || s.includes('jeune')) return 'veillee';
    return 'default';
  };

  list.innerHTML = APP_STATE.agenda.map((ev) => {
    const tk = getTypeKey(ev.type);
    const c = typeColors[tk];
    const isEditing = APP_STATE.editingAgendaId === ev.id;
    return `
    <div class="agenda-admin-item${isEditing ? ' agenda-admin-item--editing' : ''}">
      <div class="agenda-admin-item-badge" style="background:${c.bg};border-color:${c.border};color:${c.color}">
        ${escapeHtml(ev.type)}
      </div>
      <div class="agenda-admin-item-body">
        <strong>${escapeHtml(ev.date_text)}</strong>
        <span>${escapeHtml(ev.titre)}</span>
        <small><i class="fa-regular fa-clock"></i> ${escapeHtml(ev.heure)}</small>
      </div>
      <div class="agenda-admin-item-actions">
        <button class="agenda-btn-edit" onclick="editAgenda(${ev.id},'${ev.date_text.replace(/'/g,"\\'")}',' ${ev.type.replace(/'/g,"\\'")}',' ${ev.titre.replace(/'/g,"\\'")}',' ${ev.heure.replace(/'/g,"\\'")}')">
          <i class="fa-solid fa-pen"></i>${isEditing ? ' En cours' : ' Éditer'}
        </button>
        <button class="agenda-btn-delete" onclick="removeAgenda(${ev.id})">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    </div>`;
  }).join('');
}

function editAgenda(id, date_text, type, titre, heure) {
  APP_STATE.editingAgendaId = id;
  document.getElementById('admin-agenda-date').value = date_text.trim();
  const sel = document.getElementById('admin-agenda-type');
  if (sel) {
    const opt = [...sel.options].find(o => o.value.toLowerCase() === type.trim().toLowerCase());
    if (opt) sel.value = opt.value; else sel.value = sel.options[0].value;
  }
  document.getElementById('admin-agenda-titre').value = titre.trim();
  document.getElementById('admin-agenda-heure').value = heure.trim();
  const lbl = document.getElementById('agenda-submit-label');
  if (lbl) lbl.textContent = 'Enregistrer les modifications';
  document.getElementById('agenda-admin-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  renderAdminAgenda();
}

function cancelEditAgenda() {
  APP_STATE.editingAgendaId = null;
  ['admin-agenda-date','admin-agenda-titre','admin-agenda-heure'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const sel = document.getElementById('admin-agenda-type');
  if (sel) sel.selectedIndex = 0;
  const lbl = document.getElementById('agenda-submit-label');
  if (lbl) lbl.textContent = 'Ajouter l\'événement';
  renderAdminAgenda();
}

async function saveAgendaEvent() {
  const date_text = document.getElementById('admin-agenda-date')?.value.trim();
  const type = document.getElementById('admin-agenda-type')?.value.trim();
  const titre = document.getElementById('admin-agenda-titre')?.value.trim();
  const heure = document.getElementById('admin-agenda-heure')?.value.trim();

  if (!date_text || !type || !titre || !heure) {
    showToast('Complétez tous les champs.');
    return;
  }

  try {
    if (APP_STATE.editingAgendaId) {
      await api(`/api/admin/agenda/${APP_STATE.editingAgendaId}`, { method: 'PUT', body: JSON.stringify({ date_text, type, titre, heure }) });
      showToast('Événement modifié.');
    } else {
      await api('/api/admin/agenda', { method: 'POST', body: JSON.stringify({ date_text, type, titre, heure }) });
      showToast('Événement ajouté.');
    }
    cancelEditAgenda();
    await loadPublicContent();
    await loadAdminDashboard();
  } catch {
    showToast('Opération impossible.');
  }
}

async function removeAgenda(id) {
  if (!confirm('Supprimer cet événement ?')) return;
  try {
    await api(`/api/admin/agenda/${id}`, { method: 'DELETE' });
    if (APP_STATE.editingAgendaId === id) cancelEditAgenda();
    await loadPublicContent();
    await loadAdminDashboard();
    showToast('Événement supprimé.');
  } catch {
    showToast('Suppression impossible.');
  }
}

function renderEglise(e) {
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val || el.textContent; };
  set('eglise-nom-display', e.nom);
  set('eglise-slogan-display', e.slogan);
  set('eglise-vision-display', e.vision);
  set('eglise-mission-display', e.mission);
  set('eglise-valeurs-display', e.valeurs);
  set('eglise-histoire-display', e.histoire);
  set('eglise-horaire-culte-display', e.horaireCulte);
  set('eglise-horaire-etude-display', e.horaireEtude);
  set('eglise-horaire-veillee-display', e.horaireVeillee);
  set('eglise-adresse-display', e.adresse);
  set('eglise-contact-display', e.contact);
  set('eglise-email-display', e.email);

  const grid = document.getElementById('eglise-equipe-grid');
  if (grid && e.equipe) {
    const membres = e.equipe.split('\n').map(l => l.trim()).filter(Boolean);
    grid.innerHTML = membres.map(m => {
      const [nom, role] = m.split('|').map(s => s.trim());
      const initials = (nom || '?').substring(0, 2).toUpperCase();
      return `
        <div class="equipe-card">
          <div class="equipe-avatar">${escapeHtml(initials)}</div>
          <div class="equipe-nom">${escapeHtml(nom || '')}</div>
          <div class="equipe-role">${escapeHtml(role || '')}</div>
        </div>`;
    }).join('');
  }
}

function fillEgliseForms() {
  const e = APP_STATE.eglise || {};
  const fields = ['nom','slogan','vision','mission','valeurs','histoire','horaireCulte','horaireEtude','horaireVeillee','adresse','contact','email','equipe'];
  fields.forEach(f => {
    const el = document.getElementById('eglise-' + f.replace(/([A-Z])/g, '-$1').toLowerCase());
    if (el) el.value = e[f] || '';
  });
}

async function saveEgliseSettings() {
  const fields = ['nom','slogan','vision','mission','valeurs','histoire','horaireCulte','horaireEtude','horaireVeillee','adresse','contact','email','equipe'];
  const payload = {};
  fields.forEach(f => {
    const el = document.getElementById('eglise-' + f.replace(/([A-Z])/g, '-$1').toLowerCase());
    payload[f] = el ? el.value.trim() : '';
  });
  try {
    const data = await api('/api/admin/eglise', { method: 'PUT', body: JSON.stringify(payload) });
    APP_STATE.eglise = data.eglise || payload;
    renderEglise(APP_STATE.eglise);
    showToast('Présentation de l\'église enregistrée.');
  } catch {
    showToast('Impossible de sauvegarder.');
  }
}

function renderAdminPrayers() {
  const list = document.getElementById('admin-prayers-list');
  if (!list) return;

  if (!APP_STATE.adminPrayers.length) {
    list.innerHTML = '<p class="admin-empty">Aucune intention partagee.</p>';
    return;
  }

  list.innerHTML = APP_STATE.adminPrayers.map((item) => `
    <div class="admin-list-item">
      <div>
        <strong>${escapeHtml(item.name)}</strong>
        <small>${escapeHtml(item.text)}</small>
      </div>
      <button class="btn-secondary" onclick="removePrayer(${Number(item.id)})">Retirer</button>
    </div>
  `).join('');
}

async function removePrayer(id) {
  try {
    await api(`/api/admin/prayers/${id}`, { method: 'DELETE' });
    await loadPublicContent();
    await loadAdminDashboard();
    showToast('Intention retiree.');
  } catch {
    showToast('Suppression impossible.');
  }
}

async function resetStats() {
  try {
    await api('/api/admin/stats/reset', { method: 'POST', body: '{}' });
    await refreshStats();
    await loadAdminDashboard();
    showToast('Statistiques reinitialisees.');
  } catch {
    showToast('Reinitialisation impossible.');
  }
}

function exportCSV(type) {
  const endpoints = {
    stats: '/api/admin/export/stats',
    prayers: '/api/admin/export/prayers',
    replays: '/api/admin/export/replays'
  };
  const url = endpoints[type];
  if (!url) return;
  window.open(url, '_blank');
}

function showToast(msg, duration = 3500) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

// ─── SERVICE WORKER & WEB PUSH ────────────────────────────────────────────────

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.register('/sw.js').catch(() => { /* ignore */ });
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

async function requestPushPermission() {
  const banner = document.getElementById('push-banner');
  if (banner) banner.style.display = 'none';
  localStorage.setItem(PUSH_STORAGE_KEY, '1');

  if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    showToast('Les notifications ne sont pas supportées sur ce navigateur.');
    return;
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    showToast('Permission refusée. Vous pouvez l\'activer dans les paramètres du navigateur.');
    return;
  }

  try {
    const { publicKey } = await api('/api/public/push/vapid-key');
    const sw = await navigator.serviceWorker.ready;
    const sub = await sw.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
    pushSubscription = sub;
    await api('/api/public/push/subscribe', {
      method: 'POST',
      body: JSON.stringify(sub.toJSON()),
    });
    showToast('✅ Notifications activées ! Vous serez alerté avant chaque culte.');
  } catch {
    showToast('Impossible d\'activer les notifications. Réessayez plus tard.');
  }
}

// ─── ADMIN PUSH NOTIFICATIONS ─────────────────────────────────────────────────

async function loadPushStats() {
  try {
    const data = await api('/api/admin/push/stats');
    const el = document.getElementById('push-stat-actif');
    if (el) el.textContent = String(data.actif ?? '—');
  } catch { /* ignore */ }
}

async function loadPushSchedule() {
  try {
    const data = await api('/api/admin/push/schedule');
    const day = document.getElementById('push-sched-day');
    const hour = document.getElementById('push-sched-hour');
    const minute = document.getElementById('push-sched-minute');
    const message = document.getElementById('push-sched-message');
    const enabled = document.getElementById('push-sched-enabled');

    if (day) day.value = data.day || 'sunday';
    if (hour) hour.value = data.hour ?? 9;
    if (minute) minute.value = data.minute ?? 30;
    if (message) message.value = data.message || '';
    if (enabled) enabled.checked = Boolean(data.enabled);
  } catch { /* ignore */ }
}

async function savePushSchedule() {
  const day = document.getElementById('push-sched-day')?.value;
  const hour = Number(document.getElementById('push-sched-hour')?.value);
  const minute = Number(document.getElementById('push-sched-minute')?.value);
  const message = document.getElementById('push-sched-message')?.value?.trim();
  const enabled = document.getElementById('push-sched-enabled')?.checked;

  try {
    await api('/api/admin/push/schedule', {
      method: 'PUT',
      body: JSON.stringify({ enabled, day, hour, minute, message }),
    });
    showToast('Planning de notification enregistré.');
  } catch {
    showToast('Impossible de sauvegarder le planning.');
  }
}

async function sendManualPush() {
  const title = document.getElementById('push-notif-title')?.value?.trim();
  const body = document.getElementById('push-notif-body')?.value?.trim();

  if (!title) {
    showToast('Saisissez un titre pour la notification.');
    return;
  }

  try {
    const data = await api('/api/admin/push/send', {
      method: 'POST',
      body: JSON.stringify({ title, body: body || '' }),
    });
    showToast(`✅ Notification envoyée à ${data.sent} abonné(s).`);
  } catch {
    showToast('Impossible d\'envoyer la notification.');
  }
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
