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
import { expect } from 'chai';
import { getImageUrlsFromMarkdown, sanitizeImageMappings } from '../../src/index.js';

describe('getImageUrlsFromMarkdown', () => {
  it('should return an array of image urls (reference urls)', () => {
    const markdownContent = `+-----------------------+
| Hero                  |
+=======================+
| ![Car 1][image0]      |
| ![Car 2][image1]      |
+-----------------------+

[image0]: https://aem.live/car.jpeg
[image1]: https://aem.live/car2.jpeg`;

    const imageUrls = getImageUrlsFromMarkdown(markdownContent);
    expect(imageUrls).to.have.lengthOf(2);
    expect(imageUrls[0]).to.equal('https://aem.live/car.jpeg');
    expect(imageUrls[1]).to.equal('https://aem.live/car2.jpeg');
  });

  it('should return an array of image urls (inlined urls)', () => {
    const markdownContent = `+------------------------------------------+
| Hero                                     |
+==========================================+
| ![Car 1](https://aem.live/car.jpeg)      |
| ![Car 2](https://aem.live/car2.jpeg)     |
+------------------------------------------+`;

    const imageUrls = getImageUrlsFromMarkdown(markdownContent);
    expect(imageUrls).to.have.lengthOf(2);
    expect(imageUrls[0]).to.equal('https://aem.live/car.jpeg');
    expect(imageUrls[1]).to.equal('https://aem.live/car2.jpeg');
  });

  it('should return an array with no image urls', () => {
    const markdownContent = 'This is a markdown file with no images.';

    const imageUrls = getImageUrlsFromMarkdown(markdownContent);
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

    const imageUrls = getImageUrlsFromMarkdown(markdownContent);
    expect(imageUrls).to.have.lengthOf(2);
    expect(imageUrls[0]).to.equal('/car.jpeg');
    expect(imageUrls[1]).to.equal('/test/car2.jpeg');
  });

  it('should remove entries with null, undefined, or empty string values', () => {
    const imageMap = new Map([
      ['key1', 'value1'],
      ['key2', null],
      ['key3', ''],
      ['key4', undefined],
      ['key5', 'value5'],
    ]);

    const result = sanitizeImageMappings(imageMap);

    expect(result.size).to.equal(2);
    expect(result.has('key1')).to.equal(true);
    expect(result.has('key5')).to.equal(true);
    expect(result.has('key2')).to.equal(false);
    expect(result.has('key3')).to.equal(false);
    expect(result.has('key4')).to.equal(false);
  });

  it('should return an empty Map if all values are null, undefined, or empty strings', () => {
    const imageMap = new Map([
      ['key1', null],
      ['key2', ''],
      ['key3', undefined],
    ]);

    const result = sanitizeImageMappings(imageMap);

    expect(result.size).to.equal(0);
  });
});
