<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
function out($code, $data) { http_response_code($code); echo json_encode($data); exit; }

if ($_SERVER['REQUEST_METHOD'] !== 'POST') out(405, ['ok'=>false,'error'=>'POST requerido']);

$configFile = __DIR__ . '/publish-config.php';
if (!file_exists($configFile)) out(503, ['ok'=>false,'error'=>'Falta configurar publish-config.php en Hostinger']);
$config = require $configFile;
$token = is_array($config) ? (string)($config['token'] ?? '') : '';
$auth = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
if (!$auth && function_exists('getallheaders')) {
    $headers = getallheaders();
    $auth = $headers['Authorization'] ?? $headers['authorization'] ?? '';
}
if (!$token || !preg_match('/^Bearer\\s+(.+)$/i', $auth, $m) || !hash_equals($token, trim($m[1]))) out(401, ['ok'=>false,'error'=>'Token incorrecto']);

$raw = file_get_contents('php://input');
if (!$raw || strlen($raw) > 12000000) out(413, ['ok'=>false,'error'=>'La publicación supera los 12 MB. Reduce el peso de las imágenes e inténtalo otra vez.']);
$data = json_decode($raw, true);
if (is_array($data) && ($data['action'] ?? '') === 'repairExistingCards') {
    $cardsRoot = dirname(__DIR__, 2) . '/tarjetas';
    if (!is_dir($cardsRoot)) out(200, ['ok'=>true,'repaired'=>0,'message'=>'No existe todavía la carpeta de tarjetas publicadas.']);
    $style = '<style id="lav-card-repair-v2">@media(max-width:600px){html,body{width:100%!important;min-height:100%!important;margin:0!important;padding:0!important}body{min-height:100vh!important;min-height:100dvh!important;padding:0!important;display:flex!important;align-items:stretch!important;justify-content:flex-start!important;overflow-x:hidden!important}.card-container{width:100%!important;max-width:none!important;min-height:100vh!important;min-height:100dvh!important;margin:0!important;border-radius:0!important;border:0!important;box-shadow:none!important;overflow:hidden!important}.cover-banner{border-radius:0!important}}@media(display-mode:standalone){html,body{margin:0!important;padding:0!important}.card-container{max-width:none!important;margin:0!important;border-radius:0!important;box-shadow:none!important}}.photo-top-large .profile-featured-label,.photo-top-large .featured-profile,.photo-top-large [data-label="Perfil Destacado"],.photo-bottom-compact .active-card-label,.photo-bottom-compact .digital-card-active,.photo-bottom-compact [data-label="Tarjeta Digital Activa"]{display:none!important}</style><script>(function(){var labels=["Perfil Destacado","Tarjeta Digital Activa"];function clean(){document.querySelectorAll("body *").forEach(function(e){if(e.children.length>2)return;var t=(e.textContent||"").replace(/\\s+/g," ").trim();if(!t||!labels.some(function(x){return t===x||t.indexOf(x)!==-1}))return;var n=e;for(var i=0;i<3&&n.parentElement&&n.parentElement!==document.body;i++){var p=n.parentElement;if(p.children.length<=3&&p.textContent.trim().length<100)n=p;else break;}n.style.setProperty("display","none","important");});}if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",clean);else clean();})();</script>';
    $installStyle = '<style id="lav-card-pwa-install-v1">@media(display-mode:standalone),(display-mode:fullscreen){html,body{width:100%;min-height:100dvh;margin:0;padding:0}.card-container{width:100%;max-width:none!important;min-height:100dvh;border-radius:0!important;box-shadow:none!important}#pwaInstallBar,#pwaInstallHelp{display:none!important}}#pwaInstallBar{position:fixed;z-index:9997;top:max(10px,env(safe-area-inset-top));right:10px}#pwaInstallButton{border:1px solid rgba(255,255,255,.28);border-radius:999px;padding:10px 14px;background:rgba(10,15,28,.9);color:#fff!important;font:700 12px/1.2 Arial,sans-serif;box-shadow:0 6px 20px rgba(0,0,0,.25);backdrop-filter:blur(12px)}#pwaInstallHelp{position:fixed;inset:0;z-index:9998;display:none;align-items:center;justify-content:center;padding:20px;background:rgba(0,0,0,.72);backdrop-filter:blur(8px)}#pwaInstallHelp.is-open{display:flex}#pwaInstallPanel{position:relative;width:min(100%,380px);padding:24px;border-radius:22px;background:#101827;color:#f8fafc;border:1px solid rgba(255,255,255,.14);font:14px/1.55 Arial,sans-serif}#pwaInstallPanel h2{margin:0 30px 12px 0;font-size:20px;color:#fff!important}#pwaInstallPanel p{margin:8px 0;color:#e2e8f0!important}#pwaInstallClose{position:absolute;top:10px;right:12px;border:0;background:transparent;color:#fff!important;font-size:26px}#pwaInstallOk{display:block;width:100%;margin-top:16px;padding:12px;border:0;border-radius:12px;background:#4f46e5;color:#fff!important;font-weight:700}</style>';
    $installMarkup = '<div id="pwaInstallBar"><button id="pwaInstallButton" type="button">Instalar como app</button></div><div id="pwaInstallHelp" role="dialog" aria-modal="true" aria-labelledby="pwaInstallTitle"><div id="pwaInstallPanel"><button id="pwaInstallClose" type="button" aria-label="Cerrar">×</button><h2 id="pwaInstallTitle">Abre esta tarjeta como una app</h2><p>Instala esta tarjeta en tu celular para abrirla desde un icono, sin la barra normal del navegador.</p><p id="pwaInstallSteps"></p><button id="pwaInstallOk" type="button">Entendido</button></div></div>';
    $installScript = <<<'INSTALL_JS'
<script id="lav-pwa-install-v1">(function(){var b=document.getElementById('pwaInstallButton'),bar=document.getElementById('pwaInstallBar'),h=document.getElementById('pwaInstallHelp'),x=document.getElementById('pwaInstallClose'),ok=document.getElementById('pwaInstallOk'),s=document.getElementById('pwaInstallSteps'),p=null,u=navigator.userAgent||'',ios=/iphone|ipad|ipod/i.test(u)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1),stand=matchMedia('(display-mode:standalone)').matches||matchMedia('(display-mode:fullscreen)').matches||navigator.standalone===true;if(stand&&bar)bar.style.display='none';addEventListener('beforeinstallprompt',function(e){e.preventDefault();p=e});addEventListener('appinstalled',function(){if(bar)bar.style.display='none';if(h)h.classList.remove('is-open')});function close(){if(h)h.classList.remove('is-open')}if(x)x.addEventListener('click',close);if(ok)ok.addEventListener('click',close);if(h)h.addEventListener('click',function(e){if(e.target===h)close()});if(b)b.addEventListener('click',async function(){if(stand){bar.style.display='none';return}if(p){p.prompt();await p.userChoice;p=null;return}if(s)s.textContent=ios?'En Safari: pulsa Compartir, elige “Añadir a pantalla de inicio”, activa “Abrir como app” si aparece y pulsa Añadir. Si abriste el enlace desde WhatsApp, primero ábrelo en Safari.':(/android/i.test(u)?'En Chrome: pulsa el menú ⋮ y elige “Instalar aplicación” o “Añadir a pantalla de inicio”. Si abriste el enlace dentro de otra app, elige Abrir en Chrome.':'Abre este enlace en Chrome o Edge y utiliza la opción Instalar aplicación del menú del navegador.');if(h)h.classList.add('is-open')})})();</script>
INSTALL_JS;
    $appShellStyle = '<style id="lav-card-app-shell-v1">@media(max-width:600px){html,body{width:100%!important;min-height:100%!important;margin:0!important;padding:0!important}body{display:block!important;min-height:100vh!important;min-height:100dvh!important;padding:0!important;align-items:stretch!important;justify-content:flex-start!important;overflow-x:hidden!important;background:#070b14!important}.card-container{width:100%!important;max-width:none!important;min-height:100vh!important;min-height:100dvh!important;margin:0!important;border-radius:0!important;border:0!important;box-shadow:none!important}.cover-banner{border-radius:0!important}.content-body{padding-bottom:max(26px,env(safe-area-inset-bottom))!important}}@media(display-mode:standalone),(display-mode:fullscreen){html,body{margin:0!important;padding:0!important;min-height:100vh!important;min-height:100dvh!important}.card-container{width:100%!important;max-width:none!important;min-height:100vh!important;min-height:100dvh!important;margin:0!important;border-radius:0!important;box-shadow:none!important}}</style>';
    $repaired = 0; $skipped = 0;
    try {
        $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($cardsRoot, FilesystemIterator::SKIP_DOTS));
        foreach ($iterator as $file) {
            if (!$file->isFile() || strtolower($file->getFilename()) !== 'index.html' || $file->getSize() > 12000000) continue;
            $path = $file->getPathname();
            $html = @file_get_contents($path);
            if (!is_string($html) || stripos($html, '<html') === false) { $skipped++; continue; }
            $cardDir = dirname($path);
            $cardFolder = basename($cardDir);
            $clientFolder = basename(dirname($cardDir));
            // Las tarjetas exportadas ya traen su propio botón "Abrir como app".
            // El reparador antiguo añadía un segundo botón y un segundo diálogo.
            $hadDuplicateInstallUi = strpos($html, 'lavInstallButton') !== false && strpos($html, 'pwaInstallBar') !== false;
            if ($hadDuplicateInstallUi) {
                $html = preg_replace('/<style id="lav-card-pwa-install-v1">.*?<\/style>/s', '', $html, 1);
                $html = str_replace($installMarkup, '', $html);
                $html = preg_replace('/<script id="lav-pwa-install-v1">.*?<\/script>/s', '', $html, 1);
            }
            if (!$hadDuplicateInstallUi && strpos($html, 'lav-card-app-shell-v1') !== false && strpos($html, 'lav-card-pwa-ready-v1') !== false && file_exists($cardDir . '/manifest.json') && file_exists($cardDir . '/sw.js') && file_exists($cardDir . '/contact.vcf')) { $skipped++; continue; }
            if (strpos($html, 'lav-card-app-shell-v1') === false && stripos($html, '</head>') !== false) {
                $html = preg_replace('/<\\/head>/i', $appShellStyle . "\\n</head>", $html, 1);
            }
            $vcardPattern = '/vcard:\\s*("(?:\\\\.|[^"\\\\])*")/s';
            if (preg_match($vcardPattern, $html, $vcardMatch)) {
                $vcardText = json_decode($vcardMatch[1], true);
                if (is_string($vcardText) && strpos($vcardText, 'BEGIN:VCARD') === 0) { @file_put_contents($cardDir . '/contact.vcf', $vcardText, LOCK_EX); @chmod($cardDir . '/contact.vcf', 0644); }
            }
            if (strpos($html, 'lav-card-repair-v2') === false) {
                if (stripos($html, '</head>') !== false) {
                    $html = preg_replace('/<\/head>/i', $style . "\n</head>", $html, 1);
                } elseif (stripos($html, '</style>') !== false) {
                    $html = preg_replace('/<\/style>/i', '</style>' . $style, $html, 1);
                } else {
                    $html = preg_replace('/<body\b/i', $style . '<body', $html, 1);
                }
            }
            if (strpos($html, 'lavInstallButton') === false && strpos($html, 'lav-card-pwa-install-v1') === false && stripos($html, '</head>') !== false) {
                $html = preg_replace('/<\/head>/i', $installStyle . "\n</head>", $html, 1);
            }
            if (strpos($html, 'lavInstallButton') === false && strpos($html, 'pwaInstallBar') === false) {
                if (strpos($html, '<div id="toastNotice"></div>') !== false) {
                    $html = str_replace('<div id="toastNotice"></div>', '<div id="toastNotice"></div>' . $installMarkup, $html);
                } else {
                    $html = preg_replace('/<body\b[^>]*>/i', '$0' . $installMarkup, $html, 1);
                }
            }
            if (strpos($html, 'lavInstallButton') === false && strpos($html, 'lav-pwa-install-v1') === false) {
                $html = preg_replace('/<\/body>/i', $installScript . "\n</body>", $html, 1);
            }
            // Make each existing published card an actually installable PWA: the HTML must link its manifest and register its own scoped service worker.
            $pwaHead = '<meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"><link rel="apple-touch-icon" href="/tarjetas-digitales/apple-touch-icon.png"><link rel="manifest" href="./manifest.json"><meta name="lav-card-pwa-ready-v1" content="1">';
            if (stripos($html, 'rel="manifest"') === false && stripos($html, '</head>') !== false) $html = preg_replace('/<\/head>/i', $pwaHead . "\n</head>", $html, 1);
            elseif (strpos($html, 'lav-card-pwa-ready-v1') === false && stripos($html, '</head>') !== false) $html = preg_replace('/<\/head>/i', '<meta name="lav-card-pwa-ready-v1" content="1"></head>', $html, 1);
            $pwaRegister = '<script id="lav-card-sw-register-v1">if("serviceWorker" in navigator){window.addEventListener("load",function(){navigator.serviceWorker.register("./sw.js",{scope:"./"}).catch(function(e){console.warn("No se pudo registrar la tarjeta instalable",e);});});}</script>';
            if (strpos($html, 'lav-card-sw-register-v1') === false && stripos($html, '</body>') !== false) $html = preg_replace('/<\/body>/i', $pwaRegister . "\n</body>", $html, 1);
            $manifest = ['id'=>'./','name'=>ucwords(str_replace(['-','_'],' ',$clientFolder)) . ' — Tarjeta Digital','short_name'=>substr(ucwords(str_replace(['-','_'],' ',$clientFolder)),0,20),'description'=>'Tarjeta digital profesional e interactiva','start_url'=>'./index.html','scope'=>'./','display'=>'standalone','display_override'=>['standalone','minimal-ui'],'orientation'=>'portrait','background_color'=>'#070b14','theme_color'=>'#0f172a','icons'=>[['src'=>'/tarjetas-digitales/pwa-192x192.png','sizes'=>'192x192','type'=>'image/png','purpose'=>'any'],['src'=>'/tarjetas-digitales/pwa-512x512.png','sizes'=>'512x512','type'=>'image/png','purpose'=>'any']] ];
            $manifestJson = json_encode($manifest, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
            if ($manifestJson !== false) { @file_put_contents($cardDir . '/manifest.json', $manifestJson, LOCK_EX); @chmod($cardDir . '/manifest.json', 0644); }
            $cachePrefix = 'lav-card-' . substr(hash('sha256', $clientFolder . '/' . $cardFolder), 0, 12) . '-shell-';
            $swName = $cachePrefix . 'v2';
            $sw = "const CACHE_NAME = '" . $swName . "';\nconst CACHE_PREFIX = '" . $cachePrefix . "';\nself.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE_NAME).then(c=>c.add('./index.html')))});\nself.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(CACHE_PREFIX)&&k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));\nself.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;if(e.request.mode==='navigate')e.respondWith(fetch(e.request).then(r=>{if(r.ok){const copy=r.clone();caches.open(CACHE_NAME).then(c=>c.put('./index.html',copy))}return r}).catch(()=>caches.match('./index.html')))});";
            @file_put_contents($cardDir . '/sw.js', $sw, LOCK_EX); @chmod($cardDir . '/sw.js', 0644);
            $tmp = tempnam(dirname($path), 'fix');
            if ($tmp && file_put_contents($tmp, $html, LOCK_EX) !== false && @chmod($tmp, 0644) && @rename($tmp, $path)) {
                $repaired++;
            } else {
                if ($tmp && file_exists($tmp)) @unlink($tmp);
                $skipped++;
            }
        }
    } catch (Throwable $e) {
        out(500, ['ok'=>false,'error'=>'No se pudo recorrer la carpeta de tarjetas publicadas.']);
    }
    out(200, ['ok'=>true,'repaired'=>$repaired,'skipped'=>$skipped,'message'=>'Corrección aplicada a las tarjetas existentes.']);
}
$clientFolder = (string)($data['clientFolder'] ?? '');
$cardFolder = (string)($data['cardFolder'] ?? '');
$html = $data['html'] ?? '';
$validFolder = '/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,79}$/';
if (!preg_match($validFolder, $clientFolder) || !preg_match($validFolder, $cardFolder) || !is_string($html) || stripos($html, '<html') === false) {
    out(400, ['ok'=>false,'error'=>'Nombre de carpeta o HTML inválido']);
}

