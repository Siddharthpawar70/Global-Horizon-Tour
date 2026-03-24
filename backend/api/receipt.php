<?php
require_once __DIR__ . '/../config.php';
$pdo = getPDO();
ensureTables($pdo);

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendJson(['success' => false, 'message' => 'Method not allowed'], 405);
}

$bookingCode = trim($_GET['booking_code'] ?? '');
if (!$bookingCode) {
    sendJson(['success' => false, 'message' => 'booking_code is required'], 422);
}

$bStmt = $pdo->prepare('SELECT * FROM bookings WHERE booking_code = ? LIMIT 1');
$bStmt->execute([$bookingCode]);
$booking = $bStmt->fetch();

if (!$booking) {
    sendJson(['success' => false, 'message' => 'Booking not found'], 404);
}

$pStmt = $pdo->prepare('SELECT * FROM payments WHERE booking_code = ? ORDER BY id DESC LIMIT 1');
$pStmt->execute([$bookingCode]);
$payment = $pStmt->fetch();

sendJson(['success' => true, 'booking' => $booking, 'payment' => $payment]);
