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
import he from 'he';
import { DOMParser } from '@xmldom/xmldom';
import { formatXML } from '../shared/xml.js';

/**
 * Get the parsed XML document.
 * @param {string} xmlString - The XML string to parse.
 * @returns {*|Document} - The parsed XML document.
 */
export const getParsedXml = (xmlString) => {
  const parser = new DOMParser();
  return parser.parseFromString(xmlString, 'text/xml');
};

/**
 * Get the properties of a page from the jcr:content node.
 * @param {string} xml the XML string of the page
 * @returns the properties of the jcr:content node
 */
export const getPageProperties = (xml) => {
  const doc = getParsedXml(xml);

  // get the jcr:content node properties
  const namespaceURI = 'http://www.jcp.org/jcr/1.0';
  const localName = 'content';
  const jcrContent = doc.getElementsByTagNameNS(namespaceURI, localName)[0];
  // eslint-disable-next-line max-len
  // return jcrContent ? jcrContent.getAttributeNames() : [];
  return jcrContent ? Array.from(jcrContent.attributes).map((attr) => attr.name) : [];
};

/**
 * Get the children of the jcr:content node.
 * @param {string} xml the XML string of the page
 * @returns the children of the jcr:content node
 */
export const getPageContentChildren = (xml) => {
  const doc = getParsedXml(xml);

  // get the names of the jcr:content node children
  const namespaceURI = 'http://www.jcp.org/jcr/1.0';
  const localName = 'content';
  const jcrContent = doc.getElementsByTagNameNS(namespaceURI, localName)[0];
  const children = jcrContent?.children;
  return children ? Array.from(children).map((child) => child.tagName) : [];
};

/**
 * Generate the properties.xml file for the content package.
 * @param {string} packageName the name of the package
 * @returns the properties.xml file
 */
export const getPropertiesXml = (packageName) => {
  const author = 'anonymous';
  const now = new Date().toISOString();
  let propXml = `<?xml version='1.0' encoding='UTF-8'?>
    <!DOCTYPE properties SYSTEM 'http://java.sun.com/dtd/properties.dtd'>
    <properties>
      <comment>FileVault Package Properties</comment>
      <entry key='description'></entry>
      <entry key='generator'>org.apache.jackrabbit.vault:3.7.1-T20231005151103-335689a8</entry>
      <entry key='packageType'>content</entry>
      <entry key='lastWrappedBy'>${author}</entry>
      <entry key='packageFormatVersion'>2</entry>
      <entry key='group'>my_packages</entry>
      <entry key='created'>${now}</entry>
      <entry key='lastModifiedBy'>${author}</entry>
      <entry key='buildCount'>1</entry>
      <entry key='lastWrapped'>${now}</entry>
      <entry key='version'></entry>
      <entry key='dependencies'></entry>
      <entry key='createdBy'>${author}</entry>
      <entry key='name'>${packageName}</entry>
      <entry key='lastModified'>${now}</entry>
    </properties>`;
  const propXmlPath = 'META-INF/vault/properties.xml';
  propXml = formatXML(propXml);
  return { propXmlPath, propXml };
};

/**
 * Generate the filter.xml file for the content package based on the JCR pages.
 * @param {Array<Page>} jcrPages the pages to include in the package.
 * @returns the filter.xml file
 */
export const getFilterXml = (jcrPages) => {
  const pageFilters = jcrPages.reduce((acc, page) => `${acc}<filter root='${page.jcrPath}'></filter>\n`, '');

  let filterXml = `<?xml version='1.0' encoding='UTF-8'?>
    <workspaceFilter version='1.0'>
      ${pageFilters}
    </workspaceFilter>`;
  const filterXmlPath = 'META-INF/vault/filter.xml';

  filterXml = formatXML(filterXml);
  return { filterXmlPath, filterXml };
};

/**
 * Generate a package name based on the site name and the pages.
 * If there is only one page, the package name will be the site folder name
 * followed by the page name. If there are multiple pages, the package name
 * will be the site folder name.
 * @param {Array<Page>} pages the pages to be included in the package.
 * @param {string} siteFolderName the name of the site folder(s) in AEM.
 * @returns {string} the package name.
 */
export const getPackageName = (pages, siteFolderName) => {
  if (pages.length === 1) {
    const pageName = pages[0].path.split('/').pop();
    return `${siteFolderName}_${pageName}`;
  }
  return siteFolderName;
};

/**
 * Sanitizes a JCR (Java Content Repository) path by replacing invalid characters with hyphens.
 * Applies different sanitization rules for folders versus files:
 * - Folders: Replaces spaces, tabs, and special characters (* / : [ \ ] | # % { } ? " ^ ; + &)
 * with hyphens
 * - Files: Replaces special characters (* / : [ \ ] | # % { } ? &) with hyphens
 *
 * @param {string} jcrPath - The JCR path to sanitize
 * @returns {string} The sanitized path with invalid characters replaced by hyphens
 * @example
 * fixPath('/content/my folder/file*name.txt')
 * // Returns: '/content/my-folder/file-name.txt'
 */
