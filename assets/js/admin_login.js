document.addEventListener('DOMContentLoaded', function() {
    const adminLoginForm = document.getElementById('admin-login-form');
    const errorMessage = document.getElementById('error-message');

    adminLoginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        errorMessage.textContent = ''; // Clear previous errors

        const formData = new FormData(this);

        fetch('api/admin_login.php', {
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
            console.error('Admin login error:', error);
            errorMessage.textContent = 'خطای ارتباط با سرور.';
        });
    });
});