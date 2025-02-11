import sinon from 'sinon';
import { expect } from 'chai';
import { rmdir } from 'fs/promises';
import { existsSync } from 'fs';
import { saveFile } from '../../src/shared/filesystem.js';

/* eslint-env mocha */
// write a test that tests the filesystem.js code
describe('filesystem', () => {
  const content = '<xml></xml>';
  const rootDir = 'output';
  let outDir;

  beforeEach(() => {
    // create a unique director for each test
    outDir = `./${rootDir}/test-${Date.now()}`;
  });

  afterEach(() => {
    rmdir(rootDir, { recursive: true, force: true });
  });

  describe('node', () => {
    it('node validate saving file', async () => {
      const filename = 'folder/a/b.xml';
      await saveFile(outDir, filename, content);
      expect(existsSync(`${outDir}/${filename}`)).to.equal(true);
    });
  });

  describe('browser', () => {
    let dirHandle;
    let writeSpy;

    beforeEach(() => {
      writeSpy = sinon.spy();
      dirHandle = {
        getDirectoryHandle: sinon.stub().returnsThis(),
        getFileHandle: sinon.stub().resolves({
          createWritable: sinon.stub().resolves({
            write: writeSpy,
            close: sinon.stub().resolves(),
          }),
        }),
      };

      global.window = {
        showDirectoryPicker: sinon.stub().resolves(dirHandle),
      };
    });

    it('should save a file in two folders deep', async () => {
      const filename = 'folder/a/b.xml';
      await saveFile(dirHandle, filename, content);
      // expect that getDirectoryHandle is called twice once per folder
      expect(dirHandle.getDirectoryHandle.calledTwice).to.be.equal(true);
      expect(writeSpy.calledOnce).to.be.equal(true);
      expect(writeSpy.calledWith(content)).to.be.equal(true);
    });

    it('should save a file in the root', async () => {
      const filename = 'b.xml';
      await saveFile(dirHandle, filename, content);

      // expect that getDirectoryHandle is not called as the file is in the root dir
      expect(dirHandle.getDirectoryHandle.calledOnce).to.be.equal(false);
      expect(writeSpy.calledOnce).to.be.equal(true);
      expect(writeSpy.calledWith(content)).to.be.equal(true);
    });
  });

  // verify that an error is thrown when the dirHandle is not provided
  it('should throw an error when no directory handle is provided', async () => {
    try {
      await saveFile(null, 'b.xml', content);
    } catch (error) {
      expect(error.message).to.be.equal('No directory handle provided');
    }
  });
});
