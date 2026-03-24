<?php
require_once __DIR__ . '/../config.php';
$pdo = getPDO();
ensureTables($pdo);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJson(['success' => false, 'message' => 'Method not allowed'], 405);
}

$body = getJsonBody();
$bookingCode = trim($body['booking_code'] ?? '');
$amount = (float)($body['amount'] ?? 0);
$currency = trim($body['currency_code'] ?? 'INR');
$gateway = trim($body['gateway'] ?? 'Razorpay');
$status = trim($body['status'] ?? 'success');

if (!$bookingCode || !$amount) {
    sendJson(['success' => false, 'message' => 'booking_code and amount are required'], 422);
}

if (!in_array($status, ['success', 'failed', 'pending'], true)) {
    $status = 'pending';
}

$txn = strtoupper(substr($gateway, 0, 3)) . '-' . time() . '-' . random_int(1000, 9999);

$insert = $pdo->prepare('INSERT INTO payments (booking_code, gateway, transaction_id, amount, currency_code, payment_status) VALUES (?, ?, ?, ?, ?, ?)');
$insert->execute([$bookingCode, $gateway, $txn, $amount, $currency, $status]);

$bookingStatus = $status === 'success' ? 'confirmed' : ($status === 'failed' ? 'payment_failed' : 'payment_pending');
$pdo->prepare('UPDATE bookings SET booking_status = ? WHERE booking_code = ?')->execute([$bookingStatus, $bookingCode]);

sendJson([
    'success' => true,
    'payment' => [
        'transaction_id' => $txn,
        'status' => $status,
        'gateway' => $gateway,
        'currency_code' => $currency,
        'amount' => $amount
    ]
]);
