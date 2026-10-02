# public/ — Static Assets

Static assets served at the web root. `runtime-env.json` is materialized here
per build from `etc/browser/` by the canonical build runner and is gitignored
(`ENVIRONMENT_SPEC.md` §5.1). Keep this directory free of secrets.
