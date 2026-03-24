<?php
/**
 * payment_api.php
 * Handles Stripe PaymentIntent creation and payment verification.
 *
 * SETUP:
 * 1. Install Stripe PHP SDK via Composer: composer require stripe/stripe-php
 *    OR place stripe-php folder in backend/vendor/
 * 2. Replace STRIPE_SECRET_KEY below with your actual Stripe secret key (sk_test_...)
 *
 * TEST CARD: 4242 4242 4242 4242 | Exp: any future date | CVV: any 3 digits
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

// ---- Configuration ----
define('STRIPE_SECRET_KEY', 'sk_test_YOUR_KEY_HERE'); // <-- Replace with your real Stripe TEST key

require_once __DIR__ . '/db.php';

// Try to load Stripe SDK (Composer autoload or manual)
$stripeLoaded = false;
if (file_exists(__DIR__ . '/vendor/autoload.php')) {
    require_once __DIR__ . '/vendor/autoload.php';
    $stripeLoaded = class_exists('\Stripe\Stripe');
}

$input  = json_decode(file_get_contents('php://input'), true);
$action = $input['action'] ?? $_GET['action'] ?? '';


// -------------------------------------------------------
// ACTION: create_intent
// Creates a Stripe PaymentIntent and returns the client_secret
// -------------------------------------------------------
if ($action === 'create_intent') {
    $amount      = intval(($input['amount'] ?? 0) * 100); // Convert to paise/cents
    $currency    = strtolower($input['currency'] ?? 'inr');
    $bookingRef  = $input['booking_ref'] ?? 'GHT_UNKNOWN';

    if ($amount <= 0) {
        echo json_encode(['status' => 'error', 'message' => 'Invalid amount.']);
        exit();
    }

    if (!$stripeLoaded) {
        // Stripe SDK not installed — return a mock client_secret for development
        echo json_encode([
            'status'        => 'success',
            'client_secret' => 'pi_mock_' . $bookingRef . '_secret_mock',
            'mock'          => true,
            'message'       => 'Stripe SDK not installed. Running in mock mode.'
        ]);
        exit();
    }

    try {
        \Stripe\Stripe::setApiKey(STRIPE_SECRET_KEY);
        $intent = \Stripe\PaymentIntent::create([
            'amount'      => $amount,
            'currency'    => $currency,
            'description' => "GHT Booking: $bookingRef",
            'metadata'    => ['booking_ref' => $bookingRef],
        ]);

        echo json_encode([
            'status'        => 'success',
            'client_secret' => $intent->client_secret,
            'intent_id'     => $intent->id
        ]);
    } catch (\Exception $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
    exit();
}


// -------------------------------------------------------
// ACTION: verify_payment
// After payment is confirmed on frontend, update booking status
// -------------------------------------------------------
if ($action === 'verify_payment') {
    $bookingRef = $input['booking_ref'] ?? '';
    $intentId   = $input['intent_id'] ?? '';

    if (!$bookingRef) {
        echo json_encode(['status' => 'error', 'message' => 'booking_ref required.']);
        exit();
    }

    $verified = false;

    if ($stripeLoaded && !empty($intentId) && strpos($intentId, 'mock') === false) {
        try {
            \Stripe\Stripe::setApiKey(STRIPE_SECRET_KEY);
            $intent   = \Stripe\PaymentIntent::retrieve($intentId);
            $verified = ($intent->status === 'succeeded');
        } catch (\Exception $e) {
            echo json_encode(['status' => 'error', 'message' => 'Stripe verification failed: ' . $e->getMessage()]);
            exit();
        }
    } else {
        // Mock mode — assume verified
        $verified = true;
    }

    if ($verified) {
        // Update the booking payment_method to STRIPE and mark as confirmed
        $stmt = $pdo->prepare("UPDATE bookings SET payment_method = 'STRIPE', status = 'confirmed' WHERE booking_ref = ?");
        $stmt->execute([$bookingRef]);

        // Fetch booking details to return for receipt
        $stmt2 = $pdo->prepare("SELECT * FROM bookings WHERE booking_ref = ?");
        $stmt2->execute([$bookingRef]);
        $booking = $stmt2->fetch();

        echo json_encode([
            'status'  => 'success',
            'message' => 'Payment verified and booking confirmed.',
            'booking' => $booking
        ]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Payment not completed.']);
    }
    exit();
}

echo json_encode(['status' => 'error', 'message' => 'Invalid action.']);
