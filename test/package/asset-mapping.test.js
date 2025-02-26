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
  it('should return an array of image urls (reference urls)', () => {
    const markdownContent = `+-----------------------+
| Hero                  |
+=======================+
| ![Car 1][image0]      |
| ![Car 2][image1]      |
+-----------------------+

[image0]: https://aem.live/car.jpeg
[image1]: https://aem.live/car2.jpeg`;

    const assetUrls = getAssetUrlsFromMarkdown(markdownContent);
    expect(assetUrls).to.have.lengthOf(2);
    expect(assetUrls[0]).to.equal('https://aem.live/car.jpeg');
    expect(assetUrls[1]).to.equal('https://aem.live/car2.jpeg');
  });

  it('should return an array of image urls (inlined urls)', () => {
    const markdownContent = `+------------------------------------------+
| Hero                                     |
+==========================================+
| ![Car 1](https://aem.live/car.jpeg)      |
| ![Car 2](https://aem.live/car2.jpeg)     |
+------------------------------------------+`;

    const assetUrls = getAssetUrlsFromMarkdown(markdownContent);
    expect(assetUrls).to.have.lengthOf(2);
    expect(assetUrls[0]).to.equal('https://aem.live/car.jpeg');
    expect(assetUrls[1]).to.equal('https://aem.live/car2.jpeg');
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

    const assetUrls = getAssetUrlsFromMarkdown(markdownContent);
    expect(assetUrls).to.have.lengthOf(0);
  });

  it('should return an array of image urls (absolute/relative urls)', () => {
    const markdownContent = `+------------------------------------------+
| Hero                                     |
+==========================================+
| ![Car 1](/car.jpeg)                      |
| ![Car 2][image0]                         |
+------------------------------------------+

[image0]: /test/car2.jpeg`;

    const assetUrls = getAssetUrlsFromMarkdown(markdownContent);
    expect(assetUrls).to.have.lengthOf(2);
    expect(assetUrls[0]).to.equal('/car.jpeg');
    expect(assetUrls[1]).to.equal('/test/car2.jpeg');
  });

  // should call createImageMappingFile with the correct arguments
  it('test getAssetUrlsFromMarkdown', async () => {
    const markdown = await loadFile('../fixtures/mystique/hero.md');
    const imageUrl = await getAssetUrlsFromMarkdown(markdown);
    expect(imageUrl).to.be.an('array');
    expect(imageUrl).to.have.lengthOf(1);
  });
});
