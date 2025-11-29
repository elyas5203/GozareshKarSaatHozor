document.addEventListener('DOMContentLoaded', () => {
    const monthYearElement = document.getElementById('month-year');
    const daysElement = document.getElementById('days');
    const prevMonthButton = document.getElementById('prev-month');
    const nextMonthButton = document.getElementById('next-month');
    const eventsListElement = document.getElementById('events-list');
    const eventsTitleElement = document.getElementById('events-title');

    let currentDate = new Date();
    let events = {};
    let currentJYear, currentJMonth;

    async function fetchEvents(year, month) {
        try {
            const response = await fetch(`https://pnldev.com/api/calender/month/${year}/${month}`);
            if (response.ok) {
                const data = await response.json();
                events = {}; // Clear previous events
                data.forEach(event => {
                    const day = event.day;
                    if (!events[day]) {
                        events[day] = [];
                    }
                    events[day].push(event.title);
                });
            }
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    }

    function renderCalendar(date) {
        const today = new Date();
        const jToday = jalaali.toJalaali(today.getFullYear(), today.getMonth() + 1, today.getDate());

        const jDate = jalaali.toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate());
        currentJYear = jDate.jy;
        currentJMonth = jDate.jm;

        const persianMonths = [
            "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
            "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"
        ];
        monthYearElement.textContent = `${persianMonths[currentJMonth - 1]} ${currentJYear}`;

        daysElement.innerHTML = '';

        fetchEvents(currentJYear, currentJMonth).then(() => {
            const daysInMonth = jalaali.jalaaliMonthLength(currentJYear, currentJMonth);
            const firstDayOfMonth = jalaali.toGregorian(currentJYear, currentJMonth, 1);
            let firstDayOfWeek = new Date(firstDayOfMonth.gy, firstDayOfMonth.gm - 1, firstDayOfMonth.gd).getDay();
            firstDayOfWeek = (firstDayOfWeek + 1) % 7;

            for (let i = 0; i < firstDayOfWeek; i++) {
                daysElement.innerHTML += '<div></div>';
            }

            for (let day = 1; day <= daysInMonth; day++) {
                const dayElement = document.createElement('div');
                dayElement.textContent = day;

                if (currentJYear === jToday.jy && currentJMonth === jToday.jm && day === jToday.jd) {
                    dayElement.classList.add('today');
                }

                if (events[day]) {
                    dayElement.classList.add('event');
                }

                dayElement.addEventListener('click', () => {
                    displayEvents(day);
                });

                daysElement.appendChild(dayElement);
            }
            displayEvents(jToday.jd);
        });
    }

    function displayEvents(day) {
        const persianMonths = [
            "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
            "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"
        ];
        eventsTitleElement.textContent = `مناسبت‌های روز ${day} ${persianMonths[currentJMonth - 1]}`;
        eventsListElement.innerHTML = '';
        if (events[day]) {
            events[day].forEach(event => {
                const li = document.createElement('li');
                li.textContent = event;
                eventsListElement.appendChild(li);
            });
        } else {
            const li = document.createElement('li');
            li.textContent = 'هیچ مناسبتی برای این روز ثبت نشده است.';
            eventsListElement.appendChild(li);
        }
    }

    prevMonthButton.addEventListener('click', () => {
        const jDate = jalaali.toJalaali(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate());
        const prevMonthDate = jalaali.toGregorian(jDate.jy, jDate.jm - 1, 1);
        currentDate = new Date(prevMonthDate.gy, prevMonthDate.gm - 1, prevMonthDate.gd);
        renderCalendar(currentDate);
    });

    nextMonthButton.addEventListener('click', () => {
        const jDate = jalaali.toJalaali(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate());
        const nextMonthDate = jalaali.toGregorian(jDate.jy, jDate.jm + 1, 1);
        currentDate = new Date(nextMonthDate.gy, nextMonthDate.gm - 1, nextMonthDate.gd);
        renderCalendar(currentDate);
    });

    renderCalendar(currentDate);
});
