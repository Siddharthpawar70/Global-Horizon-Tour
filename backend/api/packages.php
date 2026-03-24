<?php
require_once __DIR__ . '/../config.php';
$pdo = getPDO();
ensureTables($pdo);

$seedCount = (int)$pdo->query('SELECT COUNT(*) AS c FROM packages')->fetch()['c'];
if ($seedCount === 0) {
    $seed = $pdo->prepare('INSERT INTO packages (name, category, price_inr, airport, railway) VALUES (?, ?, ?, ?, ?)');
    $rows = [
        ['Maldives Private Island Retreat', 'International', 245000, "Velana Int\'l (MLE)", 'N/A'],
        ['European Wonders Tour', 'International', 175000, 'Paris CDG', 'EuroRail'],
        ['Soul Journey - Bali', 'International', 65000, 'Ngurah Rai (DPS)', 'N/A'],
        ['Masai Mara Safari', 'International', 195000, 'Nairobi (NBO)', 'N/A'],
        ['Ganges Bliss', 'India', 45000, 'Varanasi (VNS)', 'Varanasi Jn']
    ];
    foreach ($rows as $row) $seed->execute($row);
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $rows = $pdo->query('SELECT id, name, category, price_inr, airport, railway, updated_at FROM packages ORDER BY id DESC')->fetchAll();
    sendJson(['success' => true, 'data' => $rows]);
}

$body = getJsonBody();

if ($method === 'POST') {
    $stmt = $pdo->prepare('INSERT INTO packages (name, category, price_inr, airport, railway) VALUES (?, ?, ?, ?, ?)');
    $stmt->execute([
        trim($body['name'] ?? ''),
        trim($body['category'] ?? 'India'),
        (float)($body['price_inr'] ?? 0),
        trim($body['airport'] ?? ''),
        trim($body['railway'] ?? '')
    ]);
    sendJson(['success' => true, 'id' => (int)$pdo->lastInsertId()], 201);
}

if ($method === 'PUT') {
    $id = (int)($body['id'] ?? 0);
    $stmt = $pdo->prepare('UPDATE packages SET name=?, category=?, price_inr=?, airport=?, railway=? WHERE id=?');
    $stmt->execute([
        trim($body['name'] ?? ''),
        trim($body['category'] ?? 'India'),
        (float)($body['price_inr'] ?? 0),
        trim($body['airport'] ?? ''),
        trim($body['railway'] ?? ''),
        $id
    ]);
    sendJson(['success' => true]);
}

if ($method === 'DELETE') {
    $id = (int)($_GET['id'] ?? 0);
    $stmt = $pdo->prepare('DELETE FROM packages WHERE id = ?');
    $stmt->execute([$id]);
    sendJson(['success' => true]);
}

sendJson(['success' => false, 'message' => 'Method not allowed'], 405);
