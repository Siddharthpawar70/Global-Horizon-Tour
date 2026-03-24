<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once __DIR__ . '/db.php';

session_start();

$input  = json_decode(file_get_contents('php://input'), true);
$action = $input['action'] ?? $_GET['action'] ?? '';

// -------------------------------------------------------
// ACTION: create_booking
// -------------------------------------------------------
if ($action === 'create') {
    $ref        = 'GHT' . strtoupper(substr(md5(uniqid()), 0, 7));
    $custName   = trim($input['name'] ?? '');
    $custPhone  = trim($input['mobile'] ?? '');
    $custEmail  = trim($input['email'] ?? '');
    $dest       = trim($input['dest'] ?? '');
    $date       = $input['date'] ?? '';
    $adults     = intval($input['adults'] ?? 1);
    $children   = intval($input['children'] ?? 0);
    $mode       = $input['mode'] ?? 'flight';
    $transDetail= json_encode($input['transportDetails'] ?? []);
    $notes      = $input['notes'] ?? '';
    $total      = floatval($input['total'] ?? 0);
    $payMethod  = $input['paymentMethod'] ?? 'CASH';
    $discount   = $input['offer'] ?? 'None';
    $userEmail  = $input['userEmail'] ?? $custEmail;

    if (!$custName || !$dest || !$date || !$total) {
        echo json_encode(['status' => 'error', 'message' => 'Required booking fields are missing.']);
        exit();
    }

    // Get user_id if logged in
    $userStmt = $pdo->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
    $userStmt->execute([$userEmail]);
    $userRow  = $userStmt->fetch();
    $userId   = $userRow ? $userRow['id'] : null;

    $stmt = $pdo->prepare("INSERT INTO bookings 
        (booking_ref, user_id, user_email, cust_name, cust_phone, cust_email, destination, travel_date, adults, children, transport_mode, transport_details, special_notes, total_amount, payment_method, discount_applied) 
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)");

    $stmt->execute([$ref, $userId, $userEmail, $custName, $custPhone, $custEmail, $dest, $date, $adults, $children, $mode, $transDetail, $notes, $total, $payMethod, $discount]);

    // Add booking notification
    $pdo->prepare("INSERT INTO notifications (user_email, title, message) VALUES (?, ?, ?)")
        ->execute([$userEmail, "Booking Confirmed - $dest", "Your booking (Ref: $ref) for $dest on $date is confirmed!"]);

    echo json_encode(['status' => 'success', 'booking_ref' => $ref, 'message' => 'Booking confirmed!']);
    exit();
}

// -------------------------------------------------------
// ACTION: get_user_bookings
// -------------------------------------------------------
if ($action === 'get_user') {
    $userEmail = $input['userEmail'] ?? $_GET['email'] ?? '';
    if (!$userEmail) { echo json_encode(['status' => 'error', 'message' => 'User email required.']); exit(); }
    
    $stmt = $pdo->prepare("SELECT * FROM bookings WHERE user_email = ? ORDER BY created_at DESC");
    $stmt->execute([$userEmail]);
    $bookings = $stmt->fetchAll();
    
    echo json_encode(['status' => 'success', 'bookings' => $bookings]);
    exit();
}

// -------------------------------------------------------
// ACTION: get_all (Admin only)
// -------------------------------------------------------
if ($action === 'get_all') {
    $stmt = $pdo->query("SELECT * FROM bookings ORDER BY created_at DESC");
    $bookings = $stmt->fetchAll();
    echo json_encode(['status' => 'success', 'bookings' => $bookings]);
    exit();
}

// -------------------------------------------------------
// ACTION: cancel
// -------------------------------------------------------
if ($action === 'cancel') {
    $ref = $input['booking_ref'] ?? '';
    if (!$ref) { echo json_encode(['status' => 'error', 'message' => 'Booking ref required.']); exit(); }
    
    $stmt = $pdo->prepare("UPDATE bookings SET status = 'cancelled' WHERE booking_ref = ?");
    $stmt->execute([$ref]);
    echo json_encode(['status' => 'success', 'message' => 'Booking cancelled.']);
    exit();
}

echo json_encode(['status' => 'error', 'message' => 'Invalid action.']);
