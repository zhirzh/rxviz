import { compressToBase64, decompressFromBase64 } from 'lz-string';

export const compress = string =>
  compressToBase64(string)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

export const decompress = string =>
  decompressFromBase64(string.replace(/-/g, '+').replace(/_/g, '/'));

export const encode = data => encodeURIComponent(data);

export const decode = text => {
  return decodeURIComponent(text);
};