export const getSanitizedJcrPath = (jcrPath) => {
  const folderRegex = /[\s\t*/:[\]|#%{}?"^;+&]/g;
  const fileRegex = /[*/:[\]|#%{}?&]/g;
  const replacementChar = '-';

  const parts = jcrPath.split('/');
  const fileName = parts.pop();

  return [
    ...parts.map((folder) => folder.replace(folderRegex, replacementChar)),
    fileName.replace(fileRegex, replacementChar),
  ].join('/');
};

/**
 * Get the JCR page path based on the site folder name and the path.
 * @param {string} pagePath the path of the page
 * @param {string} sitePath the path of the site's folder in AEM
 * @returns {string} the JCR page path
 */
export const getJcrPagePath = (pagePath, sitePath) => {
  let jcrPagePath;
  if (pagePath.startsWith('/content/')) {
    // if the page already starts with the pagePath, then we are good
    if (pagePath.startsWith(sitePath)) {
      return getSanitizedJcrPath(pagePath);
    }

    const tokens = pagePath.split('/');
    // if we have more than 2 tokens and the 3rd token is not the site folder name
    // then we slide in the site folder name at the 3rd position
    if (tokens.length > 2 && tokens[2] !== sitePath) {
      tokens.splice(2, 0, sitePath);
    }
    jcrPagePath = tokens.join('/');
  } else {
    // eslint-disable-next-line no-param-reassign
    pagePath = pagePath.replace(/^\/+/, '');
    if (!sitePath.startsWith('/content/')) {
      // eslint-disable-next-line no-param-reassign
      sitePath = `/content/${sitePath}`;
    }
    jcrPagePath = `${sitePath}/${pagePath}`;
  }
  return getSanitizedJcrPath(jcrPagePath);
};

/**
 * Get the JCR path for an asset.
 * NOTE: We use lower case for the asset folder names, since in AEM DAM
 * paths are case-sensitive; AEM automatically generates a JCR node name
 * that follows a lowercase, so reference paths should also use lower case.
 * @param {URL} assetUrl - The URL of the asset
 * @param {string} assetFolderName - The name of the asset folder(s) in AEM
 * @returns {string} the JCR path for the asset.
 */
export const getJcrAssetPath = (assetUrl, assetFolderName) => {
  let path = assetUrl.pathname;
  let jcrAssetPath;
  // Extract file extension (only the last part)
  const lastDotIndex = path.lastIndexOf('.');
  let extension = '';

  // if there is a valid extension, remove it from the path
  if (lastDotIndex !== -1 && lastDotIndex > path.lastIndexOf('/')) {
    extension = path.substring(lastDotIndex);
    // Remove only the last extension from path
    path = path.substring(0, lastDotIndex);
  }

  if (path.startsWith('/content/dam/')) {
    const tokens = path.split('/');
    const assetFolderTokens = assetFolderName.split('/');

    // Find and remove existing occurrence of assetFolderName
    for (let i = 3; i <= tokens.length - assetFolderTokens.length; i += 1) {
      if (tokens.slice(i, i + assetFolderTokens.length).join('/') === assetFolderName) {
        tokens.splice(i, assetFolderTokens.length);
        break;
      }
    }

    // insert the assetFolderName in index position 3 ("", /content, /dam)
    // and move everything after over resulting in /content/dam/<site>/<asset_path>
    tokens.splice(3, 0, ...assetFolderTokens);

    jcrAssetPath = `${tokens.join('/')}${extension}`;
  } else {
    // replace media_ with media1_ in path to avoid conflicts with the media folder
    path = path.replace('/media_', '/media1_');
    jcrAssetPath = `/content/dam/${assetFolderName}${path}${extension}`;
  }
  return getSanitizedJcrPath(jcrAssetPath).toLowerCase();
};

/**
 * Get the JCR path for a asset reference.
 * @param {string} assetReference the asset reference
 * @param {string} pageUrl the URL of the page
 * @param {string} assetFolderName the name of the asset folder(s) in AEM
 * @returns {string} the JCR path for the file reference
 */
const getJcrAssetRef = (assetReference, pageUrl, assetFolderName) => {
  const host = new URL(pageUrl).origin;
  let jcrPath = assetReference;
  let url;
  const pagePath = new URL(pageUrl).pathname;

  if (assetReference.startsWith('http')) {
    // external fileReference
    url = new URL(assetReference);
    jcrPath = getJcrAssetPath(url, assetFolderName);
  } else if (assetReference.startsWith('/content/dam/')) {
    // DAM fileReference
    url = new URL(`${host}${assetReference}`);
    jcrPath = getJcrAssetPath(url, assetFolderName);
  } else if (assetReference.startsWith('/')) {
    // absolute fileReference
    url = new URL(`${host}${assetReference}`);
    jcrPath = getJcrAssetPath(url, assetFolderName);
  } else if (assetReference.startsWith('./')) {
    // relative fileReference: use the page path to make it an absolute path
    const parentPath = pagePath.substring(0, pagePath.lastIndexOf('/'));
    // eslint-disable-next-line no-param-reassign
    url = new URL(`${host}${parentPath}${assetReference.substring(1)}`);
    jcrPath = getJcrAssetPath(url, assetFolderName);
  }
  return jcrPath;
};

/**
 * Converts an asset reference (relative or absolute path) into a fully qualified URL
 * based on the page URL.
 * @param {string} assetReference - The asset reference (relative or absolute path).
 * @param {string} pageUrl - The full URL of the current page.
 * @returns {string|null} - The fully qualified URL or null if the input is invalid.
 */
export function getFullAssetUrl(assetReference, pageUrl) {
  if (!assetReference) return null;

  // Already a full URL, return as is
  if (assetReference.startsWith('http://') || assetReference.startsWith('https://')) {
    return assetReference;
  }

  const pageUrlObj = new URL(pageUrl); // Parse only once

  // If the asset reference starts with './', it is a relative file path
  if (assetReference.startsWith('./')) {
    return new URL(assetReference, pageUrlObj.href).href;
  }

  // Absolute asset reference, appending the asset path to the host
  return `${pageUrlObj.origin}${assetReference}`;
}

/**
 * Update the JCR asset map with the jcr asset path.
 * @param {Map} jcrAssetMap - The map of asset references to their corresponding JCR paths
 * @param {string} originalPath - The original asset path
 * @param {string} updatedAssetPath - The updated jcr asset path
 * @param {string} pageUrl - The URL of the page
 */
function updateJcrAssetMap(jcrAssetMap, originalPath, updatedAssetPath, pageUrl) {
  const fullyQualifiedUrl = getFullAssetUrl(originalPath, pageUrl);
  jcrAssetMap.delete(originalPath); // delete the original path entry first
  jcrAssetMap.set(fullyQualifiedUrl, updatedAssetPath); // add the new mapping entry
}

/**
 * Traverse the DOM tree and update the asset references to point to the JCR paths.
 * @param {*} node - The node to traverse
 * @param {string} pageUrl - The URL of the page
 * @param {string} assetFolderName - The name of the asset folder(s) in AEM
 * @param {Map} jcrAssetMap - A map of asset references to their corresponding JCR paths
 */
export const traverseAndUpdateAssetReferences = (node, pageUrl, assetFolderName, jcrAssetMap) => {
  if (node.nodeType === 1) { // Element node
    // eslint-disable-next-line no-restricted-syntax
    for (const attr of node.attributes) {
      // Unescape HTML entities (needs double decoding as asset urls are double encoded in the xml)
      // console.log(`Checking attribute: ${attr.name}`);
      let attrValue = he.decode(he.decode(node.getAttribute(attr.name)));
      const keys = [...jcrAssetMap.keys()];
      keys.forEach((key) => {
        if (attrValue.includes(key)) {
          const jcrAssetPath = getJcrAssetRef(key, pageUrl, assetFolderName);
          // update the map with the new jcr path
          updateJcrAssetMap(jcrAssetMap, key, jcrAssetPath, pageUrl);
          // update the attribute value with the new jcr path
          attrValue = attrValue.replace(key, jcrAssetPath);
          node.setAttribute(attr.name, he.encode(attrValue));
        }
      });
    }
  }
  // Traverse child nodes
  for (let i = 0; i < node.childNodes.length; i += 1) {
    traverseAndUpdateAssetReferences(node.childNodes[i], pageUrl, assetFolderName, jcrAssetMap);
  }
};

/**
 * Return the String representation of the XML document for an empty page.
 * @returns {string} - The XML string representation of the empty page template.
 */
export const getEmptyPageTemplate = () => `<?xml version="1.0" encoding="UTF-8"?>
<jcr:root xmlns:jcr="http://www.jcp.org/jcr/1.0" xmlns:nt="http://www.jcp.org/jcr/nt/1.0" xmlns:cq="http://www.day.com/jcr/cq/1.0" xmlns:sling="http://sling.apache.org/jcr/sling/1.0" jcr:primaryType="cq:Page">
  <jcr:content cq:template="/libs/core/franklin/templates/page" jcr:primaryType="cq:PageContent" sling:resourceType="core/franklin/components/page/v1/page"/>
</jcr:root>`;
