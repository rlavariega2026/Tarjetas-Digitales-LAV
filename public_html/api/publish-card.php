<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function respond(int $status, array $data): void {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    respond(405, ['ok' => false, 'error' => 'Usa POST.']);
}
$configFile = __DIR__ . '/publish-config.php';
if (!is_file($configFile)) respond(503, ['ok' => false, 'error' => 'Falta configurar el publicador en el servidor.']);
$config = require $configFile;
$expectedToken = is_array($config) ? (string)($config['token'] ?? '') : '';
if ($expectedToken === '') respond(503, ['ok' => false, 'error' => 'Token del servidor no configurado.']);
$auth = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
if (!preg_match('/^Bearer\s+(.+)$/i', $auth, $m) || !hash_equals($expectedToken, trim($m[1]))) {
    respond(401, ['ok' => false, 'error' => 'No autorizado.']);
}
$raw = file_get_contents('php://input');
if ($raw === false || strlen($raw) > 2000000) respond(413, ['ok' => false, 'error' => 'El archivo supera el límite permitido.']);
$input = json_decode($raw, true);
if (!is_array($input)) respond(400, ['ok' => false, 'error' => 'Solicitud JSON inválida.']);
$slug = (string)($input['slug'] ?? '');
$html = $input['html'] ?? null;
if (!preg_match('/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,79}$/', $slug)) respond(400, ['ok' => false, 'error' => 'Identificador de tarjeta inválido.']);
if (!is_string($html) || trim($html) === '' || stripos($html, '<html') === false) respond(400, ['ok' => false, 'error' => 'Contenido HTML inválido.']);

$cardsDir = dirname(__DIR__) . '/cards';
if (!is_dir($cardsDir) && !mkdir($cardsDir, 0755, true) && !is_dir($cardsDir)) respond(500, ['ok' => false, 'error' => 'No se pudo crear la carpeta cards.']);
$target = $cardsDir . '/' . $slug . '.html';
$tmp = tempnam($cardsDir, 'card-');
if ($tmp === false || file_put_contents($tmp, $html, LOCK_EX) === false) {
    if ($tmp && is_file($tmp)) unlink($tmp);
    respond(500, ['ok' => false, 'error' => 'No se pudo guardar la tarjeta.']);
}
if (!rename($tmp, $target)) {
    unlink($tmp);
    respond(500, ['ok' => false, 'error' => 'No se pudo publicar la tarjeta.']);
}
$base = 'https://' . ($_SERVER['HTTP_HOST'] ?? 'lavdigitalmkt.com');
respond(200, ['ok' => true, 'url' => $base . '/tarjetas-digitales/cards/' . rawurlencode($slug) . '.html']);
