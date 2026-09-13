import { version } from '../package.json'
import licenseMd from '../LICENSE.md?raw'

export const APP_NAME = 'VueloVista Mirador'

export const APP_BLURB =
  'Your lookout on the sky — explore VFR charts, live aircraft, and the airspace around you.'

export const APP_VERSION = version

export const APP_COPYRIGHT = '© 2026 Oliver Maerz.'

export const APP_LICENSE = 'MIT License'

/** Full MIT text from LICENSE.md (markdown heading stripped). */
export const APP_LICENSE_TEXT = licenseMd.replace(/^#\s+/, '').trim()
