# Changelog

All notable frontend changes to DevGuard Web are documented here.

For API and backend changes see the [DevGuard CHANGELOG](https://github.com/l3montree-dev/devguard/blob/main/CHANGELOG.md).

## [v1.12.0] — 2026-08-02

### Added

- **VEX rule recommendations** — assessments other DevGuard organizations or users already made on a vulnerability are now surfaced as a prominent recommendation card on the vulnerability detail page and the VEX rules page, based on majority vote across session and upstream sources, with a "Create VEX rule from recommendation" action and a link to the VEX sharing whitepaper
- **Shared `Purl` component** — package purls (icon, name, version, qualifiers) now render consistently across the dependency risk table, quick fix, vulnerability path graph, and VEX rule dialogs, with a hover tooltip exposing the full raw purl for copying
- **Multi-artifact path graph** — the vulnerability path graph now shows every artifact a vulnerability was found in as a shared root cluster feeding into the same first dependency, instead of a single, sometimes-misleading root node
- **Quick fix redesign** — restyled to match the VEX rule recommendation card's visual language
- **Package qualifiers in insights table**
- **Reworked markdown editor** — new GitHub-style markdown editor

### Fixed

- **Error page** — client-side rendering errors are no longer mislabeled as "500 Internal Server Error"; the boundary now tells real HTTP errors apart from rendering exceptions, and adds a "Try again" action (with a short automatic retry), a Sentry event reference, full technical details, and a prefilled "Create an Issue" link
- **VEX rule effect wording** — a rule that dismisses a vulnerability at the artifact root now reads "No artifact of X calls the vulnerable function of Y" instead of implying a single application called it
- **Markdown rendering in VEX cards**
- **Avatar fallback initials**
- **Expiry date input background**
- **MostUsedEcosystems percentage calculation**
- **API URL concatenation in group settings**
- **VEX rules tab state handling**

### Changed

- **VEX rules page** moved from asset-version level to asset level
- **Dependencies and CI** — Node 26, source map upload, Playwright test restructuring

### First-time contributors

Thanks to our first-time contributors this release!

- **[@Guflly](https://github.com/Guflly)** — fixed the expiry date input background
- **[@Rishav-Bagri](https://github.com/Rishav-Bagri)** — fixed markdown rendering in VEX cards
- **[@kudala-bharani](https://github.com/kudala-bharani)** — added the VEX recommendation whitepaper link
- **[@MNTarentula](https://github.com/MNTarentula)** — fixed user avatar fallback initials

---

## [v1.11.0] — 2026-07-24

### Added

- **Notification banner** — added a global banner to highlight important updates, contributor calls, or ongoing issues
- **CSIRT advisory display** — advisories are now shown in an expandable box below vulnerability badges, with the advisory description parsed into markdown segments and linked to the source document
- **KEV information on vulnerabilities** — Known Exploited Vulnerabilities callouts added to the vulnerability detail page and risk handling row, with a tooltip explaining the KEV data
- **Quick fix symbols** — quick fix indicators added to the dependency risk table
- **Personal access tokens** — reworked into four dedicated PAT sections, with tokens and the create flow renamed for clarity
- **Org join flow** — joining an organization added to the create-organization flow; accept-invitation flow reworked into a dialog

### Fixed

- **Reporting range** — fixed an issue with the reporting date range
- **SBOM/SARIF manual upload** — fixed the switch between SBOM and SARIF for manual uploads
- **Dependency Proxy docs** — fixed broken documentation URLs
- **Dependency vulnerability API type** — adjusted to support the `related` field
- **Compliance postures in asset menu** — added missing menu entry for compliance postures in asset menu

### Changed

- **Dependencies** — updated Next.js, Node (26.5.0), and other npm packages; removed `sbomnix`
- **Access token components** — renamed and consolidated (`RelationCard`, markdown components)

### First-time contributors

Thanks to our first-time contributors this release!

- **[@eliashaeussler](https://github.com/eliashaeussler)** — fixed broken Dependency Proxy documentation URLs

---

## [v1.10.1] — 2026-07-20

### Fixed

- **Organization navigation menu** — the "Compliance Postures" menu item is no longer shown at the organization level for external entity providers, matching the existing restriction on the "Settings" item

---

## [v1.10.0] — 2026-07-20

### Added

- **Security advisories** — new advisory feature with a top-level overview page and per-advisory detail page; advisories support draft, published, and withdrawn states with a visibility badge and a withdrawn menu option; advisory dialog reworked with `react-hook-form` and CSAF links; breadcrumb added
- **Compliance risks** — new compliance risks section wired to the real backend endpoint, with framework filtering, open/closed tabs, framework icons, and richer detail views; summary dashboard with controls-covered and last-attestation stat tiles, compliance risk distribution chart, and evidence download button; Grundschutz++ and SCF framework links added
- **OSCAL components** — new OSCAL component pages and a Download OSCAL button
- **SARIF download** — added SARIF download support
- **GitHub issue resolve** — added support for resolving GitHub issues
- **Security headers** — added security headers centrally via the Next.js server

### Fixed

- **CSAF export** — removed incorrect PURL logic from CSAF input
- **VEX reopen logic** — reopen form now disabled when a vulnerability was already handled by a VEX rule
- **Organization deletion** — fixed a redirect loop after deleting an organization
- **Organization validation** — added validation and reworked related comments
- **Dependency risks loading spinner** — fixed loading spinner behaviour
- **Dashboard 404** — fixed a broken page
- **Compliance state labels** — added missing `implemented` and `notApplicable` labels
- **Dialog centering** — improved dialog centering
- **ESLint config** — repaired broken ESLint config on Next 16
- **README SBOM links** — updated public SBOM links

### Changed

- **Dynamic header** — added dropdown support
- **CI** — added job retry in GitLab CI

### First-time contributors

Thanks to our first-time contributors this release!

- **[@Cryptoteep](https://github.com/Cryptoteep)** — fixed a redirect loop after deleting an organization

---

## [v1.9.0] — 2026-07-14

### Added

- **Invitation status** — invitation status is now displayed, with the ability to revoke pending invitations
- **Upstream VEX sync** — VEX rules page now syncs with upstream VEX data; VEX rule details dialog improved using `truncateMiddle` for long values
- **Artifact-scoped CVSS badge** — badge preview now loads from the artifact-scoped endpoint
- **Expiry date/time display** — added where relevant across the UI
- **Bulk updates for code risks** — added selection support for bulk-updating code risks
- **Asset names in downloads** — SBOM and VEX downloads now include asset names in the file name
- **Minimum release age** — corrected interface and improved frontend validation for the min-release-age setting

### Fixed

- **Admin role management** — admins can now manage other admins
- **Artifact input validation** — added input validation for artifacts
- **Dashboard long names** — names are truncated and bars aligned on the dashboard; broken badge temporarily disabled
- **VEX modal card borders** — restored upload card borders
- **VEX external reference handling** — now uses URL as the primary key
- **Auto setup / timeout** — timeout length and message improved for better UX
- **Doc page link** — added missing link to documentation page
- **Repository name in header** — long repository names are now truncated instead of overflowing
- **Dependency graph** — expanded by default
- **Copy button** — cursor now shows as a pointer
- **Double toast** — duplicate toast notification removed
- **Quick fixes** — corrected quick-fixes behaviour and reworked to a two-line view
- **Asset name settings** — corrected interface and validation issues

### Changed

- **Dependencies** — npm packages updated; Nix flake updated to Node.js 26.04; removed `js recommended` lint config
- **Cleanup** — removed stray console logs, removed the SBOM source type section

### First-time contributors

Thanks to our first-time contributors this release!

- **[@nicksan222](https://github.com/nicksan222)** (Nicholas Santi) — fixed VEX upload card borders and squashed a password-mismatch flash bug in the sign-up flow
- **[@domzoric](https://github.com/domzoric)** — fixed the CVSS badge preview to load from the artifact-scoped endpoint
- **[@khiem-nguyen-ict](https://github.com/khiem-nguyen-ict)** — fixed long repository names overflowing in the header

---

## [v1.8.0] — 2026-07-01

### Added

- **External managed entities** — assets can be flagged as externally managed; a dedicated banner is shown for these entities and IAC/SAST findings are scoped correctly
- **Release creation** — automated release creation integrated into the CI/CD pipeline, gated to main branch or tagged runs using job tokens
- **Updated integration snippets** — setup and onboarding code snippets updated to the current scanner version

### Fixed

- **Dependency risk vulnerability page** — "Create Ticket" button visibility corrected (broken ternary nesting)
- **Date-picker** — component behaviour corrected
- **Onboarding comments and GitLab onboarding** — flow issues resolved
- **Welcome modal** — tour-seen state now tracked correctly
- **Card shadows and badge/font sizes** — visual regressions corrected
- **Confirm-password check** — sign-up flow now validates matching passwords with a more reliable condition
- **Instance dashboard** — large vulnerability counts no longer overflow their tile; text size adjusted

### Changed

- **Onboarding tour reworked** — tour starts automatically on first visit; onboarding cards are directly clickable; redundant "Continue" button and unnecessary back buttons removed; asset creation modal closes and resets after successful creation
- **Average open code risks / fixing time charts** — added a legend to the open code risks chart and realigned the fixing time charts

---

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
