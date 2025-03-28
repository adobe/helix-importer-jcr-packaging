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
import { readFile, rm } from 'fs/promises';
import { expect } from 'chai';
import { createJcrPackage, updateAssetReferences } from '../../src/package/packaging.js';
import { getFullAssetUrl, getParsedXml } from '../../src/package/packaging.utils.js';

const PAGE_URL = 'https://main--stini--bhellema.hlx.page';
const ASSET_FOLDER_NAME = 'plush';
const ORIGINAL_XML_PATH = '../fixtures/plush-original.xml';
const IMAGE_MAPPING_PATH = '../fixtures/plush-image-mapping.json';
const PROCESS_XML_PATH = '../fixtures/plush-processed.xml';

const loadFile = async (file) => readFile(new URL(file, import.meta.url), 'utf-8');

// Helper function to initialize image URL mapping from test data
const getImageUrlMap = async () => loadFile(IMAGE_MAPPING_PATH)
  .then((response) => JSON.parse(response))
  .then((data) => new Map(Object.entries(data)))
  // eslint-disable-next-line no-console
  .catch((error) => console.error('Error loading JSON:', error));

// Helper function to initialize an array of image URL keys from test data
const getImageUrlKeysArray = async () => loadFile(IMAGE_MAPPING_PATH)
  .then((response) => JSON.parse(response))
  .then((data) => Object.keys(data))
  // eslint-disable-next-line no-console
  .catch((error) => console.error('Error loading JSON:', error));

// Test suite for packaging.js
describe('packaging', () => {
  let outdir;

  beforeEach(() => {
    outdir = `./output/test-${Date.now()}`;
  });

  afterEach(() => {
    rm(outdir, { recursive: true, force: true });
  });

  // compare the processed xml with the expected xml
  it('verify asset paths updates in xml', async () => {
    const originalXml = await loadFile(ORIGINAL_XML_PATH);
    const expectedProcessedXml = await loadFile(PROCESS_XML_PATH);

    // Init image URL map (original urls only, jcr paths will be added by updateAssetReferences)
    const imageUrls = await getImageUrlKeysArray();
    const actualImageUrlMapping = new Map(imageUrls.map((url) => [url, '']));
    const actualProcessedXml = await updateAssetReferences(
      originalXml,
      PAGE_URL,
      ASSET_FOLDER_NAME,
      actualImageUrlMapping,
    );

    // Parse both XMLs using jsdom
    const actualXmlDom = getParsedXml(actualProcessedXml);
    const expectedXmlDom = getParsedXml(expectedProcessedXml);

    // expect that processed XML matches expected XML
    expect(
      actualXmlDom.documentElement.outerHTML,
      'Processed XML does not match expected XML',
    ).to.deep.equal(expectedXmlDom.documentElement.outerHTML);
  });

  // compare the generated image mapping with the expected image mapping
  it('verify generated image mapping', async () => {
    const originalXml = await loadFile(ORIGINAL_XML_PATH);
    const expectedImageUrlMapping = await getImageUrlMap();
    // Init image URL map (original urls only, jcr paths will be added by updateAssetReferences)
    const imageUrls = await getImageUrlKeysArray();
    const actualImageUrlMapping = new Map(imageUrls.map((url) => [url, '']));

    await updateAssetReferences(originalXml, PAGE_URL, ASSET_FOLDER_NAME, actualImageUrlMapping);

    // Compare the two maps
    expect(
      actualImageUrlMapping.size,
      'Image mapping sizes do not match',
    ).to.equal(expectedImageUrlMapping.size);

    // Array.from(map.entries()).forEach(), which avoids ESLint's no-restricted-syntax rule.
    Array.from(expectedImageUrlMapping.entries()).forEach(([key, expectedValue]) => {
      // the original image urls may be relative, so we need to get the full url for comparison
      const actualValue = actualImageUrlMapping.get(getFullAssetUrl(key, PAGE_URL));
      expect(actualValue, `Mismatch for key: ${key}, expected: ${expectedValue}, got: ${actualValue}`)
        .to.equal(expectedValue);
    });
  });

  it('should handle XML parsing errors in updateAssetReferences', async () => {
    const invalidXml = '<invalid><xml>';
    const imageUrls = await getImageUrlKeysArray();
    const result = await updateAssetReferences(
      invalidXml,
      PAGE_URL,
      ASSET_FOLDER_NAME,
      imageUrls,
    );
    expect(result, 'Expected the original invalid XML to be returned').to.equal(invalidXml);
  });

  it('should create a JCR package with empty pages', async () => {
    const dir = {}; // Mock directory handle
    const pages = [];
    const imageUrls = [];
    const siteFolderName = 'site';
    const assetFolderName = 'assets';

    await createJcrPackage(dir, pages, imageUrls, siteFolderName, assetFolderName);
    // No assertions needed, just ensure no errors are thrown
  });

  it('should create a JCR package with valid pages', async () => {
    const pages = [
      {
        path: '/content/site/page1',
        data: await loadFile(ORIGINAL_XML_PATH),
        url: PAGE_URL,
      },
    ];
    const imageUrls = await getImageUrlKeysArray();
    const siteFolderName = 'site';
    const assetFolderName = 'assets';

    await createJcrPackage(outdir, pages, imageUrls, siteFolderName, assetFolderName);
    // No assertions needed, just ensure no errors are thrown
  });

  it('should handle empty ancestor pages in createJcrPackage', async () => {
    const pages = [
      {
        path: '/content/site/page1',
        data: await loadFile(ORIGINAL_XML_PATH),
        url: PAGE_URL,
      },
    ];
    const imageUrls = await getImageUrlKeysArray();
    const siteFolderName = 'site';
    const assetFolderName = 'assets';

    await createJcrPackage(outdir, pages, imageUrls, siteFolderName, assetFolderName);
    // No assertions needed, just ensure no errors are thrown
  });
});
