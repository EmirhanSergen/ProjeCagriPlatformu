export function getDisplayFileName(filename: string): string {
  const index = filename.indexOf('_')
  return index === -1 ? filename : filename.slice(index + 1)
}

