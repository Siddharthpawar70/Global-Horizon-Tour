<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$host = 'localhost';
$user = 'root';
$pass = '';
$dbname = 'ght_db';

try {
    // Connect to MySQL server first without selecting a database
    $pdo = new PDO("mysql:host=$host;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Create the database if it doesn't exist
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$dbname` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    $pdo->exec("USE `$dbname`");

    // Read the schema.sql file
    $schemaFile = __DIR__ . '/schema.sql';
    if (!file_exists($schemaFile)) {
        echo json_encode(['status' => 'error', 'message' => 'schema.sql not found.']);
        exit;
    }

    $sql = file_get_contents($schemaFile);

    // Execute the schema to create tables
    $pdo->exec($sql);

    echo json_encode(['status' => 'success', 'message' => "Database '$dbname' and tables created successfully!"]);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Database setup failed: ' . $e->getMessage()]);
}
?>
