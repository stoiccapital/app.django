// Calendar Application JavaScript

class CalendarApp {
    constructor() {
        this.currentDate = new Date();
        this.selectedDate = null;
        this.appointments = this.loadAppointments();
        this.editingAppointment = null;
        this.currentView = 'month'; // 'month' or 'week'
        
        this.initializeElements();
        this.bindEvents();
        this.updateViewToggle();
        this.updateNavigationLabels();
        this.renderCalendar();
        this.renderAppointments();
    }

    initializeElements() {
        // Calendar elements
        this.calendarGrid = document.getElementById('calendarGrid');
        this.currentPeriodElement = document.getElementById('currentPeriod');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.prevText = document.getElementById('prevText');
        this.nextText = document.getElementById('nextText');
        this.todayBtn = document.getElementById('todayBtn');
        
        // View toggle elements
        this.monthViewBtn = document.getElementById('monthViewBtn');
        this.weekViewBtn = document.getElementById('weekViewBtn');
        
        // Modal elements
        this.appointmentModal = document.getElementById('appointmentModal');
        this.appointmentDetailsModal = document.getElementById('appointmentDetailsModal');
        this.appointmentForm = document.getElementById('appointmentForm');
        this.modalTitle = document.getElementById('modalTitle');
        this.closeModalBtn = document.getElementById('closeModal');
        this.closeDetailsModalBtn = document.getElementById('closeDetailsModal');
        
        // Form elements
        this.patientNameSelect = document.getElementById('patientName');
        this.appointmentDateInput = document.getElementById('appointmentDate');
        this.appointmentTimeInput = document.getElementById('appointmentTime');
        this.appointmentTypeSelect = document.getElementById('appointmentType');
        this.appointmentDurationSelect = document.getElementById('appointmentDuration');
        this.appointmentNotesTextarea = document.getElementById('appointmentNotes');
        this.appointmentStatusSelect = document.getElementById('appointmentStatus');
        
        // Action buttons
        this.newAppointmentBtn = document.getElementById('newAppointmentBtn');
        this.saveAppointmentBtn = document.getElementById('saveAppointment');
        this.cancelAppointmentBtn = document.getElementById('cancelAppointment');
        this.editAppointmentBtn = document.getElementById('editAppointment');
        this.deleteAppointmentBtn = document.getElementById('deleteAppointment');
        this.closeDetailsBtn = document.getElementById('closeDetails');
        this.refreshAppointmentsBtn = document.getElementById('refreshAppointments');
        
        // Appointments list
        this.appointmentsList = document.getElementById('appointmentsList');
        this.appointmentDetails = document.getElementById('appointmentDetails');
    }

