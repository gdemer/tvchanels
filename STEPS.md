# Βήματα Μετατροπής σε React (με Components)

## 1. Ανάλυση αρχικού project
- Το αρχικό `index.html` ήταν ένα στατικό HTML αρχείο με:
  - Μια μεγάλη λίστα καναλιών (σύνδεσμοι `<a href>` ομαδοποιημένοι οπτικά ανά περιοχή μέσα σε `<div>`/`<br>`).
  - Έναν πίνακα με χρήσιμα links (gov.gr, ΑΑΔΕ, κ.λπ.).
- Εξήχθησαν **69 κανάλια** σε **16 περιοχές** (Αθήνα, Δράμα, Θεσσαλονίκη, Αλεξανδρούπολη, Βόλος, Ιωάννινα, Καβάλα, Κοζάνη, Λάρισα, Πάτρα, Σέρρες, Υπόλοιπη Ελλάδα, Κέρκυρα, Κρήτη, Υπόλοιπα Νησιά, Κανάλια Εξωτερικού).
- Το αρχικό αρχείο διατηρήθηκε ως `index.legacy.html` για αναφορά.

## 2. Επιλογή τεχνολογίας React (χωρίς build step)
Επειδή το workspace δεν είχε Node/npm project (μόνο ένα `.html` αρχείο), επιλέχθηκε η πιο απλή
προσέγγιση ώστε να τρέχει απευθείας στον browser, χωρίς εγκατάσταση εργαλείων:
- **React 18** και **ReactDOM 18** μέσω CDN (`unpkg.com`).
- **Babel Standalone** για μεταγλώττιση JSX απευθείας στον browser (`type="text/babel"`).
- Τα components γράφτηκαν ως ξεχωριστά `.jsx` αρχεία και φορτώνονται με `<script>` tags με τη σειρά
  που χρειάζονται (εξαρτήσεις πρώτα).

> Σημείωση: Για production/μεγαλύτερο project προτείνεται μετάβαση σε εργαλείο build όπως
> Vite (`npm create vite@latest -- --template react`), ώστε η μεταγλώττιση JSX να γίνεται σε
> build-time και όχι σε κάθε φόρτωση σελίδας.

## 3. Δομή αρχείων μετά τη μετατροπή
```
index.html                     -> entry point, φορτώνει React/Babel CDN + components
index.legacy.html              -> το αρχικό στατικό αρχείο (backup)
src/
  styles.css                   -> όλα τα στυλ (sidebar, content area, responsive)
  data/
    channels.js                -> window.CHANNEL_GROUPS: 16 περιοχές x κανάλια (name + url)
  components/
    ChannelItem.jsx             -> μία γραμμή καναλιού στη sidebar (εικονίδιο 📺 + όνομα)
    Sidebar.jsx                 -> πλευρική μπάρα: αναζήτηση + ομάδες περιοχών (εικονίδιο 📍)
                                   που ξεδιπλώνονται στα κανάλια τους
    ContentArea.jsx             -> δεξί content area: embedded <iframe> με το επιλεγμένο κανάλι
    App.jsx                     -> ρίζα εφαρμογής, κρατά state επιλεγμένου καναλιού,
                                   συνδέει Sidebar + ContentArea, κάνει το React render
```

## 4. Υλοποίηση components
1. **`channels.js`**: Μετατροπή όλων των `<a href>` συνδέσμων του αρχικού αρχείου σε δομή δεδομένων
   JS (`{ name, url }`), ομαδοποιημένα ανά περιοχή (`{ region, channels: [...] }`).
2. **`ChannelItem`**: Εμφανίζει εικονίδιο 📺 + όνομα καναλιού. Κλικ καλεί `onSelect(channel)`.
   Έχει κλάση `active` όταν είναι το τρέχον επιλεγμένο κανάλι.
3. **`Sidebar`**: 
   - Πεδίο αναζήτησης που φιλτράρει κανάλια σε πραγματικό χρόνο.
   - Κάθε περιοχή είναι ένα collapsible group (κουμπί με εικονίδιο 📍 + βελάκι ▾/▸).
   - Περνάει `activeChannel` και `onSelectChannel` callback στα `ChannelItem`.
