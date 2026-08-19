# Educational material

Samples under `edu/` are **not registered** in the shipping app. They exist to
document patterns (e.g. approval-gated or API-key chart plugins) and to keep
optional provider integrations out of the default build.

| Path | Topic |
|------|--------|
| [`dfs/`](dfs/) | Approval-gated chart plugin example (DFS Germany VFR tiles) |
| [`dl-cz/`](dl-cz/) | API-key chart plugin example (Databáze letišť tile pattern) |

Do not import from `edu/` into `src/` without a product decision, provider
permission where needed, and a `CREDITS.md` / `src/credits.js` update.
