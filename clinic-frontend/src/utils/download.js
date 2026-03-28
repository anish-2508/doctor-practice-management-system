export function getFilenameFromDisposition(contentDisposition, fallback = 'download') {
  if (!contentDisposition) return fallback;
  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) return decodeURIComponent(utf8Match[1]);

  const asciiMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
  if (asciiMatch?.[1]) return asciiMatch[1];

  return fallback;
}

export function triggerBlobDownload(response, fallbackName = 'download') {
  const blob = new Blob([response.data], {
    type: response.headers?.['content-type'] || 'application/octet-stream',
  });
  const fileName = getFilenameFromDisposition(
    response.headers?.['content-disposition'],
    fallbackName
  );

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
