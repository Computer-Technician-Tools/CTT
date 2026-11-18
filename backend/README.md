# CTT Rust hosting preview

This preview uses the Rust server in `src/main.rs` to host CTT's production
static output, including the Docusaurus homepage at `/`. It demonstrates
replacing the production file-serving process with Rust while preserving the
site's pages, theme behavior, search, and offline assets.

## Run the preview

Install Node.js and the Rust toolchain, then run this from the project root:

```sh

```

The command builds the existing Docusaurus site and starts the Rust server at
`http://127.0.0.1:8080`. The first visit uses dark mode; saved theme and
color-mode choices continue to apply. Set `CTT_ADDR` to change the listening
address. Set `CTT_BUILD_DIR` if the generated site is not in `build/`.

The production build includes a web app manifest and registers the service
worker from the homepage and documentation routes. The worker caches the
offline shell first, then fills the documentation cache in the background.
`sw.js` and its compressed sidecar are stamped and generated together so Rust
serves the same cache version regardless of client compression support.

## What this preview changes

- Rust handles HTTP requests, static-file delivery, gzip sidecars, cache
  headers, ETags, MIME types, and basic security headers.
- The browser still downloads and runs Docusaurus's compiled JavaScript. The
  source pages, React components, theme controls, search UI, and service-worker
  interactions are still authored in TypeScript/React.
- Site generation still uses Node.js and Docusaurus. Rust is not yet a
  replacement for the documentation renderer or browser application.

A full Rust frontend would need replacements for the MDX documentation
pipeline, Docusaurus page/layout components, search index and UI, themes,
platform/source badges, navigation, and offline interactions. Keep this
preview separate until those features have Rust equivalents and can be checked
against the existing site.
