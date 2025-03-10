## [2.0.1](https://github.com/adobe/helix-importer-jcr-packaging/compare/v2.0.0...v2.0.1) (2025-03-06)


### Bug Fixes

* **sites-29443:** Handle invalid JCR characters ([#8](https://github.com/adobe/helix-importer-jcr-packaging/issues/8)) ([524130b](https://github.com/adobe/helix-importer-jcr-packaging/commit/524130be1147cd18c281aa3abf8bd4647160099f))

# [2.0.0](https://github.com/adobe/helix-importer-jcr-packaging/compare/v1.1.2...v2.0.0) (2025-02-26)


* feat(sites-29416)!: Add support for importing non-image assets ([#7](https://github.com/adobe/helix-importer-jcr-packaging/issues/7)) ([ef4b444](https://github.com/adobe/helix-importer-jcr-packaging/commit/ef4b444785280eeaf5bab42af3a41109e60bcf25))


### BREAKING CHANGES

* The API getImageUrlsFromMarkdown has been renamed to getAssetUrlsFromMarkdown, to align more accurately to what it is doing.

Co-authored-by: Ben Helleman <bhellema@adobe.com>

## [1.1.2](https://github.com/adobe/helix-importer-jcr-packaging/compare/v1.1.1...v1.1.2) (2025-02-26)


### Bug Fixes

* SITES-29316 Asset reference paths should be lowercased ([#5](https://github.com/adobe/helix-importer-jcr-packaging/issues/5)) ([5d7efba](https://github.com/adobe/helix-importer-jcr-packaging/commit/5d7efbae6a063a81e55649b6eec940e3f42471ba))

## [1.1.1](https://github.com/adobe/helix-importer-jcr-packaging/compare/v1.1.0...v1.1.1) (2025-02-12)


### Bug Fixes

* **build:** remove need for node engine version ([306bdbf](https://github.com/adobe/helix-importer-jcr-packaging/commit/306bdbf868e31ba0b942eeaf23372cecfb232f81))

# [1.1.0](https://github.com/adobe/helix-importer-jcr-packaging/compare/v1.0.0...v1.1.0) (2025-02-12)


### Features

* **sites-29165:** simplify the api used to create a package ([#4](https://github.com/adobe/helix-importer-jcr-packaging/issues/4)) ([84510a6](https://github.com/adobe/helix-importer-jcr-packaging/commit/84510a65449343cb7498373aa036d562243ede59))

# 1.0.0 (2025-02-12)


### Bug Fixes

* Use node.js libs and add tests ([#2](https://github.com/adobe/helix-importer-jcr-packaging/issues/2)) ([c234107](https://github.com/adobe/helix-importer-jcr-packaging/commit/c234107f688926bdd50316701027ec92701f60dd))
