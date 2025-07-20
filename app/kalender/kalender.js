// Calendar Application JavaScript

class CalendarApp {
    constructor() {
        this.currentDate = new Date();
        this.selectedDate = null;
        this.appointments = this.loadAppointments();
        this.editingAppointment = null;
        this.currentView = 'week'; // 'month' or 'week'
        
        this.initializeElements();
        this.bindEvents();
        this.updateViewToggle();
        this.updateNavigationLabels();
        this.renderCalendar();
        this.renderAppointments();
        this.renderAppointmentsTable(); // Initialize the table view
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
        this.viewSelect = document.getElementById('viewSelect');
        
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
        
        // Table elements
        this.appointmentsTable = document.getElementById('appointmentsTable');
        this.appointmentsTableBody = document.getElementById('appointmentsTableBody');
        this.appointmentSearch = document.getElementById('appointmentSearch');
        this.statusFilter = document.getElementById('statusFilter');
        this.typeFilter = document.getElementById('typeFilter');
        this.exportAppointmentsBtn = document.getElementById('exportAppointments');
        this.printAppointmentsBtn = document.getElementById('printAppointments');
        this.tablePaginationInfo = document.getElementById('tablePaginationInfo');
        this.tablePaginationControls = document.getElementById('tablePaginationControls');
    }

