# SDKWork Workspace Metadata

This directory holds repository-local agent workspace metadata for
`sdkwork-zhiya` and follows `../sdkwork-specs/SDKWORK_WORKSPACE_SPEC.md`.

- `skills/` contains reusable repository-local agent skills
  (`.sdkwork/skills/<skill-name>/SKILL.md`, lowercase kebab-case).
- `plugins/` contains repository-local plugins
  (`.sdkwork/plugins/<plugin-name>/.codex-plugin/plugin.json`).
- `local/`, `tmp/`, `cache/`, `secrets/`, and `manual-backups/` are private
  working state and are ignored by `.sdkwork/.gitignore`.

Skills and plugins never hold source code, secrets, or runtime data. Do not
store credentials anywhere in this directory.
