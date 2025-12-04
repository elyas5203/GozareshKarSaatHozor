<?php
// Database configuration
define('DB_HOST', '172.17.0.2');
define('DB_USERNAME', 'root');
define('DB_PASSWORD', 'rootpassword');
define('DB_NAME', 'company_db');

// Establish database connection
$conn = new mysqli(DB_HOST, DB_USERNAME, DB_PASSWORD);

// Create database if it doesn't exist
$conn->query("CREATE DATABASE IF NOT EXISTS " . DB_NAME . " CHARACTER SET utf8mb4 COLLATE utf8mb4_persian_ci");
$conn->select_db(DB_NAME);


// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Set character set to utf8mb4
$conn->set_charset("utf8mb4");

// Function to execute the setup.sql file
function initialize_database($conn) {
    // Correct path to setup.sql from the root
    $sql = file_get_contents(__DIR__ . '/setup.sql');
    if ($conn->multi_query($sql)) {
        // Must consume all results from multi_query
        while ($conn->next_result()) {
            if ($result = $conn->store_result()) {
                $result->free();
            }
        }
    } else {
        die("Error initializing database: " . $conn->error);
    }
}

// Check if the employees table exists to prevent re-initialization
$result = $conn->query("SHOW TABLES LIKE 'employees'");
if ($result->num_rows == 0) {
    initialize_database($conn);
}
?>