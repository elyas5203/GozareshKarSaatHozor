document.addEventListener('DOMContentLoaded', () => {
    const monthYearEl = document.getElementById('month-year');
    const calendarEl = document.getElementById('calendar');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const reportEmployeeSelect = document.getElementById('report-employee');
    const reportDetailsDiv = document.getElementById('report-details');

    let currentDate = new Date();

    const renderCalendar = async () => {
        const jDate = jalaali.toJalaali(currentDate);
        const year = jDate.jy;
        const month = jDate.jm;

        monthYearEl.textContent = new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'long' }).format(currentDate);
        calendarEl.innerHTML = '';

        const daysInMonth = jalaali.jalaaliMonthLength(year, month);
        const firstDayOfMonth = jalaali.toGregorian(year, month, 1).getDay();

        // Add day names
        const dayNames = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
        dayNames.forEach(name => {
            const dayNameEl = document.createElement('div');
            dayNameEl.className = 'calendar-day-name';
            dayNameEl.textContent = name;
            calendarEl.appendChild(dayNameEl);
        });

        // Add empty cells for days before the first of the month
        for (let i = 0; i < (firstDayOfMonth + 1) % 7; i++) {
            calendarEl.appendChild(document.createElement('div'));
        }

        const employeeId = reportEmployeeSelect.value;
        if (!employeeId) {
             for (let day = 1; day <= daysInMonth; day++) {
                const dayEl = document.createElement('div');
                dayEl.className = 'calendar-day';
                dayEl.textContent = day;
                calendarEl.appendChild(dayEl);
            }
            return;
        }

        const monthData = await fetchMonthData(employeeId, year, month);

        for (let day = 1; day <= daysInMonth; day++) {
            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day';
            dayEl.textContent = day;

            const dayData = monthData.find(d => d.day == day);

            if (dayData) {
                dayEl.classList.add('has-data');
                if (dayData.attendance.length > 0) dayEl.classList.add('present');
                if (dayData.leaves.length > 0) dayEl.classList.add('on-leave');

                dayEl.addEventListener('click', () => {
                    displayDayDetails(dayData);
                });
            }
            calendarEl.appendChild(dayEl);
        }
    };

    const fetchMonthData = async (employeeId, year, month) => {
        try {
            const response = await fetch(`api/report_handler.php?employee_id=${employeeId}&year=${year}&month=${month}`);
            const data = await response.json();
            return data.success ? data.records : [];
        } catch (error) {
            console.error('Error fetching month data:', error);
            return [];
        }
    };

    const displayDayDetails = (data) => {
        reportDetailsDiv.innerHTML = `<h3>جزئیات روز ${data.day}</h3>`;
        if (data.attendance.length > 0) {
            reportDetailsDiv.innerHTML += '<h4>ورود و خروج:</h4>';
            data.attendance.forEach(att => {
                const checkin = new Date(att.checkin_time).toLocaleTimeString('fa-IR');
                const checkout = att.checkout_time ? new Date(att.checkout_time).toLocaleTimeString('fa-IR') : 'ثبت نشده';
                reportDetailsDiv.innerHTML += `<div class="report-entry"><strong>ورود:</strong> ${checkin} | <strong>خروج:</strong> ${checkout}</div>`;
            });
        }
         if (data.leaves.length > 0) {
            reportDetailsDiv.innerHTML += '<h4>مرخصی ساعتی:</h4>';
            data.leaves.forEach(leave => {
                const start = new Date(leave.start_time).toLocaleTimeString('fa-IR');
                const end = leave.end_time ? new Date(leave.end_time).toLocaleTimeString('fa-IR') : 'ثبت نشده';
                reportDetailsDiv.innerHTML += `<div class="report-entry"><strong>شروع:</strong> ${start} | <strong>پایان:</strong> ${end}</div>`;
            });
        }
    };

    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    // Listen for custom event from admin.js
    window.addEventListener('employeeChanged', () => {
        reportDetailsDiv.innerHTML = '';
        renderCalendar();
    });

    renderCalendar();
});