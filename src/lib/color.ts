export function getReadableTextColor(hex: string) {
  const sanitized = hex.replace("#", "")
  if (sanitized.length !== 6) return "#ffffff"
  const r = parseInt(sanitized.slice(0, 2), 16)
  const g = parseInt(sanitized.slice(2, 4), 16)
  const b = parseInt(sanitized.slice(4, 6), 16)
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
  return luminance > 0.6 ? "#0f172a" : "#ffffff"
}
