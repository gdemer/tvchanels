function parseHlsPlaylist(playlist) {
  const streams = [];
  let name = "";

  for (const line of playlist.split(/\r?\n/)) {
    const entry = line.trim();
    if (entry.startsWith("#EXTINF:")) {
      const tvgName = entry.match(/\btvg-name="([^"]+)"/i);
      const titleIndex = entry.lastIndexOf(",");
      name =
        (tvgName && tvgName[1].trim()) ||
        (titleIndex >= 0 ? entry.slice(titleIndex + 1).trim() : "");
      continue;
    }

    if (!entry || entry.startsWith("#")) {
      continue;
    }

    try {
      const streamUrl = new URL(entry);
      if (
        (streamUrl.protocol === "http:" || streamUrl.protocol === "https:") &&
        streamUrl.pathname.toLowerCase().endsWith(".m3u8")
      ) {
        streams.push({ name: name || streamUrl.hostname, url: entry });
      }
    } catch {
      // Ignore malformed playlist entries.
    }

    name = "";
  }

  return streams;
}

function App() {
  const [channels, setChannels] = React.useState([]);
  const [activeChannel, setActiveChannel] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadStreams() {
      try {
        const playlistUrls = [
          "https://iptv-org.github.io/iptv/countries/gr.m3u",
          "https://iptv-org.github.io/iptv/countries/cy.m3u",
        ];
        const responses = await Promise.all(playlistUrls.map((url) => fetch(url)));

        for (const response of responses) {
          if (!response.ok) {
            throw new Error(`Αποτυχία λήψης playlist: HTTP ${response.status}`);
          }
        }

        const playlists = await Promise.all(
          responses.map((response) => response.text()),
        );
        if (playlists.some((playlist) => !playlist.trimStart().startsWith("#EXTM3U"))) {
          throw new Error("Η απόκριση δεν είναι έγκυρη λίστα M3U.");
        }

        const greekStreams = parseHlsPlaylist(playlists[0]).filter(
          (stream) => !/^ERT(?:[0-9]|\b|Cosmos)/i.test(stream.name),
        );
        const cyprusStreams = parseHlsPlaylist(playlists[1]);
        const directoryGroups = window.CHANNEL_GROUPS || [];
        if (greekStreams.length === 0) {
          throw new Error("Δεν βρέθηκαν HLS streams με κατάληξη .m3u8.");
        }

        const ant1 = greekStreams.find((stream) => /^ANT1\b/i.test(stream.name));
        if (ant1) {
          ant1.name = "ΑΝΤ1";
          ant1.fallbackUrl = "https://watch.antennaplus.gr/#/live/ant1";
          ant1.pageOnly = true;
        }

        if (!greekStreams.some((stream) => /^MEGA\b/i.test(stream.name))) {
          greekStreams.push({
            name: "MEGA",
            url: "https://www.megatv.com/live/",
            pageOnly: true,
          });
        }

        const greekRegionGroups = directoryGroups
          .filter(
            (group) =>
              group.region !== "Κύπρος" &&
              group.region !== "Κανάλια Εξωτερικού",
          )
          .map((group) => ({
            region: `ΕΛΛΗΝΙΚΑ - ${group.region}`,
            channels: group.channels.map((channel) => ({
              ...channel,
              url: /^ΕΡΤ(?:\s|$)/i.test(channel.name)
                ? "https://www.ertflix.gr/#/channels"
                : channel.url,
              pageOnly: true,
            })),
          }));
        const cyprusPages = directoryGroups.find(
          (group) => group.region === "Κύπρος",
        );

        const formattedChannels = [
          {
            region: "ΕΛΛΗΝΙΚΑ - Πανελλαδικά HLS",
            channels: greekStreams,
          },
          ...greekRegionGroups,
          {
            region: "ΚΥΠΡΙΑΚΑ - HLS",
            channels: cyprusStreams,
          },
          ...(cyprusPages
            ? [
                {
                  region: "ΚΥΠΡΙΑΚΑ - Επίσημες Σελίδες",
                  channels: cyprusPages.channels.map((channel) => ({
                    ...channel,
                    pageOnly: true,
                  })),
                },
              ]
            : []),
        ];

        setChannels(formattedChannels);
        setActiveChannel(greekStreams[0] || cyprusStreams[0] || null);
        console.info(
          `Φορτώθηκαν ${greekStreams.length} κανάλια από τις playlists Ελλάδας και Κύπρου.`,
        );
      } catch (err) {
        console.error("Σφάλμα κατά τη φόρτωση των HLS streams", err);
      } finally {
        setLoading(false);
      }
    }

    loadStreams();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "50px", textAlign: "center" }}>
        <h3>⏳ Φόρτωση Ελληνικών & Κυπριακών Καναλιών...</h3>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar
        groups={channels}
        activeChannel={activeChannel}
        onSelectChannel={setActiveChannel}
      />
      <ContentArea channel={activeChannel} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
