# Despliegue de LAV Digital Cards en Hostinger

La aplicación se sirve bajo `https://lavdigitalmkt.com/tarjetas-digitales/`. Las tarjetas comerciales individuales se publican bajo `https://lavdigitalmkt.com/tarjetas/<cliente>/<tarjeta>/`.

## GitHub Actions: despliegue de la aplicación

En el repositorio `rlavariega2026/Tarjetas-Digitales-LAV`, abre **Settings → Secrets and variables → Actions** y crea estos Repository secrets:

- `HOSTINGER_FTP_SERVER`: servidor FTP que aparece en Hostinger.
- `HOSTINGER_FTP_USERNAME`: usuario FTP.
- `HOSTINGER_FTP_PASSWORD`: contraseña FTP.
- `HOSTINGER_FTP_SERVER_DIR`: directorio remoto de la aplicación; normalmente `/public_html/tarjetas-digitales/`, confirma la ruta exacta en el panel de Hostinger.

No guardes credenciales en el código ni en este documento. Tras configurar los cuatro secretos, cada push a `main` compila la aplicación y la sube al directorio configurado. Consulta **Actions → Build and deploy LAV Digital Cards to Hostinger** para verificar el resultado.

## Habilitar la publicación individual de tarjetas

El endpoint `public/api/publish-card.php` publica cada tarjeta como `index.html` independiente en `public_html/tarjetas/<cliente>/<tarjeta>/`. Para habilitarlo, crea manualmente el archivo `publish-config.php` dentro de `public_html/tarjetas-digitales/api/` en Hostinger, con permisos restringidos y un token largo, aleatorio y privado:

```php
<?php
return [
    'token' => 'REEMPLAZA_ESTO_POR_UN_TOKEN_ALEATORIO_LARGO_Y_PRIVADO',
];
```

Usa exactamente el mismo token en el cuadro de publicación de la aplicación. Nunca publiques el token real en GitHub, en un archivo público ni en capturas. Si el hosting no reenvía el encabezado Authorization, el endpoint admite también las variantes comunes del encabezado, pero verifica su configuración antes de usarlo.

## Verificación posterior

1. Abre `https://lavdigitalmkt.com/tarjetas-digitales/`.
2. Crea una tarjeta de prueba y publícala con el panel de Hostinger de la aplicación.
3. Abre la URL pública en una ventana privada y en otro teléfono.
4. Comprueba que la URL abre la tarjeta directamente, sin panel de administración.
5. Prueba galería, botones, iconos sociales y guardar contacto.
6. No declares la publicación exitosa hasta que la URL pública cargue correctamente.
