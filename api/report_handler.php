<?php
session_start();
require_once '../config.php';
header('Content-Type: application/json; charset=utf-8');

if (!isset($_SESSION['user_id']) || !$_SESSION['is_admin']) {
    echo json_encode(['success' => false, 'message' => 'دسترسی غیرمجاز.']);
    exit;
}

$employee_id = $_GET['employee_id'] ?? '';
$year = $_GET['year'] ?? '';
$month = $_GET['month'] ?? '';

if (empty($employee_id) || empty($year) || empty($month)) {
    echo json_encode(['success' => false, 'message' => 'اطلاعات ناقص است.']);
    exit;
}

// Convert Jalali to Gregorian for database query
require_once '../lib/jalaali-php/jalaali.php';
list($g_start_year, $g_start_month, $g_start_day) = jalaali_to_gregorian($year, $month, 1);
$days_in_month = jalaali_to_gregorian($year, $month+1, 0)[2];
list($g_end_year, $g_end_month, $g_end_day) = jalaali_to_gregorian($year, $month, $days_in_month);


$start_date = "$g_start_year-$g_start_month-$g_start_day 00:00:00";
$end_date = "$g_end_year-$g_end_month-$g_end_day 23:59:59";


// Fetch Attendance
$stmt_att = $conn->prepare("SELECT * FROM attendance WHERE employee_id = ? AND checkin_time BETWEEN ? AND ? ORDER BY checkin_time");
$stmt_att->bind_param("iss", $employee_id, $start_date, $end_date);
$stmt_att->execute();
$result_att = $stmt_att->get_result();
$attendance = [];
while ($row = $result_att->fetch_assoc()) {
    $attendance[] = $row;
}

// Fetch Leaves
$stmt_leave = $conn->prepare("SELECT * FROM leaves WHERE employee_id = ? AND start_time BETWEEN ? AND ? ORDER BY start_time");
$stmt_leave->bind_param("iss", $employee_id, $start_date, $end_date);
$stmt_leave->execute();
$result_leave = $stmt_leave->get_result();
$leaves = [];
while ($row = $result_leave->fetch_assoc()) {
    $leaves[] = $row;
}

// Group data by day
$records = [];
foreach ($attendance as $att) {
    list($jy, $jm, $jd) = gregorian_to_jalaali(substr($att['checkin_time'], 0, 4), substr($att['checkin_time'], 5, 2), substr($att['checkin_time'], 8, 2));
    if (!isset($records[$jd])) {
        $records[$jd] = ['day' => $jd, 'attendance' => [], 'leaves' => []];
    }
    $records[$jd]['attendance'][] = $att;
}
foreach ($leaves as $leave) {
    list($jy, $jm, $jd) = gregorian_to_jalaali(substr($leave['start_time'], 0, 4), substr($leave['start_time'], 5, 2), substr($leave['start_time'], 8, 2));
     if (!isset($records[$jd])) {
        $records[$jd] = ['day' => $jd, 'attendance' => [], 'leaves' => []];
    }
    $records[$jd]['leaves'][] = $leave;
}


echo json_encode(['success' => true, 'records' => array_values($records)]);
$conn->close();
?>