// The endpoint is installed in public_html/tarjetas-digitales/api.
// Published cards live separately in public_html/tarjetas/<cliente>/<tarjeta>/index.html.
$cardsRoot = dirname(__DIR__, 2) . '/tarjetas';
$dir = $cardsRoot . '/' . $clientFolder . '/' . $cardFolder;
if (!is_dir($dir) && !mkdir($dir, 0755, true) && !is_dir($dir)) out(500, ['ok'=>false,'error'=>'No se pudo crear la carpeta de la tarjeta']);
// Save a standards-based vCard beside the published card so phones can open the native contact import flow.
// Prefer the explicit payload; the HTML regex remains as a compatibility fallback for older clients.
$vcardText = $data['vcard'] ?? null;
if (!is_string($vcardText) || strpos($vcardText, 'BEGIN:VCARD') !== 0 || strpos($vcardText, 'END:VCARD') === false) {
    $vcardPattern = '/vcard:\\s*("(?:\\\\.|[^"\\\\])*")/s';
    if (preg_match($vcardPattern, $html, $vcardMatch)) {
        $decodedVcard = json_decode($vcardMatch[1], true);
        if (is_string($decodedVcard)) $vcardText = $decodedVcard;
    }
}
if (is_string($vcardText) && strpos($vcardText, 'BEGIN:VCARD') === 0 && strpos($vcardText, 'END:VCARD') !== false) {
    if (@file_put_contents($dir . '/contact.vcf', $vcardText, LOCK_EX) === false) {
        out(500, ['ok'=>false,'error'=>'No se pudo generar contact.vcf. Revisa permisos de la carpeta de la tarjeta.']);
    }
    @chmod($dir . '/contact.vcf', 0644);
} else {
    out(400, ['ok'=>false,'error'=>'No se recibieron datos de contacto válidos para generar contact.vcf.']);
}
// Link the manifest and register the per-card service worker before saving the published HTML.
$pwaHead = '<meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"><link rel="apple-touch-icon" href="/tarjetas-digitales/apple-touch-icon.png"><link rel="manifest" href="./manifest.json"><meta name="lav-card-pwa-ready-v1" content="1">';
if (stripos($html, 'rel="manifest"') === false && stripos($html, '</head>') !== false) $html = preg_replace('/<\/head>/i', $pwaHead . "\n</head>", $html, 1);
$pwaRegister = '<script id="lav-card-sw-register-v1">if("serviceWorker" in navigator){window.addEventListener("load",function(){navigator.serviceWorker.register("./sw.js",{scope:"./"}).catch(function(e){console.warn("No se pudo registrar la tarjeta instalable",e);});});}</script>';
if (strpos($html, 'lav-card-sw-register-v1') === false && stripos($html, '</body>') !== false) $html = preg_replace('/<\/body>/i', $pwaRegister . "\n</body>", $html, 1);
// Ensure web-readable permissions on the published path.
@chmod($cardsRoot, 0755);
@chmod(dirname($dir), 0755);
@chmod($dir, 0755);
$tmp = tempnam($dir, 'card');
if (!$tmp || file_put_contents($tmp, $html, LOCK_EX) === false || !@chmod($tmp, 0644) || !rename($tmp, $dir . '/index.html')) {
    if ($tmp && file_exists($tmp)) @unlink($tmp);
    out(500, ['ok'=>false,'error'=>'No se pudo guardar index.html']);
}

