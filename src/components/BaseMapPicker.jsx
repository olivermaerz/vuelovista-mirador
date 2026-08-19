const BaseMapPicker = ({ basemaps, activeId, onSelect }) => (
  <div className="layer-toggles" id="basemap-picker">
    <span className="panel-label">Base map</span>
    {basemaps.map(({ id, label }) => (
      <button
        key={id}
        type="button"
        className={activeId === id ? 'active' : undefined}
        aria-pressed={activeId === id}
        onClick={() => onSelect(id)}
      >
        {label}
      </button>
    ))}
  </div>
)

export default BaseMapPicker
