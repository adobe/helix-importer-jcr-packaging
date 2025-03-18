import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import aemContent from './rules/aem-content.js';

// Map of transformation types to their functions
const TRANSFORMATIONS = {
  'aem-content': aemContent,
  // Add other transformation types here as needed
};

/**
 * Register a new transformation function
 * @param {string} name - The name of the transformation type
 * @param {Function} transformFn - The transformation function to register
 * @package {Object} context - object that contains properties that can be accessed by
 * the transformation functions.
 */
export function registerTransformer(name, transformFn) {
  if (typeof transformFn !== 'function') {
    throw new Error('Transformer must be a function');
  }
  TRANSFORMATIONS[name] = transformFn;
}

/**
 * Transform an XML string using the provided rules
 * @param xml - The XML string to transform
 * @param {Object} rules - The transformation rules to apply to the pages.
 * @param {object} context - The context object to pass to the transformation functions
 * @return {string} - The transformed XML string
 */
export default function transform(xml, rules, context) {
  if (!rules) {
    return xml;
  }

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    parseAttributeValue: false,
    parseTagValue: false,
    trimValues: true,
  });

  const result = parser.parse(xml);

  function transformNode(node, modelRules) {
    if (!node) return node;

    // If it's an array, transform each element
    if (Array.isArray(node)) {
      return node.map((item) => transformNode(item, modelRules));
    }

    // If it's not an object, return as is
    if (typeof node !== 'object') {
      return node;
    }

    // Check if this node has a model attribute
    const model = node['@_model'];
    if (model && modelRules[model]) {
      const transformedNode = {};

      // Transform only the fields specified in the rules
      Object.entries(modelRules[model]).forEach(([field, transformType]) => {
        // Check for both regular field and attribute field
        const fieldValue = node[field] !== undefined ? node[field] : node[`@_${field}`];
        if (fieldValue !== undefined) {
          const transformFn = TRANSFORMATIONS[transformType];
          const key = node[`@_${field}`] !== undefined ? `@_${field}` : field;
          // apply the transformation function if it exists
          transformedNode[key] = transformFn ? transformFn(fieldValue, context) : fieldValue;
        }
      });

      // Copy over all other fields as-is
      Object.entries(node).forEach(([key, value]) => {
        if (!transformedNode[key]) {
          transformedNode[key] = value;
        }
      });

      return transformedNode;
    }

    // Recursively transform all properties
    const transformedNode = {};
    Object.entries(node).forEach(([key, value]) => {
      transformedNode[key] = transformNode(value, modelRules);
    });

    return transformedNode;
  }

  // Transform the parsed XML using the rules
  const transformedResult = transformNode(result, rules);

  // Convert back to XML string
  const builder = new XMLBuilder({
    attributeNamePrefix: '@_',
    format: true,
    ignoreAttributes: false,
    suppressEmptyNode: false,
  });

  return builder.build(transformedResult);
}
