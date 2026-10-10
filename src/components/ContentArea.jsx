/* Δεξί content area: εμφανίζει το επιλεγμένο κανάλι μέσα σε embedded iframe. */
function ContentArea({ channel }) {
  const videoContainerRef = React.useRef(null);
  const playerRef = React.useRef(null);
  const [showIframeFallback, setShowIframeFallback] = React.useState(false);

  React.useEffect(() => {
    setShowIframeFallback(Boolean(channel && channel.pageOnly));
  }, [channel]);

  React.useEffect(() => {
    if (
      !channel ||
      channel.pageOnly ||
      showIframeFallback ||
      !videoContainerRef.current
    ) {
      return undefined;
    }

    setShowIframeFallback(false);
    const vjs = window.videojs || (typeof videojs !== 'undefined' ? videojs : null);

    if (!vjs) {
      return undefined;
    }

    const videoElement = document.createElement('video');
    videoElement.className = 'video-js vjs-default-skin vjs-big-play-centered';
    videoElement.playsInline = true;
    videoContainerRef.current.replaceChildren(videoElement);

    const player = vjs(videoElement, {
      controls: true,
      autoplay: true,
      preload: 'auto',
      fluid: false,
      fill: true,
    });
    playerRef.current = player;

    player.on('error', () => {
      if (playerRef.current === player) {
        setShowIframeFallback(true);
      }
    });

    player.src({
      src: channel.url,
      type: 'application/x-mpegURL',
    });

    return () => {
      if (playerRef.current === player) {
        playerRef.current = null;
        if (!player.isDisposed()) {
          player.dispose();
        }
      }
    };
  }, [channel, showIframeFallback]);

  if (!channel) {
    return <main className="content-area content-area--empty"><h2>Παρακαλώ επιλέξτε κανάλι</h2></main>;
  }

  const fallbackUrl =
    channel.fallbackUrl ||
    (/^4e\b/i.test(channel.name)
      ? 'http://www.tv4e.gr/livestreaming.php'
      : channel.url);

  if (
    channel.pageOnly &&
    /^4e\b/i.test(channel.name) &&
    window.location.protocol === 'https:'
  ) {
    return (
      <main className="content-area content-area--empty">
        <h2>{channel.name}</h2>
        <p>Η ιστοσελίδα 4Ε δεν υποστηρίζει HTTPS και δεν μπορεί να ενσωματωθεί σε σελίδα HTTPS.</p>
        <a
          className="open-new-tab"
          href={fallbackUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Άνοιγμα 4Ε σε νέα καρτέλα ↗
        </a>
      </main>
    );
  }

  if (channel.pageOnly && /ertflix\.gr/i.test(fallbackUrl)) {
    return (
      <main className="content-area content-area--empty">
        <h2>{channel.name}</h2>
        <p>Άνοιξε το ERTFLIX Live και επίλεξε {channel.name} από τη λίστα καναλιών.</p>
        <p>Αν εμφανιστεί σχετικό μήνυμα, χρειάζεται πλήρης οθόνη ή ανάλυση τουλάχιστον 1024×800.</p>
        <a
          className="open-new-tab"
          href={fallbackUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Άνοιγμα ERTFLIX Live σε νέα καρτέλα ↗
        </a>
      </main>
    );
  }

  return (
    <main className="content-area content-area--player">
       <div className="content-area-header">
        <span className="channel-icon" aria-hidden="true">📺</span>
        <h2>{channel.name}</h2>
        <a className="open-new-tab" href={channel.fallbackUrl || channel.url} target="_blank" rel="noopener noreferrer">
          Άνοιγμα σε νέα καρτέλα ↗
        </a>
      </div>
      {showIframeFallback ? (
        <iframe
          className="content-player-frame"
          src={fallbackUrl}
          title={channel.name}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          referrerPolicy="no-referrer"
        />
      ) : (
        <div ref={videoContainerRef} className="content-player-host" />
      )}
    </main>
  );
}


function ContentArea3({ channel }) {
  const videoContainerRef = React.useRef(null);
  const playerRef = React.useRef(null);

  React.useEffect(() => {
    const vjs = window.videojs || (typeof videojs !== 'undefined' ? videojs : null);

    if (channel && videoContainerRef.current && vjs) {
      // 1. Καθαρισμός προηγούμενου player αν υπάρχει
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }

      // 2. Παίρνουμε το καθαρό URL από το αρχείο δεδομένων
      const correctUrl = channel.url;

      // 3. Δημιουργία νέου <video> tag στο DOM
      videoContainerRef.current.innerHTML = '';
      const videoEl = document.createElement('video');
      videoEl.className = 'video-js vjs-default-skin vjs-big-play-centered';
      videoEl.style.width = '100%';
      videoEl.style.height = '100%';
      videoContainerRef.current.appendChild(videoEl);

      // 4. Αρχικοποίηση Video.js
      playerRef.current = vjs(videoEl, {
        controls: true,
        autoplay: true,
        preload: 'auto',
        fluid: true
      });

      // 5. Ανάθεση της ροής βίντεο
      playerRef.current.src({
        src: correctUrl,
        type: 'application/x-mpegURL'
      });

      // 6. Διαχείριση σφαλμάτων (Fail-safe)
      playerRef.current.on('error', function() {
        videoContainerRef.current.innerHTML = `
          <div style="padding: 30px; text-align: center; color: #fff; background: #222; border-radius: 8px;">
            <p>⚠️ Η ζωντανή ροή δεν είναι διαθέσιμη αυτή τη στιγμή ενσωματωμένη.</p>
            <a href="${correctUrl}" target="_blank" rel="noopener noreferrer" 
               style="display: inline-block; margin-top: 10px; padding: 10px 15px; background: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">
               🔗 Εξωτερική προβολή καναλιού
            </a>
          </div>`;
      });
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [channel]);

  if (!channel) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
        <h2>Παρακαλώ επιλέξτε κανάλι</h2>
      </div>
    );
  }

  return (
    <div className="content-area" style={{ flex: 1, padding: '20px' }}>
      <h2 style={{ color: '#333', marginBottom: '15px' }}>🔴 {channel.name}</h2>
      <div ref={videoContainerRef} style={{ width: '100%', maxWidth: '800px', backgroundColor: '#000', borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{ color: '#fff', padding: '20px', textAlign: 'center' }}>Φόρτωση ροής...</div>
      </div>
    </div>
  );
}

function ContentArea2({ channel }) {
  const videoContainerRef = React.useRef(null);
  const playerRef = React.useRef(null);
console.log("Rendering ContentArea for channel:", channel);
  React.useEffect(() => {
    const vjs = window.videojs || (typeof videojs !== 'undefined' ? videojs : null);

    if (channel && videoContainerRef.current && vjs) {
      // 1. Καθαρισμός προηγούμενου player
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }

      // 2. 🔥 ΔΙΟΡΘΩΣΗ: Έλεγχος αν το URL έχει καταστραφεί από τη C#
      let correctUrl = channel.url;
      const currentUrl = channel.url ? channel.url.toLowerCase().trim() : "";
      const currentName = channel.name ? channel.name.toUpperCase().trim() : "";
      console.error("Current URL:", currentUrl);
      console.error("Current Name:", currentName);

      // Αν η C# έβγαλε το χαλασμένο siliconweb.com ή star.gr
      if (currentUrl === "https://siliconweb.com/" || currentUrl === "https://siliconweb.com" || currentUrl.indexOf("msvdn.net") > -1 || currentUrl === "https://star.gr") {
        
        // Διόρθωση με βάση λέξεις-κλειδιά στο όνομα χωρίς ευαισθησία σε κενά
        if (currentName.indexOf("ERT1") > -1 || currentName.indexOf("ΕΡΤ 1") > -1 || currentName.indexOf("ERT 1") > -1) {
          correctUrl = "https://siliconweb.com";
        } else if (currentName.indexOf("ERT2") > -1 || currentName.indexOf("ΕΡΤ 2") > -1 || currentName.indexOf("ERT 2") > -1) {
          correctUrl = "https://siliconweb.com";
        } else if (currentName.indexOf("ERT3") > -1 || currentName.indexOf("ΕΡΤ 3") > -1 || currentName.indexOf("ERT 3") > -1) {
          correctUrl = "https://siliconweb.com";
        } else if (currentName.indexOf("NEWS") > -1) {
          correctUrl = "https://siliconweb.com";
        } else if (currentName.indexOf("STAR") > -1) {
          correctUrl = "https://star.gr";
        } else if (currentName.indexOf("OPEN") > -1) {
          correctUrl = "https://netmax.gr";
        }
      }
      
      // 3. Δημιουργία καθαρού <video> στο DOM
      videoContainerRef.current.innerHTML = '';
      const videoEl = document.createElement('video');
      videoEl.className = 'video-js vjs-default-skin vjs-big-play-centered';
      videoEl.style.width = '100%';
      videoEl.style.height = '100%';
      videoContainerRef.current.appendChild(videoEl);

      // 4. Αρχικοποίηση Player
      playerRef.current = vjs(videoEl, {
        controls: true,
        autoplay: true,
        preload: 'auto',
        fluid: true
      });

      // 5. Ανάθεση του διορθωμένου URL
      playerRef.current.src({
        src: correctUrl,
        type: 'application/x-mpegURL'
      });

      // 6. Διαχείριση σφαλμάτων
      playerRef.current.on('error', function() {
        videoContainerRef.current.innerHTML = `
          <div style="padding: 30px; text-align: center; color: #fff; background: #222; border-radius: 8px;">
            <p>⚠️ Η ζωντανή ροή δεν είναι διαθέσιμη αυτή τη στιγμή ενσωματωμένη.</p>
            <a href="${correctUrl}" target="_blank" rel="noopener noreferrer" 
               style="display: inline-block; margin-top: 10px; padding: 10px 15px; background: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">
               🔗 Εξωτερική προβολή καναλιού
            </a>
          </div>`;
      });
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [channel]);

  if (!channel) {
    return <div style={{ padding: '20px', textAlign: 'center' }}><h2>Παρακαλώ επιλέξτε κανάλι</h2></div>;
  }

  return (
    <div className="content-area" style={{ flex: 1, padding: '20px' }}>
      <h2>🔴 {channel.name}</h2>
      <div ref={videoContainerRef} style={{ width: '100%', maxWidth: '800px', backgroundColor: '#000', borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{ color: '#fff', padding: '20px', textAlign: 'center' }}>Φόρτωση ροής...</div>
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
