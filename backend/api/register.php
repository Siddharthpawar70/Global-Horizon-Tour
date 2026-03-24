<?php
require_once __DIR__ . '/../config.php';
$pdo = getPDO();
ensureTables($pdo);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJson(['success' => false, 'message' => 'Method not allowed'], 405);
}

$body = getJsonBody();
$name = trim($body['name'] ?? '');
$email = strtolower(trim($body['email'] ?? ''));
$password = (string)($body['password'] ?? '');
$countryCode = trim($body['countryCode'] ?? '');
$languageCode = trim($body['languageCode'] ?? 'en');

if (!$name || !$email || !$password) {
    sendJson(['success' => false, 'message' => 'Name, email and password are required'], 422);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendJson(['success' => false, 'message' => 'Invalid email format'], 422);
}

$existsStmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
$existsStmt->execute([$email]);
if ($existsStmt->fetch()) {
    sendJson(['success' => false, 'message' => 'Email is already registered'], 409);
}

$hash = password_hash($password, PASSWORD_BCRYPT);
$insert = $pdo->prepare('INSERT INTO users (name, email, password_hash, status, country_code, language_code) VALUES (?, ?, ?, ?, ?, ?)');
$insert->execute([$name, $email, $hash, 'approved', $countryCode ?: null, $languageCode ?: 'en']);

sendJson([
    'success' => true,
    'message' => 'Registration successful',
    'user' => [
        'name' => $name,
        'email' => $email,
        'status' => 'approved',
        'countryCode' => $countryCode,
        'languageCode' => $languageCode ?: 'en'
    ]
], 201);
