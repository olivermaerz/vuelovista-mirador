import { useState } from 'react'
import AboutModal from './AboutModal.jsx'

const AboutButton = () => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        className="about-button"
        onClick={() => setOpen(true)}
      >
        About
      </button>
      <AboutModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}

export default AboutButton
