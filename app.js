/* ============================================================
   CULCUTTA HAIR SALOON — App Logic
   Data layer uses localStorage (works fully offline, no server).
   See README.md for how to swap this for real Firebase.
   ============================================================ */

const SALON = {
  name: "Culcutta Hair Saloon",
  owner: "आमिर शेख",
  phone: "917486909015",
  phoneDisplay: "+91 74869 09015",
  address: "भद्रा प्लाजा का तीसरा गेट, बैंक ऑफ इंडिया के पीछे, अहमदाबाद",
  open: "सुबह 9:00",
  close: "रात 9:00",
  mapsQuery: "Bhadra Plaza, Ahmedabad, Gujarat",
  upiId: "culcuttahairsaloon@upi" /* PLACEHOLDER — बदलें असली UPI ID से, README देखें */
};

const SERVICES = {
  hair: { label: "हेयर", icon: "✂️", items: [
    { n: "रेगुलर हेयर कट", p: 130 },
    { n: "फैंसी हेयर कट", p: 150 },
    { n: "बाबा फैंसी हेयर कट", p: 100 },
    { n: "हेयर स्पा", p: 400 },
    { n: "हाई लाइट कलर", p: 400 },
    { n: "हेयर कलर", p: 300 },
    { n: "हेयर ड्रायर से बाल जमाना", p: 30 },
  ]},
  shave: { label: "शेविंग", icon: "🪒", items: [
    { n: "स्पेशल शेविंग", p: 50 },
    { n: "फोम शेविंग", p: 80 },
    { n: "फैंसी चेहरा सेटिंग", p: 70 },
    { n: "मूंछ सेटिंग", p: 10 },
  ]},
  face: { label: "फेस केयर", icon: "🧴", items: [
    { n: "फेस वॉश", p: 20 },
    { n: "शैम्पू वॉश", p: 30 },
    { n: "फेस ब्लीच", p: 250 },
    { n: "फेस डी-टैन / मसाज", p: 400 },
  ]},
  spa: { label: "मसाज", icon: "💆", items: [
    { n: "हेड मसाज", p: 100 },
  ]},
};

const OFFERS = [
  { tag: "नया ग्राहक", title: "पहली हेयर कट पर 20% छूट", desc: "नए ग्राहकों के लिए विशेष स्वागत ऑफर।" },
  { tag: "सोम-गुरु", title: "हेयर स्पा पर ₹50 की छूट", desc: "सोमवार से गुरुवार, हेयर स्पा बुक करें और बचाएं।" },
  { tag: "मेंबर", title: "10 विज़िट पर 1 हेयर कट फ्री", desc: "लॉयल्टी मेंबर्स के लिए खास इनाम।" },
];

const SEED_REVIEWS = [
  { name: "राहुल पटेल", stars: 5, text: "बहुत अच्छी सर्विस, स्टाफ बहुत पॉलिटली और स्किल्ड है।" },
  { name: "विशाल ठाकोर", stars: 5, text: "हेयर स्पा बहुत रिलैक्सिंग था, कीमत भी वाजिब है।" },
  { name: "किरण सोलंकी", stars: 4, text: "अच्छी जगह है, समय पर सर्विस मिलती है।" },
];

const ADMIN_PASSWORD = "culcutta786"; // डेमो के लिए — प्रोडक्शन में Firebase Auth से बदलें

/* ---------------- storage helpers ---------------- */
const store = {
  get(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v === null ? d : v; } catch (e) { return d; } },
  set(k, v) { localStorage.setItem(k, JSON.stringify(v)); }
};
function ensureSeed() {
  if (!store.get("ch_reviews")) store.set("ch_reviews", SEED_REVIEWS);
  if (!store.get("ch_bookings")) store.set("ch_bookings", []);
  if (!store.get("ch_user")) store.set("ch_user", null);
  if (!store.get("ch_users")) store.set("ch_users", []);
  if (!store.get("ch_theme")) store.set("ch_theme", "dark");
}
ensureSeed();

