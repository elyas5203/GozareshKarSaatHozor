<?php
session_start();
require_once '../config.php';

header('Content-Type: application/json; charset=utf-8');

$response = ['success' => false, 'message' => 'اطلاعات ورود نامعتبر است.'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';

    if (!empty($username) && !empty($password)) {
        // Use prepared statements to prevent SQL injection
        $stmt = $conn->prepare("SELECT id, full_name, password, is_admin FROM employees WHERE username = ? AND is_admin = TRUE");
        $stmt->bind_param("s", $username);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 1) {
            $user = $result->fetch_assoc();

            // Using plain text password as per setup.sql
            if ($password === $user['password']) {
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['user_name'] = $user['full_name'];
                $_SESSION['is_admin'] = $user['is_admin'];

                $response['success'] = true;
                $response['redirect'] = 'admin_dashboard.php';
            } else {
                $response['message'] = 'رمز عبور اشتباه است.';
            }
        } else {
            $response['message'] = 'کاربر ادمین با این مشخصات یافت نشد.';
        }
        $stmt->close();
    }
}

echo json_encode($response);
$conn->close();
?>