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

// Regex for inline images & reference-style images
// 1. inline images: ![Alt text](url "title")
// 2. reference-style images: ![Alt text][ReferenceLabel]
const imageRegex = /!\[([^\]]*)]\(([^) "]+)(?: *"([^"]*)")?\)|!\[([^\]]*)]\[([^\]]+)]/g;

// Regex for reference definitions
const referenceRegex = /\[([^\]]+)]:\s*(\S+)/g;

// Regex for non-image asset links (PDFs, docs, excel etc.)
const nonImageAssetRegex = /(?:\[(.*?)\]|\[.*?\])\(([^)]+\.(?:pdf|doc|docx|xls|xlsx|ppt|pptx|odt|ods|odp|rtf|txt|csv))\)|\[(.*?)\]:\s*(\S+\.(?:pdf|doc|docx|xls|xlsx|ppt|pptx|odt|ods|odp|rtf|txt|csv))/gi;

/**
 * Function to find reference definitions in a markdown file.
 *
 * @param markdownContent - The content of the markdown file
 * @returns {{label: string, url: string}} A map of reference definitions
 */
const findReferenceDefinitionsInMarkdown = (markdownContent) => {
  const references = {};
  let match;
  // eslint-disable-next-line no-cond-assign
  while ((match = referenceRegex.exec(markdownContent)) !== null) {
    // eslint-disable-next-line prefer-destructuring
    references[match[1]] = match[2]; // Map: referenceLabel -> URL
  }
  return references;
};

/**
 * Function to scan for assets in a markdown file.
 *
 * @param markdownContent - The content of the markdown file
 * @returns {Array<string>} A Map of asset urls as key
 */
const findAssetsInMarkdown = (markdownContent) => {
  const references = findReferenceDefinitionsInMarkdown(markdownContent);

  const assetUrls = [];

  // Identify each image url in the markdown content
  let match;
  let url;
  // eslint-disable-next-line no-cond-assign
  while ((match = imageRegex.exec(markdownContent)) !== null) {
    if (match[2]) { // Inline image
      // eslint-disable-next-line prefer-destructuring
      url = match[2];
    } else if (match[5]) { // Reference-style image
      url = references[match[5]] || null; // Resolve URL from reference map
    }
    if (url) {
      assetUrls.push(url);
    }
  }

  // Find and add only non-image asset links
  // eslint-disable-next-line no-cond-assign
  while ((match = nonImageAssetRegex.exec(markdownContent)) !== null) {
    url = match[2] || match[3];
    if (url) {
      assetUrls.push(url);
    }
  }

  return assetUrls;
};

/**
 * Get the list asset urls present in the markdown.
 * @param {string} markdownContent - The content of the markdown file
 * @returns {Array<string>} An array of asset urls.
 */
const getAssetUrlsFromMarkdown = (markdownContent) => {
  try {
    return findAssetsInMarkdown(markdownContent);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Error getting asset urls from markdown:', error);
    return [];
  }
};

export {
  // eslint-disable-next-line import/prefer-default-export
  getAssetUrlsFromMarkdown,
};
