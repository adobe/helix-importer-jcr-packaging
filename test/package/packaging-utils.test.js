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
  getPropertiesXml, traverseAndUpdateAssetReferences, getSanitizedJcrPath,
  getRelativeAssetPath,
} from '../../src/package/packaging.utils.js';

describe('packaging-utils', () => {
  it('test the getPropertiesXml', async () => {
    const props = getPropertiesXml();
    expect(props.propXmlPath).to.equal('META-INF/vault/properties.xml');
    expect(props.propXml).to.contain('<?xml version="1.0" encoding="UTF-8"?>');
  });

  it('test the getPropertiesXml with custom props', async () => {
    const { propXmlPath, propXml } = getPropertiesXml('custom-package-name');
    expect(propXmlPath).to.equal('META-INF/vault/properties.xml');
    expect(propXml).to.contain(
      '<entry key="name">custom-package-name</entry>',
    );
  });

  // write a test to cover getFilterXml
  it('test the getFilterXml', async () => {
    // given a list of pages make sure the filterXMl contains the pages
    const pages = [{ jcrPath: '/content/site/a' }, { jcrPath: '/content/site/b' }];
    const { filterXmlPath, filterXml } = getFilterXml(pages);
    expect(filterXmlPath).to.equal('META-INF/vault/filter.xml');
    expect(filterXml).to.contain('<filter root="/content/site/a">');
    expect(filterXml).to.contain('<filter root="/content/site/b">');
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
    let assetFolderName = 'DOE-Sample-Site-1';

    // ensure generated path is in lower case, and has no double extension
    let assetUrl = new URL('https://xyz/content/dam/doe/sws/image/IMG-20241017-WA0000.jpg.thumb.1280.1280.jpg');
    let expectedJcrPath = '/content/dam/doe-sample-site-1/doe/sws/image/img-20241017-wa0000.jpg.thumb.1280.1280.jpg';
    let actualJcrPath = getJcrAssetPath(assetUrl, assetFolderName);
    expect(actualJcrPath).to.equal(expectedJcrPath);

    // ensure hidden file handling
    assetUrl = new URL('https://example.com/doe/sws/.hiddenfile');
    expectedJcrPath = '/content/dam/doe-sample-site-1/doe/sws/.hiddenfile';
    actualJcrPath = getJcrAssetPath(assetUrl, assetFolderName);
    expect(actualJcrPath).to.equal(expectedJcrPath);

    // should generate a path if resource url has extension
    assetUrl = new URL('https://example.com/blob/shdckh234y4');
    expectedJcrPath = '/content/dam/doe-sample-site-1/blob/shdckh234y4';
    actualJcrPath = getJcrAssetPath(assetUrl, assetFolderName);
    expect(actualJcrPath).to.equal(expectedJcrPath);

    // ensure removal of assetFolderName if present, before reinserting to avoid duplication
    assetUrl = new URL('https://example.com/content/dam/doe/sws/toys/foo/card/toy.png');
    assetFolderName = 'doe/sws/toys/foo';
    expectedJcrPath = '/content/dam/doe/sws/toys/foo/card/toy.png';
    actualJcrPath = getJcrAssetPath(assetUrl, assetFolderName);
    expect(actualJcrPath).to.equal(expectedJcrPath);
  });

  it('test the getJcrPagePath', async () => {
    // if the path does not start with /content then the jcr path should be /content/<path>
    // really we should not have to deal with this scenario as we should be enforcing paths
    // start with /content for a site folder.
    let jcrPath = getJcrPagePath('/content/adobe/products/lightroom', '/content/adobe');
    expect(jcrPath).to.equal('/content/adobe/products/lightroom');

    jcrPath = getJcrPagePath('/products/lightroom', 'adobe');
    expect(jcrPath).to.equal('/content/adobe/products/lightroom');

    // if the path starts with /content then the jcr path should be the same
    jcrPath = getJcrPagePath('/content/adobe/products/lightroom', 'adobe');
    expect(jcrPath).to.equal('/content/adobe/products/lightroom');

    // if the path starts with /content then the jcr path should be the same
    jcrPath = getJcrPagePath('/content/foo/bar/xyz', 'foo');
    expect(jcrPath).to.equal('/content/foo/bar/xyz');

    jcrPath = getJcrPagePath('/products/lightroom', '/content/xwalk');
    expect(jcrPath).to.equal('/content/xwalk/products/lightroom');
  });

  // write unit test for traverseAndUpdateAssetReferences
  it('should update asset references in the DOM tree', () => {
    const document = getParsedXml(`<?xml version="1.0" encoding="UTF-8"?>
<jcr:root xmlns:jcr="http://www.jcp.org/jcr/1.0">
  <jcr:content>
    <root>
      <section>
        <block hero_image="https://domain.com/media_a.jpeg"></block>
        <text_1 text="&lt;p&gt;&lt;img src=&quot;/car.jpeg?width=750&amp;format=jpeg&amp;optimize=medium&quot;&gt;&lt;/p&gt;&lt;p&gt;&lt;img src=&quot;/boat.jpeg?width=750&amp;format=jpeg&amp;optimize=medium&quot;&gt;&lt;/p&gt;"/>
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
    expect(text[0].getAttribute('text')).to.equal('<p><img src="/content/dam/xwalk/car.jpeg"></p><p><img src="/content/dam/xwalk/boat.jpeg"></p>');
  });

  it('should update all relative asset references in the DOM tree', () => {
    const document = getParsedXml(`
      <section>
        <block_0>
          <item image="./cat.png"></item>
        </block_0>
        <block_1>
          <item image="./cat.png"></item>
        </block_1>
        <block_2>
          <item image="../dog.png"></item>
        </block_2>
        <block_3>
          <item image="../dog.png"></item>
        </block_3>        
        <block_4>
          <item image="asset/bird.png"></item>
        </block_4>
        <block_5>
          <item image="asset/bird.png"></item>
        </block_5>        
        <block_6>
          <item image="asset.png"></item>
        </block_6>
        <block_7>
          <item image="asset.png"></item>
        </block_7> 
      </section>
    `);
    const pageUrl = 'http://example.com/folderXYZ/page.html';
    const assetFolderName = 'xwalk';
    const jcrAssetMap = new Map([
      ['./cat.png', '/content/dam/xwalk/folderxyz/cat.png'],
      ['../dog.png', '/content/dam/xwalk/dog.png'],
      ['asset/bird.png', '/content/dam/xwalk/folderxyz/asset/bird.png'],
      ['asset.png', '/content/dam/xwalk/folderxyz/asset.png'],
    ]);

    traverseAndUpdateAssetReferences(
      document.documentElement,
      pageUrl,
      assetFolderName,
      jcrAssetMap,
    );

    const blocks0 = document.getElementsByTagName('block_0');
    const blocks1 = document.getElementsByTagName('block_1');
    const blocks2 = document.getElementsByTagName('block_2');
    const blocks3 = document.getElementsByTagName('block_3');
    const blocks4 = document.getElementsByTagName('block_4');
    const blocks5 = document.getElementsByTagName('block_5');
    const blocks6 = document.getElementsByTagName('block_6');
    const blocks7 = document.getElementsByTagName('block_7');

    // for each block test to see if the attribute has been updated
    expect(blocks0[0].getElementsByTagName('item')[0].getAttribute('image')).to.equal('/content/dam/xwalk/folderxyz/cat.png'); // Same directory
    expect(blocks1[0].getElementsByTagName('item')[0].getAttribute('image')).to.equal('/content/dam/xwalk/folderxyz/cat.png'); // Same directory
    expect(blocks2[0].getElementsByTagName('item')[0].getAttribute('image')).to.equal('/content/dam/xwalk/dog.png'); // Parent directory
    expect(blocks3[0].getElementsByTagName('item')[0].getAttribute('image')).to.equal('/content/dam/xwalk/dog.png'); // Parent directory
    expect(blocks4[0].getElementsByTagName('item')[0].getAttribute('image')).to.equal('/content/dam/xwalk/folderxyz/asset/bird.png'); // sub asset folder
    expect(blocks5[0].getElementsByTagName('item')[0].getAttribute('image')).to.equal('/content/dam/xwalk/folderxyz/asset/bird.png'); // sub asset folder
    expect(blocks6[0].getElementsByTagName('item')[0].getAttribute('image')).to.equal('/content/dam/xwalk/folderxyz/asset.png'); // sub asset folder
    expect(blocks7[0].getElementsByTagName('item')[0].getAttribute('image')).to.equal('/content/dam/xwalk/folderxyz/asset.png'); // sub asset folder
  });

  it('should update all asset references in the DOM tree', () => {
    const document = getParsedXml(`
      <section>
        <block_0>
          <item image="/-/media/projects/foo/cat.png"></item>
        </block_0>
        <block_1>
          <item image="/-/media/projects/foo/cat.png"></item>
        </block_1>
        <block_2>
          <item image="/content/themes/img.jpg"></item> 
        </block_2>
        <block_3>
         <item text="&lt;img src=&quot;/content/themes/img.jpg&quot;&gt;"></item>
        </block_3>
      </section>
    `);
    const pageUrl = 'http://example.com/foobar/page.html';
    const assetFolderName = 'xwalk';
    const jcrAssetMap = new Map([
      ['/-/media/projects/foo/cat.png', ''],
      ['/content/themes/img.jpg', ''],
    ]);

    traverseAndUpdateAssetReferences(
      document.documentElement,
      pageUrl,
      assetFolderName,
      jcrAssetMap,
    );

    const blocks0 = document.getElementsByTagName('block_0');
    const blocks1 = document.getElementsByTagName('block_1');
    const blocks2 = document.getElementsByTagName('block_2');
    const blocks3 = document.getElementsByTagName('block_3');

    // for each block test to see if the attribute has been updated
    expect(blocks0[0].getElementsByTagName('item')[0].getAttribute('image')).to.equal('/content/dam/xwalk/-/media/projects/foo/cat.png');
    expect(blocks1[0].getElementsByTagName('item')[0].getAttribute('image')).to.equal('/content/dam/xwalk/-/media/projects/foo/cat.png');
    expect(blocks2[0].getElementsByTagName('item')[0].getAttribute('image')).to.equal('/content/dam/xwalk/content/themes/img.jpg');
    expect(blocks3[0].getElementsByTagName('item')[0].getAttribute('text')).to.equal('<img src="/content/dam/xwalk/content/themes/img.jpg">');
  });

  it('test for getSanitizedJcrPath', () => {
    // should replace invalid folder name characters
    let input = '/content/dam/inva*lid/fol:der/image.jpg';
    let expected = '/content/dam/inva-lid/fol-der/image.jpg';
    expect(getSanitizedJcrPath(input)).to.equal(expected);

    // should replace invalid file name characters
    input = '/content/dam/folder/image?.jpg';
    expected = '/content/dam/folder/image-.jpg';
    expect(getSanitizedJcrPath(input)).to.equal(expected);

    // should not modify valid paths
    input = '/content/dam/valid-folder/valid-image.jpg';
    expect(getSanitizedJcrPath(input)).to.equal(input);

    // 'should handle spaces and tabs in folder names
    input = '/content/dam/folder name/another\tfolder/image.jpg';
    expected = '/content/dam/folder-name/another-folder/image.jpg';
    expect(getSanitizedJcrPath(input)).to.equal(expected);

    // should correctly handle multiple invalid characters
    input = '/content/dam/inv*ali[d]/fol^der+/ima?ge.jpg';
    expected = '/content/dam/inv-ali-d-/fol-der-/ima-ge.jpg';
    expect(getSanitizedJcrPath(input)).to.equal(expected);

    // should replace invalid characters at the start or end of a folder name
    input = '/content/dam/*invalid*/folder/';
    expected = '/content/dam/-invalid-/folder/';
    expect(getSanitizedJcrPath(input)).to.equal(expected);

    // should handle empty input gracefully
    expect(getSanitizedJcrPath('')).to.equal('');

    // should not break if given a path without a file
    input = '/content/dam/folder/';
    expect(getSanitizedJcrPath(input)).to.equal(input);
  });

  it('should correctly handle encoded and non-encoded attribute values', () => {
    const document = getParsedXml(`<?xml version="1.0" encoding="UTF-8"?>
<jcr:root xmlns:jcr="http://www.jcp.org/jcr/1.0">
  <jcr:content>
    <root>
      <!-- Regular non-encoded attributes -->
      <block1 image="/images/simple.jpg" 
              background="/images/background.png"/>
      
      <!-- HTML content with additional encoding -->
      <block2 content="&amp;lt;img src=&amp;quot;/images/double-encoded.jpg&amp;quot;&amp;gt;"
              data="Link to &amp;quot;/images/double-quoted.png&amp;quot;"/>      
    </root>
  </jcr:content>
</jcr:root>
  `);

    const pageUrl = 'http://example.com/test/page.html';
    const assetFolderName = 'test-site';
    const jcrAssetMap = new Map([
      ['/images/simple.jpg', '/content/dam/test-site/images/simple.jpg'],
      ['/images/background.png', '/content/dam/test-site/images/background.png'],
      ['/images/double-encoded.jpg', '/content/dam/test-site/images/double-encoded.jpg'],
      ['/images/double-quoted.png', '/content/dam/test-site/images/double-quoted.png'],
    ]);

    traverseAndUpdateAssetReferences(
      document.documentElement,
      pageUrl,
      assetFolderName,
      jcrAssetMap,
    );

    // Test non-encoded attributes (should remain non-encoded)
    const block1 = document.getElementsByTagName('block1')[0];
    expect(block1.getAttribute('image')).to.equal('/content/dam/test-site/images/simple.jpg');
    expect(block1.getAttribute('background')).to.equal('/content/dam/test-site/images/background.png');

    // Test HTML content that was double-encoded
    const block2 = document.getElementsByTagName('block2')[0];
    expect(block2.getAttribute('content')).to.equal(
      he.encode('<img src="/content/dam/test-site/images/double-encoded.jpg">'),
    );
    expect(block2.getAttribute('data')).to.equal(
      he.encode('Link to "/content/dam/test-site/images/double-quoted.png"'),
    );
  });

  describe('getRelativeAssetPath', () => {
    const pageUrl = 'https://foo.com/foo/folderXYZ/page.html';

    it('should handle files in the same directory', () => {
      // Test file in the same directory
      expect(getRelativeAssetPath(pageUrl, '/foo/folderXYZ/cat.png'))
        .to.equal('./cat.png');

      // Test another file in the same directory
      expect(getRelativeAssetPath(pageUrl, '/foo/folderXYZ/image.jpg'))
        .to.equal('./image.jpg');
    });

    it('should handle files in subdirectories', () => {
      // Test file in a subdirectory
      expect(getRelativeAssetPath(pageUrl, '/foo/folderXYZ/asset/bird.png'))
        .to.equal('./asset/bird.png');

      // Test file in a deeper subdirectory
      expect(getRelativeAssetPath(pageUrl, '/foo/folderXYZ/images/sub/photo.jpg'))
        .to.equal('./images/sub/photo.jpg');
    });

    it('should handle files in parent directories', () => {
      // Test file in parent directory
      expect(getRelativeAssetPath(pageUrl, '/foo/dog.png'))
        .to.equal('../dog.png');

      // Test file in parent's parent directory
      expect(getRelativeAssetPath(pageUrl, '/cat.png'))
        .to.equal('../../cat.png');
    });

    it('should handle different page URL formats', () => {
      // Test with trailing slash in page URL
      const pageUrlWithSlash = 'https://foo.com/content/dam/xwalk/folderXYZ/';
      expect(getRelativeAssetPath(pageUrlWithSlash, '/content/dam/xwalk/folderXYZ/cat.png'))
        .to.equal('./cat.png');

      // Test with different domain
      const pageUrlDifferentDomain = 'http://example.com/content/dam/xwalk/folderXYZ/page.html';
      expect(getRelativeAssetPath(pageUrlDifferentDomain, '/content/dam/xwalk/folderXYZ/cat.png'))
        .to.equal('./cat.png');
    });
  });
});
