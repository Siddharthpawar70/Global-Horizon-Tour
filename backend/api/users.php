<?php
require_once __DIR__ . '/../config.php';
$pdo = getPDO();
ensureTables($pdo);

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $rows = $pdo->query('SELECT id, name, email, status, country_code, language_code, created_at FROM users ORDER BY id DESC')->fetchAll();
    sendJson(['success' => true, 'data' => $rows]);
}

if ($method === 'PATCH') {
    $body = getJsonBody();
    $email = strtolower(trim($body['email'] ?? ''));
    $status = trim($body['status'] ?? 'pending');
    $allowed = ['pending', 'approved', 'blocked'];
    if (!$email || !in_array($status, $allowed, true)) {
        sendJson(['success' => false, 'message' => 'Invalid payload'], 422);
    }
    $stmt = $pdo->prepare('UPDATE users SET status=? WHERE email=?');
    $stmt->execute([$status, $email]);
    sendJson(['success' => true]);
}

sendJson(['success' => false, 'message' => 'Method not allowed'], 405);
