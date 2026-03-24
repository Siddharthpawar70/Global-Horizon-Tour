<?php
require_once __DIR__ . '/../config.php';
$pdo = getPDO();
ensureTables($pdo);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJson(['success' => false, 'message' => 'Method not allowed'], 405);
}

$body = getJsonBody();
$email = strtolower(trim($body['email'] ?? ''));
$password = (string)($body['password'] ?? '');

if (!$email || !$password) {
    sendJson(['success' => false, 'message' => 'Email and password are required'], 422);
}

$stmt = $pdo->prepare('SELECT id, name, email, password_hash, status, country_code, language_code, created_at FROM users WHERE email = ?');
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password_hash'])) {
    sendJson(['success' => false, 'message' => 'Invalid email or password'], 401);
}

unset($user['password_hash']);
sendJson(['success' => true, 'user' => $user]);
