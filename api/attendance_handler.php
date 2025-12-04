<?php
session_start();
require_once '../config.php';

header('Content-Type: application/json; charset=utf-8');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'ابتدا باید وارد شوید.']);
    exit;
}

$employee_id = $_SESSION['user_id'];
$action = $_GET['action'] ?? '';

// Fetches the last attendance record for today
function getLastAttendance($conn, $employee_id) {
    $today = date('Y-m-d');
    $stmt = $conn->prepare("SELECT * FROM attendance WHERE employee_id = ? AND DATE(checkin_time) = ? ORDER BY id DESC LIMIT 1");
    $stmt->bind_param("is", $employee_id, $today);
    $stmt->execute();
    $result = $stmt->get_result();
    return $result->fetch_assoc();
}

// Fetches the last leave record for today
function getLastLeave($conn, $employee_id) {
    $today = date('Y-m-d');
    $stmt = $conn->prepare("SELECT * FROM leaves WHERE employee_id = ? AND DATE(start_time) = ? ORDER BY id DESC LIMIT 1");
    $stmt->bind_param("is", $employee_id, $today);
    $stmt->execute();
    $result = $stmt->get_result();
    return $result->fetch_assoc();
}

// Get current status
if ($action === 'status') {
    $last_attendance = getLastAttendance($conn, $employee_id);
    $last_leave = getLastLeave($conn, $employee_id);

    $state = [
        'status_text' => 'خارج از شرکت',
        'can_checkin' => true,
        'can_checkout' => false,
        'can_leave' => false,
        'on_leave' => false,
    ];

    if ($last_attendance && !$last_attendance['checkout_time']) { // Checked in, but not out
        $state['status_text'] = 'در شرکت';
        $state['can_checkin'] = false;
        $state['can_checkout'] = true;
        $state['can_leave'] = true;

        if ($last_leave && !$last_leave['end_time']) { // Also on leave
            $state['status_text'] = 'در مرخصی ساعتی';
            $state['can_checkout'] = false; // Cannot checkout while on leave
            $state['on_leave'] = true;
        }
    }

    echo json_encode(['success' => true, 'state' => $state]);
    exit;
}

// Handle Actions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $now = date('Y-m-d H:i:s');
    $last_attendance = getLastAttendance($conn, $employee_id);
    $last_leave = getLastLeave($conn, $employee_id);

    switch ($action) {
        case 'checkin':
            if (!$last_attendance || $last_attendance['checkout_time']) {
                $stmt = $conn->prepare("INSERT INTO attendance (employee_id, checkin_time) VALUES (?, ?)");
                $stmt->bind_param("is", $employee_id, $now);
                $stmt->execute();
                echo json_encode(['success' => true]);
            } else {
                echo json_encode(['success' => false, 'message' => 'شما قبلا وارد شده‌اید.']);
            }
            break;

        case 'checkout':
            if ($last_attendance && !$last_attendance['checkout_time']) {
                 if ($last_leave && !$last_leave['end_time']) {
                    echo json_encode(['success' => false, 'message' => 'ابتدا باید مرخصی خود را تمام کنید.']);
                    exit;
                 }
                $stmt = $conn->prepare("UPDATE attendance SET checkout_time = ? WHERE id = ?");
                $stmt->bind_param("si", $now, $last_attendance['id']);
                $stmt->execute();
                echo json_encode(['success' => true]);
            } else {
                echo json_encode(['success' => false, 'message' => 'شما هنوز وارد نشده‌اید یا قبلا خارج شده‌اید.']);
            }
            break;

        case 'toggle_leave':
             if (!$last_attendance || $last_attendance['checkout_time']) {
                 echo json_encode(['success' => false, 'message' => 'برای ثبت مرخصی ابتدا باید وارد شوید.']);
                 exit;
             }

            if ($last_leave && !$last_leave['end_time']) { // End leave
                $stmt = $conn->prepare("UPDATE leaves SET end_time = ? WHERE id = ?");
                $stmt->bind_param("si", $now, $last_leave['id']);
                $stmt->execute();
                echo json_encode(['success' => true]);
            } else { // Start leave
                $stmt = $conn->prepare("INSERT INTO leaves (employee_id, start_time) VALUES (?, ?)");
                $stmt->bind_param("is", $employee_id, $now);
                $stmt->execute();
                echo json_encode(['success' => true]);
            }
            break;

        default:
            echo json_encode(['success' => false, 'message' => 'عملیات نامعتبر است.']);
    }
}

$conn->close();
?>