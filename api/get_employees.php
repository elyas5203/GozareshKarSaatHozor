<?php
require_once '../config.php';

header('Content-Type: application/json; charset=utf-8');

$sql = "SELECT id, full_name FROM employees WHERE is_admin = FALSE ORDER BY full_name";
$result = $conn->query($sql);

$employees = [];
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $employees[] = $row;
    }
}

echo json_encode($employees);

$conn->close();
?>