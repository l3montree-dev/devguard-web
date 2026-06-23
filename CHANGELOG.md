# Changelog

All notable frontend changes to DevGuard Web are documented here.

For API and backend changes see the [DevGuard CHANGELOG](https://github.com/l3montree-dev/devguard/blob/main/CHANGELOG.md).

## [v1.7.0] — 2026-06-19

### Added

- **Instance admin dashboard** — admin area now fully wired up: organisation creation toggle, instance settings panel, technical info, daemon trigger actions; admin requests signed in-browser using an in-memory key
- **Playwright e2e auth setup** — dedicated auth fixture; test suite reworked with updated Playwright and Ory versions

### Fixed

- **Config file editor** — filenames now match what the scanner expects
- **Admin dashboard stats** — rounded to two decimals; loading/error states corrected; login-domain warning added
- **SSE streaming** — refactored into reusable `src/lib/sse.ts`; signed request bodies enforced as strings; CRLF line endings handled correctly

### Changed

- CI pipelines migrated from `devguard-action` to `devguard-ci-component`

---

## [v1.6.1] — 2026-06-17

### Fixed

- Issue [#1873](https://github.com/l3montree-dev/devguard/issues/1873) — regression fix

---

## [v1.6.0] — 2026-06-16

### Added

- **Bearer token support** — web now accepts symmetric PAT-based bearer tokens in addition to session cookies
- **Dedicated OAuth2 error page** — routing based on HTTP 403 status instead of inline error handling
- **Theme toggler** — light/dark mode toggle

### Fixed

- **VEX button** — removed redundant continue button and unnecessary `uploadMethod`
- **Project settings** — settings no longer in a drawer; moved to top of settings page
- **Double toast notifications** — duplicate toast on certain actions eliminated
- **Sign-up password flow** — Ory flow components refactored into modular `flowcomponents`; improved contrast on fixed button
- **Group tour** — state issues resolved

---

## [v1.5.0] — 2026-05-28

### Added

- **Star banner** — GitHub star call-to-action with GitHub-matching styling
- **Umami analytics** — tracking added to help center, guided tour, and documentation links

### Fixed

- **Organisation layout error logging** — unexpected errors now logged
- **Markdown code block colors** — description code colour and link colour corrected
- **Filter buttons** — rendering issues resolved
- **Risk badge** — reworked with CVSS badge; quickfix fallback improved

### Changed

- Quickfix hidden when dependency paths are too numerous
- Risk group label no longer shows "across other branches" suffix

---

## [v1.4.2] — 2026-05-21

### Fixed

- PDF report download path
- Pipeline spinner no longer times out on slow autosetup

---

## [v1.4.1] — 2026-05-14

### Fixed

- Last active organisation redirect — centralised `lastActiveOrg` persistence; localStorage guarded with `try/catch`; SSR hydration mismatch resolved
- SBOM / SARIF tab order corrected
- Streaming JSON buffer — chunks now buffered to correctly parse newline-delimited JSON

---

## [v1.4.0] — 2026-05-07

### Added

- **Configurable organisation creation toggle** — respected in UI
- **VEX / SBOM sharing** — share actions for VEX documents and SBOMs
- **Guided tour** — ReactTour-based tour with Umami event tracking
- **Store last active org on registration**

### Fixed

- Dependency graph background in light mode
- Box shadow, license badge, list borders, skeleton loading consistency
- Welcome modal logo in white mode

---

## [v1.3.0] — 2026-04-28

### Added

- **Dependency proxy configuration UI** — rule validation and testing
- **Config file editor** — code editor for scanner config files; Checkov config added to defaults
- **Umami analytics integration**
- **Sorting** — sort by various criteria on project and organisation pages
- **SSO provider icons and settings** — `OrySsoButton` and `OrySsoSettings` with provider icon support
- **Organisation overview charts** — org-level risk aggregation visualisation

### Fixed

- CVSS badge image source
- Dependency graph background in light mode
- Ory provider button accessibility

### Changed

- Deterministic Next.js build IDs for reproducible deployments
- Breadcrumbs added to config settings pages

---

## [v1.2.0] — 2026-04-14

### Added

- **Advanced filtering** — filter component with search, clear-all, and `like` operator across risk pages
- **Billing URL handling** — payment-required errors redirect to billing URL
- **Dynamic issue tracker URL** — error handling components use the configured issue tracker

### Fixed

- Release dashboard suspense and hydration errors
- Asset version deletion redirect bug
- Average remediation time refactored to unified endpoint
- Compliance visibility toggle behaviour

---

## [v1.1.0] — 2026-03-17

### Added

- **Optimistic updates** — SBOM upload and risk page actions use optimistic UI
- **Affected component details** — PURL and qualifiers from `matchContext` displayed

### Fixed

- Login page Ory link colours
- ThreeJS scene scroll handling
- Release dashboard loading state

---

## [v1.0.1] — 2026-03-02

### Fixed

- Build environment variables corrected during Nix build

---

## [v1.0.0] — 2026-02-20

Initial stable release of the DevGuard Web frontend.

### Added

- Full organisation, project, and asset management UI
- Vulnerability risk pages with CVSS scoring and VEX workflow
- SBOM upload and dependency graph visualisation
- Guided onboarding flow
- Light/dark theme support
- Ory Kratos identity integration