    bindEvents() {
        // Calendar navigation
        this.prevBtn.addEventListener('click', () => this.navigatePeriod(-1));
        this.nextBtn.addEventListener('click', () => this.navigatePeriod(1));
        this.todayBtn.addEventListener('click', () => this.goToToday());
        
        // View toggle
        this.monthViewBtn.addEventListener('click', () => this.switchToMonthView());
        this.weekViewBtn.addEventListener('click', () => this.switchToWeekView());
        
        // Modal events
        this.newAppointmentBtn.addEventListener('click', () => this.openNewAppointmentModal());
        this.closeModalBtn.addEventListener('click', () => this.closeModal());
        this.closeDetailsModalBtn.addEventListener('click', () => this.closeDetailsModal());
        this.cancelAppointmentBtn.addEventListener('click', () => this.closeModal());
        this.closeDetailsBtn.addEventListener('click', () => this.closeDetailsModal());
        
        // Form events
        this.saveAppointmentBtn.addEventListener('click', () => this.saveAppointment());
        this.editAppointmentBtn.addEventListener('click', () => this.editAppointment());
        this.deleteAppointmentBtn.addEventListener('click', () => this.deleteAppointment());
        this.refreshAppointmentsBtn.addEventListener('click', () => this.refreshAppointments());
        
        // Modal backdrop click
        this.appointmentModal.addEventListener('click', (e) => {
            if (e.target === this.appointmentModal) this.closeModal();
        });
        
        this.appointmentDetailsModal.addEventListener('click', (e) => {
            if (e.target === this.appointmentDetailsModal) this.closeDetailsModal();
        });
        
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
                this.closeDetailsModal();
            }
        });
    }

    // Calendar Navigation
    navigatePeriod(direction) {
        if (this.currentView === 'month') {
            this.currentDate.setMonth(this.currentDate.getMonth() + direction);
        } else {
            this.currentDate.setDate(this.currentDate.getDate() + (direction * 7));
        }
        this.renderCalendar();
    }

    goToToday() {
        this.currentDate = new Date();
        this.renderCalendar();
    }

    switchToMonthView() {
        this.currentView = 'month';
        this.updateViewToggle();
        this.updateNavigationLabels();
        this.renderCalendar();
    }

    switchToWeekView() {
        this.currentView = 'week';
        this.updateViewToggle();
        this.updateNavigationLabels();
        this.renderCalendar();
    }

    updateViewToggle() {
        this.monthViewBtn.classList.toggle('active', this.currentView === 'month');
        this.weekViewBtn.classList.toggle('active', this.currentView === 'week');
    }

    updateNavigationLabels() {
        if (this.currentView === 'month') {
            this.prevText.textContent = 'Vorheriger Monat';
            this.nextText.textContent = 'Nächster Monat';
        } else {
            this.prevText.textContent = 'Vorherige Woche';
            this.nextText.textContent = 'Nächste Woche';
        }
    }

    // Calendar Rendering
    renderCalendar() {
        if (this.currentView === 'month') {
            this.renderMonthView();
        } else {
            this.renderWeekView();
        }
    }

    renderMonthView() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // Update period display
        const monthNames = [
            'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
            'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
        ];
        this.currentPeriodElement.textContent = `${monthNames[month]} ${year}`;
        
        // Clear calendar grid
        this.calendarGrid.innerHTML = '';
        this.calendarGrid.className = 'calendar-grid';
        
        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay() || 7; // Convert Sunday (0) to 7
        
        // Get previous month's days to fill first week
        const prevMonth = new Date(year, month, 0);
        const daysInPrevMonth = prevMonth.getDate();
        
        // Generate calendar days
        let dayCount = 1;
        const totalCells = Math.ceil((daysInMonth + startingDay - 1) / 7) * 7;
        
        for (let i = 1; i <= totalCells; i++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            
            if (i < startingDay) {
                // Previous month days
                const prevDay = daysInPrevMonth - startingDay + i + 1;
                dayElement.classList.add('other-month');
                dayElement.innerHTML = `
                    <div class="calendar-day-number">${prevDay}</div>
                `;
            } else if (dayCount <= daysInMonth) {
                // Current month days
                const currentDayDate = new Date(year, month, dayCount);
                const isToday = this.isToday(currentDayDate);
                const isSelected = this.selectedDate && this.isSameDate(currentDayDate, this.selectedDate);
                
                if (isToday) dayElement.classList.add('today');
                if (isSelected) dayElement.classList.add('selected');
                
                // Get appointments for this day
                const dayAppointments = this.getAppointmentsForDate(currentDayDate);
                
                dayElement.innerHTML = `
                    <div class="calendar-day-number">${dayCount}</div>
                    ${this.renderAppointmentIndicators(dayAppointments)}
                    ${this.renderAppointmentPreview(dayAppointments)}
                `;
                
                // Add click event
                dayElement.addEventListener('click', () => this.selectDate(currentDayDate));
                
                dayCount++;
            } else {
                // Next month days
                const nextDay = i - (startingDay + daysInMonth - 1);
                dayElement.classList.add('other-month');
                dayElement.innerHTML = `
                    <div class="calendar-day-number">${nextDay}</div>
                `;
            }
            
            this.calendarGrid.appendChild(dayElement);
        }
    }

    renderWeekView() {
        // Calculate the start of the week (Monday)
        const startOfWeek = this.getStartOfWeek(this.currentDate);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        
        // Update period display
        const monthNames = [
            'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
            'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
        ];
        
        const startMonth = monthNames[startOfWeek.getMonth()];
        const endMonth = monthNames[endOfWeek.getMonth()];
        
        if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
            this.currentPeriodElement.textContent = `${startMonth} ${startOfWeek.getDate()}-${endOfWeek.getDate()}, ${startOfWeek.getFullYear()}`;
        } else {
            this.currentPeriodElement.textContent = `${startMonth} ${startOfWeek.getDate()} - ${endMonth} ${endOfWeek.getDate()}, ${startOfWeek.getFullYear()}`;
        }
        
        // Clear calendar grid
        this.calendarGrid.innerHTML = '';
        this.calendarGrid.className = 'calendar-grid week-view';
        
        // Generate week days
        for (let i = 0; i < 7; i++) {
            const currentDayDate = new Date(startOfWeek);
            currentDayDate.setDate(startOfWeek.getDate() + i);
            
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            
            const isToday = this.isToday(currentDayDate);
            const isSelected = this.selectedDate && this.isSameDate(currentDayDate, this.selectedDate);
            
            if (isToday) dayElement.classList.add('today');
            if (isSelected) dayElement.classList.add('selected');
            
            // Get appointments for this day
            const dayAppointments = this.getAppointmentsForDate(currentDayDate);
            
            dayElement.innerHTML = `
                <div class="calendar-day-number">${currentDayDate.getDate()}</div>
                ${this.renderAppointmentIndicators(dayAppointments)}
                ${this.renderAppointmentPreview(dayAppointments)}
            `;
            
            // Add click event
            dayElement.addEventListener('click', () => this.selectDate(currentDayDate));
            
            this.calendarGrid.appendChild(dayElement);
        }
    }

    getStartOfWeek(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
        return new Date(d.setDate(diff));
    }

    renderAppointmentIndicators(appointments) {
        if (appointments.length === 0) return '';
        
        const indicators = appointments.slice(0, 3).map(appointment => 
            `<span class="appointment-indicator ${appointment.type}"></span>`
        ).join('');
        
        return `<div class="appointment-indicators">${indicators}</div>`;
    }

    renderAppointmentPreview(appointments) {
        if (appointments.length === 0) return '';
        
        const preview = appointments[0];
        return `<div class="appointment-preview">${preview.patient} - ${this.getTypeLabel(preview.type)}</div>`;
    }

    // Date Utilities
    isToday(date) {
        const today = new Date();
        return this.isSameDate(date, today);
    }

    isSameDate(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }

    formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    formatTime(time) {
        return time;
    }

    // Appointment Management
    selectDate(date) {
        this.selectedDate = date;
        this.renderCalendar();
        
        // If clicking on a day with appointments, show details
        const appointments = this.getAppointmentsForDate(date);
        if (appointments.length > 0) {
            this.showAppointmentDetails(appointments[0]);
        } else {
            // Open new appointment modal with selected date
            this.openNewAppointmentModal(date);
        }
    }

    openNewAppointmentModal(selectedDate = null) {
        this.editingAppointment = null;
        this.modalTitle.textContent = 'Neuer Termin';
        
        // Reset form
        this.appointmentForm.reset();
        
        // Set default date if provided
        if (selectedDate) {
            this.appointmentDateInput.value = this.formatDate(selectedDate);
        } else {
            this.appointmentDateInput.value = this.formatDate(new Date());
        }
        
        // Set default time to next available slot
        const now = new Date();
        const nextHour = now.getHours() + 1;
        this.appointmentTimeInput.value = `${nextHour.toString().padStart(2, '0')}:00`;
        
        this.showModal();
    }

    showModal() {
        this.appointmentModal.classList.add('show');
        document.body.style.overflow = 'hidden';
        
        // Focus first input
        setTimeout(() => {
            this.patientNameSelect.focus();
        }, 100);
    }

    closeModal() {
        this.appointmentModal.classList.remove('show');
        document.body.style.overflow = '';
        this.editingAppointment = null;
    }

    saveAppointment() {
        const formData = new FormData(this.appointmentForm);
        const appointmentData = {
            id: this.editingAppointment ? this.editingAppointment.id : this.generateId(),
            patient: formData.get('patientName'),
            date: formData.get('appointmentDate'),
            time: formData.get('appointmentTime'),
            type: formData.get('appointmentType'),
            duration: parseInt(formData.get('appointmentDuration')),
            notes: formData.get('appointmentNotes'),
            status: formData.get('appointmentStatus'),
            createdAt: this.editingAppointment ? this.editingAppointment.createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        // Validation
        if (!appointmentData.patient || !appointmentData.date || !appointmentData.time || !appointmentData.type) {
            this.showAlert('Bitte füllen Sie alle erforderlichen Felder aus.', 'error');
            return;
        }
        
        // Check for conflicts
        if (!this.editingAppointment && this.hasTimeConflict(appointmentData)) {
            this.showAlert('Es gibt bereits einen Termin zu dieser Zeit.', 'error');
            return;
        }
        
        // Save appointment
        if (this.editingAppointment) {
            const index = this.appointments.findIndex(a => a.id === this.editingAppointment.id);
            this.appointments[index] = appointmentData;
        } else {
            this.appointments.push(appointmentData);
        }
        
        this.saveAppointments();
        this.renderCalendar();
        this.renderAppointments();
        this.closeModal();
        
        this.showAlert(
            this.editingAppointment ? 'Termin wurde aktualisiert.' : 'Termin wurde erfolgreich erstellt.',
            'success'
        );
    }

    hasTimeConflict(newAppointment) {
        const newDate = new Date(`${newAppointment.date}T${newAppointment.time}`);
        const newEnd = new Date(newDate.getTime() + newAppointment.duration * 60000);
        
        return this.appointments.some(appointment => {
            if (appointment.id === newAppointment.id) return false;
            if (appointment.date !== newAppointment.date) return false;
            
            const existingDate = new Date(`${appointment.date}T${appointment.time}`);
            const existingEnd = new Date(existingDate.getTime() + appointment.duration * 60000);
            
            return (newDate < existingEnd && newEnd > existingDate);
        });
    }

    showAppointmentDetails(appointment) {
        this.editingAppointment = appointment;
        
        const typeLabels = {
            vaccination: 'Impfung',
            checkup: 'Kontrolle',
            surgery: 'Operation',
            emergency: 'Notfall',
            consultation: 'Beratung',
            grooming: 'Pflege'
        };
        
        const statusLabels = {
            scheduled: 'Geplant',
            confirmed: 'Bestätigt',
            completed: 'Abgeschlossen',
            cancelled: 'Storniert'
        };
        
        this.appointmentDetails.innerHTML = `
            <h4>${appointment.patient}</h4>
            <div class="detail-row">
                <span class="detail-label">Datum:</span>
                <span class="detail-value">${this.formatGermanDate(appointment.date)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Uhrzeit:</span>
                <span class="detail-value">${appointment.time}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Behandlung:</span>
                <span class="detail-value">${typeLabels[appointment.type] || appointment.type}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Dauer:</span>
                <span class="detail-value">${appointment.duration} Minuten</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="detail-value">
                    <span class="status-badge ${appointment.status}">${statusLabels[appointment.status]}</span>
                </span>
            </div>
            ${appointment.notes ? `
                <div class="detail-row">
                    <span class="detail-label">Notizen:</span>
                    <span class="detail-value">${appointment.notes}</span>
                </div>
            ` : ''}
        `;
        
        this.showDetailsModal();
    }

    showDetailsModal() {
        this.appointmentDetailsModal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    closeDetailsModal() {
        this.appointmentDetailsModal.classList.remove('show');
        document.body.style.overflow = '';
        this.editingAppointment = null;
    }

    editAppointment() {
        if (!this.editingAppointment) return;
        
        // Populate form with appointment data
        this.modalTitle.textContent = 'Termin bearbeiten';
        this.patientNameSelect.value = this.editingAppointment.patient;
        this.appointmentDateInput.value = this.editingAppointment.date;
        this.appointmentTimeInput.value = this.editingAppointment.time;
        this.appointmentTypeSelect.value = this.editingAppointment.type;
        this.appointmentDurationSelect.value = this.editingAppointment.duration;
        this.appointmentNotesTextarea.value = this.editingAppointment.notes || '';
        this.appointmentStatusSelect.value = this.editingAppointment.status;
        
        this.closeDetailsModal();
        this.showModal();
    }

    deleteAppointment() {
        if (!this.editingAppointment) return;
        
        if (confirm('Sind Sie sicher, dass Sie diesen Termin löschen möchten?')) {
            this.appointments = this.appointments.filter(a => a.id !== this.editingAppointment.id);
            this.saveAppointments();
            this.renderCalendar();
            this.renderAppointments();
            this.closeDetailsModal();
            
            this.showAlert('Termin wurde gelöscht.', 'success');
        }
    }

    // Appointments List
    renderAppointments() {
        const upcomingAppointments = this.getUpcomingAppointments();
        
        if (upcomingAppointments.length === 0) {
            this.appointmentsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📅</div>
                    <div class="empty-state-title">Keine anstehenden Termine</div>
                    <div class="empty-state-description">Erstellen Sie Ihren ersten Termin, um zu beginnen.</div>
                </div>
            `;
            return;
        }
        
        this.appointmentsList.innerHTML = upcomingAppointments.map(appointment => 
            this.renderAppointmentCard(appointment)
        ).join('');
        
        // Add click events to appointment cards
        this.appointmentsList.querySelectorAll('.appointment-card').forEach((card, index) => {
            card.addEventListener('click', () => {
                this.showAppointmentDetails(upcomingAppointments[index]);
            });
        });
    }

    renderAppointmentCard(appointment) {
        const typeLabels = {
            vaccination: 'Impfung',
            checkup: 'Kontrolle',
            surgery: 'Operation',
            emergency: 'Notfall',
            consultation: 'Beratung',
            grooming: 'Pflege'
        };
        
        const statusLabels = {
            scheduled: 'Geplant',
            confirmed: 'Bestätigt',
            completed: 'Abgeschlossen',
            cancelled: 'Storniert'
        };
        
        return `
            <div class="appointment-card">
                <div class="appointment-time">${appointment.time}</div>
                <div class="appointment-info">
                    <div class="appointment-patient">${appointment.patient}</div>
                    <div class="appointment-type">${typeLabels[appointment.type] || appointment.type}</div>
                    ${appointment.notes ? `<div class="appointment-notes">${appointment.notes}</div>` : ''}
                </div>
                <div class="appointment-status">
                    <span class="status-badge ${appointment.status}">${statusLabels[appointment.status]}</span>
                </div>
            </div>
        `;
    }

    getUpcomingAppointments() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return this.appointments
            .filter(appointment => {
                const appointmentDate = new Date(appointment.date);
                return appointmentDate >= today && appointment.status !== 'cancelled';
            })
            .sort((a, b) => {
                const dateA = new Date(`${a.date}T${a.time}`);
                const dateB = new Date(`${b.date}T${b.time}`);
                return dateA - dateB;
            })
            .slice(0, 10); // Show only next 10 appointments
    }

    getAppointmentsForDate(date) {
        const dateString = this.formatDate(date);
        return this.appointments.filter(appointment => appointment.date === dateString);
    }

    // Utility Methods
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    getTypeLabel(type) {
        const labels = {
            vaccination: 'Impfung',
            checkup: 'Kontrolle',
            surgery: 'Operation',
            emergency: 'Notfall',
            consultation: 'Beratung',
            grooming: 'Pflege'
        };
        return labels[type] || type;
    }

    formatGermanDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('de-DE', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    refreshAppointments() {
        this.renderAppointments();
        this.showAlert('Termine wurden aktualisiert.', 'success');
    }

    showAlert(message, type = 'info') {
        // Create alert element
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.innerHTML = `
            <span class="alert-message">${message}</span>
            <button class="alert-close">&times;</button>
        `;
        
        // Add to page
        document.body.appendChild(alert);
        
        // Show alert
        setTimeout(() => alert.classList.add('show'), 100);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            alert.classList.remove('show');
            setTimeout(() => alert.remove(), 300);
        }, 5000);
        
        // Close button
        alert.querySelector('.alert-close').addEventListener('click', () => {
            alert.classList.remove('show');
            setTimeout(() => alert.remove(), 300);
        });
    }

    // Data Persistence
    saveAppointments() {
        localStorage.setItem('vetmates-appointments', JSON.stringify(this.appointments));
    }

    loadAppointments() {
        const saved = localStorage.getItem('vetmates-appointments');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('Error loading appointments:', e);
                return this.getDefaultAppointments();
            }
        }
        return this.getDefaultAppointments();
    }

    getDefaultAppointments() {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        return [
            {
                id: '1',
                patient: 'Max - Golden Retriever',
                date: this.formatDate(today),
                time: '09:00',
                type: 'checkup',
                duration: 30,
                notes: 'Jährliche Kontrolle',
                status: 'confirmed',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: '2',
                patient: 'Bella - Katze',
                date: this.formatDate(today),
                time: '14:30',
                type: 'vaccination',
                duration: 15,
                notes: 'Impfung gegen Katzenschnupfen',
                status: 'scheduled',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: '3',
                patient: 'Rocky - Bulldog',
                date: this.formatDate(tomorrow),
                time: '10:00',
                type: 'surgery',
                duration: 120,
                notes: 'Kastration',
                status: 'scheduled',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];
    }
}

// Initialize the calendar when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CalendarApp();
}); 