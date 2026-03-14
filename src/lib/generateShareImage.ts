// Share image is now a static asset at /share-image.png
// This helper loads it and returns it as a Blob for sharing

export async function getShareImageBlob(): Promise<Blob> {
  const response = await fetch('/share-image.png')
  if (!response.ok) throw new Error('Failed to load share image')
  return response.blob()
}

export function getShareImageUrl(): string {
  return '/share-image.png'
}
