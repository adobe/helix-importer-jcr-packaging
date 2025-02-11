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
import { JSDOM } from 'jsdom';
import {
  getFilterXml, getJcrPagePath, getPackageName,
  getPropertiesXml, traverseAndUpdateAssetReferences,
} from '../../src/package/packaging.utils.js';

describe('packaging-utils', () => {
  it('test the getPropertiesXml', async () => {
    const props = getPropertiesXml();
    expect(props.propXmlPath).to.equal('META-INF/vault/properties.xml');
    expect(props.propXml).to.contain("<?xml version='1.0' encoding='UTF-8'?>");
  });

  it('test the getPropertiesXml with custom props', async () => {
    const { propXmlPath, propXml } = getPropertiesXml('custom-package-name');
    expect(propXmlPath).to.equal('META-INF/vault/properties.xml');
    expect(propXml).to.contain(
      "<entry key='name'>custom-package-name</entry>",
    );
  });

  // write a test to cover getFilterXml
  it('test the getFilterXml', async () => {
    // given a list of pages make sure the filterXMl contains the pages
    const pages = [{ jcrPath: '/content/site/a' }, { jcrPath: '/content/site/b' }];
    const { filterXmlPath, filterXml } = getFilterXml(pages);
    expect(filterXmlPath).to.equal('META-INF/vault/filter.xml');
    expect(filterXml).to.contain('<filter root=\'/content/site/a\'>');
    expect(filterXml).to.contain('<filter root=\'/content/site/b\'>');
  });

  // write a test to cover getPackageName
  it('test the getPackageName', async () => {
    // one page should create a package name with the page name
    let pages = [{ path: '/content/site/a' }];
    let packageName = getPackageName(pages, 'xwalk');
    expect(packageName).to.equal('xwalk_a');

    // multiple pages should create a package name with the first page name
    pages = [{ path: '/content/site/a' }, { path: '/content/site/b' }];
    packageName = getPackageName(pages, 'xwalk');
    expect(packageName).to.equal('xwalk');
  });

  // write a test to cover getJcrPagePath
  it('test the getJcrPagePath', async () => {
    // if the path does not start with /content then the jcr path should be /content/<path>
    const jcrPath = getJcrPagePath('/products/lightroom', 'adobe');
    expect(jcrPath).to.equal('/content/adobe/products/lightroom');

    // if the path starts with /content/adobe then the jcr path should be the same
    const jcrPath2 = getJcrPagePath('/content/adobe/products/lightroom', 'adobe');
    expect(jcrPath2).to.equal('/content/adobe/products/lightroom');
  });

  // write unit test for traverseAndUpdateAssetReferences
  it('should update asset references in the DOM tree', () => {
    const dom = new JSDOM(`
      <html lang="en">
        <body>
          <img src="http://example.com/content/dam/image.jpg" alt=""/>
          <img src="https://example.com/cars/honda.jpg"  alt=""/>
          <a href="./relative/path/to/asset.jpg">Link</a>
          <div>
            Nested Image
            <img src="http://example.com/cars/dodge.jpg" alt=""/>
            <img src="/content/dam/dodge/cars/charger.jpg" alt=""/>
          </div>
        </body>
      </html>
    `);
    const { document } = dom.window;
    const pageUrl = 'http://example.com/content/page.html';
    const assetFolderName = 'xwalk';
    const jcrAssetMap = new Map([
      ['http://example.com/content/dam/image.jpg', '/content/dam/xwalk/image.jpg'],
      ['./relative/path/to/asset.jpg', '/content/dam/xwalk/relative/path/to/asset.jpg'],
      ['https://example.com/cars/honda.jpg', '/content/dam/xwalk/cars/honda.jpg'],
      ['http://example.com/cars/dodge.jpg', '/content/dam/xwalk/cars/dodge.jpg'],
      ['/content/dam/dodge/cars/charger.jpg', '/content/dam/xwalk/dodge/cars/charger.jpg'],
    ]);

    traverseAndUpdateAssetReferences(document.body, pageUrl, assetFolderName, jcrAssetMap);

    const imgs = document.querySelectorAll('img');
    const a = document.querySelector('a');

    expect(imgs[0].getAttribute('src')).to.equal('/content/dam/xwalk/image.jpg');
    expect(imgs[1].getAttribute('src')).to.equal('/content/dam/xwalk/cars/honda.jpg');
    expect(imgs[2].getAttribute('src')).to.equal('/content/dam/xwalk/cars/dodge.jpg');
    expect(imgs[3].getAttribute('src')).to.equal('/content/dam/xwalk/dodge/cars/charger.jpg');
    expect(a.getAttribute('href')).to.equal('/content/dam/xwalk/content/relative/path/to/asset.jpg');
  });
});
