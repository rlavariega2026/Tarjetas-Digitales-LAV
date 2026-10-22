<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
function out($code, $data) { http_response_code($code); echo json_encode($data); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') out(405, ['ok'=>false,'error'=>'POST requerido']);
$configFile = __DIR__ . '/publish-config.php';
if (!file_exists($configFile)) out(503, ['ok'=>false,'error'=>'Falta configurar publish-config.php en Hostinger']);
$config = require $configFile;
$token = is_array($config) ? (string)($config['token'] ?? '') : '';
$auth = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
if (!$token || !preg_match('/^Bearer\s+(.+)$/i', $auth, $m) || !hash_equals($token, trim($m[1]))) out(401, ['ok'=>false,'error'=>'Token incorrecto']);
$raw = file_get_contents('php://input');
if (!$raw || strlen($raw) > 2000000) out(413, ['ok'=>false,'error'=>'HTML vacío o demasiado grande']);
$data = json_decode($raw, true);
$slug = (string)($data['slug'] ?? '');
$html = $data['html'] ?? '';
if (!preg_match('/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,79}$/', $slug) || !is_string($html) || stripos($html, '<html') === false) out(400, ['ok'=>false,'error'=>'Tarjeta inválida']);
$dir = dirname(__DIR__) . '/cards';
if (!is_dir($dir) && !mkdir($dir, 0755, true) && !is_dir($dir)) out(500, ['ok'=>false,'error'=>'No se pudo crear cards']);
$tmp = tempnam($dir, 'card');
if (!$tmp || file_put_contents($tmp, $html, LOCK_EX) === false || !rename($tmp, $dir . '/' . $slug . '.html')) out(500, ['ok'=>false,'error'=>'No se pudo guardar el HTML']);
$host = $_SERVER['HTTP_HOST'] ?? 'lavdigitalmkt.com';
out(200, ['ok'=>true,'url'=>'https://' . $host . '/tarjetas-digitales/cards/' . rawurlencode($slug) . '.html']);
