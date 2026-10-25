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
    $repaired = 0; $skipped = 0;
    try {
        $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($cardsRoot, FilesystemIterator::SKIP_DOTS));
        foreach ($iterator as $file) {
            if (!$file->isFile() || strtolower($file->getFilename()) !== 'index.html' || $file->getSize() > 12000000) continue;
            $path = $file->getPathname();
            $html = @file_get_contents($path);
            if (!is_string($html) || stripos($html, '<html') === false) { $skipped++; continue; }
            if (strpos($html, 'lav-card-repair-v2') !== false) { $skipped++; continue; }
            if (stripos($html, '</head>') !== false) {
                $html = preg_replace('/<\/head>/i', $style . "\n</head>", $html, 1);
            } elseif (stripos($html, '</style>') !== false) {
                $html = preg_replace('/<\/style>/i', '</style>' . $style, $html, 1);
            } else {
                $html = preg_replace('/<body\b/i', $style . '<body', $html, 1);
            }
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
$serviceWorker = str_replace('lav-card-shell-v1', 'lav-card-shell-' . substr(hash('sha256', $clientFolder . '/' . $cardFolder), 0, 12) . '-v1', $serviceWorker);
file_put_contents($dir . '/sw.js', $serviceWorker, LOCK_EX);
@chmod($dir . '/sw.js', 0644);
$host = $_SERVER['HTTP_HOST'] ?? 'lavdigitalmkt.com';
out(200, ['ok'=>true,'url'=>'https://' . $host . '/tarjetas/' . rawurlencode($clientFolder) . '/' . rawurlencode($cardFolder) . '/index.html']);
