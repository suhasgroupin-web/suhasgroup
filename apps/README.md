# Module boundaries

This directory is the additive target for the modular migration. It intentionally contains no copied production code yet.

- Do not move or duplicate legacy files until imports, routes, DOM selectors, event handlers, auth gates and Supabase dependencies are mapped.
- Each module will receive its own entry point/assets and a scoped CSS/JS boundary.
- Keep the current root-level HTML files as compatibility routes until the replacement has passed route and regression tests.
- See ../../ARCHITECTURE.md and ../../MODULE_MANIFEST.json for the migration contract and current inventory.
