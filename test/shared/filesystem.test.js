import sinon from 'sinon';
import { expect } from 'chai';
import { saveFile } from '../../src/shared/filesystem.js';

/* eslint-env mocha */
// write a test that tests the filesystem.js code
describe('filesystem', () => {
  const content = '<xml></xml>';
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
  });

  it('should save a file in two folders deep', async () => {
    const prefix = 'folder/a/b.xml';
    await saveFile(dirHandle, prefix, content);

    // expect that getDirectoryHandle is called twice once per folder
    expect(dirHandle.getDirectoryHandle.calledTwice).to.be.equal(true);
    expect(writeSpy.calledOnce).to.be.equal(true);
    expect(writeSpy.calledWith(content)).to.be.equal(true);
  });

  it('should save a file in the root', async () => {
    const prefix = 'b.xml';
    await saveFile(dirHandle, prefix, content);

    // expect that getDirectoryHandle is not called as the file is in the root dir
    expect(dirHandle.getDirectoryHandle.calledOnce).to.be.equal(false);
    expect(writeSpy.calledOnce).to.be.equal(true);
    expect(writeSpy.calledWith(content)).to.be.equal(true);
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
