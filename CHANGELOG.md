## [2.0.11](https://github.com/adobe/helix-importer-jcr-packaging/compare/v2.0.10...v2.0.11) (2025-08-25)


### Bug Fixes

* update image regex to handle escaped alt text ([#21](https://github.com/adobe/helix-importer-jcr-packaging/issues/21)) ([3f569e0](https://github.com/adobe/helix-importer-jcr-packaging/commit/3f569e0763520e1f61141793409721c339d1c2e0))

## [2.0.10](https://github.com/adobe/helix-importer-jcr-packaging/compare/v2.0.9...v2.0.10) (2025-07-21)


### Bug Fixes

* Skip any embedded data URLs when compiling a list of referenced assets for downloading ([#20](https://github.com/adobe/helix-importer-jcr-packaging/issues/20)) ([55cbee4](https://github.com/adobe/helix-importer-jcr-packaging/commit/55cbee463e70d91ee0aeed2e1822a9a71a6232e5))

## [2.0.9](https://github.com/adobe/helix-importer-jcr-packaging/compare/v2.0.8...v2.0.9) (2025-06-27)


### Bug Fixes

* Bug in asset reference update logic that generates invalid names paces in pages ([#19](https://github.com/adobe/helix-importer-jcr-packaging/issues/19)) ([3867374](https://github.com/adobe/helix-importer-jcr-packaging/commit/38673745f1c7d2a775998e8560acf001e7ecfcae))

## [2.0.8](https://github.com/adobe/helix-importer-jcr-packaging/compare/v2.0.7...v2.0.8) (2025-06-18)


### Bug Fixes

* **14:** Multiple image paths are not being updated ([#15](https://github.com/adobe/helix-importer-jcr-packaging/issues/15)) ([03b67b1](https://github.com/adobe/helix-importer-jcr-packaging/commit/03b67b1a0ad3332624f5621d98c8901db5cbe71e))

## [2.0.7](https://github.com/adobe/helix-importer-jcr-packaging/compare/v2.0.6...v2.0.7) (2025-05-20)


### Bug Fixes

* empty pages are overwriting existing content ([afdb9b3](https://github.com/adobe/helix-importer-jcr-packaging/commit/afdb9b3507c8f5e5cc8475af3aeb0b9ff162a455))

## [2.0.6](https://github.com/adobe/helix-importer-jcr-packaging/compare/v2.0.5...v2.0.6) (2025-03-31)


### Bug Fixes

* packaging is adding additional files ([068b3f6](https://github.com/adobe/helix-importer-jcr-packaging/commit/068b3f61960167be4b72dff321ad28e205b95dcb))

## [2.0.5](https://github.com/adobe/helix-importer-jcr-packaging/compare/v2.0.4...v2.0.5) (2025-03-28)


### Bug Fixes

* issue with filter paths being wrong ([bf17964](https://github.com/adobe/helix-importer-jcr-packaging/commit/bf1796403efe99c5df99ca58f2a273a3921cfd17))

## [2.0.4](https://github.com/adobe/helix-importer-jcr-packaging/compare/v2.0.3...v2.0.4) (2025-03-28)


### Bug Fixes

* clean up asset and site folder names ([6660480](https://github.com/adobe/helix-importer-jcr-packaging/commit/6660480f38823d785b9330e424f3055428afa69d))

## [2.0.3](https://github.com/adobe/helix-importer-jcr-packaging/compare/v2.0.2...v2.0.3) (2025-03-28)


### Bug Fixes

* **sites-30112:** support transforming model field values ([#12](https://github.com/adobe/helix-importer-jcr-packaging/issues/12)) ([40ddefa](https://github.com/adobe/helix-importer-jcr-packaging/commit/40ddefa53bc0c9bc318d0718c49da60e687ac138))

## [2.0.2](https://github.com/adobe/helix-importer-jcr-packaging/compare/v2.0.1...v2.0.2) (2025-03-26)


### Bug Fixes

* **sites-30112:** support transforming model field values ([#10](https://github.com/adobe/helix-importer-jcr-packaging/issues/10)) ([082c844](https://github.com/adobe/helix-importer-jcr-packaging/commit/082c84489dff628c4c51b02af2ab11de92cc50b8))

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
