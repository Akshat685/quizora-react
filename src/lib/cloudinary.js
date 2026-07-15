const UPLOAD_SEGMENT = '/image/upload/'

/** Insert Cloudinary transforms (auto format, quality, width) into a delivery URL. */
export function cloudinaryUrl(url, width = 640) {
  if (!url?.includes('res.cloudinary.com')) return url

  const segmentIndex = url.indexOf(UPLOAD_SEGMENT)
  if (segmentIndex === -1) return url

  const insertAt = segmentIndex + UPLOAD_SEGMENT.length
  const afterUpload = url.slice(insertAt)

  // Skip if transforms are already present (not a version segment).
  if (!afterUpload.startsWith('v')) return url

  return `${url.slice(0, insertAt)}f_auto,q_auto,w_${width}/${afterUpload}`
}

export function cloudinarySrcSet(url, widths = [400, 640, 800]) {
  return widths.map((w) => `${cloudinaryUrl(url, w)} ${w}w`).join(', ')
}
