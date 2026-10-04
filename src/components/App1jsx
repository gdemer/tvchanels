/* Ρίζα εφαρμογής: κρατά το επιλεγμένο κανάλι και συνδέει Sidebar + ContentArea. */
function App() {
  const groups = window.CHANNEL_GROUPS;
  const firstChannel = groups[0] && groups[0].channels[0];
  const [activeChannel, setActiveChannel] = React.useState(firstChannel || null);

  return (
    <div className="app-layout">
      <Sidebar groups={groups} activeChannel={activeChannel} onSelectChannel={setActiveChannel} />
      <ContentArea channel={activeChannel} />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
