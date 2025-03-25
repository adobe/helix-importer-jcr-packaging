import { expect } from 'chai';
import { readFileSync } from 'fs';
import { join } from 'path';
import transform from '../../src/transformation/transformation.js';

/* eslint-env mocha */

describe('transformation rules', () => {
  let fixturePath;
  let blogPageXml;
  const rulesFixture = {
    'blog-entry': {
      path: 'aem-content',
    },
  };

  const context = {
    siteFolderName: 'xwalk',
  };

  before(() => {
    fixturePath = join(process.cwd(), 'test', 'fixtures', 'transformation', 'rules');
    blogPageXml = readFileSync(join(fixturePath, 'blog.xml'), 'utf8');
  });

  describe('transform function with aem-content rule', () => {
    it('should apply aem-content transformation to specified fields', () => {
      const result = transform(blogPageXml, rulesFixture, context);

      // Verify the transformation was applied to the path field
      expect(result).to.include('path="/content/xwalk/blogs/page1"');
      expect(result).to.include('path="/content/xwalk/blogs/page2"');

      // page 3 is a full qualified path, so it should be transformed by using
      // the pathname of the url as the path to be added to the content folder
      expect(result).to.include('path="/content/xwalk/blogs/page3"');
    });

    it('should only transform fields specified in the rules', () => {
      const result = transform(blogPageXml, rulesFixture, context);

      // Verify non-specified fields remain unchanged
      expect(result).to.include('path="/content/xwalk/blogs/page1"');
      expect(result).to.include('path="/content/xwalk/blogs/page2"');
      expect(result).to.include('title="Page 1"');
      expect(result).to.include('title="Page 2"');
    });

    it('should handle multiple transformation rules', () => {
      const extendedRules = {
        ...rulesFixture,
        'blog-entry': {
          ...rulesFixture['blog-entry'],
          title: 'aem-content',
        },
      };

      const result = transform(blogPageXml, extendedRules, context);

      // Verify both path and link are transformed
      expect(result).to.include('path="/content/xwalk/blogs/page1"');
      expect(result).to.include('path="/content/xwalk/blogs/page1"');
      expect(result).to.include('title="/content/xwalk/Page 1"');
      expect(result).to.include('title="/content/xwalk/Page 2"');
    });

    it('should preserve XML structure and non-transformed attributes', () => {
      const result = transform(blogPageXml, rulesFixture, context);

      // Verify the overall structure is preserved
      expect(result).to.include('<?xml version="1.0" encoding="UTF-8"?>');
      expect(result).to.include('<jcr:root');
      expect(result).to.include('<jcr:content');
      expect(result).to.include('<root');
      expect(result).to.include('<section');
      expect(result).to.include('<block');

      // Verify non-transformed attributes remain unchanged
      expect(result).to.include('model="blog-entry"');
      expect(result).to.include('title="Blogs"');
      expect(result).to.include('type="h1"');
      expect(result).to.include('filter="blogs"');
      expect(result).to.include('name="Blogs"');
    });

    it('should handle unknown transformation types gracefully', () => {
      const invalidRules = {
        'blog-entry': {
          path: 'unknown-transform',
        },
      };

      const result = transform(blogPageXml, invalidRules, context);

      // Verify the field remains unchanged when transformation type is unknown
      expect(result).to.include('path="/blogs/page1"');
      expect(result).to.include('path="/blogs/page2"');
    });

    it('transformation should sanitize jcr paths', () => {
      let content = blogPageXml;
      content = content.replace(/\/blogs\/page2/g, '/blogs/page2{with}invalid-chars');
      const result = transform(content, rulesFixture, context);

      // Verify the field remains unchanged when transformation type is unknown
      expect(result).to.include('path="/content/xwalk/blogs/page2-with-invalid-chars"');
    });

    it('should handle /content/ in the path', () => {
      const result = transform(blogPageXml, rulesFixture, context);
      expect(result).to.include('path="/content/xwalk/myfolder/page4"');
    });
  });
});
