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
import path from 'path';
import { mkdir, writeFile } from 'fs/promises';

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index += 1) {
    // eslint-disable-next-line no-await-in-loop
    await callback(array[index], index, array);
  }
}

// Node.js implementation
async function createDirectoryNode(rootDir, folder) {
  const newDirPath = `${rootDir}/${folder}`;
  await mkdir(newDirPath, { recursive: true });
  return path.resolve(newDirPath);
}

// Browser implementation
async function createDirectoryBrowser(rootDir, folder) {
  return rootDir.getDirectoryHandle(folder, { create: true });
}

async function createDirectory(rootDir, folder) {
  if (typeof window !== 'undefined' && window.showDirectoryPicker) {
    // Browser environment using File System Access API
    return createDirectoryBrowser(rootDir, folder);
  }

  // Node.js environment using fs module
  return createDirectoryNode(rootDir, folder);
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
      dir = await createDirectory(dir, folder);
    }
  });

  return dir;
}

const writeBrowserFile = async (dir, fileName, content) => {
  const fileHandle = await dir.getFileHandle(fileName, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(content);
  return writable.close();
};

const writeFileToDir = async (dir, fileName, content) => {
  if (typeof window !== 'undefined' && window.showDirectoryPicker) {
    return writeBrowserFile(dir, fileName, content);
  }
  // Node.js environment using fs module
  return writeFile(`${dir}/${fileName}`, content);
};

/**
 * Save a file to the filesystem.
 * @param {string} directoryPath - The directory handle to save the file to.
 * @param {string} filePath - The path to the file.
 * @param {string} content - The content to save to the file.
 * @return {Promise<void>} - A promise that resolves when the file is saved.
 */
async function saveFile(directoryPath, filePath, content) {
  if (!directoryPath) {
    throw new Error('No directory handle provided');
  }
  const fileName = filePath.split('/').pop();
  const dir = await getParentDirectory(directoryPath, filePath);
  return writeFileToDir(dir, fileName, content);
}

export {
  saveFile,
};