/* ---------------- small utils ---------------- */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
function toast(msg) {
  const t = $("#toast"); t.textContent = msg; t.classList.add("show");
  clearTimeout(window.__tt); window.__tt = setTimeout(() => t.classList.remove("show"), 2600);
}
function waLink(text) { return `https://wa.me/${SALON.phone}?text=${encodeURIComponent(text)}`; }
function openWhatsApp() { window.open(waLink(`नमस्ते ${SALON.name}, मुझे जानकारी चाहिए।`), "_blank"); }
function callNow() { window.location.href = `tel:+${SALON.phone}`; }
function openModal(html) { $("#modalBody").innerHTML = html; $("#modalBg").classList.add("show"); }
function closeModal() { $("#modalBg").classList.remove("show"); }
$("#modalBg").addEventListener("click", e => { if (e.target.id === "modalBg") closeModal(); });

function icon(name) {
  const M = {
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/>',
    home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',
    scissors: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4L8.5 15.5M20 20L14.5 14.5M8.5 8.5L20 20"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>',
    star: '<path d="M12 2l3 6.8 7.4.6-5.6 4.9 1.7 7.3L12 17.8 5.5 21.6l1.7-7.3L1.6 9.4l7.4-.6z"/>',
    phone: '<path d="M22 16.9v2a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 1h2a2 2 0 0 1 2 1.7c.1 1.1.4 2.2.7 3.2a2 2 0 0 1-.5 2.1L7.1 9.3a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c1 .4 2.1.6 3.2.7a2 2 0 0 1 1.7 2z"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>',
    check: '<path d="M20 6L9 17l-5-5"/>',
    close: '<path d="M18 6L6 18M6 6l12 12"/>',
    shield: '<path d="M12 2l8 4v6c0 5-3.4 8.4-8 10-4.6-1.6-8-5-8-10V6z"/>',
    qr: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM19 14h2v2h-2zM14 19h2v2h-2zM19 19h2v2h-2z"/>',
    gift: '<rect x="3" y="8" width="18" height="13" rx="1"/><path d="M12 8v13M3 12h18M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',
  };
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${M[name] || ""}</svg>`;
}

/* ================= RENDER ================= */
function render() {
  const theme = store.get("ch_theme", "dark");
  document.body.dataset.theme = theme;

  $("#app").innerHTML = `
  ${topbar(theme)}
  ${hero()}
  ${about()}
  ${servicesSec()}
  ${gallerySec()}
  ${bookingSec()}
  ${loyaltySec()}
  ${reviewsSec()}
  ${offersSec()}
  ${paymentSec()}
  ${footerSec()}
  ${bottomNav()}
  `;
  bindEvents();
}

function topbar(theme) {
  return `
  <header class="topbar">
    <div class="wrap topbar-inner">
      <div class="topbar-brand">
        <img src="logo.jpg" alt="">
        <div class="name">Culcutta <span class="brand-en">HAIR SALOON</span><small>प्रीमियम जेंट्स सैलून · भद्रा प्लाजा</small></div>
      </div>
      <nav class="desknav">
        <a href="#home">होम</a>
        <a href="#about">परिचय</a>
        <a href="#services">सेवाएं</a>
        <a href="#booking">बुकिंग</a>
        <a href="#reviews">रिव्यू</a>
      </nav>
      <div class="topbar-actions">
        <button class="icon-btn" id="themeToggle" aria-label="थीम बदलें">${icon(theme === "dark" ? "sun" : "moon")}</button>
        <button class="icon-btn" id="profileBtn" aria-label="मेरा खाता">${icon("user")}</button>
      </div>
    </div>
  </header>`;
}

function hero() {
  return `
  <section id="home" class="hero">
    <div class="hero-ring"><img src="logo.jpg" alt="Culcutta Hair Saloon logo"></div>
    <h1>CULCUTTA HAIR SALOON<span>स्टाइल · कॉन्फिडेंस · परफेक्शन</span></h1>
    <p class="tag">अहमदाबाद के भद्रा प्लाजा में प्रीमियम हेयर कट, शेविंग, ग्रूमिंग और हेयर स्पा — मालिक: ${SALON.owner}</p>
    <div class="hero-cta">
      <button class="btn btn-gold" onclick="location.hash='#booking'">${icon("calendar")} अपॉइंटमेंट बुक करें</button>
      <button class="btn btn-outline" onclick="callNow()">${icon("phone")} अभी कॉल करें</button>
      <button class="btn btn-ghost" onclick="openWhatsApp()">${icon("shield")} WhatsApp चैट</button>
    </div>
    <div class="strip">
      <div class="item">${icon("clock")}<div class="lbl">खुलने का समय</div><div class="val">${SALON.open} – ${SALON.close}</div></div>
      <div class="item">${icon("pin")}<div class="lbl">लोकेशन</div><div class="val">भद्रा प्लाजा</div></div>
      <div class="item">${icon("phone")}<div class="lbl">मोबाइल</div><div class="val">${SALON.phoneDisplay}</div></div>
      <div class="item">${icon("star")}<div class="lbl">रेटिंग</div><div class="val" id="avgRatingTop">–</div></div>
    </div>
    <div class="razor-line"></div>
  </section>`;
}

function about() {
  return `
  <section id="about" class="wrap">
    <div class="eyebrow">परिचय</div>
    <h2 class="sec-title">हमारे बारे में <em>जानें</em></h2>
    <div class="divider"></div>
    <div class="grid grid-2">
      <div class="card about-card">
        <p>Culcutta Hair Saloon अहमदाबाद के भद्रा प्लाजा में स्थित एक प्रीमियम जेंट्स सैलून है। मालिक <b>${SALON.owner}</b> के अनुभवी नेतृत्व में, हम हर ग्राहक को स्टाइल, सफाई और भरोसे के साथ बेहतरीन ग्रूमिंग अनुभव देने के लिए प्रतिबद्ध हैं।</p>
        <p>हमारी टीम रेगुलर हेयर कट से लेकर हेयर स्पा, फेस ब्लीच और प्रीमियम कलरिंग तक हर सेवा को पूरी सावधानी और स्किल के साथ करती है।</p>
      </div>
      <div class="card">
        <div class="about-meta">${icon("user")}<div><b>मालिक</b><span>${SALON.owner}</span></div></div>
        <div class="about-meta">${icon("phone")}<div><b>मोबाइल नंबर</b><span>${SALON.phoneDisplay}</span></div></div>
        <div class="about-meta">${icon("pin")}<div><b>पता</b><span>${SALON.address}</span></div></div>
        <div class="about-meta">${icon("clock")}<div><b>समय</b><span>रोज़ ${SALON.open} से ${SALON.close} तक खुला</span></div></div>
        <div class="map-frame">
          <iframe loading="lazy" src="https://www.google.com/maps?q=${encodeURIComponent(SALON.mapsQuery)}&output=embed"></iframe>
        </div>
        <div style="margin-top:12px">
          <a class="btn btn-outline" style="width:100%;justify-content:center" target="_blank"
             href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(SALON.mapsQuery)}">${icon("pin")} दिशा-निर्देश पाएं</a>
        </div>
      </div>
    </div>
  </section>`;
}

function servicesSec() {
  const keys = Object.keys(SERVICES);
  return `
  <section id="services" class="wrap">
    <div class="eyebrow">प्राइस लिस्ट</div>
    <h2 class="sec-title">हमारी <em>सेवाएं</em></h2>
    <div class="divider"></div>
    <div class="svc-tabs">
      ${keys.map((k, i) => `<button class="svc-tab ${i === 0 ? "active" : ""}" data-tab="${k}">${SERVICES[k].icon} ${SERVICES[k].label}</button>`).join("")}
    </div>
    <div class="card">
      ${keys.map((k, i) => `
      <div class="svc-group ${i === 0 ? "active" : ""}" data-group="${k}">
        ${SERVICES[k].items.map(it => `
          <div class="svc-row">
            <div class="nm">${it.n}</div>
            <div class="pr">₹${it.p}</div>
          </div>`).join("")}
      </div>`).join("")}
    </div>
  </section>`;
}

function gallerySec() {
  const glyphs = ["✂️", "💈", "🪒", "💇", "🧴", "✨"];
  return `
  <section id="gallery" class="wrap">
    <div class="eyebrow">गैलरी</div>
    <h2 class="sec-title">सैलून की <em>झलक</em></h2>
    <div class="divider"></div>
    <div class="gal">${glyphs.map(g => `<div class="tile">${g}</div>`).join("")}</div>
    <p class="muted-note">असली फोटो जोड़ने के लिए: सैलून की तस्वीरें खींचें और इन tile की जगह &lt;img&gt; टैग से लगाएं — README में स्टेप बताया गया है।</p>
  </section>`;
}

function bookingSec() {
  const allItems = Object.values(SERVICES).flatMap(g => g.items);
  return `
  <section id="booking" class="wrap">
    <div class="eyebrow">अपॉइंटमेंट</div>
    <h2 class="sec-title">बुकिंग <em>करें</em></h2>
    <div class="divider"></div>
    <div class="card">
      <form id="bookingForm">
        <div class="row2">
          <div class="field"><label>पूरा नाम</label><input required name="name" placeholder="आपका नाम"></div>
          <div class="field"><label>मोबाइल नंबर</label><input required name="phone" type="tel" pattern="[0-9]{10}" placeholder="10 अंकों का नंबर"></div>
        </div>
        <div class="row2">
          <div class="field"><label>सेवा चुनें</label>
            <select required name="service">
              <option value="">-- सेवा चुनें --</option>
              ${allItems.map(it => `<option value="${it.n}|${it.p}">${it.n} — ₹${it.p}</option>`).join("")}
            </select>
          </div>
          <div class="field"><label>पसंदीदा समय</label>
            <select required name="time">
              ${["10:00 AM","11:00 AM","12:00 PM","01:00 PM","03:00 PM","04:00 PM","05:00 PM","06:00 PM","07:00 PM","08:00 PM"].map(t=>`<option>${t}</option>`).join("")}
            </select>
          </div>
        </div>
        <div class="field"><label>तारीख</label><input required name="date" type="date"></div>
        <div class="field"><label>कोई खास नोट (वैकल्पिक)</label><textarea name="note" rows="2" placeholder="जैसे: पिछली बार जैसा हेयर स्टाइल"></textarea></div>
        <button class="btn btn-gold" type="submit" style="width:100%;justify-content:center">${icon("check")} बुकिंग कन्फर्म करें</button>
      </form>
      <p class="muted-note">बुकिंग सबमिट करते ही आपका मैसेज WhatsApp पर सीधे ${SALON.owner} तक भेजा जाएगा और लॉयल्टी अकाउंट में सेव होगा।</p>
    </div>
  </section>`;
}

function loyaltySec() {
  return `
  <section id="loyalty" class="wrap">
    <div class="eyebrow">लॉयल्टी</div>
    <h2 class="sec-title">मेंबरशिप <em>पॉइंट्स</em></h2>
    <div class="divider"></div>
    <div id="loyaltyBox"></div>
  </section>`;
}

function reviewsSec() {
  return `
  <section id="reviews" class="wrap">
    <div class="eyebrow">ग्राहकों की राय</div>
    <h2 class="sec-title">कस्टमर <em>रिव्यू</em></h2>
    <div class="divider"></div>
    <div id="reviewList"></div>
    <div class="card">
      <b class="head" style="font-size:1rem">अपना रिव्यू लिखें</b>
      <form id="reviewForm" class="review-form">
        <input required name="name" placeholder="आपका नाम">
        <select name="stars">
          <option value="5">⭐⭐⭐⭐⭐ बहुत बढ़िया</option>
          <option value="4">⭐⭐⭐⭐ अच्छा</option>
          <option value="3">⭐⭐⭐ ठीक-ठाक</option>
        </select>
        <textarea required name="text" rows="3" placeholder="अपना अनुभव लिखें..."></textarea>
        <button class="btn btn-gold" type="submit">रिव्यू भेजें</button>
      </form>
    </div>
  </section>`;
}

function offersSec() {
  return `
  <section id="offers" class="wrap">
    <div class="eyebrow">ऑफर्स</div>
    <h2 class="sec-title">छूट और <em>ऑफर</em></h2>
    <div class="divider"></div>
    <div class="grid grid-3">
      ${OFFERS.map(o => `
      <div class="offer-card">
        <div class="badge">OFFER</div>
        ${icon("gift")}
        <h3>${o.title}</h3>
        <p>${o.desc}</p>
      </div>`).join("")}
    </div>
  </section>`;
}

function paymentSec() {
  return `
  <section id="payment" class="wrap">
    <div class="eyebrow">भुगतान</div>
    <h2 class="sec-title">UPI से <em>पेमेंट</em></h2>
    <div class="divider"></div>
    <div class="card">
      <div class="field"><label>राशि (₹)</label><input id="payAmount" type="number" min="10" placeholder="जैसे 150"></div>
      <button class="btn btn-gold" onclick="generateQR()">${icon("qr")} QR कोड बनाएं</button>
      <div id="qrArea" style="text-align:center"></div>
      <p class="muted-note">Google Pay, PhonePe, Paytm — किसी भी UPI ऐप से QR स्कैन करके भुगतान करें। (नोट: यह डेमो UPI ID <b>${SALON.upiId}</b> का उपयोग करता है — असली भुगतान के लिए इसे मालिक की सही UPI ID से बदलें, README देखें।)</p>
    </div>
  </section>`;
}

function footerSec() {
  return `
  <footer>
    <div class="wrap">
      <div class="brand-en">CULCUTTA HAIR SALOON</div>
      <p>${SALON.address}</p>
      <p>${SALON.phoneDisplay} · रोज़ ${SALON.open} – ${SALON.close}</p>
      <p style="margin-top:16px"><a href="#" id="adminLink" style="color:var(--gold-bright); text-decoration:underline">एडमिन पैनल</a></p>
      <p style="opacity:.6; font-size:.75rem; margin-top:10px">© 2026 Culcutta Hair Saloon · मालिक: ${SALON.owner}</p>
    </div>
  </footer>`;
}

function bottomNav() {
  return `
  <nav class="bottomnav">
    <a href="#home" class="active">${icon("home")}होम</a>
    <a href="#services">${icon("scissors")}सेवाएं</a>
    <a href="#booking">${icon("calendar")}बुकिंग</a>
    <a href="#reviews">${icon("star")}रिव्यू</a>
    <a href="#" id="bottomProfile">${icon("user")}खाता</a>
  </nav>`;
}

/* ================= dynamic fragments ================= */
function renderReviews() {
  const revs = store.get("ch_reviews", []);
  const avg = revs.length ? (revs.reduce((a, r) => a + r.stars, 0) / revs.length).toFixed(1) : "5.0";
  const t = $("#avgRatingTop"); if (t) t.textContent = `${avg} ★`;
  const box = $("#reviewList");
  if (box) box.innerHTML = revs.slice().reverse().map(r => `
    <div class="review">
      <div class="top"><span class="who">${r.name}</span><span class="stars">${"★".repeat(r.stars)}${"☆".repeat(5 - r.stars)}</span></div>
      <p>${r.text}</p>
    </div>`).join("");
}

function renderLoyalty() {
  const user = store.get("ch_user");
  const box = $("#loyaltyBox"); if (!box) return;
  if (!user) {
    box.innerHTML = `<div class="card" style="text-align:center">
      <p>अपने लॉयल्टी पॉइंट्स और मेंबरशिप देखने के लिए लॉगिन करें।</p>
      <button class="btn btn-gold" onclick="openAuth('login')">${icon("user")} लॉगिन करें</button>
    </div>`;
    return;
  }
  const pts = user.points || 0;
  const tier = pts >= 300 ? "गोल्ड मेंबर" : pts >= 100 ? "सिल्वर मेंबर" : "ब्रॉन्ज़ मेंबर";
  const next = pts >= 300 ? 300 : pts >= 100 ? 300 : 100;
  const pct = Math.min(100, Math.round((pts / next) * 100));
  box.innerHTML = `
  <div class="loyalty-card">
    <div class="tier">${tier}</div>
    <div>${user.name} · ${pts} पॉइंट्स</div>
    <div class="loyalty-bar"><div style="width:${pct}%"></div></div>
    <div style="font-size:.78rem;color:var(--paper-dim)">हर ₹10 खर्च पर 1 पॉइंट मिलता है। ${next - pts > 0 ? `अगले टियर तक ${next - pts} पॉइंट बाकी।` : "आप टॉप टियर पर हैं!"}</div>
  </div>`;
}

/* ================= events ================= */
function bindEvents() {
  $("#themeToggle").onclick = () => {
    const cur = store.get("ch_theme", "dark");
    const nxt = cur === "dark" ? "light" : "dark";
    store.set("ch_theme", nxt);
    render();
  };
  $("#profileBtn").onclick = () => openAuth(store.get("ch_user") ? "account" : "login");
  $("#bottomProfile").onclick = (e) => { e.preventDefault(); openAuth(store.get("ch_user") ? "account" : "login"); };
  $("#adminLink").onclick = (e) => { e.preventDefault(); openAdminLogin(); };

  $$(".svc-tab").forEach(btn => btn.onclick = () => {
    $$(".svc-tab").forEach(b => b.classList.remove("active"));
    $$(".svc-group").forEach(g => g.classList.remove("active"));
    btn.classList.add("active");
    $(`.svc-group[data-group="${btn.dataset.tab}"]`).classList.add("active");
  });

  $("#bookingForm").addEventListener("submit", e => {
    e.preventDefault();
    const f = new FormData(e.target);
    const [svcName, svcPrice] = f.get("service").split("|");
    const booking = {
      id: Date.now(),
      name: f.get("name"), phone: f.get("phone"),
      service: svcName, price: Number(svcPrice),
      date: f.get("date"), time: f.get("time"), note: f.get("note") || "",
      status: "pending"
    };
    const list = store.get("ch_bookings", []); list.push(booking); store.set("ch_bookings", list);
    const msg = `नमस्ते, मैं ${booking.name} अपॉइंटमेंट बुक करना चाहता/चाहती हूँ।\nसेवा: ${booking.service} (₹${booking.price})\nतारीख: ${booking.date} | समय: ${booking.time}\nमोबाइल: ${booking.phone}\n${booking.note ? "नोट: " + booking.note : ""}`;
    window.open(waLink(msg), "_blank");
    toast("बुकिंग भेज दी गई है ✅");
    e.target.reset();
  });

  $("#reviewForm").addEventListener("submit", e => {
    e.preventDefault();
    const f = new FormData(e.target);
    const list = store.get("ch_reviews", []);
    list.push({ name: f.get("name"), stars: Number(f.get("stars")), text: f.get("text") });
    store.set("ch_reviews", list);
    renderReviews();
    toast("धन्यवाद! आपका रिव्यू जोड़ दिया गया 🙏");
    e.target.reset();
  });

  renderReviews();
  renderLoyalty();

  $$(".bottomnav a, .desknav a").forEach(a => {
    a.addEventListener("click", () => {
      $$(".bottomnav a").forEach(x => x.classList.remove("active"));
      if (a.closest(".bottomnav")) a.classList.add("active");
    });
  });
}

/* ================= auth ================= */
function openAuth(mode) {
  const user = store.get("ch_user");
  if (mode === "account" && user) {
    openModal(`
      <div class="modal-head"><b class="head" style="font-size:1.2rem">मेरा खाता</b><button class="close-x" onclick="closeModal()">${icon("close")}</button></div>
      <p><b>${user.name}</b><br>${user.phone}</p>
      <p style="color:var(--paper-dim)">लॉयल्टी पॉइंट्स: <b style="color:var(--gold-bright)">${user.points || 0}</b></p>
      <button class="btn btn-outline" style="width:100%;justify-content:center;margin-top:10px" onclick="logout()">लॉगआउट करें</button>
    `);
    return;
  }
  openModal(`
    <div class="modal-head"><b class="head" style="font-size:1.2rem">खाता</b><button class="close-x" onclick="closeModal()">${icon("close")}</button></div>
    <div class="authtabs">
      <button id="tabLogin" class="active">लॉगिन</button>
      <button id="tabReg">रजिस्टर करें</button>
    </div>
    <form id="loginForm">
      <div class="field"><label>मोबाइल नंबर</label><input required name="phone" type="tel"></div>
      <div class="field"><label>पासवर्ड</label><input required name="password" type="password"></div>
      <button class="btn btn-gold" style="width:100%;justify-content:center" type="submit">लॉगिन करें</button>
    </form>
    <form id="regForm" style="display:none">
      <div class="field"><label>पूरा नाम</label><input required name="name"></div>
      <div class="field"><label>मोबाइल नंबर</label><input required name="phone" type="tel"></div>
      <div class="field"><label>पासवर्ड बनाएं</label><input required name="password" type="password"></div>
      <button class="btn btn-gold" style="width:100%;justify-content:center" type="submit">रजिस्टर करें</button>
    </form>
    <p class="muted-note">यह डेमो लॉगिन डिवाइस पर ही सेव होता है। असली OTP-आधारित Firebase लॉगिन जोड़ने का तरीका README में है।</p>
  `);
  $("#tabLogin").onclick = () => { $("#tabLogin").classList.add("active"); $("#tabReg").classList.remove("active"); $("#loginForm").style.display = "grid"; $("#regForm").style.display = "none"; };
  $("#tabReg").onclick = () => { $("#tabReg").classList.add("active"); $("#tabLogin").classList.remove("active"); $("#regForm").style.display = "grid"; $("#loginForm").style.display = "none"; };

  $("#regForm").onsubmit = e => {
    e.preventDefault(); const f = new FormData(e.target);
    const users = store.get("ch_users", []);
    if (users.find(u => u.phone === f.get("phone"))) { toast("यह नंबर पहले से रजिस्टर है"); return; }
    const u = { name: f.get("name"), phone: f.get("phone"), password: f.get("password"), points: 0 };
    users.push(u); store.set("ch_users", users);
    store.set("ch_user", u);
    toast(`स्वागत है, ${u.name}!`); closeModal(); renderLoyalty();
  };
  $("#loginForm").onsubmit = e => {
    e.preventDefault(); const f = new FormData(e.target);
    const users = store.get("ch_users", []);
    const u = users.find(u => u.phone === f.get("phone") && u.password === f.get("password"));
    if (!u) { toast("गलत नंबर या पासवर्ड"); return; }
    store.set("ch_user", u); toast(`वापसी पर स्वागत है, ${u.name}!`); closeModal(); renderLoyalty();
  };
}
function logout() { store.set("ch_user", null); closeModal(); renderLoyalty(); toast("लॉगआउट हो गए"); }

/* ================= admin ================= */
function openAdminLogin() {
  openModal(`
    <div class="modal-head"><b class="head" style="font-size:1.2rem">एडमिन लॉगिन</b><button class="close-x" onclick="closeModal()">${icon("close")}</button></div>
    <form id="adminForm">
      <div class="field"><label>एडमिन पासवर्ड</label><input required name="pw" type="password"></div>
      <button class="btn btn-gold" style="width:100%;justify-content:center" type="submit">लॉगिन</button>
    </form>
    <p class="muted-note">डेमो पासवर्ड: culcutta786 (README में असली Firebase एडमिन ऑथ सेटअप बताया गया है)</p>
  `);
  $("#adminForm").onsubmit = e => {
    e.preventDefault();
    if (new FormData(e.target).get("pw") === ADMIN_PASSWORD) openAdminPanel();
    else toast("गलत पासवर्ड");
  };
}
function openAdminPanel() {
  const bookings = store.get("ch_bookings", []).slice().reverse();
  const reviews = store.get("ch_reviews", []);
  openModal(`
    <div class="modal-head"><b class="head" style="font-size:1.2rem">एडमिन पैनल</b><button class="close-x" onclick="closeModal()">${icon("close")}</button></div>
    <b class="head" style="font-size:.95rem">बुकिंग्स (${bookings.length})</b>
    <div style="overflow-x:auto;margin:10px 0 20px">
      <table class="admin-table">
        <tr><th>नाम</th><th>सेवा</th><th>तारीख/समय</th><th>स्टेटस</th><th></th></tr>
        ${bookings.map(b => `
        <tr>
          <td>${b.name}<br><span style="color:var(--paper-dim);font-size:.75rem">${b.phone}</span></td>
          <td>${b.service}<br>₹${b.price}</td>
          <td>${b.date}<br>${b.time}</td>
          <td><span class="pill ${b.status}">${b.status === "done" ? "पूर्ण" : "लंबित"}</span></td>
          <td>${b.status === "pending" ? `<button class="btn btn-outline" style="padding:6px 10px;font-size:.72rem" onclick="markDone(${b.id})">पूर्ण करें</button>` : "✓"}</td>
        </tr>`).join("") || `<tr><td colspan="5" style="color:var(--paper-dim)">अभी कोई बुकिंग नहीं</td></tr>`}
      </table>
    </div>
    <b class="head" style="font-size:.95rem">रिव्यू (${reviews.length})</b>
    <div style="margin-top:10px">
      ${reviews.map((r, i) => `
      <div class="review">
        <div class="top"><span class="who">${r.name}</span>
          <button class="close-x" style="font-size:1rem" onclick="deleteReview(${i})">${icon("close")}</button></div>
        <p>${r.text}</p>
      </div>`).join("")}
    </div>
    <p class="muted-note">"पूर्ण करें" दबाने पर ग्राहक के लॉगिन खाते में ₹10 = 1 पॉइंट के हिसाब से लॉयल्टी पॉइंट जुड़ेंगे (अगर उस मोबाइल नंबर से रजिस्टर्ड है)।</p>
  `);
}
function markDone(id) {
  const list = store.get("ch_bookings", []);
  const b = list.find(x => x.id === id); if (!b) return;
  b.status = "done"; store.set("ch_bookings", list);
  const users = store.get("ch_users", []);
  const u = users.find(x => x.phone === b.phone);
  if (u) { u.points = (u.points || 0) + Math.floor(b.price / 10); store.set("ch_users", users);
    const cur = store.get("ch_user"); if (cur && cur.phone === u.phone) store.set("ch_user", u);
  }
  openAdminPanel(); renderLoyalty(); toast("बुकिंग पूर्ण के रूप में मार्क की गई");
}
function deleteReview(i) {
  const list = store.get("ch_reviews", []); list.splice(i, 1); store.set("ch_reviews", list);
  openAdminPanel(); renderReviews(); toast("रिव्यू हटा दिया गया");
}

/* ================= UPI QR payment ================= */
function generateQR() {
  const amt = Number($("#payAmount").value || 0);
  if (!amt || amt < 1) { toast("कृपया सही राशि डालें"); return; }
  const upiUrl = `upi://pay?pa=${encodeURIComponent(SALON.upiId)}&pn=${encodeURIComponent(SALON.name)}&am=${amt}&cu=INR&tn=${encodeURIComponent("Culcutta Hair Saloon Payment")}`;
  const area = $("#qrArea");
  area.innerHTML = `<div class="qr-box" id="qrcode"></div><p style="font-family:'Rajdhani';font-weight:700;color:var(--gold-bright)">₹${amt} भुगतान करें</p>`;
  new QRCode(document.getElementById("qrcode"), { text: upiUrl, width: 190, height: 190, colorDark: "#141210", colorLight: "#ffffff" });
}

/* ================= boot ================= */
render();

/* register service worker for offline / installable app */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}
