document.addEventListener('DOMContentLoaded', () => {
    const monthYearElement = document.getElementById('month-year');
    const daysElement = document.getElementById('days');
    const prevMonthButton = document.getElementById('prev-month');
    const nextMonthButton = document.getElementById('next-month');
    const eventsListElement = document.getElementById('events-list');
    const eventsTitleElement = document.getElementById('events-title');

    let currentDate = new Date();
    let monthEventsCache = {}; // Cache for loaded month events
    let currentJYear, currentJMonth;

    async function loadMonthEvents(year, month) {
        const cacheKey = `${year}-${month}`;
        if (monthEventsCache[cacheKey]) {
            return; // Already loaded
        }
        try {
            const response = await fetch(`https://persian-calendar-api.sajjadth.workers.dev/?year=${year}&month=${month}`);
            if (response.ok) {
                const data = await response.json();
                // Process and cache the data
                const eventsByDay = {};
                if (data.days) {
                    data.days.forEach(dayData => {
                        const dayOfMonth = parseInt(dayData.day.jalali, 10);
                        if (dayData.events.list && dayData.events.list.length > 0) {
                            eventsByDay[dayOfMonth] = dayData.events.list.map(evt => ({
                                title: evt.event,
                                is_holiday: evt.isHoliday
                            }));
                        }
                    });
                }
                monthEventsCache[cacheKey] = eventsByDay;
            } else {
                monthEventsCache[cacheKey] = {}; // No events for this month
            }
        } catch (error) {
            console.error(`Error loading events for month ${year}-${month}:`, error);
            monthEventsCache[cacheKey] = {}; // Cache empty to prevent re-fetching
        }
    }

    async function renderCalendar(date) {
        const today = new Date();
        const jToday = jalaali.toJalaali(today.getFullYear(), today.getMonth() + 1, today.getDate());

        const jDate = jalaali.toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate());
        currentJYear = jDate.jy;
        currentJMonth = jDate.jm;

        await loadMonthEvents(currentJYear, currentJMonth);

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

        const currentMonthEvents = monthEventsCache[`${currentJYear}-${currentJMonth}`] || {};

        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.textContent = day;

            if (currentJYear === jToday.jy && currentJMonth === jToday.jm && day === jToday.jd) {
                dayElement.classList.add('today');
            }

            const dayEvents = currentMonthEvents[day];
            if (dayEvents && dayEvents.length > 0) {
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

        const currentMonthEvents = monthEventsCache[`${currentJYear}-${currentJMonth}`] || {};
        const dayEvents = currentMonthEvents[day];

        if (dayEvents && dayEvents.length > 0) {
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
        // This logic correctly handles month/year rollovers
        currentDate.setMonth(currentDate.getMonth() - 1);
        const jDate = jalaali.toJalaali(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
        const gDate = jalaali.toGregorian(jDate.jy, jDate.jm, 1);
        currentDate = new Date(gDate.gy, gDate.gm - 1, gDate.gd);
        renderCalendar(currentDate);
    });

    nextMonthButton.addEventListener('click', () => {
        // This logic correctly handles month/year rollovers
        currentDate.setMonth(currentDate.getMonth() + 1);
        const jDate = jalaali.toJalaali(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
        const gDate = jalaali.toGregorian(jDate.jy, jDate.jm, 1);
        currentDate = new Date(gDate.gy, gDate.gm - 1, gDate.gd);
        renderCalendar(currentDate);
    });

    renderCalendar(currentDate);
});
