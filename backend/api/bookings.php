<?php
require_once __DIR__ . '/../config.php';
$pdo = getPDO();
ensureTables($pdo);

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $email = strtolower(trim($_GET['email'] ?? ''));
    if ($email) {
        $stmt = $pdo->prepare('SELECT * FROM bookings WHERE user_email=? ORDER BY id DESC');
        $stmt->execute([$email]);
        sendJson(['success' => true, 'data' => $stmt->fetchAll()]);
    }
    $rows = $pdo->query('SELECT * FROM bookings ORDER BY id DESC')->fetchAll();
    sendJson(['success' => true, 'data' => $rows]);
}

if ($method === 'POST') {
    $body = getJsonBody();
    $bookingCode = 'GHT' . random_int(10000, 99999) . time();

    $stmt = $pdo->prepare('INSERT INTO bookings (booking_code, user_email, customer_name, mobile, destination, source_location, travel_date, travel_mode, travel_details, travelers, currency_code, fx_rate, total_amount, payment_method, booking_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    $stmt->execute([
        $bookingCode,
        strtolower(trim($body['user_email'] ?? 'guest@example.com')),
        trim($body['customer_name'] ?? ''),
        trim($body['mobile'] ?? ''),
        trim($body['destination'] ?? ''),
        trim($body['source_location'] ?? ''),
        trim($body['travel_date'] ?? date('Y-m-d')),
        trim($body['travel_mode'] ?? 'flight'),
        trim($body['travel_details'] ?? ''),
        (int)($body['travelers'] ?? 1),
        trim($body['currency_code'] ?? 'INR'),
        (float)($body['fx_rate'] ?? 1),
        (float)($body['total_amount'] ?? 0),
        trim($body['payment_method'] ?? 'UPI'),
        'pending_payment'
    ]);

    sendJson(['success' => true, 'booking_code' => $bookingCode], 201);
}

if ($method === 'DELETE') {
    $code = trim($_GET['booking_code'] ?? '');
    if (!$code) sendJson(['success' => false, 'message' => 'booking_code required'], 422);
    $pdo->prepare('DELETE FROM payments WHERE booking_code=?')->execute([$code]);
    $pdo->prepare('DELETE FROM bookings WHERE booking_code=?')->execute([$code]);
    sendJson(['success' => true]);
}

sendJson(['success' => false, 'message' => 'Method not allowed'], 405);
