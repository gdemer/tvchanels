/* Πλευρική μπάρα: λίστα περιοχών (με εικονίδιο 📍) που ξεδιπλώνονται στα κανάλια τους. */
function Sidebar({ groups, activeChannel, onSelectChannel }) {
  const [openRegions, setOpenRegions] = React.useState(() => new Set([groups[0] && groups[0].region]));
  const [query, setQuery] = React.useState("");

  function toggleRegion(region) {
    setOpenRegions((prev) => {
      const next = new Set(prev);
      if (next.has(region)) {
        next.delete(region);
      } else {
        next.add(region);
      }
      return next;
    });
  }

  const filtered = groups
    .map((group) => ({
      region: group.region,
      channels: group.channels.filter((ch) =>
        ch.name.toLowerCase().includes(query.trim().toLowerCase())
      )
    }))
    .filter((group) => group.channels.length > 0);

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-icon" aria-hidden="true">📡</span>
        <h1>Ελληνικά Κανάλια</h1>
      </div>
      <input
        className="sidebar-search"
        type="search"
        placeholder="Αναζήτηση καναλιού..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <nav className="sidebar-nav">
        {filtered.map((group) => {
          const isOpen = query.trim().length > 0 || openRegions.has(group.region);
          return (
            <div className="region-group" key={group.region}>
              <button
                type="button"
                className="region-header"
                onClick={() => toggleRegion(group.region)}
              >
                <span className="region-icon" aria-hidden="true">📍</span>
                <span className="region-name">{group.region}</span>
                <span className="region-toggle">{isOpen ? "▾" : "▸"}</span>
              </button>
              {isOpen && (
                <ul className="channel-list">
                  {group.channels.map((channel) => (
                    <ChannelItem
                      key={channel.name}
                      channel={channel}
                      isActive={activeChannel && activeChannel.name === channel.name}
                      onSelect={onSelectChannel}
                    />
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
