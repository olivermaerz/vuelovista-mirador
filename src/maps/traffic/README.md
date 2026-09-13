# Traffic data sources

| Source | What | Module |
|--------|------|--------|
| [adsb.lol](https://adsb.lol) | Live ADS-B positions | `adsblol.js` |
| [adsbdb](https://adsbdb.com) | Aircraft reg / type / photo (on popup) | `adsbdb.js` |
| [VRS standing data](https://github.com/vradarserver/standing-data) (via adsb.lol mirror) | Callsign → route | `routes.js` |

Requests go through same-origin proxies (`/adsblol-proxy`, `/adsbdb-proxy`, `/standing-data-proxy`); Capacitor rewrites them to the upstream hosts.
