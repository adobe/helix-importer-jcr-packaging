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
export default function transform(value, { siteFolderName }) {
  if (!value) return '';

  if (value.startsWith(`/content/${siteFolderName}/`)) {
    return value;
  }

  return value.startsWith('/')
    ? `/content/${siteFolderName}${value}`
    : `/content/${siteFolderName}/${value}`;
}