    bindEvents() {
        // Calendar navigation
        this.prevBtn.addEventListener('click', () => this.navigatePeriod(-1));
        this.nextBtn.addEventListener('click', () => this.navigatePeriod(1));
        this.todayBtn.addEventListener('click', () => this.goToToday());
        
        // View toggle
        this.viewSelect.addEventListener('change', (e) => this.switchView(e.target.value));
        
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
        
        // Table events
        this.appointmentSearch.addEventListener('input', () => this.filterAppointments());
        this.statusFilter.addEventListener('change', () => this.filterAppointments());
        this.typeFilter.addEventListener('change', () => this.filterAppointments());
        this.exportAppointmentsBtn.addEventListener('click', () => this.exportAppointments());
        this.printAppointmentsBtn.addEventListener('click', () => this.printAppointments());
        
        // Table sorting
        this.appointmentsTable.addEventListener('click', (e) => {
            if (e.target.tagName === 'TH') {
                this.sortTable(e.target);
            }
        });
        
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

    switchView(view) {
        this.currentView = view;
        this.updateViewToggle();
        this.updateNavigationLabels();
        this.renderCalendar();
    }

    updateViewToggle() {
        if (this.viewSelect) {
            this.viewSelect.value = this.currentView;
        }
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
        
        // Clear calendar grid and reset header
        this.calendarGrid.innerHTML = '';
        this.calendarGrid.className = 'calendar-grid';
        
        // Reset calendar header for month view
        const calendarHeader = document.getElementById('calendarHeader');
        if (calendarHeader) {
            calendarHeader.className = 'calendar-header';
        }
        
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
        
        // Clear calendar grid and update header
        this.calendarGrid.innerHTML = '';
        this.calendarGrid.className = 'calendar-grid week-view';
        
        // Update calendar header for week view
        const calendarHeader = document.getElementById('calendarHeader');
        if (calendarHeader) {
            calendarHeader.className = 'calendar-header week-view';
            calendarHeader.innerHTML = `
                <div class="calendar-day-header">Mo ${startOfWeek.getDate()}</div>
                <div class="calendar-day-header">Di ${(new Date(startOfWeek.getTime() + 24*60*60*1000)).getDate()}</div>
                <div class="calendar-day-header">Mi ${(new Date(startOfWeek.getTime() + 2*24*60*60*1000)).getDate()}</div>
                <div class="calendar-day-header">Do ${(new Date(startOfWeek.getTime() + 3*24*60*60*1000)).getDate()}</div>
                <div class="calendar-day-header">Fr ${(new Date(startOfWeek.getTime() + 4*24*60*60*1000)).getDate()}</div>
                <div class="calendar-day-header">Sa ${(new Date(startOfWeek.getTime() + 5*24*60*60*1000)).getDate()}</div>
                <div class="calendar-day-header">So ${(new Date(startOfWeek.getTime() + 6*24*60*60*1000)).getDate()}</div>
            `;
        }
        
        // Get all appointments for the week
        const weekAppointments = this.getAppointmentsForWeek(startOfWeek);
        
        // Generate time slots from 0:00 to 23:00 (24 hours)
        for (let hour = 0; hour < 24; hour++) {
            const timeSlotRow = document.createElement('div');
            timeSlotRow.className = 'time-slot-row';
            
            // Time label
            const timeLabel = document.createElement('div');
            timeLabel.className = 'time-slot-label';
            timeLabel.textContent = `${hour.toString().padStart(2, '0')}:00`;
            timeSlotRow.appendChild(timeLabel);
            
            // Generate day columns for this time slot
            for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
                const currentDayDate = new Date(startOfWeek);
                currentDayDate.setDate(startOfWeek.getDate() + dayIndex);
                
                const daySlot = document.createElement('div');
                daySlot.className = 'day-time-slot';
                daySlot.setAttribute('data-day', dayIndex);
                daySlot.setAttribute('data-hour', hour);
                
                // Check if this is the current time
                const now = new Date();
                const isCurrentTime = this.isToday(currentDayDate) && now.getHours() === hour;
                if (isCurrentTime) {
                    daySlot.classList.add('current-time');
                }
                
                // Check if this slot should show an appointment
                const appointmentForSlot = this.getAppointmentForSlot(weekAppointments, currentDayDate, hour);
                
                if (appointmentForSlot) {
                    // Calculate how many rows this appointment should span
                    const appointmentStartHour = parseInt(appointmentForSlot.time.split(':')[0]);
                    const appointmentStartMinute = parseInt(appointmentForSlot.time.split(':')[1]);
                    const appointmentEndTime = new Date(`${appointmentForSlot.date}T${appointmentForSlot.time}`);
                    appointmentEndTime.setMinutes(appointmentEndTime.getMinutes() + appointmentForSlot.duration);
                    
                    const durationInHours = appointmentForSlot.duration / 60;
                    const rowSpan = Math.max(1, Math.ceil(durationInHours));
                    
                    // Only show appointment in the first slot of its duration
                    if (hour === appointmentStartHour) {
                        const appointmentElement = document.createElement('div');
                        appointmentElement.className = `appointment-slot ${appointmentForSlot.type}`;
                        appointmentElement.style.gridRow = `span ${rowSpan}`;
                        appointmentElement.innerHTML = `
                            <div class="appointment-slot-time">${appointmentForSlot.time}</div>
                            <div class="appointment-slot-patient">${appointmentForSlot.patient}</div>
                            <div class="appointment-slot-type">${this.getTypeLabel(appointmentForSlot.type)}</div>
                            <div class="appointment-slot-duration">${appointmentForSlot.duration} Min</div>
                        `;
                        
                        // Add click event to show appointment details
                        appointmentElement.addEventListener('click', (e) => {
                            e.stopPropagation();
                            this.showAppointmentDetails(appointmentForSlot);
                        });
                        
                        daySlot.appendChild(appointmentElement);
                    }
                } else {
                    // Add click event to create new appointment
                    daySlot.addEventListener('click', () => {
                        const selectedDate = new Date(currentDayDate);
                        selectedDate.setHours(hour, 0, 0, 0);
                        this.openNewAppointmentModal(selectedDate);
                    });
                }
                
                timeSlotRow.appendChild(daySlot);
            }
            
            this.calendarGrid.appendChild(timeSlotRow);
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
        } else {
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
        
        // Also update the table view
        this.renderAppointmentsTable();
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
                <div class="appointment-time">
                    <div class="appointment-date">${this.formatGermanDate(appointment.date)}</div>
                    <div class="appointment-time-slot">${appointment.time}</div>
                    <div class="appointment-duration">${appointment.duration} Min</div>
                </div>
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
            }); // Show all upcoming appointments
    }

    getAppointmentsForDate(date) {
        const dateString = this.formatDate(date);
        return this.appointments.filter(appointment => appointment.date === dateString);
    }

    getAppointmentsForTimeSlot(date, hour) {
        const dateString = this.formatDate(date);
        return this.appointments.filter(appointment => {
            if (appointment.date !== dateString) return false;
            
            const appointmentHour = parseInt(appointment.time.split(':')[0]);
            return appointmentHour === hour;
        });
    }

    getAppointmentsForWeek(startOfWeek) {
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        
        return this.appointments.filter(appointment => {
            const appointmentDate = new Date(appointment.date);
            return appointmentDate >= startOfWeek && appointmentDate <= endOfWeek;
        });
    }

    getAppointmentForSlot(weekAppointments, date, hour) {
        const dateString = this.formatDate(date);
        
        return weekAppointments.find(appointment => {
            if (appointment.date !== dateString) return false;
            
            const appointmentStartHour = parseInt(appointment.time.split(':')[0]);
            const appointmentStartMinute = parseInt(appointment.time.split(':')[1]);
            
            // Check if this hour is within the appointment duration
            const appointmentStartTime = new Date(`${appointment.date}T${appointment.time}`);
            const appointmentEndTime = new Date(appointmentStartTime.getTime() + appointment.duration * 60000);
            
            const slotStartTime = new Date(date);
            slotStartTime.setHours(hour, 0, 0, 0);
            const slotEndTime = new Date(slotStartTime.getTime() + 60 * 60000); // 1 hour later
            
            // Return true if this slot overlaps with the appointment
            return slotStartTime < appointmentEndTime && slotEndTime > appointmentStartTime;
        });
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

    // Table Methods
    renderAppointmentsTable() {
        const filteredAppointments = this.getFilteredAppointments();
        this.appointmentsTableBody.innerHTML = '';

        if (filteredAppointments.length === 0) {
            this.appointmentsTableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="table-empty">
                        <div class="table-empty-icon">📋</div>
                        <h3 class="table-empty-title">Keine Termine gefunden</h3>
                        <p class="table-empty-description">Versuchen Sie andere Suchkriterien oder erstellen Sie einen neuen Termin.</p>
                    </td>
                </tr>
            `;
            this.updateTablePagination(0);
            return;
        }

        filteredAppointments.forEach(appointment => {
            const row = this.createAppointmentTableRow(appointment);
            this.appointmentsTableBody.appendChild(row);
        });

        this.updateTablePagination(filteredAppointments.length);
    }

    createAppointmentTableRow(appointment) {
        const row = document.createElement('tr');
        row.className = 'appointment-row';
        row.dataset.appointmentId = appointment.id;

        const statusClass = this.getStatusClass(appointment.status);
        const statusLabel = this.getStatusLabel(appointment.status);
        const typeLabel = this.getTypeLabel(appointment.type);

        row.innerHTML = `
            <td class="avatar-cell">
                <div class="avatar">${appointment.patient.split(' ')[0].charAt(0).toUpperCase()}</div>
                <div>
                    <div>${appointment.patient.split(' - ')[0]}</div>
                    <small>ID: #${appointment.id}</small>
                </div>
            </td>
            <td>${appointment.patient.split(' - ')[1] || 'Unbekannt'}</td>
            <td>
                <div>${this.formatGermanDate(appointment.date)}</div>
                <small>${appointment.time} Uhr</small>
            </td>
            <td>${typeLabel}</td>
            <td><span class="status-cell ${statusClass}">${statusLabel}</span></td>
            <td class="table-text-center">${appointment.duration} Min</td>
            <td class="action-cell">
                <button class="btn btn-sm btn-primary" onclick="calendarApp.viewAppointment('${appointment.id}')">Ansehen</button>
                <button class="btn btn-sm btn-secondary" onclick="calendarApp.editAppointmentFromTable('${appointment.id}')">Bearbeiten</button>
            </td>
        `;

        return row;
    }

    getFilteredAppointments() {
        const searchTerm = this.appointmentSearch.value.toLowerCase();
        const statusFilter = this.statusFilter.value;
        const typeFilter = this.typeFilter.value;

        return this.appointments.filter(appointment => {
            const matchesSearch = !searchTerm || 
                appointment.patient.toLowerCase().includes(searchTerm) ||
                appointment.notes.toLowerCase().includes(searchTerm);

            const matchesStatus = !statusFilter || appointment.status === statusFilter;
            const matchesType = !typeFilter || appointment.type === typeFilter;

            return matchesSearch && matchesStatus && matchesType;
        });
    }

    filterAppointments() {
        this.renderAppointmentsTable();
    }

    sortTable(header) {
        const isAsc = header.classList.contains('sort-asc');
        const isDesc = header.classList.contains('sort-desc');
        
        // Remove existing sort classes
        header.parentElement.querySelectorAll('th').forEach(th => {
            th.classList.remove('sort-asc', 'sort-desc');
        });
        
        // Add new sort class
        if (!isAsc && !isDesc) {
            header.classList.add('sort-asc');
        } else if (isAsc) {
            header.classList.add('sort-desc');
        } else {
            header.classList.add('sort-asc');
        }
        
        // Implement sorting logic based on column
        const columnIndex = Array.from(header.parentElement.children).indexOf(header);
        this.sortAppointmentsByColumn(columnIndex, isAsc ? 'desc' : 'asc');
    }

    sortAppointmentsByColumn(columnIndex, direction) {
        const filteredAppointments = this.getFilteredAppointments();
        
        filteredAppointments.sort((a, b) => {
            let aValue, bValue;
            
            switch(columnIndex) {
                case 0: // Patient
                    aValue = a.patient.split(' - ')[0].toLowerCase();
                    bValue = b.patient.split(' - ')[0].toLowerCase();
                    break;
                case 1: // Owner
                    aValue = (a.patient.split(' - ')[1] || '').toLowerCase();
                    bValue = (b.patient.split(' - ')[1] || '').toLowerCase();
                    break;
                case 2: // Date & Time
                    aValue = new Date(a.date + ' ' + a.time);
                    bValue = new Date(b.date + ' ' + b.time);
                    break;
                case 3: // Type
                    aValue = this.getTypeLabel(a.type).toLowerCase();
                    bValue = this.getTypeLabel(b.type).toLowerCase();
                    break;
                case 4: // Status
                    aValue = this.getStatusLabel(a.status).toLowerCase();
                    bValue = this.getStatusLabel(b.status).toLowerCase();
                    break;
                case 5: // Duration
                    aValue = a.duration;
                    bValue = b.duration;
                    break;
                default:
                    return 0;
            }
            
            if (direction === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
        
        this.renderSortedAppointments(filteredAppointments);
    }

    renderSortedAppointments(sortedAppointments) {
        this.appointmentsTableBody.innerHTML = '';
        sortedAppointments.forEach(appointment => {
            const row = this.createAppointmentTableRow(appointment);
            this.appointmentsTableBody.appendChild(row);
        });
    }

    updateTablePagination(totalItems) {
        this.tablePaginationInfo.textContent = `Zeige 1-${totalItems} von ${totalItems} Ergebnissen`;
        
        // Simple pagination - in a real app you'd implement proper pagination
        const controls = this.tablePaginationControls;
        controls.innerHTML = `
            <button class="table-pagination-btn" disabled>‹</button>
            <button class="table-pagination-btn active">1</button>
            <button class="table-pagination-btn" disabled>›</button>
        `;
    }

    getStatusClass(status) {
        const statusClasses = {
            'scheduled': 'info',
            'confirmed': 'active',
            'completed': 'success',
            'cancelled': 'error'
        };
        return statusClasses[status] || 'inactive';
    }

    getStatusLabel(status) {
        const statusLabels = {
            'scheduled': 'Geplant',
            'confirmed': 'Bestätigt',
            'completed': 'Abgeschlossen',
            'cancelled': 'Storniert'
        };
        return statusLabels[status] || 'Unbekannt';
    }

    viewAppointment(appointmentId) {
        const appointment = this.appointments.find(a => a.id === appointmentId);
        if (appointment) {
            this.showAppointmentDetails(appointment);
        }
    }

    editAppointmentFromTable(appointmentId) {
        const appointment = this.appointments.find(a => a.id === appointmentId);
        if (appointment) {
            this.editingAppointment = appointment;
            this.openNewAppointmentModal();
            this.populateFormWithAppointment(appointment);
        }
    }

    populateFormWithAppointment(appointment) {
        this.patientNameSelect.value = appointment.patient;
        this.appointmentDateInput.value = appointment.date;
        this.appointmentTimeInput.value = appointment.time;
        this.appointmentTypeSelect.value = appointment.type;
        this.appointmentDurationSelect.value = appointment.duration;
        this.appointmentNotesTextarea.value = appointment.notes;
        this.appointmentStatusSelect.value = appointment.status;
        this.modalTitle.textContent = 'Termin bearbeiten';
    }

    exportAppointments() {
        const filteredAppointments = this.getFilteredAppointments();
        const csvContent = this.generateCSV(filteredAppointments);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `termine_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    }

    generateCSV(appointments) {
        const headers = ['Patient', 'Besitzer', 'Datum', 'Zeit', 'Behandlungstyp', 'Status', 'Dauer', 'Notizen'];
        const rows = appointments.map(appointment => [
            appointment.patient.split(' - ')[0],
            appointment.patient.split(' - ')[1] || 'Unbekannt',
            appointment.date,
            appointment.time,
            this.getTypeLabel(appointment.type),
            this.getStatusLabel(appointment.status),
            appointment.duration + ' Min',
            appointment.notes
        ]);
        
        return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    }

    printAppointments() {
        const printWindow = window.open('', '_blank');
        const filteredAppointments = this.getFilteredAppointments();
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Termin Übersicht</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    .status { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
                    .scheduled { background-color: #e3f2fd; color: #1976d2; }
                    .confirmed { background-color: #e8f5e8; color: #2e7d32; }
                    .completed { background-color: #e8f5e8; color: #2e7d32; }
                    .cancelled { background-color: #ffebee; color: #c62828; }
                </style>
            </head>
            <body>
                <h1>Termin Übersicht</h1>
                <p>Erstellt am: ${new Date().toLocaleDateString('de-DE')}</p>
                <table>
                    <thead>
                        <tr>
                            <th>Patient</th>
                            <th>Besitzer</th>
                            <th>Datum</th>
                            <th>Zeit</th>
                            <th>Behandlungstyp</th>
                            <th>Status</th>
                            <th>Dauer</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredAppointments.map(appointment => `
                            <tr>
                                <td>${appointment.patient.split(' - ')[0]}</td>
                                <td>${appointment.patient.split(' - ')[1] || 'Unbekannt'}</td>
                                <td>${this.formatGermanDate(appointment.date)}</td>
                                <td>${appointment.time}</td>
                                <td>${this.getTypeLabel(appointment.type)}</td>
                                <td><span class="status ${appointment.status}">${this.getStatusLabel(appointment.status)}</span></td>
                                <td>${appointment.duration} Min</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.print();
    }
}

// Initialize the calendar when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CalendarApp();
}); 