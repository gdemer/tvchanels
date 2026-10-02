/* Δεξί content area: εμφανίζει το επιλεγμένο κανάλι μέσα σε embedded iframe. */
function ContentArea({ channel }) {
  // Αν δεν έχει επιλεγεί κανένα κανάλι ακόμα (αρχική κατάσταση)
  if (!channel) {
    return (
      <div className="content-area empty-state">
        <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>
          <h2>📺 Καλώς ορίσατε στο TV Channels App</h2>
          <p>Παρακαλώ επιλέξτε ένα κανάλι από την αριστερή στήλη για να ξεκινήσει η αναπαραγωγή.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="content-area" style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column' }}>
      <div className="channel-header" style={{ marginBottom: '15px' }}>
        <h2 style={{ margin: 0, color: '#333' }}>🔴 Τώρα Παίζει: {channel.name}</h2>
      </div>
      
      {/* Το Iframe Container που κρατάει σταθερές τις αναλογίες της οθόνης */}
      <div className="video-container" style={{ position: 'relative', width: '100%', height: 'calc(100vh - 150px)', border: '2px solid #ccc', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#000' }}>
        <iframe
          src={channel.url}
          title={channel.name}
          width="100%"
          height="100%"
          allowFullScreen
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        ></iframe>
      </div>
    </div>
  );
}

function ContentArea1({ channel }) {
  if (!channel) {
    return (
      <main className="content-area content-area--empty">
        <p>Επίλεξε ένα κανάλι από την πλευρική μπάρα για να ξεκινήσεις.</p>
      </main>
    );
  }

  return (
    <main className="content-area">
      <div className="content-area-header">
        <span className="channel-icon" aria-hidden="true">📺</span>
        <h2>{channel.name}</h2>
        <a className="open-new-tab" href={channel.url} target="_blank" rel="noopener noreferrer">
          Άνοιγμα σε νέα καρτέλα ↗
        </a>
      </div>
      <div className="iframe-wrapper">
        <iframe
          key={channel.url}
          src={channel.url}
          title={channel.name}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
          referrerPolicy="no-referrer"
        />
      </div>
      <p className="iframe-note">
        Σημείωση: Ορισμένα κανάλια ενδέχεται να μην επιτρέπουν embedding (X-Frame-Options/CSP).
        Σε αυτή την περίπτωση χρησιμοποίησε το «Άνοιγμα σε νέα καρτέλα».
      </p>
    </main>
  );
}
