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

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index += 1) {
    // eslint-disable-next-line no-await-in-loop
    await callback(array[index], index, array);
  }
}

/**
 * Return the filesystem handle to the parent directory of a file creating necessary directories
 * if required to the file path location.
 * @param rootDir - The root directory to create the folders and file beneath.
 * @param filePath - The path to the file.
 * @return {Promise<FileSystemDirectoryHandle>}
 */
async function getParentDirectory(rootDir, filePath) {
  let dir = rootDir;
  const folders = filePath.split('/');
  await asyncForEach(folders, async (folder, i) => {
    if (folder && i < folders.length - 1) {
      dir = await dir.getDirectoryHandle(folder, { create: true });
    }
  });

  return dir;
}

/**
 * Save a file to the filesystem.
 * @param {FileSystemDirectoryHandle} dirHandle - The directory handle to save the file to.
 * @param {string} path - The path to the file.
 * @param {string} content - The content to save to the file.
 * @return {Promise<void>} - A promise that resolves when the file is saved.
 */
async function saveFile(dirHandle, path, content) {
  if (!dirHandle) {
    throw new Error('No directory handle provided');
  }
  const fileName = path.split('/').pop();
  const dir = await getParentDirectory(dirHandle, path);
  const fileHandle = await dir.getFileHandle(fileName, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(content);
  return writable.close();
}

export {
  saveFile,
};
