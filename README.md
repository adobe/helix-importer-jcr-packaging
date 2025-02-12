# helix-importer-jcr-packaging

The `helix-importer-jcr-packaging` module provides APIs to help generate a JCR content package.  

## Output

The output of the createJcrPackage is a content package zip file, and a sidecar file that contains a map of image urls to the corresponding image 
file path in the content package.  This file then can be used by the [aem-import-helper](https://www.npmjs.com/package/aem-import-helper) to 
automatically upload images to AEM.
