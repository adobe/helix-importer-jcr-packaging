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
import JSZip from 'jszip';
import { XMLSerializer } from '@xmldom/xmldom';
import {
  getParsedXml,
  getPageProperties,
  getPageContentChildren,
  getPropertiesXml,
  getFilterXml,
  getPackageName,
  getJcrPagePath,
  traverseAndUpdateAssetReferences,
  getEmptyPageTemplate,
} from './packaging.utils.js';
import { saveFile } from '../shared/filesystem.js';
import { formatXML } from '../shared/xml.js';

let jcrPages = [];
const ASSET_MAPPING_FILE = 'asset-mapping.json';

const init = () => {
  jcrPages = [];
};

const addPage = async (page, dir, prefix, zip) => {
  const xml = formatXML(page.processedXml);
  zip.file(page.contentXmlPath, xml);
  await saveFile(dir, `${prefix}/${page.contentXmlPath}`, xml);
};

/**
 * Updates the asset references in given xml, to point to their respective JCR paths
 * @param {string} xml - The xml content of the page
 * @param {string} pageUrl - The url of the site page
 * @param {string} assetFolderPath - The path under /content/dam where the assets are stored.
 * @param {Map} assetMappings - A map to store the asset urls and their corresponding jcr paths
 * @returns {Promise<*|string>} - The updated xml content
 */
export const updateAssetReferences = async (xml, pageUrl, assetFolderPath, assetMappings) => {
  let doc;
  try {
    doc = getParsedXml(xml);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error parsing the XML document for the JCR page', pageUrl, error.message);
    return xml;
  }

  // Start traversal from the document root and update the asset references
  traverseAndUpdateAssetReferences(doc.documentElement, pageUrl, assetFolderPath, assetMappings);

  const serializer = new XMLSerializer();
  return serializer.serializeToString(doc);
};

// eslint-disable-next-line max-len
export const getJcrPages = async (pages, siteFolderName, assetFolderPath, assetMappings) => Promise.all(pages.map(async (page) => ({
  path: page.path,
  sourceXml: page.data,
  pageProperties: getPageProperties(page.data),
  pageContentChildren: getPageContentChildren(page.data),
  processedXml: await updateAssetReferences(
    page.data,
    page.url,
    assetFolderPath,
    assetMappings,
  ),
  jcrPath: getJcrPagePath(page.path, siteFolderName),
  contentXmlPath: `jcr_root${getJcrPagePath(page.path, siteFolderName)}/.content.xml`,
  url: page.url,
})));

const addFilterXml = async (dir, prefix, zip) => {
  const { filterXmlPath, filterXml } = getFilterXml(jcrPages);
  zip.file(filterXmlPath, filterXml);
  await saveFile(dir, `${prefix}/${filterXmlPath}`, filterXml);
};

const addPropertiesXml = async (dir, prefix, zip, packageName) => {
  const { propXmlPath, propXml } = getPropertiesXml(packageName);
  zip.file(propXmlPath, propXml);
  await saveFile(dir, `${prefix}/${propXmlPath}`, propXml);
};

const getEmptyAncestorPages = (pages) => {
  const seenAncestors = new Set();
  const jcrPaths = pages.map((page) => page.jcrPath);
  const emptyAncestors = [];
  const ancestorXml = getEmptyPageTemplate();

  jcrPaths.forEach((pagePath) => {
    const pathSegments = pagePath.split('/');
    let ancestorPath = '';

    // all pagePath should start with /content by now
    const startIndex = pagePath.startsWith('/content') ? 1 : 2;

    for (let i = startIndex; i < pathSegments.length - 1; i += 1) {
      ancestorPath += `/${pathSegments[i]}`;

      if (!seenAncestors.has(ancestorPath) && !jcrPaths.includes(ancestorPath)) {
        seenAncestors.add(ancestorPath);
        emptyAncestors.push({
          jcrPath: ancestorPath,
          contentXmlPath: `jcr_root${ancestorPath}/.content.xml`,
          processedXml: ancestorXml,
        });
      }
    }
  });

  return emptyAncestors;
};

/**
 * Save the asset mappings to a file.
 * @param {Map} assetMappings - A map of asset urls and their corresponding jcr paths
 * @param {*} outputDirectory - The directory handle
 */
const saveAssetMappings = async (assetMappings, outputDirectory) => {
  // Convert Map to a plain object
  const obj = Object.fromEntries(assetMappings);

  // Save the updated asset mapping content into a file
  await saveFile(outputDirectory, ASSET_MAPPING_FILE, JSON.stringify(obj, null, 2));
};

/**
 * Creates a JCR content package from a directory containing pages.
 * @param {*} outputDirectory - The directory handle
 * @param {Array} pages - An array of pages
 * @param {Array<string>} assetUrls - An array of asset urls that were found in the markdown.
 * @param {string} siteContentPath - The path to the site content in AEM under /content.
 * @param {string} assetDamPath - The path to the assets in AEM under /content/dam.
 * @returns {Promise<void>} - The promise is resolved when the package is created.
 */
export const createJcrPackage = async (
  outputDirectory,
  pages,
  assetUrls,
  siteContentPath,
  assetDamPath,
) => {
  if (pages.length === 0) {
    return;
  }

  init();

  let siteName = siteContentPath;
  let assetFolder = assetDamPath;
  if (siteContentPath.startsWith('/content/')) {
    // just pull the site name from the path
    // eslint-disable-next-line prefer-destructuring
    siteName = siteContentPath.split('/')[2];
  }

  if (assetDamPath.startsWith('/content/dam/')) {
    // just pull the site name from the path
    // eslint-disable-next-line prefer-destructuring
    assetFolder = assetDamPath.replace('/content/dam/', '');
  }

  // remove any trailing slashes
  siteName = siteName.replace(/\/+$/, '');
  assetFolder = assetFolder.replace(/\/+$/, '');

  const packageName = getPackageName(pages, siteName);
  const zip = new JSZip();
  const prefix = 'jcr';

  // create a map using the provided asset urls as keys (values will be populated later)
  const assetMappings = new Map(assetUrls.map((url) => [url, '']));

  // add the pages
  jcrPages = await getJcrPages(pages, siteContentPath, assetFolder, assetMappings);
  for (let i = 0; i < jcrPages.length; i += 1) {
    const page = jcrPages[i];
    // eslint-disable-next-line no-await-in-loop
    await addPage(page, outputDirectory, prefix, zip);
  }

  // add the empty ancestor pages
  const emptyAncestorPages = getEmptyAncestorPages(jcrPages);
  for (let i = 0; i < emptyAncestorPages.length; i += 1) {
    const page = emptyAncestorPages[i];
    // eslint-disable-next-line no-await-in-loop
    await addPage(page, outputDirectory, prefix, zip);
  }

  // add the filter.xml file
  await addFilterXml(outputDirectory, prefix, zip);

  // add the properties.xml file
  await addPropertiesXml(outputDirectory, prefix, zip, packageName);

  const outputType = typeof window !== 'undefined' ? 'blob' : 'nodebuffer';

  // save the zip file
  await zip.generateAsync({ type: outputType })
    .then(async (blob) => saveFile(outputDirectory, `${packageName}.zip`, blob));

  await saveAssetMappings(assetMappings, outputDirectory);
};
