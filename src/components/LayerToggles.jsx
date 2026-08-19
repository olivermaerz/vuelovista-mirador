const LayerToggles = ({ plugins, active, onToggle }) => (
  <div className="layer-toggles" id="layer-toggles">
    <span className="panel-label">Layers</span>
    {plugins.map(({ id, label }) => (
      <button
        key={id}
        type="button"
        className={active[id] ? 'active' : undefined}
        aria-pressed={active[id]}
        onClick={() => onToggle(id)}
      >
        {label}
      </button>
    ))}
  </div>
)

export default LayerToggles
