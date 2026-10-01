/* Δεξί content area: εμφανίζει το επιλεγμένο κανάλι μέσα σε embedded iframe. */
function ContentArea({ channel }) {
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
