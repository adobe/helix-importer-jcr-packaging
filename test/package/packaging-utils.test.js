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
import he from 'he';
import {
  getFilterXml, getJcrPagePath, getPackageName, getParsedXml, getJcrAssetPath,
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

  // write a test to cover getJcrAssetPath:
  // 1. test lowercased asset referernces
  // 2. should not add an extra .jpg to the URL
  it('test the getJcrAssetPath', () => {
    const assetUrl = new URL('https://xyz/content/dam/doe/sws/image/IMG-20241017-WA0000.jpg.thumb.1280.1280.jpg');
    const assetFolderName = 'DOE-Sample-Site-1';

    const result = getJcrAssetPath(assetUrl, assetFolderName);

    // Expected output
    const expected = '/content/dam/doe-sample-site-1/doe/sws/image/img-20241017-wa0000.jpg.thumb.1280.1280.jpg';
    expect(result).to.equal(expected);
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
    const document = getParsedXml(`<?xml version="1.0" encoding="UTF-8"?>
<jcr:root xmlns:jcr="http://www.jcp.org/jcr/1.0">
  <jcr:content>
    <root>
      <section>
        <block hero_image="https://domain.com/media_a.jpeg"></block>
        <text_1 text="&lt;p&gt;&lt;img src=&quot;/car.jpeg?width=750&amp;#x26;format=jpeg&amp;#x26;optimize=medium&quot;&gt;&lt;/p&gt;&lt;p&gt;&lt;img src=&quot;/boat.jpeg?width=750&amp;#x26;format=jpeg&amp;#x26;optimize=medium&quot;&gt;&lt;/p&gt;"/>
        <block_1>
          <item_0 image="./c.png"></item_0>
          <item_1 image="./folder/d.png"></item_1>
        </block_1>
      </section>
    </root>
    <image fileReference="/content/dam/folder/e.png" />
  </jcr:content>
</jcr:root>
    `);
    const pageUrl = 'http://example.com/folderXYZ/page.html';
    const assetFolderName = 'xwalk';
    const jcrAssetMap = new Map([
      ['https://domain.com/media_a.jpeg', '/content/dam/xwalk/media_a.jpeg'],
      ['/media_b.jpeg', '/content/dam/xwalk/media1_b.jpeg'],
      ['/car.jpeg?width=750&format=jpeg&optimize=medium', '/content/dam/xwalk/car.jpeg'],
      ['/boat.jpeg?width=750&format=jpeg&optimize=medium', '/content/dam/xwalk/boat.jpeg'],
      ['./c.png', '/content/dam/xwalk/folderXYZ/c.png'],
      ['./folder/d.png', '/content/dam/xwalk/folderXYZ/folder/d.png'],
      ['/content/dam/folder/e.png', '/content/dam/xwalk/folder/e.png'],
    ]);

    traverseAndUpdateAssetReferences(
      document.documentElement,
      pageUrl,
      assetFolderName,
      jcrAssetMap,
    );

    const blocks = document.getElementsByTagName('block');
    const blocks1 = document.getElementsByTagName('block_1');
    const image = document.getElementsByTagName('image');
    const text = document.getElementsByTagName('text_1');

    // for each block test to see if the attribute has been updated
    expect(blocks[0].getAttribute('hero_image')).to.equal('/content/dam/xwalk/media1_a.jpeg');
    expect(blocks1[0].getElementsByTagName('item_0')[0].getAttribute('image')).to.equal('/content/dam/xwalk/folderxyz/c.png');
    expect(blocks1[0].getElementsByTagName('item_1')[0].getAttribute('image')).to.equal('/content/dam/xwalk/folderxyz/folder/d.png');
    expect(image[0].getAttribute('fileReference')).to.equal('/content/dam/xwalk/folder/e.png');

    // test to see if the text has been updated
    expect(text[0].getAttribute('text')).to.equal(
      he.encode('<p><img src="/content/dam/xwalk/car.jpeg"></p><p><img src="/content/dam/xwalk/boat.jpeg"></p>'),
    );
  });
});
