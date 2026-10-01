/* Μία γραμμή καναλιού μέσα στη λευρική μπάρα, με εικονίδιο τηλεόρασης. */
function ChannelItem({ channel, isActive, onSelect }) {
  return (
    <li
      className={"channel-item" + (isActive ? " active" : "")}
      onClick={() => onSelect(channel)}
      title={channel.name}
    >
      <span className="channel-icon" aria-hidden="true">📺</span>
      <span className="channel-name">{channel.name}</span>
    </li>
  );
}
