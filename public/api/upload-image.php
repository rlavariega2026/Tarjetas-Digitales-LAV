<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function upload_response(int $status, array $payload): void {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    upload_response(405, ['ok' => false, 'error' => 'Usa POST para subir una imagen.']);
}
if (!isset($_FILES['image']) || !is_array($_FILES['image'])) {
    upload_response(400, ['ok' => false, 'error' => 'No se recibió ningún archivo. Si es muy pesado, revisa el límite de subida configurado en el hosting.']);
}
$file = $_FILES['image'];
if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
    $errors = [
        UPLOAD_ERR_INI_SIZE => 'El servidor rechazó el archivo por su límite de subida. El límite configurado actualmente es de hasta 512 MB.',
        UPLOAD_ERR_FORM_SIZE => 'El formulario rechazó el archivo.',
        UPLOAD_ERR_PARTIAL => 'La imagen llegó incompleta. Intenta subirla otra vez.',
        UPLOAD_ERR_NO_FILE => 'No se recibió ningún archivo.',
        UPLOAD_ERR_NO_TMP_DIR => 'El servidor no tiene una carpeta temporal disponible.',
        UPLOAD_ERR_CANT_WRITE => 'El servidor no pudo escribir el archivo.',
        UPLOAD_ERR_EXTENSION => 'Una extensión del servidor detuvo la subida.',
    ];
    upload_response(413, ['ok' => false, 'error' => $errors[$file['error']] ?? 'No se pudo recibir la imagen.']);
}
$tmp = (string)($file['tmp_name'] ?? '');
if ($tmp === '' || !is_uploaded_file($tmp)) upload_response(400, ['ok' => false, 'error' => 'Archivo de subida inválido.']);

$scope = (string)($_POST['scope'] ?? '');
$ownerId = (string)($_POST['ownerId'] ?? '');
if (!in_array($scope, ['cards', 'clients'], true) || !preg_match('/^[a-zA-Z0-9_-]{1,128}$/', $ownerId)) {
    upload_response(400, ['ok' => false, 'error' => 'Identificador de destino inválido.']);
}

$info = @getimagesize($tmp);
if (!$info || empty($info['mime'])) upload_response(415, ['ok' => false, 'error' => 'El archivo no contiene una imagen compatible.']);
$mime = strtolower((string)$info['mime']);
$extensions = [
    'image/jpeg' => 'jpg',
    'image/png' => 'png',
    'image/webp' => 'webp',
    'image/gif' => 'gif',
    'image/avif' => 'avif',
    'image/bmp' => 'bmp',
    'image/tiff' => 'tif',
];
if (!isset($extensions[$mime])) upload_response(415, ['ok' => false, 'error' => 'Formato no compatible. Usa JPG, PNG, WebP, GIF, AVIF, BMP o TIFF.']);

$root = dirname(__DIR__, 2) . '/tarjetas/media';
$directory = $root . '/' . $scope . '/' . $ownerId;
if (!is_dir($directory) && !@mkdir($directory, 0755, true) && !is_dir($directory)) {
    upload_response(500, ['ok' => false, 'error' => 'No se pudo crear el espacio de almacenamiento de imágenes.']);
}

// Prevent PHP execution and directory listings in the public media area.
$mediaRules = "Options -Indexes\n<FilesMatch \"\\.(php[0-9]?|phtml|phar|cgi|pl|py|sh)$\">\nRequire all denied\n</FilesMatch>\n";
$rulesPath = $root . '/.htaccess';
if (!is_file($rulesPath)) @file_put_contents($rulesPath, $mediaRules, LOCK_EX);

$extension = $extensions[$mime];
$filename = bin2hex(random_bytes(18)) . '.' . $extension;
$destination = $directory . '/' . $filename;
if (!@move_uploaded_file($tmp, $destination)) upload_response(500, ['ok' => false, 'error' => 'No se pudo guardar la imagen. Revisa el espacio disponible y los permisos del hosting.']);
@chmod($destination, 0644);

$host = $_SERVER['HTTP_HOST'] ?? 'lavdigitalmkt.com';
$url = 'https://' . $host . '/tarjetas/media/' . rawurlencode($scope) . '/' . rawurlencode($ownerId) . '/' . rawurlencode($filename);
upload_response(200, ['ok' => true, 'url' => $url, 'name' => (string)($file['name'] ?? $filename), 'size' => (int)($file['size'] ?? 0), 'mime' => $mime]);
