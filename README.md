# Culcutta Hair Saloon — App

यह एक पूरी तरह काम करने वाला **Progressive Web App (PWA)** है — Android, iPhone और Desktop तीनों पर चलता है और होम स्क्रीन पर "Install" किया जा सकता है (असली ऐप की तरह आइकॉन के साथ खुलेगा)।

## अभी क्या-क्या असली और काम करने वाला है
- होम, परिचय, सेवाएं (आपकी असली प्राइस लिस्ट के साथ), गैलरी, रिव्यू, ऑफर — सब पेज
- बुकिंग फॉर्म → सबमिट होते ही WhatsApp पर आपके नंबर (7486909015) पर मैसेज जाता है
- Call Now बटन → सीधे डायलर खोलता है
- WhatsApp चैट बटन (फ्लोटिंग)
- Google Maps लोकेशन embed + दिशा-निर्देश बटन
- कस्टमर लॉगिन/रजिस्ट्रेशन (डिवाइस पर सेव)
- लॉयल्टी पॉइंट सिस्टम (₹10 = 1 पॉइंट, ब्रॉन्ज़/सिल्वर/गोल्ड टियर)
- कस्टमर रिव्यू + रेटिंग जोड़ना
- एडमिन पैनल (फुटर में "एडमिन पैनल" लिंक, डेमो पासवर्ड: `culcutta786`) — बुकिंग देखें, पूर्ण करें, रिव्यू हटाएं
- UPI QR कोड जनरेटर (Google Pay/PhonePe/Paytm सभी काम करेंगे — पेमेंट सेक्शन में)
- Dark/Light थीम टॉगल (टॉप बार में सूरज/चाँद आइकॉन)
- पूरी तरह Responsive — मोबाइल, टैबलेट, डेस्कटॉप

**सीमा:** डेटा (बुकिंग, लॉगिन, रिव्यू) अभी सिर्फ उसी डिवाइस/ब्राउज़र पर सेव होता है (localStorage), असली ऑनलाइन डेटाबेस नहीं। नीचे इसे Firebase से जोड़ने का पूरा तरीका है।

---

## स्टेप 1 — इसे तुरंत टेस्ट करें
`index.html` को किसी भी ब्राउज़र में खोलें, या नीचे दिए स्टेप से मोबाइल पर इंस्टॉल करें:
1. इन सभी फाइलों को एक फ्री होस्टिंग पर डालें: **Firebase Hosting**, **Netlify**, या **GitHub Pages** (तीनों फ्री हैं)।
2. उस लिंक को Chrome (Android) या Safari (iPhone) में खोलें।
3. Chrome में "⋮ मेनू → Add to Home screen" दबाएं — ऐप आपकी होम स्क्रीन पर आइकॉन के साथ इंस्टॉल हो जाएगा।

---

## स्टेप 2 — असली Firebase बैकएंड जोड़ें (Login + Database + Notifications)
1. https://console.firebase.google.com पर जाकर **नया प्रोजेक्ट बनाएं** (जैसे "culcutta-hair-saloon")।
2. **Authentication** चालू करें → Phone या Email/Password method ऑन करें।
3. **Firestore Database** बनाएं (bookings, reviews, users के लिए collections)।
4. **Cloud Messaging (FCM)** से Push Notifications चालू करें।
5. Firebase Project Settings से मिला हुआ यह कोड `index.html` के `</head>` से ठीक पहले जोड़ें:

```html
<script type="module">
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
  import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
  import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
  import { getMessaging } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging.js";

  const firebaseConfig = {
    apiKey: "आपकी-api-key",
    authDomain: "culcutta-hair-saloon.firebaseapp.com",
    projectId: "culcutta-hair-saloon",
    storageBucket: "culcutta-hair-saloon.appspot.com",
    messagingSenderId: "...",
    appId: "..."
  };
  const app = initializeApp(firebaseConfig);
  window.auth = getAuth(app);
  window.db = getFirestore(app);
</script>
```

6. फिर `app.js` में हर जगह जहाँ `store.get("ch_bookings")` / `store.set("ch_bookings", ...)` लिखा है, उसे Firestore की `addDoc(collection(db,"bookings"), booking)` कॉल से बदल दें। लॉगिन के लिए `signInWithPhoneNumber(auth, ...)` इस्तेमाल करें। यह बदलाव किसी भी फ्रीलांस React/Firebase डेवलपर से 3–5 घंटे में हो जाता है।

---

## स्टेप 3 — असली UPI Payment चालू करें
अभी QR कोड डेमो UPI ID (`culcuttahairsaloon@upi`) से बनता है।
1. `app.js` में सबसे ऊपर `SALON.upiId` को अपनी असली UPI ID से बदलें (जो आपके बैंक अकाउंट/Google Pay से जुड़ी है, जैसे `7486909015@ybl`)।
2. यही एक UPI लिंक Google Pay, PhonePe, Paytm — तीनों में अपने-आप खुल जाता है, अलग-अलग इंटीग्रेशन की ज़रूरत नहीं।
3. अगर पेमेंट का ऑटोमेटिक रिकॉर्ड (सफल/असफल) चाहिए तो **Razorpay** या **Cashfree** जैसे पेमेंट गेटवे से बिज़नेस अकाउंट बनाना होगा (KYC ज़रूरी) — वो असली सर्वर-साइड API कॉल से जुड़ता है।

---

## स्टेप 4 — Play Store पर पब्लिश करना
यह एक वेब ऐप (PWA) है, इसे बिना दोबारा कोड लिखे "TWA" (Trusted Web Activity) के ज़रिए असली Android ऐप की तरह पैकेज करके Play Store पर डाला जा सकता है:
1. ऐप को पहले किसी डोमेन पर लाइव होस्ट करें (Firebase Hosting फ्री है)।
2. Google का **PWA Builder** (https://www.pwabuilder.com) खोलें, अपनी वेबसाइट का लिंक डालें।
3. "Package for Android" चुनें → यह अपने-आप एक `.aab` फाइल बना देगा।
4. https://play.google.com/console पर **Google Play Developer अकाउंट** बनाएं (एक बार का ₹2,100 शुल्क)।
5. वह `.aab` फाइल अपलोड करें, स्टोर लिस्टिंग (स्क्रीनशॉट, डिस्क्रिप्शन, प्राइवेसी पॉलिसी लिंक) भरें और सबमिट करें।

*(यह स्टेप आपके अपने Google अकाउंट, बिलिंग और असली होस्टिंग डोमेन के बिना नहीं हो सकता — ये जानकारी सिर्फ आप ही दे सकते हैं।)*

---

## फाइलें
- `index.html` — पूरा ऐप ढांचा और डिज़ाइन (CSS)
- `app.js` — सारा लॉजिक: बुकिंग, लॉगिन, लॉयल्टी, रिव्यू, एडमिन, QR पेमेंट
- `manifest.json` — ऐप को इंस्टॉल करने योग्य बनाता है
- `sw.js` — ऑफलाइन/इंस्टॉल सपोर्ट (Service Worker)
- `assets/logo.jpg` — आपका लोगो
