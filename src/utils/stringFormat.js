export const capitalizeFirstLetter = (str) => {
  if (typeof str !== 'string') {
    return '';
  }
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const convertStatus = (string = '') => {
  if (!string) {
    return '';
  }
  return string.replaceAll('_', ' ').toLowerCase();
};

export const getFileExtension = (filename) => {
  if (!filename) {
    return '';
  }
  const parts = filename.split('.');

  if (parts.length > 1) {
    return parts[parts.length - 1];
  }
  return '';
};

export const extractFirstSegmentFromPath = (pathname) => {
  const trimmedPath = pathname.replace(/^\/|\/$/g, '');
  const segments = trimmedPath.split('/');
  const firstSegment = segments[0];
  return firstSegment;
};
