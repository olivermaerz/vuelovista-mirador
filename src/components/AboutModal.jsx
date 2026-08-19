import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { APP_BLURB, APP_COPYRIGHT, APP_LICENSE, APP_NAME, APP_VERSION } from '../appMeta.js'
import { creditSections } from '../credits.js'

const CreditLink = ({ item }) => {
  if (!item.url) return <span>{item.name}</span>
  return (
    <a href={item.url} target="_blank" rel="noreferrer">
      {item.name}
    </a>
  )
}

const AboutModal = ({ open, onClose }) => {
  const titleId = useId()
  const closeRef = useRef(null)
  const [view, setView] = useState('about')

  useEffect(() => {
    if (!open) return undefined
    setView('about')

    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', onKey)
    closeRef.current?.focus()

    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const title = view === 'credits' ? 'Credits' : APP_NAME

  return createPortal(
    <div className="about-modal-root" role="presentation">
      <button
        type="button"
        className="about-modal-backdrop"
        aria-label="Close about dialog"
        onClick={onClose}
      />
      <div
        className={`about-modal${view === 'credits' ? ' about-modal-wide' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <button
          ref={closeRef}
          type="button"
          className="about-modal-close"
          aria-label="Close"
          onClick={onClose}
        >
          ×
        </button>

        {view === 'credits' ? (
          <>
            <button
              type="button"
              className="about-modal-back"
              onClick={() => setView('about')}
            >
              ← Back
            </button>
            <h1 id={titleId} className="about-modal-title">
              {title}
            </h1>
            <p className="about-modal-blurb">
              Data providers and open-source software used by Mirador. Active map
              layers are also credited in the map footer.
            </p>
            <div className="about-credits">
              {creditSections.map((section) => (
                <section key={section.id} className="about-credits-section">
                  <h2 className="about-credits-heading">{section.title}</h2>
                  <ul className="about-credits-list">
                    {section.items.map((item) => (
                      <li key={item.name}>
                        <CreditLink item={item} />
                        {item.note ? (
                          <span className="about-credits-note"> — {item.note}</span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </>
        ) : (
          <>
            <h1 id={titleId} className="about-modal-title">
              {title}
            </h1>
            <p className="about-modal-blurb">{APP_BLURB}</p>
            <p className="about-modal-meta">Version {APP_VERSION}</p>
            <p className="about-modal-meta">{APP_LICENSE}</p>
            <p className="about-modal-copyright">{APP_COPYRIGHT}</p>
            <button
              type="button"
              className="about-modal-link"
              onClick={() => setView('credits')}
            >
              Credits & data sources
            </button>
          </>
        )}
      </div>
    </div>,
    document.body,
  )
}

export default AboutModal
