import { expect } from 'chai';
import { readFileSync } from 'fs';
import { join } from 'path';
import transform, { registerTransformer } from '../../src/transformation/transformation.js';

/* eslint-env mocha */

describe('transformer loader', () => {
  let fixturePath;
  let xmlFixture;

  before(() => {
    fixturePath = join(process.cwd(), 'test', 'fixtures', 'transformation', 'rules');
    xmlFixture = readFileSync(join(fixturePath, 'blog.xml'), 'utf8');
  });

  it('should load and register a transformer from a JavaScript file', async () => {
    // Import the transformer module
    const uppercaseTransformer = await import('../fixtures/transformation/rules/uppercase.js');

    // Register the transformer
    registerTransformer('uppercase', uppercaseTransformer.default);

    // Create rules that use the new transformer
    const rules = {
      'blog-entry': {
        title: 'uppercase',
      },
    };

    // Transform the XML
    const result = transform(xmlFixture, rules);

    // Verify the transformation was applied
    expect(result).to.include('title="PAGE 1"');
    expect(result).to.include('title="PAGE 2"');
  });

  it('should handle multiple transformers', async () => {
    // Import and register the uppercase transformer
    const uppercaseTransformer = await import('../fixtures/transformation/rules/uppercase.js');
    registerTransformer('uppercase', uppercaseTransformer.default);

    // Create rules that use multiple transformers
    const rules = {
      'blog-entry': {
        title: 'uppercase',
        path: 'aem-content',
      },
    };

    // Transform the XML
    const result = transform(xmlFixture, rules);

    // Verify both transformations were applied
    expect(result).to.include('title="PAGE 1"');
    expect(result).to.include('path="/content/xwalk/blogs/page1"');
  });

  it('should throw an error when registering a non-function transformer', async () => {
    // Try to register a non-function value
    expect(() => {
      registerTransformer('invalid', 'not a function');
    }).to.throw('Transformer must be a function');
  });
});
