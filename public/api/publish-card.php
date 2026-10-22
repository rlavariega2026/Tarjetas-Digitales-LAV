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
if (!$raw || strlen($raw) > 2000000) out(413, ['ok'=>false,'error'=>'HTML vacío o demasiado grande']);
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
$tmp = tempnam($dir, 'card');
if (!$tmp || file_put_contents($tmp, $html, LOCK_EX) === false || !rename($tmp, $dir . '/index.html')) {
    if ($tmp && file_exists($tmp)) @unlink($tmp);
    out(500, ['ok'=>false,'error'=>'No se pudo guardar index.html']);
}
$host = $_SERVER['HTTP_HOST'] ?? 'lavdigitalmkt.com';
out(200, ['ok'=>true,'url'=>'https://' . $host . '/tarjetas/' . rawurlencode($clientFolder) . '/' . rawurlencode($cardFolder) . '/']);
