# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