4. **`ContentArea`**:
   - Αν δεν έχει επιλεγεί κανάλι, δείχνει μήνυμα υπόδειξης.
   - Αλλιώς, δείχνει τίτλο καναλιού, σύνδεσμο "Άνοιγμα σε νέα καρτέλα" και ένα `<iframe>` που
     φορτώνει το `channel.url` (Embedded προβολή).
   - Προσθήκη σημείωσης ότι κάποια sites μπορεί να μπλοκάρουν embedding μέσω
     `X-Frame-Options` / `Content-Security-Policy` — σε αυτή την περίπτωση χρειάζεται το
     άνοιγμα σε νέα καρτέλα.
5. **`App`**: Κρατά `activeChannel` state (`React.useState`), default το πρώτο κανάλι της πρώτης
   περιοχής. Κάνει `ReactDOM.createRoot(...).render(<App />)`.

## 5. Στυλ (CSS)
- Flex layout: `.app-layout` = sidebar (280px, scrollable) + content area (flex: 1).
- Σκούρο θέμα (παρόμοιο με το αρχικό `#003476` μπλε φόντο).
- Responsive: σε οθόνες <720px η sidebar πάει πάνω από το content area (column layout).

## 6. Γνωστοί περιορισμοί
- Πολλά κανάλια (π.χ. MEGA, ΑΝΤ1, ΣΚΑΪ) μπορεί να μην επιτρέπουν embedding μέσα σε `<iframe>`
  λόγω `X-Frame-Options: DENY/SAMEORIGIN` ή CSP `frame-ancestors`. Αυτό δεν μπορεί να παρακαμφθεί
  από client-side κώδικα — είναι περιορισμός του εκάστοτε site. Γι' αυτό υπάρχει πάντα το κουμπί
  "Άνοιγμα σε νέα καρτέλα" ως fallback.
- Δεν υπάρχει build step (webpack/vite) — το JSX μεταγλωττίζεται στον browser με Babel standalone,
  κάτι που είναι απλό αλλά πιο αργό από ένα production build. Για μεγαλύτερο project προτείνεται
  αναβάθμιση σε Vite/CRA.

## 7. Πώς τρέχει
- **Δεν ανοίγει με διπλό κλικ (`file://`)**: Οι browsers μπλοκάρουν, για λόγους ασφαλείας (CORS),
  τη φόρτωση εξωτερικών `<script src="./src/...">` αρχείων όταν η σελίδα ανοίγει απευθείας από
  το δίσκο (`file:///C:/...`). Χρειάζεται οπωσδήποτε έναν **τοπικό HTTP server**:
  - VS Code **Live Server** (Go Live) — αυτό που ήδη χρησιμοποιείται, σωστή επιλογή.
  - Ή εναλλακτικά `npx serve .` / `python -m http.server` από τον φάκελο του project.
- Με server (`http://127.0.0.1:...`) η εφαρμογή φορτώνει κανονικά.

## 8. Πώς προσθέτω νέα κανάλια/περιοχή (π.χ. Κύπρος)
- Άνοιξε το [src/data/channels.js](../src/data/channels.js).
- Για νέο κανάλι σε υπάρχουσα περιοχή, πρόσθεσε ένα αντικείμενο `{ name: "...", url: "..." }` μέσα
  στο `channels` array της περιοχής.
- Για νέα περιοχή, πρόσθεσε ένα νέο `{ region: "...", channels: [...] }` block μέσα στο
  `window.CHANNEL_GROUPS` array.
- Προστέθηκε ήδη η περιοχή **"Κύπρος"** με: ΡΙΚ 1, ΡΙΚ 2, ΡΙΚ HD, ΡΙΚ SAT, SIGMA, ALPHA Κύπρου,
  ANT1 Κύπρου, OMEGA. Δεν χρειάζεται αλλαγή σε κανένα άλλο αρχείο — η Sidebar διαβάζει δυναμικά
  το `window.CHANNEL_GROUPS`.
- Αν ένα νέο URL δεν επιτρέπει embedding (λευκή/άδεια οθόνη στο iframe), αυτό είναι περιορισμός
  του site (βλ. ενότητα 6), όχι bug του κώδικα.
