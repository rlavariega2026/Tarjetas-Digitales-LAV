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
out(200, ['ok'=>true,'url'=>'https://' . $host . '/tarjetas/' . rawurlencode($clientFolder) . '/' . rawurlencode($cardFolder) . '/']);
