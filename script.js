document.addEventListener('DOMContentLoaded', () => {
    const monthYearElement = document.getElementById('month-year');
    const daysElement = document.getElementById('days');
    const prevMonthButton = document.getElementById('prev-month');
    const nextMonthButton = document.getElementById('next-month');
    const eventsListElement = document.getElementById('events-list');
    const eventsTitleElement = document.getElementById('events-title');

    let currentDate = new Date();
    let yearEventsCache = {}; // Cache for loaded year events
    let currentJYear, currentJMonth;

    async function loadYearEvents(year) {
        if (yearEventsCache[year]) {
            return; // Already loaded
        }
        try {
            const response = await fetch(`events/events_${year}.json`);
            if (response.ok) {
                yearEventsCache[year] = await response.json();
            } else {
                yearEventsCache[year] = {}; // No events for this year
            }
        } catch (error) {
            console.error(`Error loading events for year ${year}:`, error);
            yearEventsCache[year] = {}; // Cache empty to prevent re-fetching
        }
    }

    async function renderCalendar(date) {
        const today = new Date();
        const jToday = jalaali.toJalaali(today.getFullYear(), today.getMonth() + 1, today.getDate());

        const jDate = jalaali.toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate());
        currentJYear = jDate.jy;
        currentJMonth = jDate.jm;

        await loadYearEvents(currentJYear);

        const persianMonths = [
            "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
            "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"
        ];
        monthYearElement.textContent = `${persianMonths[currentJMonth - 1]} ${currentJYear}`;

        daysElement.innerHTML = '';

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

            const dayEvents = yearEventsCache[currentJYear]?.[currentJMonth]?.[day];
            if (dayEvents) {
                dayElement.classList.add('event');
                if (dayEvents.some(e => e.is_holiday)) {
                    dayElement.classList.add('holiday');
                }
            }

            dayElement.addEventListener('click', () => {
                displayEvents(day);
            });

            daysElement.appendChild(dayElement);
        }

        let dayToShow = 1;
        if (currentJYear === jToday.jy && currentJMonth === jToday.jm) {
            dayToShow = jToday.jd;
        }
        displayEvents(dayToShow);
    }

    function displayEvents(day) {
        const persianMonths = [
            "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
            "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"
        ];
        eventsTitleElement.textContent = `مناسبت‌های روز ${day} ${persianMonths[currentJMonth - 1]}`;
        eventsListElement.innerHTML = '';

        const dayEvents = yearEventsCache[currentJYear]?.[String(currentJMonth)]?.[String(day)];
        if (dayEvents) {
            dayEvents.forEach(event => {
                const li = document.createElement('li');
                li.textContent = event.title;
                if (event.is_holiday) {
                    li.style.fontWeight = 'bold';
                    li.style.color = '#dc3545';
                }
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
