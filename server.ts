import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import JSZip from 'jszip';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '15mb' }));

// Initialize Google GenAI on server-side with User-Agent header
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// AI endpoint for intelligent card design suggestions
app.post('/api/ai/suggest-design', async (req, res) => {
  try {
    const { category, businessName, profession, userGoal } = req.body;

    if (!ai) {
      return res.status(200).json({
        success: false,
        fallback: true,
        message: 'Servicio de IA operando con sugerencias locales inteligentes.',
        suggestion: getLocalDesignSuggestion(category),
      });
    }

    const prompt = `Actúa como Director Creativo Senior de "LAV Digital Marketing".
Genera una propuesta de diseño premium para una tarjeta digital con estos datos:
- Empresa / Negocio: "${businessName || 'Negocio Profesional'}"
- Categoría / Giro: "${category || 'Profesional'}"
- Cargo o Especialidad: "${profession || 'Especialista'}"
- Objetivo o Enfoque: "${userGoal || 'Generar clientes y transmitir confianza'}"

Devuelve en formato JSON con la siguiente estructura exacta:
- primaryColor: color hexadecimal principal (elegante y con alto contraste)
- secondaryColor: color hexadecimal complementario
- accentColor: color hexadecimal para botones y llamados a la acción
- backgroundColor: color hexadecimal para el fondo o base de la tarjeta (claro u oscuro sofisticado)
- fontHeadline: una de estas familias ("Outfit", "Inter", "Playfair Display", "Cinzel", "Space Grotesk", "Montserrat")
- fontBody: una de estas familias ("Inter", "DM Sans", "Outfit")
- slogan: un eslogan o propuesta de valor breve e impactante (máx 10 palabras)
- bio: una descripción comercial atractiva y profesional para la tarjeta (2 a 3 líneas)
- buttonStyle: uno de ("solid", "outline", "glass", "gradient")
- cardTheme: uno de ("dark-luxury", "modern-clean", "bold-gradient", "minimalist", "editorial")
- recommendedCtas: arreglo de 3 textos sugeridos para botones de acción (ej. ["Agendar Cita", "Escribir por WhatsApp", "Ver Portafolio"])`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            primaryColor: { type: Type.STRING },
            secondaryColor: { type: Type.STRING },
            accentColor: { type: Type.STRING },
            backgroundColor: { type: Type.STRING },
            fontHeadline: { type: Type.STRING },
            fontBody: { type: Type.STRING },
            slogan: { type: Type.STRING },
            bio: { type: Type.STRING },
            buttonStyle: { type: Type.STRING },
            cardTheme: { type: Type.STRING },
            recommendedCtas: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: [
            'primaryColor',
            'secondaryColor',
            'accentColor',
            'backgroundColor',
            'fontHeadline',
            'fontBody',
            'slogan',
            'bio',
            'buttonStyle',
            'cardTheme',
            'recommendedCtas',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, suggestion: parsed });
  } catch (error: any) {
    console.error('Error generating design suggestion with Gemini:', error);
    return res.status(200).json({
      success: false,
      fallback: true,
      error: error.message,
      suggestion: getLocalDesignSuggestion(req.body?.category),
    });
  }
});

