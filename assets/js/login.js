document.addEventListener('DOMContentLoaded', function() {
    const employeeSelect = document.getElementById('employee');
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');

    // Fetch and populate employee list
    fetch('api/get_employees.php')
        .then(response => response.json())
        .then(employees => {
            if (employees.length > 0) {
                employees.forEach(employee => {
                    const option = document.createElement('option');
                    option.value = employee.id;
                    option.textContent = employee.full_name;
                    employeeSelect.appendChild(option);
                });
            } else {
                const option = document.createElement('option');
                option.textContent = 'کارمندی یافت نشد';
                option.disabled = true;
                employeeSelect.appendChild(option);
            }
        })
        .catch(error => {
            console.error('Error fetching employees:', error);
            errorMessage.textContent = 'خطا در دریافت لیست کارمندان.';
        });

    // Handle form submission
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        errorMessage.textContent = ''; // Clear previous errors

        const formData = new FormData(this);

        fetch('api/login.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.location.href = data.redirect;
            } else {
                errorMessage.textContent = data.message || 'خطایی رخ داد.';
            }
        })
        .catch(error => {
            console.error('Login error:', error);
            errorMessage.textContent = 'خطای ارتباط با سرور.';
        });
    });
});