// Cada tarjeta publicada también puede instalarse como PWA independiente.
$displayName = ucwords(str_replace(['-', '_'], ' ', $clientFolder));
$manifest = [
    'id' => './',
    'name' => $displayName . ' — Tarjeta Digital',
    'short_name' => substr($displayName, 0, 20),
    'description' => 'Tarjeta digital profesional e interactiva',
    'start_url' => './',
    'scope' => './',
    'display' => 'standalone',
    'display_override' => ['standalone', 'minimal-ui'],
    'orientation' => 'portrait',
    'background_color' => '#070b14',
    'theme_color' => '#0f172a',
    'icons' => [
        ['src' => '/tarjetas-digitales/pwa-192x192.png', 'sizes' => '192x192', 'type' => 'image/png'],
        ['src' => '/tarjetas-digitales/pwa-512x512.png', 'sizes' => '512x512', 'type' => 'image/png'],
    ],
];
$manifestJson = json_encode($manifest, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
if ($manifestJson !== false) {
    file_put_contents($dir . '/manifest.json', $manifestJson, LOCK_EX);
    @chmod($dir . '/manifest.json', 0644);
}
$serviceWorker = <<<'SW'
const CACHE_NAME = 'lav-card-shell-v1';
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.add('./')));
});
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then(response => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put('./', copy));
      }
      return response;
    }).catch(() => caches.match('./')));
  }
});
SW;
$cachePrefix = 'lav-card-' . substr(hash('sha256', $clientFolder . '/' . $cardFolder), 0, 12) . '-shell-';
$serviceWorker = str_replace('lav-card-shell-v1', $cachePrefix . 'v1', $serviceWorker);
$serviceWorker = str_replace("keys.filter(key => key !== CACHE_NAME)", "keys.filter(key => key.startsWith('" . $cachePrefix . "') && key !== CACHE_NAME)", $serviceWorker);
file_put_contents($dir . '/sw.js', $serviceWorker, LOCK_EX);
@chmod($dir . '/sw.js', 0644);
$host = $_SERVER['HTTP_HOST'] ?? 'lavdigitalmkt.com';
out(200, ['ok'=>true,'url'=>'https://' . $host . '/tarjetas/' . rawurlencode($clientFolder) . '/' . rawurlencode($cardFolder) . '/']);
