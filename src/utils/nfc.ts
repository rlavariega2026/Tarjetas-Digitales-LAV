export interface NFCSupportStatus {
  supported: boolean;
  message: string;
}

/**
 * Checks if the current browser & hardware support Web NFC writing
 */
export function checkNFCSupport(): NFCSupportStatus {
  if (typeof window === 'undefined') {
    return { supported: false, message: 'Entorno no compatible.' };
  }

  if ('NDEFReader' in window) {
    return {
      supported: true,
      message: 'Tu dispositivo Android es compatible con escritura directa de tarjetas NFC.',
    };
  }

  const isAndroid = /android/i.test(navigator.userAgent);
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

  if (isAndroid) {
    return {
      supported: false,
      message: 'Navegador sin Web NFC nativo habilitado. Puedes usar la app gratuita "NFC Tools" para Android.',
    };
  }

  if (isIOS) {
    return {
      supported: false,
      message: 'iOS requiere usar la app gratuita "NFC Tools" o Atajos para programar chips NFC.',
    };
  }

  return {
    supported: false,
    message: 'Para programar un chip NFC físico, abre esta opción en un celular Android con Chrome o usa la app "NFC Tools".',
  };
}

/**
 * Writes the card URL to a physical NFC tag using Web NFC API
 */
export async function writeNfcTag(url: string, onProgress?: (status: string) => void): Promise<{ success: boolean; message: string }> {
  if (!('NDEFReader' in window)) {
    return {
      success: false,
      message: 'Web NFC no está disponible en este navegador.',
    };
  }

  try {
    // @ts-ignore
    const ndef = new window.NDEFReader();
    if (onProgress) onProgress('Acerca tu tarjeta o sticker NFC a la parte trasera de tu teléfono...');
    
    await ndef.write({
      records: [
        {
          recordType: 'url',
          data: url,
        },
      ],
    });

    return {
      success: true,
      message: '¡Tarjeta NFC programada con éxito! Al acercarla a cualquier teléfono se abrirá tu tarjeta digital.',
    };
  } catch (err: any) {
    console.error('Error writing NFC tag:', err);
    return {
      success: false,
      message: err.name === 'NotAllowedError'
        ? 'Permiso de NFC denegado o NFC desactivado en ajustes de tu teléfono.'
        : `Error al escribir en NFC: ${err.message || 'Verifica que la tarjeta no esté bloqueada.'}`,
    };
  }
}
