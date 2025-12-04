<?php
session_start();

// Redirect to login page if user is not logged in
if (!isset($_SESSION['user_id']) || $_SESSION['is_admin']) {
    header('Location: index.html');
    exit;
}
?>
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>داشبورد کارمند</title>
    <link rel="stylesheet" href="assets/css/style.css">
    <link rel="stylesheet" href="assets/css/dashboard.css">
</head>
<body>
    <div class="dashboard-container">
        <header class="dashboard-header">
            <h1>خوش آمدید، <?php echo htmlspecialchars($_SESSION['user_name']); ?>!</h1>
            <a href="api/logout.php" class="logout-btn">خروج</a>
        </header>

        <main class="dashboard-main">
            <div id="status-message" class="status-message">وضعیت شما: نامشخص</div>
            <div class="actions-container">
                <button id="checkin-btn" class="action-btn">ثبت ورود</button>
                <button id="checkout-btn" class="action-btn" disabled>ثبت خروج</button>
                <button id="leave-btn" class="action-btn">شروع مرخصی ساعتی</button>
            </div>
            <div id="timer" class="timer-display" style="display: none;">00:00:00</div>
        </main>
    </div>

    <script src="assets/js/dashboard.js"></script>
</body>
</html>