/*
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/* eslint-env mocha */
import { readFile } from 'fs/promises';
import { expect } from 'chai';
import { getAssetUrlsFromMarkdown } from '../../src/package/asset-mapping.js';

const loadFile = async (file) => readFile(new URL(file, import.meta.url), 'utf-8');

describe('getAssetUrlsFromMarkdown', () => {
  it('should return an array of asset urls (reference urls)', () => {
    const markdownContent = `+-----------------------+
| Hero                  |
+=======================+
| ![Car 1][image0]      |
| ![Car 2][image1]      |
+-----------------------+

[image0]: https://aem.live/car.jpeg
[image1]: https://aem.live/car2.jpeg`;

    const imageUrls = getAssetUrlsFromMarkdown(markdownContent);
    expect(imageUrls).to.have.lengthOf(2);
    expect(imageUrls[0]).to.equal('https://aem.live/car.jpeg');
    expect(imageUrls[1]).to.equal('https://aem.live/car2.jpeg');
  });

  it('should return an array of asset urls (inlined urls)', () => {
    const markdownContent = `+------------------------------------------+
| Hero                                     |
+==========================================+
| ![Car 1](https://aem.live/car.jpeg)      |
| ![Car 2](https://aem.live/car2.jpeg)     |
+------------------------------------------+`;

    const imageUrls = getAssetUrlsFromMarkdown(markdownContent);
    expect(imageUrls).to.have.lengthOf(2);
    expect(imageUrls[0]).to.equal('https://aem.live/car.jpeg');
    expect(imageUrls[1]).to.equal('https://aem.live/car2.jpeg');
  });

  it('should return non-image asset URLs for various document types', () => {
    const markdownContent = `
      Click [PDF](/content/dam/doe/foo/bar.pdf) to download the guide.
      View [DOC](/content/dam/doe/docs/sample.doc).
      Open [DOCX](/content/dam/doe/docs/sample.docx).
      See [XLS](/content/dam/doe/spreadsheets/data.xls).
      Try [XLSX](/content/dam/doe/spreadsheets/data.xlsx).
      Read [PPT](/content/dam/doe/presentations/slide.ppt).
      Check [PPTX](/content/dam/doe/presentations/slide.pptx).
      Open [ODT](/content/dam/doe/texts/note.odt).
      Review [ODS](/content/dam/doe/spreadsheets/sheet.ods).
      Access [ODP](/content/dam/doe/presentations/deck.odp).
      Check [RTF](/content/dam/doe/docs/document.rtf).
      Read [TXT](/content/dam/doe/texts/readme.txt).
      Get [CSV](/content/dam/doe/data/records.csv).
      Invalid [Fake](/content/dam/doe/fake/myimage.pdf.png).
      Also check [here](https://example.live/siteFoo.html).
    `;

    const assetUrls = getAssetUrlsFromMarkdown(markdownContent);

    expect(assetUrls).to.have.lengthOf(13); // 13 valid document URLs
    expect(assetUrls).to.include('/content/dam/doe/foo/bar.pdf');
    expect(assetUrls).to.include('/content/dam/doe/docs/sample.doc');
    expect(assetUrls).to.include('/content/dam/doe/docs/sample.docx');
    expect(assetUrls).to.include('/content/dam/doe/spreadsheets/data.xls');
    expect(assetUrls).to.include('/content/dam/doe/spreadsheets/data.xlsx');
    expect(assetUrls).to.include('/content/dam/doe/presentations/slide.ppt');
    expect(assetUrls).to.include('/content/dam/doe/presentations/slide.pptx');
    expect(assetUrls).to.include('/content/dam/doe/texts/note.odt');
    expect(assetUrls).to.include('/content/dam/doe/spreadsheets/sheet.ods');
    expect(assetUrls).to.include('/content/dam/doe/presentations/deck.odp');
    expect(assetUrls).to.include('/content/dam/doe/docs/document.rtf');
    expect(assetUrls).to.include('/content/dam/doe/texts/readme.txt');
    expect(assetUrls).to.include('/content/dam/doe/data/records.csv');

    // Ensure the invalid case is excluded
    expect(assetUrls).to.not.include('/content/dam/doe/fake/myimage.pdf.png');
  });

  it('should return an array with no image urls', () => {
    const markdownContent = 'This is a markdown file with no images.';

    const imageUrls = getAssetUrlsFromMarkdown(markdownContent);
    expect(imageUrls).to.have.lengthOf(0);
  });

  it('should return an array of image urls (absolute/relative urls)', () => {
    const markdownContent = `+------------------------------------------+
| Hero                                     |
+==========================================+
| ![Car 1](/car.jpeg)                      |
| ![Car 2][image0]                         |
+------------------------------------------+

[image0]: /test/car2.jpeg`;

    const imageUrls = getAssetUrlsFromMarkdown(markdownContent);
    expect(imageUrls).to.have.lengthOf(2);
    expect(imageUrls[0]).to.equal('/car.jpeg');
    expect(imageUrls[1]).to.equal('/test/car2.jpeg');
  });

  // should call getAssetUrlsFromMarkdown with the correct arguments
  it('test getAssetUrlsFromMarkdown', async () => {
    const markdown = await loadFile('../fixtures/mystique/hero.md');
    const imageUrl = await getAssetUrlsFromMarkdown(markdown);
    expect(imageUrl).to.be.an('array');
    expect(imageUrl).to.have.lengthOf(1);
  });

  it('should skip data URLs and only return file URLs', () => {
    const markdownContent = `
# Test Document

Regular image: ![Regular Image](/path/to/image.jpg)
Data URL SVG: ![SVG Icon](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMTAwJSIgd2lkdGg9IjEwMCUiIHZpZXdCb3g9IjAgMCAxNiAxNiI+PGcgZmlsbD0iY3VycmVudENvbG9yIj48cGF0aCBkPSJNMTYsOC4wNDhhOCw4LDAsMSwwLTkuMjUsNy45VjEwLjM2SDQuNzE5VjguMDQ4SDYuNzVWNi4yODVBMi44MjIsMi4yLDAsMCwxLDkuNzcxLDMuMTczYTEyLjIsMTIuMiwwLDAsMSwxLjc5MS4xNTZWNS4zSDEwLjU1NGExLjE1NSwxLjE1NSwwLDAsMC0xLjMsMS4yNXYxLjVoMi4yMTlsLS4zNTUsMi4zMTJIOS4yNXY1LjU5MUE4LDgsMCwwLDAsMTYsOC4wNDhaIiBmaWxsPSJjdXJyZW50Q29sb3IiLz48L2c+PC9zdmc+)
Data URL PNG: ![PNG Icon](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==)
Another regular image: ![Another Image](https://example.com/image.png)

Reference style with data URL:
![Data Reference][dataref]
![File Reference][fileref]

[dataref]: data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A8A
[fileref]: /content/dam/assets/logo.jpg

Download [Regular PDF](/content/dam/documents/guide.pdf)
    `;

    const assetUrls = getAssetUrlsFromMarkdown(markdownContent);

    // Should only return 4 URLs (2 regular images + 1 reference file + 1 regular PDF)
    expect(assetUrls).to.have.lengthOf(4);

    // Should include regular file URLs
    expect(assetUrls).to.include('/path/to/image.jpg');
    expect(assetUrls).to.include('https://example.com/image.png');
    expect(assetUrls).to.include('/content/dam/assets/logo.jpg');
    expect(assetUrls).to.include('/content/dam/documents/guide.pdf');

    // Should NOT include image data URLs
    expect(assetUrls).to.not.include.members([
      'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMTAwJSIgd2lkdGg9IjEwMCUiIHZpZXdCb3g9IjAgMCAxNiAxNiI+PGcgZmlsbD0iY3VycmVudENvbG9yIj48cGF0aCBkPSJNMTYsOC4wNDhhOCw4LDAsMSwwLTkuMjUsNy45VjEwLjM2SDQuNzE5VjguMDQ4SDYuNzVWNi4yODVBMi44MjIsMi4yLDAsMCwxLDkuNzcxLDMuMTczYTEyLjIsMTIuMiwwLDAsMSwxLjc5MS4xNTZWNS4zSDEwLjU1NGExLjE1NSwxLjE1NSwwLDAsMC0xLjMsMS4yNXYxLjVoMi4yMTlsLS4zNTUsMi4zMTJIOS4yNXY1LjU5MUE4LDgsMCwwLDAsMTYsOC4wNDhaIiBmaWxsPSJjdXJyZW50Q29sb3IiLz48L2c+PC9zdmc+',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
      'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A8A',
    ]);
  });

  it('should find all assets in wknd-trendsetters.md fixture', async () => {
    const markdownContent = await loadFile('../fixtures/wknd-trendsetters/wknd-trendsetters.md');
    const assetUrls = getAssetUrlsFromMarkdown(markdownContent);

    // Should find 9 asset URLs (including duplicates from multiple references)
    expect(assetUrls).to.have.lengthOf(9);

    // Should include the CDN image URLs that are actually found
    expect(assetUrls).to.include('https://cdn.prod.website-files.com/image-generation-assets/793c17eb-ae3c-458b-b8fa-a189b0052bc6.avif'); // image0
    expect(assetUrls).to.include('https://cdn.prod.website-files.com/image-generation-assets/f55b6d62-bc1d-4700-8258-318e659fa50c.avif'); // image1
    expect(assetUrls).to.include('https://cdn.prod.website-files.com/685659f2651d1abee4832887/68565a6c53e53dcd1effd2b6_7101dd4d-174a-4d00-82a1-383912b95bdb.avif'); // image10
    expect(assetUrls).to.include('https://cdn.prod.website-files.com/685659f2651d1abee4832887/68565a6c90d15f06db8c3063_05222b1a-c1f8-4466-a89e-8372f97aecc0.avif'); // image11
    expect(assetUrls).to.include('https://cdn.prod.website-files.com/685659f2651d1abee4832887/68565a6cd421d169780374bf_9ad18339-65d0-40a9-9bff-7b374acace0a.avif'); // image12
    expect(assetUrls).to.include('https://cdn.prod.website-files.com/685659f2651d1abee4832887/68565a6c58786282145eff60_deca1497-b229-4572-bcdf-56566120eec4.avif'); // image13
    expect(assetUrls).to.include('https://cdn.prod.website-files.com/image-generation-assets/5db1565e-357f-43eb-93a8-3692f45b38d5.avif'); // image14
    expect(assetUrls).to.include('https://cdn.prod.website-files.com/image-generation-assets/e198cd7a-a7bd-4756-ab20-d81853a5b03f.avif'); // image15

    // Should NOT include any data URLs (SVG base64 encoded images for image2-image9)
    expect(assetUrls).to.not.include.members([
      'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+PHBhdGggZD0iTTEyLjUgMTguMjVDMTYuMjI3OSAxOC4yNSAxOS4yNSA5LjIyNzkgMTkuMjUgMTEuNUMxOS4yNSA3Ljc3MjA4IDE2LjIyNzkgNC43NSAxMi41IDQuNzVDOC43NzIwOCA0Ljc1IDUuNzUgNy43NzIwOCA1Ljc1IDExLjVDNS43NSAxMi42MDA3IDYuMDEzNDUgMTMuNjM5OCA2LjQ4MDcyIDE0LjU1NzhMNSAxOUw5LjcxODE5IDE3LjY1MTlDMTAuNTY2NCAxOC4wMzYxIDExLjUwODIgMTguMjUgMTIuNSAxOC4yNVoiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==',
      'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+PHBhdGggZD0iTTUuMjUgNi43NUgxOC43NVYxNy4yNUg1LjI1VjYuNzVaIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cGF0aCBkPSJNNS4yNSA2Ljc1TDEyIDEyTDE4Ljc1IDYuNzUiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==',
    ]);

    // Verify that all found URLs are valid (not data URLs)
    assetUrls.forEach((url) => {
      expect(url).to.not.match(/^data:/);
    });
  });
});
