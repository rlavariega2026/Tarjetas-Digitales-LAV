/**
 * Uploads the original image file to Hostinger without resizing, recompressing,
 * or converting its format. The application stores only the returned URL.
 */
export async function uploadImageOriginal(
  file: File,
  scope: 'cards' | 'clients',
  ownerId: string
): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Selecciona un archivo de imagen válido.');
  }
  const form = new FormData();
  form.append('image', file, file.name);
  form.append('scope', scope);
  form.append('ownerId', ownerId);

  const response = await fetch('/tarjetas-digitales/api/upload-image.php', {
    method: 'POST',
    body: form,
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.ok || typeof result.url !== 'string') {
    throw new Error(result.error || 'No se pudo subir la imagen al servidor (' + response.status + ').');
  }
  return result.url;
}
