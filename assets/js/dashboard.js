document.addEventListener('DOMContentLoaded', () => {
    const statusMessage = document.getElementById('status-message');
    const checkinBtn = document.getElementById('checkin-btn');
    const checkoutBtn = document.getElementById('checkout-btn');
    const leaveBtn = document.getElementById('leave-btn');
    const timerDisplay = document.getElementById('timer');

    let leaveTimerInterval;
    let leaveSeconds = 0;

    // This function will update the UI based on the employee's current state
    const updateUI = (state) => {
        statusMessage.textContent = `وضعیت شما: ${state.status_text}`;

        checkinBtn.disabled = state.can_checkin === false;
        checkoutBtn.disabled = state.can_checkout === false;
        leaveBtn.disabled = state.can_leave === false;

        if (state.on_leave) {
            leaveBtn.textContent = 'پایان مرخصی ساعتی';
            startLeaveTimer();
        } else {
            leaveBtn.textContent = 'شروع مرخصی ساعتی';
            stopLeaveTimer();
        }
    };

    // Fetches the current status from the server
    const fetchStatus = () => {
        fetch('api/attendance_handler.php?action=status')
            .then(response => response.json())
            .then(data => {
                if(data.success) {
                    updateUI(data.state);
                }
            })
            .catch(err => console.error('Error fetching status:', err));
    };

    // Function to handle all actions (checkin, checkout, leave)
    const handleAction = (action) => {
        fetch(`api/attendance_handler.php?action=${action}`, { method: 'POST' })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    fetchStatus(); // Refresh UI after action
                } else {
                    alert(data.message || 'خطایی رخ داد.');
                }
            })
            .catch(err => console.error(`Error with action ${action}:`, err));
    };

    // Timer functions
    const startLeaveTimer = () => {
        if (leaveTimerInterval) return;
        timerDisplay.style.display = 'block';
        leaveTimerInterval = setInterval(() => {
            leaveSeconds++;
            const h = String(Math.floor(leaveSeconds / 3600)).padStart(2, '0');
            const m = String(Math.floor((leaveSeconds % 3600) / 60)).padStart(2, '0');
            const s = String(leaveSeconds % 60).padStart(2, '0');
            timerDisplay.textContent = `${h}:${m}:${s}`;
        }, 1000);
    };

    const stopLeaveTimer = () => {
        clearInterval(leaveTimerInterval);
        leaveTimerInterval = null;
        leaveSeconds = 0;
        timerDisplay.style.display = 'none';
    };

    // Event Listeners
    checkinBtn.addEventListener('click', () => handleAction('checkin'));
    checkoutBtn.addEventListener('click', () => handleAction('checkout'));
    leaveBtn.addEventListener('click', () => handleAction('toggle_leave'));

    // Initial status fetch
    fetchStatus();
});