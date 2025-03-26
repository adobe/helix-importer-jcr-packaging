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
import {
  getJcrPagePath,
} from '../../package/packaging.utils.js';

/**
 * Transform a value into an AEM content path by taking the value, and
 * adjusting the path to include a prefix of /content, followed by the
 * site name, and the existing value.
 *
 * If the value starts with /content/${siteName}/, it will be returned as is.
 *
 * @param value - The value to transform
 * @param {Object} context - The context object.
 * @param {string} context.siteFolderName - The name of the site.
 * @return {string} - The transformed value
 */
export default function transform(value, context) {
  if (!value) return '';
  const { siteFolderName } = context;

  let path = value;

  try {
    const url = new URL(path);
    path = url.pathname;
  } catch (error) {
    // if the value is not a URL, then we can ignore the error
  }

  return getJcrPagePath(path, siteFolderName);
}
