document.addEventListener('DOMContentLoaded', () => {
    // Tab content
    const reportsTab = document.getElementById('reports');
    const employeesTab = document.getElementById('employees');

    // Employee management elements
    const employeeListDiv = document.getElementById('employee-list');
    const addEmployeeBtn = document.getElementById('add-employee-btn');
    const employeeModal = document.getElementById('employee-modal');
    const modalTitle = document.getElementById('modal-title');
    const employeeForm = document.getElementById('employee-form');
    const closeBtn = document.querySelector('.close-btn');
    const employeeIdInput = document.getElementById('employee-id');
    const fullNameInput = document.getElementById('full_name');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    // Reports elements
    const reportEmployeeSelect = document.getElementById('report-employee');
    const reportDetailsDiv = document.getElementById('report-details');


    // --- Employee Management ---

    const fetchEmployees = () => {
        fetch('api/employee_handler.php?action=list')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    renderEmployeeList(data.employees);
                    populateReportSelect(data.employees);
                }
            });
    };

    const renderEmployeeList = (employees) => {
        employeeListDiv.innerHTML = '';
        employees.forEach(emp => {
            const item = document.createElement('div');
            item.className = 'employee-item';
            item.innerHTML = `
                <span>${emp.full_name} (${emp.username})</span>
                <div class="employee-actions">
                    <button class="edit-btn" data-id="${emp.id}" data-name="${emp.full_name}" data-username="${emp.username}">ویرایش</button>
                    <button class="delete-btn" data-id="${emp.id}">حذف</button>
                </div>
            `;
            employeeListDiv.appendChild(item);
        });
    };

    const openModalForEdit = (id, name, username) => {
        modalTitle.textContent = 'ویرایش کارمند';
        employeeIdInput.value = id;
        fullNameInput.value = name;
        usernameInput.value = username;
        passwordInput.value = ''; // Clear password field
        passwordInput.placeholder = 'برای تغییر رمز، وارد کنید';
        employeeModal.style.display = 'block';
    };

    addEmployeeBtn.addEventListener('click', () => {
        modalTitle.textContent = 'افزودن کارمند جدید';
        employeeForm.reset();
        employeeIdInput.value = '';
        passwordInput.placeholder = '';
        employeeModal.style.display = 'block';
    });

    closeBtn.onclick = () => { employeeModal.style.display = 'none'; };
    window.onclick = (event) => {
        if (event.target == employeeModal) {
            employeeModal.style.display = 'none';
        }
    };

    employeeListDiv.addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('edit-btn')) {
            openModalForEdit(target.dataset.id, target.dataset.name, target.dataset.username);
        }
        if (target.classList.contains('delete-btn')) {
            if (confirm('آیا از حذف این کارمند مطمئن هستید؟')) {
                const formData = new FormData();
                formData.append('id', target.dataset.id);
                fetch('api/employee_handler.php?action=delete', { method: 'POST', body: formData })
                    .then(() => fetchEmployees()); // Refresh list after delete
            }
        }
    });

    employeeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const action = employeeIdInput.value ? 'update' : 'create';
        const formData = new FormData(employeeForm);

        fetch(`api/employee_handler.php?action=${action}`, { method: 'POST', body: formData })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    employeeModal.style.display = 'none';
                    fetchEmployees(); // Refresh the list
                } else {
                    alert(data.message || 'خطایی رخ داد.');
                }
            });
    });


    // --- Reports ---

    const populateReportSelect = (employees) => {
        reportEmployeeSelect.innerHTML = '<option value="">یک کارمند را انتخاب کنید</option>';
        employees.forEach(emp => {
            const option = document.createElement('option');
            option.value = emp.id;
            option.textContent = emp.full_name;
            reportEmployeeSelect.appendChild(option);
        });
    };

    reportEmployeeSelect.addEventListener('change', () => {
        // This will trigger the calendar update
        const calendarScript = document.querySelector('script[src="assets/js/calendar-admin.js"]');
        if (calendarScript) {
             // A bit of a hack: re-trigger calendar load or create a dedicated function
             // For now, let's assume calendar.js listens for this change or we manually trigger it.
             window.dispatchEvent(new CustomEvent('employeeChanged', { detail: { employeeId: reportEmployeeSelect.value } }));
        }
    });


    // --- Initial Load ---
    fetchEmployees();
});