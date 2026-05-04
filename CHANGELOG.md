# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2026-04-27

### Added

- **Dependency Proxy Configuration** — Added a Dependency Proxy settings section at the organization, project, and asset levels with rule validation and live testing functionality
- **Umami Analytics Support** — Integrated Umami analytics support for self-hosted telemetry
- **Quick Fix Improvements** — Reworked the quick fix UI with a before/after comparison, improved copy-code support, a subtle bounce animation, dotted line indicators, and dependency graph integration
- **4K character limit** on VEX rule justification input fields

### Changed

- **Config Editor** — Added tab whitespace support, save via keyboard shortcut, toast notifications on save, and package validation/parsing logic
- **Sign-In / Auth Pages** — Reworked and unified the styling of all authentication pages
- **Sign-Up Usability** — Improved contrast for UI buttons and error messages in light mode
- **VEX Rules** — `ROOT` is now displayed as "Your Application" in VEX rule path patterns
- **Custom Theming** — Several improvements to support custom theming, including a fix for the logo width on the login screen in light mode
- **Reproducible / Deterministic Builds** — Migrated to Turbopack, deterministic module IDs, and Nix-based OCI image builds
- Replaced Google Fonts with locally hosted fonts

### Fixed

- VEX rules not being displayed correctly
- VEX rules modal flashing when clicking a redirect link
- VEX rules not working for direct dependencies
- Search pagination resetting to page 1 after a search query
- Background color of the dependency graph in light mode
- Broken events in the activity stream
- Spacing in the license distribution card
- URL formatting in settings input fields
- `quickfix NO UPDATE FOR` using wrong package name
- Spacing between risk value and package name in the activity stream

## [1.2.0] - 2026-03-30

### Added

- **Organization dashboard** with comprehensive analytics: risk history chart, vulnerability detection & remediation trends, ecosystem distribution, average remediation times, most used components/CVEs, open vulnerabilities per severity, average dependency age, and code risk statistics
- **Organization structure view** with expandable sections linking to respective pages
- **Code editor component** with TOML support for editing configuration files
- **Configuration files section** in asset and project settings with a dedicated `ConfigFileEditor` (supports Checkov and other config formats)
- **Sorting feature** for project and organization pages with dropdown menu and direction toggle
- **SSO provider improvements**: new `OrySsoRoot` component, SSO provider icons, improved `OrySsoButton` and `OrySsoSettings` for better accessibility
- **Organization deletion** with confirmation dialog
- Nix ecosystem image support
- Breadcrumbs to configuration settings pages
- IDs to dependency graph nodes for better referencing
- Checkov config file added to default configuration options

### Fixed

- Colors in risk assessment feed
- VEX rule creation
- Sorting behavior and URL parameter handling ([#1811](https://github.com/l3montree-dev/devguard/issues/1811), [#1828](https://github.com/l3montree-dev/devguard/issues/1828))
- Validation handling in `CodeEditor` and `ConfigFileEditor` components
- Editor value reset when config file is not available; save button state logic
- Chart handling improvements in org overview

## [1.1.0] - previous release

<!-- add notes for 1.1.0 here if needed -->
