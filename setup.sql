CREATE DATABASE IF NOT EXISTS company_db CHARACTER SET utf8mb4 COLLATE utf8mb4_persian_ci;

USE company_db;

CREATE TABLE employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    checkin_time DATETIME NOT NULL,
    checkout_time DATETIME,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

CREATE TABLE leaves (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Passwords are plain text for now. They will be hashed in the application.
-- In a real scenario, insert hashed passwords.
-- Example for password 'adminpass': password_hash('adminpass', PASSWORD_DEFAULT)
INSERT INTO employees (full_name, username, password, is_admin) VALUES
('ادمین سیستم', 'admin', 'adminpass', TRUE);

INSERT INTO employees (full_name, username, password) VALUES
('کارمند اول', 'user1', 'pass1'),
('کارمند دوم', 'user2', 'pass2'),
('کارمند سوم', 'user3', 'pass3'),
('کارمند چهارم', 'user4', 'pass4'),
('کارمند پنجم', 'user5', 'pass5');