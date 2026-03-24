<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

function envOrDefault(string $key, string $default): string {
    $value = getenv($key);
    return ($value !== false && $value !== '') ? $value : $default;
}

function getPDO(): PDO {
    static $pdo = null;
    if ($pdo instanceof PDO) return $pdo;

    $host = envOrDefault('DB_HOST', '127.0.0.1');
    $port = envOrDefault('DB_PORT', '3306');
    $dbName = envOrDefault('DB_NAME', 'global_horizon_tour');
    $dbUser = envOrDefault('DB_USER', 'root');
    $dbPass = envOrDefault('DB_PASS', '');

    $dsn = "mysql:host={$host};port={$port};dbname={$dbName};charset=utf8mb4";

    try {
        $pdo = new PDO($dsn, $dbUser, $dbPass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
    } catch (PDOException $e) {
        sendJson(['success' => false, 'message' => 'Database connection failed', 'error' => $e->getMessage()], 500);
    }

    return $pdo;
}

function getJsonBody(): array {
    $raw = file_get_contents('php://input');
    if (!$raw) return [];
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

function sendJson(array $payload, int $status = 200): void {
    http_response_code($status);
    echo json_encode($payload);
    exit;
}

function ensureTables(PDO $pdo): void {
    $pdo->exec("CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(120) NOT NULL,
        email VARCHAR(180) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        status ENUM('pending','approved','blocked') NOT NULL DEFAULT 'approved',
        country_code VARCHAR(8) NULL,
        language_code VARCHAR(10) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    $pdo->exec("CREATE TABLE IF NOT EXISTS packages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(180) NOT NULL,
        category VARCHAR(60) NOT NULL,
        price_inr DECIMAL(10,2) NOT NULL,
        airport VARCHAR(160) NULL,
        railway VARCHAR(160) NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    $pdo->exec("CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        booking_code VARCHAR(40) NOT NULL UNIQUE,
        user_email VARCHAR(180) NOT NULL,
        customer_name VARCHAR(120) NOT NULL,
        mobile VARCHAR(40) NOT NULL,
        destination VARCHAR(160) NOT NULL,
        source_location VARCHAR(160) NOT NULL,
        travel_date DATE NOT NULL,
        travel_mode VARCHAR(30) NOT NULL,
        travel_details VARCHAR(180) NULL,
        travelers INT NOT NULL,
        currency_code VARCHAR(8) NOT NULL,
        fx_rate DECIMAL(12,6) NOT NULL,
        total_amount DECIMAL(12,2) NOT NULL,
        payment_method VARCHAR(40) NOT NULL,
        booking_status VARCHAR(30) NOT NULL DEFAULT 'pending_payment',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    $pdo->exec("CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        booking_code VARCHAR(40) NOT NULL,
        gateway VARCHAR(40) NOT NULL,
        transaction_id VARCHAR(90) NOT NULL,
        amount DECIMAL(12,2) NOT NULL,
        currency_code VARCHAR(8) NOT NULL,
        payment_status ENUM('success','failed','pending') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_booking (booking_code)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
}
