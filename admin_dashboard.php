<?php
session_start();

// Redirect to admin login if not logged in as admin
if (!isset($_SESSION['user_id']) || !$_SESSION['is_admin']) {
    header('Location: admin.html');
    exit;
}
?>
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>داشبورد مدیریت</title>
    <link rel="stylesheet" href="assets/css/style.css">
    <link rel="stylesheet" href="assets/css/dashboard.css">
    <link rel="stylesheet" href="assets/css/admin.css">
</head>
<body>
    <div class="dashboard-container">
        <header class="dashboard-header">
            <h1>پنل مدیریت</h1>
            <a href="api/logout.php" class="logout-btn">خروج</a>
        </header>

        <main class="admin-dashboard">
            <div class="tabs">
                <button class="tab-link active" onclick="openTab(event, 'reports')">گزارش‌گیری</button>
                <button class="tab-link" onclick="openTab(event, 'employees')">مدیریت کارمندان</button>
            </div>

            <!-- Reports Tab -->
            <div id="reports" class="tab-content" style="display: block;">
                <h2>گزارش حضور و غیاب</h2>
                <div class="report-controls">
                    <label for="report-employee">انتخاب کارمند:</label>
                    <select id="report-employee">
                        <!-- Employee list will be populated here -->
                    </select>
                </div>
                <div id="calendar-container">
                     <!-- We will reuse the existing calendar logic here -->
                     <div class="calendar-container">
                        <div class="calendar-header">
                            <button id="prev-month">&lt;</button>
                            <h2 id="month-year"></h2>
                            <button id="next-month">&gt;</button>
                        </div>
                        <div class="calendar-grid" id="calendar">
                            <!-- Calendar days will be generated here -->
                        </div>
                     </div>
                </div>
                 <div id="report-details"></div>
            </div>

            <!-- Employee Management Tab -->
            <div id="employees" class="tab-content">
                <h2>مدیریت کارمندان</h2>
                <button id="add-employee-btn" class="action-btn">افزودن کارمند جدید</button>
                <div id="employee-list">
                    <!-- Employee list for management will be loaded here -->
                </div>
            </div>
        </main>
    </div>

    <!-- Add/Edit Employee Modal -->
    <div id="employee-modal" class="modal">
        <div class="modal-content">
            <span class="close-btn">&times;</span>
            <h3 id="modal-title">افزودن کارمند</h3>
            <form id="employee-form">
                <input type="hidden" id="employee-id" name="id">
                <div class="form-group">
                    <label for="full_name">نام کامل:</label>
                    <input type="text" id="full_name" name="full_name" required>
                </div>
                <div class="form-group">
                    <label for="username">نام کاربری:</label>
                    <input type="text" id="username" name="username" required>
                </div>
                <div class="form-group">
                    <label for="password">رمز عبور (برای ثبت جدید یا تغییر):</label>
                    <input type="password" id="password" name="password">
                </div>
                <button type="submit" id="save-employee-btn">ذخیره</button>
            </form>
        </div>
    </div>

    <script src="assets/js/admin.js"></script>
    <script src="assets/js/jalaali.js"></script>
    <script src="assets/js/calendar-admin.js"></script>
    <script>
        // Simple tab functionality
        function openTab(evt, tabName) {
            var i, tabcontent, tablinks;
            tabcontent = document.getElementsByClassName("tab-content");
            for (i = 0; i < tabcontent.length; i++) {
                tabcontent[i].style.display = "none";
            }
            tablinks = document.getElementsByClassName("tab-link");
            for (i = 0; i < tablinks.length; i++) {
                tablinks[i].className = tablinks[i].className.replace(" active", "");
            }
            document.getElementById(tabName).style.display = "block";
            evt.currentTarget.className += " active";
        }
    </script>
</body>
</html>