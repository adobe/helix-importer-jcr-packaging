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

  if (value.startsWith(`/content/${siteFolderName}/`)) {
    return value;
  }

  let path = value;

  try {
    const url = new URL(path);
    path = url.pathname;
  } catch (error) {
    // if the value is not a URL, then we can ignore the error
  }

  return path.startsWith('/')
    ? `/content/${siteFolderName}${path}`
    : `/content/${siteFolderName}/${path}`;
}
