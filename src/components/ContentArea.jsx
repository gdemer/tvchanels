/* Δεξί content area: εμφανίζει το επιλεγμένο κανάλι μέσα σε embedded iframe. */
function ContentArea({ channel }) {
  const videoContainerRef = React.useRef(null);
  const playerRef = React.useRef(null);

  React.useEffect(() => {
    // Έλεγχος διαθεσιμότητας της βιβλιοθήκης video.js
    const vjs = window.videojs || (typeof videojs !== 'undefined' ? videojs : null);

    if (channel && videoContainerRef.current && vjs) {
      // 1. Καθαρισμός προηγούμενου player αν υπάρχει
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }

      // 2. Δημιουργούμε δυναμικά ένα νέο καθαρό <video> tag στο DOM
      videoContainerRef.current.innerHTML = '';
      const videoEl = document.createElement('video');
      videoEl.className = 'video-js vjs-default-skin vjs-big-play-centered';
      videoEl.style.width = '100%';
      videoEl.style.height = '100%';
      videoContainerRef.current.appendChild(videoEl);

      // 3. Αρχικοποίηση του νέου player
      playerRef.current = vjs(videoEl, {
        controls: true,
        autoplay: true,
        preload: 'auto',
        fluid: true,
        responsive: true
      });

      // 4. Ανάθεση του stream
      playerRef.current.src({
        src: channel.url,
        type: 'application/x-mpegURL'
      });

      // 5. Διαχείριση σφαλμάτων stream (αν το λινκ είναι νεκρό ή μπλοκαρισμένο)
      playerRef.current.on('error', function() {
        const error = playerRef.current.error();
        if (error && error.code === 4) {
          // Αν αποτύχει, εμφανίζουμε ένα καθαρό κουμπί για εξωτερική προβολή ως εναλλακτική
          videoContainerRef.current.innerHTML = `
            <div style="padding: 40px; text-align: center; color: #fff; background: #222; border-radius: 8px;">
              <p>⚠️ Το stream του καναλιού δεν υποστηρίζει απευθείας ενσωμάτωση στον browser.</p>
              <a href="${channel.url}" target="_blank" rel="noopener noreferrer" 
                 style="display: inline-block; margin-top: 15px; padding: 10px 20px; background: #ff4757; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold;">
                 🔗 Άνοιγμα σε εξωτερικό Player / Νέα Καρτέλα
              </a>
            </div>`;
        }
      });
    }

    // Καθαρισμός κατά το unmount
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [channel]); // 👈 Εκτελείται ΑΠΑΡΑΙΤΗΤΑ κάθε φορά που αλλάζει το κανάλι

  if (!channel) {
    return (
      <div className="content-area empty" style={{ flex: 1, padding: '20px', textAlign: 'center' }}>
        <h2>📺 Καλώς ορίσατε</h2>
        <p>Παρακαλώ επιλέξτε ένα κανάλι από τη λίστα.</p>
      </div>
    );
  }

  return (
    <div className="content-area" style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ color: '#333', marginBottom: '15px' }}>🔴 Τώρα Παίζει: {channel.name}</h2>
      
      {/* Το Container που θα φιλοξενεί δυναμικά το video element */}
      <div ref={videoContainerRef} className="my-player-container" style={{ width: '100%', maxWidth: '800px', backgroundColor: '#000', borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{ color: '#fff', padding: '20px', textAlign: 'center' }}>Προετοιμασία ροής...</div>
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