// AI endpoint for copywriting improvement
app.post('/api/ai/enhance-text', async (req, res) => {
  try {
    const { text, type, businessName, category } = req.body;
    if (!ai) {
      return res.json({
        success: true,
        enhancedText: text ? text.trim() : 'Profesional enfocado en resultados excepcionales.',
      });
    }

    const prompt = `Mejora y redacta en español profesional y persuasivo el siguiente texto para una tarjeta digital de presentación de "${businessName || 'Negocio'}" en el sector "${category || 'General'}".
Tipo de texto: ${type || 'bio'} (bio, eslogan, o descripción de producto/servicio).
Texto original: "${text || ''}"
Devuelve SOLO el texto mejorado, sin explicaciones ni comillas.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    return res.json({
      success: true,
      enhancedText: response.text ? response.text.trim() : text,
    });
  } catch (error: any) {
    console.error('Error enhancing text:', error);
    return res.json({ success: false, fallbackText: req.body?.text || '' });
  }
});

// PayPal Server Endpoints
app.get('/api/paypal/config', (_req, res) => {
  const clientId = process.env.PAYPAL_CLIENT_ID || '';
  const mode = process.env.PAYPAL_MODE || 'sandbox';
  res.json({
    configured: Boolean(clientId),
    clientId: clientId ? clientId.substring(0, 8) + '...' : '',
    mode,
  });
});

app.post('/api/paypal/create-order', async (req, res) => {
  try {
    const { amount, currency = 'USD', description = 'Pago de servicio' } = req.body;
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    const mode = process.env.PAYPAL_MODE || 'sandbox';

    if (!clientId || !clientSecret) {
      return res.status(200).json({
        success: false,
        configured: false,
        message: 'PayPal API no configurado con credenciales de servidor. Utilice enlace directo de pago PayPal.me o enlace personalizado.',
      });
    }

    const baseUrl = mode === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const tokenRes = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      return res.status(400).json({ success: false, error: 'No se pudo autenticar con PayPal' });
    }

    const orderRes = await fetch(`${baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            description,
            amount: {
              currency_code: currency,
              value: amount ? parseFloat(amount).toFixed(2) : '10.00',
            },
          },
        ],
      }),
    });

    const orderData = await orderRes.json();
    return res.json({ success: true, order: orderData });
  } catch (error: any) {
    console.error('Error creating PayPal order:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/paypal/capture-order', async (req, res) => {
  try {
    const { orderId } = req.body;
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    const mode = process.env.PAYPAL_MODE || 'sandbox';

    if (!clientId || !clientSecret) {
      return res.status(400).json({ success: false, message: 'PayPal no configurado en servidor.' });
    }

    const baseUrl = mode === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const tokenRes = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    const tokenData = await tokenRes.json();
    const captureRes = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    const captureData = await captureRes.json();
    return res.json({ success: true, capture: captureData });
  } catch (error: any) {
    console.error('Error capturing PayPal order:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});
function getLocalDesignSuggestion(category?: string) {
  const cat = (category || '').toLowerCase();
  if (cat.includes('salud') || cat.includes('medic') || cat.includes('dent')) {
    return {
      primaryColor: '#0284c7',
      secondaryColor: '#0f172a',
      accentColor: '#10b981',
      backgroundColor: '#f8fafc',
      fontHeadline: 'Outfit',
      fontBody: 'Inter',
      slogan: 'Salud, bienestar y atención especializada para tu familia',
      bio: 'Comprometidos con brindarte atención médica integral de primer nivel con calidez humana y tecnología de vanguardia.',
      buttonStyle: 'solid',
      cardTheme: 'modern-clean',
      recommendedCtas: ['Agendar Cita', 'Urgencias WhatsApp', 'Ubicación de Clínica'],
    };
  }
  if (cat.includes('abog') || cat.includes('legal') || cat.includes('consult')) {
    return {
      primaryColor: '#1e293b',
      secondaryColor: '#d97706',
      accentColor: '#b45309',
      backgroundColor: '#0f172a',
      fontHeadline: 'Cinzel',
      fontBody: 'DM Sans',
      slogan: 'Defensa estratégica y asesoría legal con integridad',
      bio: 'Representación jurídica experta y consultoría corporativa para proteger tus intereses patrimoniales y comerciales.',
      buttonStyle: 'glass',
      cardTheme: 'dark-luxury',
      recommendedCtas: ['Consulta Confidencial', 'Llamada Directa', 'Enviar Documentos'],
    };
  }
  if (cat.includes('rest') || cat.includes('caf') || cat.includes('bar')) {
    return {
      primaryColor: '#e11d48',
      secondaryColor: '#f59e0b',
      accentColor: '#10b981',
      backgroundColor: '#18181b',
      fontHeadline: 'Playfair Display',
      fontBody: 'Outfit',
      slogan: 'Sabores memorables y momentos gastronómicos únicos',
      bio: 'Cocina de autor, ingredientes selectos y una atmósfera acogedora para disfrutar en cada visita.',
      buttonStyle: 'gradient',
      cardTheme: 'bold-gradient',
      recommendedCtas: ['Ver Menú Digital', 'Reservar Mesa', 'Pedir a Domicilio'],
    };
  }
  return {
    primaryColor: '#6366f1',
    secondaryColor: '#ec4899',
    accentColor: '#10b981',
    backgroundColor: '#0f172a',
    fontHeadline: 'Space Grotesk',
    fontBody: 'Inter',
    slogan: 'Impulsando marcas con soluciones de alto impacto',
    bio: 'Especialistas en crecimiento, presencia digital y estrategias diseñadas para destacar tu propuesta de valor.',
    buttonStyle: 'solid',
    cardTheme: 'modern-clean',
    recommendedCtas: ['Escribir por WhatsApp', 'Ver Portafolio', 'Guardar Contacto'],
  };
}

// Explicit PWA Service Worker & Manifest Routes to ensure proper MIME types
app.get('/sw.js', (_req, res) => {
  const possiblePaths = [
    path.join(__dirname, 'dev-dist', 'sw.js'),
    path.join(__dirname, 'dist', 'sw.js'),
    path.join(__dirname, 'public', 'sw.js'),
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      res.setHeader('Service-Worker-Allowed', '/');
      return res.sendFile(p);
    }
  }
  res.status(404).send('Service worker not found');
});

app.get(['/workbox-*.js', '/dev-dist/workbox-*.js'], (req, res) => {
  const fileName = path.basename(req.path);
  const possiblePaths = [
    path.join(__dirname, 'dev-dist', fileName),
    path.join(__dirname, 'dist', fileName),
    path.join(__dirname, 'public', fileName),
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      return res.sendFile(p);
    }
  }
  res.status(404).send('Workbox file not found');
});

app.get(['/manifest.webmanifest', '/manifest.json'], (_req, res) => {
  const manifestData = {
    id: '/',
    name: 'LAV Digital Marketing — Tarjetas Digitales',
    short_name: 'LAV Tarjetas',
    description: 'Diseña, personaliza, publica y comparte tarjetas de presentación digitales interactivas con QR y NFC.',
    theme_color: '#0f172a',
    background_color: '#0f172a',
    display: 'standalone',
    orientation: 'portrait',
    start_url: '/',
    scope: '/',
    icons: [
      {
        src: '/pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/pwa-maskable-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
  };
  res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
  res.json(manifestData);
});

// Direct vCard endpoint to trigger native Contact App opening in iOS and Android
function escapeVCardField(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\r\n|\n|\r/g, '\\n')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,');
}

app.get(['/api/vcard', '/api/card/:slug/vcard', '/c/:slug.vcf'], (req, res) => {
  try {
    const slug = req.params.slug;
    const cleanSlug = slug ? slug.replace(/\.vcf$/, '') : '';
    const fallbackName = cleanSlug
      ? cleanSlug
          .split(/[-_]/)
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ')
      : 'Contacto';

    const name = (req.query.n as string) || (req.query.name as string) || fallbackName;
    const phone = (req.query.p as string) || (req.query.phone as string) || '';
    const email = (req.query.e as string) || (req.query.email as string) || '';
    const org = (req.query.o as string) || (req.query.org as string) || (req.query.company as string) || '';
    const title = (req.query.t as string) || (req.query.title as string) || '';
    const website = (req.query.w as string) || (req.query.website as string) || '';
    const address = (req.query.a as string) || (req.query.address as string) || '';
    const note = (req.query.note as string) || (req.query.bio as string) || '';

    const lines: string[] = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN;CHARSET=UTF-8:${escapeVCardField(name)}`,
      `N;CHARSET=UTF-8:${escapeVCardField(name)};;;;`,
    ];

    if (org) lines.push(`ORG;CHARSET=UTF-8:${escapeVCardField(org)}`);
    if (title) lines.push(`TITLE;CHARSET=UTF-8:${escapeVCardField(title)}`);
    if (phone) lines.push(`TEL;TYPE=CELL,VOICE:${phone}`);
    if (email) lines.push(`EMAIL;TYPE=INTERNET,WORK:${email}`);
    if (website) lines.push(`URL:${website}`);
    if (address) {
      lines.push(`ADR;TYPE=WORK;CHARSET=UTF-8:;;${escapeVCardField(address)};;;;`);
      lines.push(`LABEL;TYPE=WORK;CHARSET=UTF-8:${escapeVCardField(address)}`);
    }
    if (note) lines.push(`NOTE;CHARSET=UTF-8:${escapeVCardField(note)}`);
    lines.push(`REV:${new Date().toISOString()}`);
    lines.push('END:VCARD');

    const vcardContent = lines.join('\r\n');
    const safeFilename = name.toLowerCase().replace(/[^a-z0-9]/g, '_') + '.vcf';

    // Headers specifically for native iOS and Android contact opening
    res.setHeader('Content-Type', 'text/vcard; charset=utf-8');
    res.setHeader('Content-Disposition', `inline; filename="${safeFilename}"`);
    res.setHeader('Cache-Control', 'no-cache');
    res.send(vcardContent);
  } catch (err: any) {
    res.status(500).send('Error generating contact vCard');
  }
});

// Endpoint to download the full Hostinger deployment ZIP package
app.get('/api/hostinger/download-bundle', async (_req, res) => {
  try {
    const zip = new JSZip();
    const distDir = path.join(__dirname, 'dist');
    const publicDir = path.join(__dirname, 'public');

    const addDirToZip = (dirPath: string, zipFolder: any) => {
      if (!fs.existsSync(dirPath)) return;
      const items = fs.readdirSync(dirPath);
      for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          const subFolder = zipFolder.folder(item);
          addDirToZip(fullPath, subFolder);
        } else {
          const content = fs.readFileSync(fullPath);
          zipFolder.file(item, content);
        }
      }
    };

    if (fs.existsSync(distDir)) {
      addDirToZip(distDir, zip);
    } else if (fs.existsSync(publicDir)) {
      addDirToZip(publicDir, zip);
    }

    // Add .htaccess for Hostinger Apache/LiteSpeed
    const htaccessContent = `# ===================================================================
# CONFIGURACIÓN HTACCESS PARA HOSTINGER (lavdigitalmkt.com)
# ===================================================================
RewriteEngine On
RewriteBase /

# Forzar HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Enrutamiento SPA para tarjetas digitales y vistas
RewriteRule ^index\\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME} !-l
RewriteRule . /index.html [L]

# Cabeceras MIME para PWA e iconos
<IfModule mod_mime.c>
  AddType application/manifest+json .webmanifest .json
  AddType application/javascript .js
  AddType image/svg+xml .svg
  AddType image/png .png
</IfModule>

<IfModule mod_headers.c>
  <FilesMatch "(sw\\.js)$">
    Header set Cache-Control "max-age=0, no-cache, no-store, must-revalidate"
    Header set Service-Worker-Allowed "/"
  </FilesMatch>
</IfModule>
`;
    zip.file('.htaccess', htaccessContent);

    const readmeContent = `===================================================================
 GUÍA DE INSTALACIÓN EN HOSTINGER — LAV DIGITAL MARKETING
 Dominio: lavdigitalmkt.com
===================================================================

¡Felicidades! Este archivo ZIP contiene la aplicación lista para subir
a tu servicio de hosting en Hostinger.

PASO 1: ACCEDER A TU PANEL DE HOSTINGER
1. Ingresa a https://hpanel.hostinger.com con tu cuenta.
2. Selecciona tu plan de hosting y haz clic en "Administrar".

PASO 2: ELEGIR DÓNDE PUBLICAR
Tienes dos excelentes opciones:

OPCIÓN A RECOMENDADA (Subdominio):
- En hPanel ve a "Dominios" > "Subdominios".
- Crea el subdominio: "tarjetas" (quedará: tarjetas.lavdigitalmkt.com).
- Hostinger creará la carpeta: public_html/tarjetas (o domains/lavdigitalmkt.com/public_html/tarjetas).

OPCIÓN B (Sitio Principal):
- Ve directamente a la carpeta: public_html

PASO 3: SUBIR EL ARCHIVO ZIP
1. En hPanel ve a "Archivos" > "Administrador de archivos".
2. Abre la carpeta correspondiente (ej. public_html/tarjetas o public_html).
3. Haz clic en el botón "Subir" (icono con flecha hacia arriba) y sube este archivo ZIP.
4. Una vez subido, haz clic derecho sobre el ZIP y selecciona "Extraer" (Descomprimir).
5. Extrae todo dentro de esa carpeta.

PASO 4: VERIFICAR CERTIFICADO SSL (HTTPS)
1. En hPanel ve a "Seguridad" > "SSL".
2. Asegúrate de que el SSL gratuito esté ACTIVO en lavdigitalmkt.com (o en tu subdominio).

PASO 5: ¡INSTALAR EN TU CELULAR DESDE TU PROPIO DOMINIO!
Abre desde tu teléfono:
https://tarjetas.lavdigitalmkt.com (o tu dominio)
Toca el menú de Chrome o Safari y selecciona "Instalar aplicación".
Como estará en tu propio dominio con HTTPS, se instalará al instante
sin ninguna advertencia de Google ni error de "no se puede instalar".
===================================================================`;
    zip.file('LEEME_HOSTINGER.txt', readmeContent);

    const zipBuffer = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 9 },
    });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename=lavdigitalmkt-tarjetas-hostinger.zip');
    res.setHeader('Content-Length', zipBuffer.length.toString());
    res.send(zipBuffer);
  } catch (err: any) {
    console.error('Error generating Hostinger bundle:', err);
    res.status(500).json({ error: 'Failed to generate bundle', message: err.message });
  }
});

// Development or production Vite integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`LAV Digital Marketing server running on http://0.0.0.0:${port}`);
  });
}

startServer();
