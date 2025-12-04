<?php
session_start();
require_once '../config.php';

header('Content-Type: application/json; charset=utf-8');

$response = ['success' => false, 'message' => 'اطلاعات ورود نامعتبر است.'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $employee_id = $_POST['employee_id'] ?? '';
    $password = $_POST['password'] ?? '';

    if (!empty($employee_id) && !empty($password)) {
        // Use prepared statements to prevent SQL injection
        $stmt = $conn->prepare("SELECT id, full_name, password, is_admin FROM employees WHERE id = ?");
        $stmt->bind_param("i", $employee_id);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 1) {
            $user = $result->fetch_assoc();

            // For now, we are using plain text passwords as stored in setup.sql
            // In a real application, use password_verify()
            // if (password_verify($password, $user['password'])) {
            if ($password === $user['password']) {
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['user_name'] = $user['full_name'];
                $_SESSION['is_admin'] = $user['is_admin'];

                $response['success'] = true;
                // Redirect based on user role
                $response['redirect'] = $user['is_admin'] ? 'admin_dashboard.php' : 'employee_dashboard.php';
            } else {
                $response['message'] = 'رمز عبور اشتباه است.';
            }
        } else {
            $response['message'] = 'کاربری با این مشخصات یافت نشد.';
        }
        $stmt->close();
    }
}

echo json_encode($response);
$conn->close();
?>