<?php
session_start();
require_once '../config.php';
header('Content-Type: application/json; charset=utf-8');

if (!isset($_SESSION['user_id']) || !$_SESSION['is_admin']) {
    echo json_encode(['success' => false, 'message' => 'دسترسی غیرمجاز.']);
    exit;
}

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

if ($action === 'list' && $method === 'GET') {
    $sql = "SELECT id, full_name, username FROM employees WHERE is_admin = FALSE ORDER BY full_name";
    $result = $conn->query($sql);
    $employees = [];
    while($row = $result->fetch_assoc()) {
        $employees[] = $row;
    }
    echo json_encode(['success' => true, 'employees' => $employees]);
}
elseif ($action === 'create' && $method === 'POST') {
    $data = $_POST;
    // Basic validation
    if (empty($data['full_name']) || empty($data['username']) || empty($data['password'])) {
        echo json_encode(['success' => false, 'message' => 'تمام فیلدها الزامی است.']);
        exit;
    }
    // Hashing password would be done here in a real app
    // $hashed_password = password_hash($data['password'], PASSWORD_DEFAULT);
    $stmt = $conn->prepare("INSERT INTO employees (full_name, username, password) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $data['full_name'], $data['username'], $data['password']);
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'کارمند با موفقیت اضافه شد.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'خطا در افزودن کارمند: ' . $conn->error]);
    }
}
elseif ($action === 'update' && $method === 'POST') {
    $data = $_POST;
     if (empty($data['id']) || empty($data['full_name']) || empty($data['username'])) {
        echo json_encode(['success' => false, 'message' => 'اطلاعات ناقص است.']);
        exit;
    }
    if (!empty($data['password'])) {
        $stmt = $conn->prepare("UPDATE employees SET full_name = ?, username = ?, password = ? WHERE id = ?");
        $stmt->bind_param("sssi", $data['full_name'], $data['username'], $data['password'], $data['id']);
    } else {
        $stmt = $conn->prepare("UPDATE employees SET full_name = ?, username = ? WHERE id = ?");
        $stmt->bind_param("ssi", $data['full_name'], $data['username'], $data['id']);
    }
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'اطلاعات کارمند به‌روزرسانی شد.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'خطا در به‌روزرسانی: ' . $conn->error]);
    }
}
elseif ($action === 'delete' && $method === 'POST') {
    $id = $_POST['id'] ?? '';
    if (empty($id)) {
         echo json_encode(['success' => false, 'message' => 'شناسه کارمند مشخص نیست.']);
         exit;
    }
    $stmt = $conn->prepare("DELETE FROM employees WHERE id = ?");
    $stmt->bind_param("i", $id);
     if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'کارمند با موفقیت حذف شد.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'خطا در حذف کارمند: ' . $conn->error]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'عملیات نامعتبر است.']);
}

$conn->close();
?>