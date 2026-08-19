const ThemePicker = ({ themes, activeId, onSelect }) => (
  <div className="theme-picker" role="group" aria-label="Theme">
    {themes.map(({ id, label }) => (
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

export default ThemePicker
