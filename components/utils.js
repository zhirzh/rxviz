import { compressToBase64, decompressFromBase64 } from 'lz-string';

export const compress = string =>
  compressToBase64(string)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

export const decompress = string =>
  decompressFromBase64(string.replace(/-/g, '+').replace(/_/g, '/'));

export const downloadSvg = svg => {
  const element = document.createElement('a');

  element.setAttribute(
    'href',
    'data:image/svg;charset=utf-8,' + encodeURIComponent(svg)
  );

  element.setAttribute('download', 'rxviz.svg');

  element.style.display = 'none';

  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};
