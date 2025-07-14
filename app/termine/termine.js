// Termine Page JavaScript

class TermineManager {
    constructor() {
        this.termine = this.loadTermine();
        this.patients = this.loadPatients();
        this.currentTermin = null;
        this.isEditing = false;
        this.currentView = 'calendar';
        this.currentDate = new Date();
        this.currentWeek = new Date();
        
        this.initializeElements();
        this.bindEvents();
        this.populatePatientSelect();
        this.renderTermine();
        this.updateEmptyState();
        this.updateCurrentDate();
    }
    
    initializeElements() {
        // Modal elements
        this.modal = document.getElementById('terminModal');
        this.modalContent = this.modal.querySelector('.modal-content');
        this.closeModalBtn = document.getElementById('closeModal');
        this.cancelBtn = document.getElementById('cancelBtn');
        
        // Form elements
        this.terminForm = document.getElementById('terminForm');
        this.formInputs = this.terminForm.querySelectorAll('input, select, textarea');
        this.patientSelect = document.getElementById('patientSelect');
        this.ownerNameInput = document.getElementById('ownerName');
        this.ownerPhoneInput = document.getElementById('ownerPhone');
        this.ownerEmailInput = document.getElementById('ownerEmail');
        
        // Action buttons
        this.addTerminBtn = document.getElementById('addTerminBtn');
        this.addFirstTerminBtn = document.getElementById('addFirstTerminBtn');
        
        // View controls
        this.calendarViewBtn = document.getElementById('calendarViewBtn');
        this.listViewBtn = document.getElementById('listViewBtn');
        this.calendarView = document.getElementById('calendarView');
        this.listView = document.getElementById('listView');
        
        // Search and filter
        this.searchInput = document.getElementById('terminSearch');
        this.statusFilter = document.getElementById('statusFilter');
        this.typeFilter = document.getElementById('typeFilter');
        
        // Date controls
        this.prevDateBtn = document.getElementById('prevDateBtn');
        this.nextDateBtn = document.getElementById('nextDateBtn');
        this.currentDateElement = document.getElementById('currentDate');
        this.datePresets = document.querySelectorAll('[data-preset]');
        
        // Calendar elements
        this.prevWeekBtn = document.getElementById('prevWeekBtn');
        this.nextWeekBtn = document.getElementById('nextWeekBtn');
        this.currentWeekElement = document.getElementById('currentWeek');
        this.weeklyCalendar = document.getElementById('weeklyCalendar');
        
        // Table elements
        this.termineTable = document.getElementById('termineTable');
        this.termineTableBody = document.getElementById('termineTableBody');
        this.noTermine = document.getElementById('noTermine');
        
        // Alert container
        this.alertContainer = document.getElementById('alertContainer');
    }
    
    bindEvents() {
        // Modal events
        this.addTerminBtn.addEventListener('click', () => this.openModal());
        this.addFirstTerminBtn.addEventListener('click', () => this.openModal());
        this.closeModalBtn.addEventListener('click', () => this.closeModal());
        this.cancelBtn.addEventListener('click', () => this.closeModal());
        
        // Close modal on outside click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
        
        // Form submission
        this.terminForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        
        // Patient selection
        this.patientSelect.addEventListener('change', () => this.handlePatientSelection());
        
        // View controls
        this.calendarViewBtn.addEventListener('click', () => this.switchView('calendar'));
        this.listViewBtn.addEventListener('click', () => this.switchView('list'));
        
        // Search and filter
        this.searchInput.addEventListener('input', () => this.handleSearch());
        this.statusFilter.addEventListener('change', () => this.handleFilter());
        this.typeFilter.addEventListener('change', () => this.handleFilter());
        
        // Date controls
        this.prevDateBtn.addEventListener('click', () => this.navigateDate(-1));
        this.nextDateBtn.addEventListener('click', () => this.navigateDate(1));
        this.datePresets.forEach(preset => {
            preset.addEventListener('click', (e) => this.handleDatePreset(e.target.dataset.preset));
        });
        
        // Calendar controls
        this.prevWeekBtn.addEventListener('click', () => this.navigateWeek(-1));
        this.nextWeekBtn.addEventListener('click', () => this.navigateWeek(1));
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.closeModal();
            }
        });
    }
    
    // Modal Management
    openModal(termin = null) {
        this.currentTermin = termin;
        this.isEditing = !!termin;
        
        if (this.isEditing) {
            this.fillFormWithTermin(termin);
            this.modal.querySelector('.modal-title').textContent = 'Termin bearbeiten';
        } else {
            this.clearForm();
            this.modal.querySelector('.modal-title').textContent = 'Neuen Termin hinzufügen';
            
            // Set default date to today
            const today = new Date().toISOString().split('T')[0];
            this.terminForm.querySelector('[name="terminDate"]').value = today;
        }
        
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Focus first input
        setTimeout(() => {
            this.terminForm.querySelector('input').focus();
        }, 100);
    }
    
    openBookingModal(date, time) {
        this.currentTermin = null;
        this.isEditing = false;
        
        this.clearForm();
        this.modal.querySelector('.modal-title').textContent = 'Neuen Termin buchen';
        
        // Pre-fill date and time
        const dateString = date.toISOString().split('T')[0];
        this.terminForm.querySelector('[name="terminDate"]').value = dateString;
        this.terminForm.querySelector('[name="terminTime"]').value = time;
        
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Focus on patient selection
        setTimeout(() => {
            this.patientSelect.focus();
        }, 100);
    }
    
    closeModal() {
        this.modal.classList.remove('active');
        document.body.style.overflow = '';
        this.currentTermin = null;
        this.isEditing = false;
        this.clearForm();
    }
    
    clearForm() {
        this.formInputs.forEach(input => {
            if (input.type === 'checkbox') {
                input.checked = false;
            } else {
                input.value = '';
            }
        });
        
        // Clear readonly fields
        this.ownerNameInput.value = '';
        this.ownerPhoneInput.value = '';
        this.ownerEmailInput.value = '';
        
        // Remove error states
        this.terminForm.querySelectorAll('.form-group').forEach(group => {
            group.classList.remove('error', 'success');
        });
    }
    
    fillFormWithTermin(termin) {
        const formData = {
            terminDate: termin.date,
            terminTime: termin.time,
            terminDuration: termin.duration,
            terminType: termin.type,
            terminStatus: termin.status,
            terminNotes: termin.notes || '',
            patientId: termin.patientId,
            assignedStaff: termin.assignedStaff || '',
            treatmentRoom: termin.treatmentRoom || '',
            equipment: termin.equipment || '',
            sendReminder: termin.sendReminder || false,
            sendEmail: termin.sendEmail || false
        };
        
        Object.keys(formData).forEach(key => {
            const input = this.terminForm.querySelector(`[name="${key}"]`);
            if (input) {
                if (input.type === 'checkbox') {
                    input.checked = formData[key];
                } else {
                    input.value = formData[key];
                }
            }
        });
        
        // Update owner information
        this.updateOwnerInfo(termin.patientId);
    }
    
    // Patient Integration
    populatePatientSelect() {
        this.patientSelect.innerHTML = '<option value="">Patient auswählen</option>';
        
        this.patients.forEach(patient => {
            const option = document.createElement('option');
            option.value = patient.id;
            option.textContent = `${patient.name} (${patient.species}) - ${patient.owner.name}`;
            this.patientSelect.appendChild(option);
        });
    }
    
    handlePatientSelection() {
        const patientId = this.patientSelect.value;
        this.updateOwnerInfo(patientId);
    }
    
    updateOwnerInfo(patientId) {
        const patient = this.patients.find(p => p.id === patientId);
        
        if (patient) {
            this.ownerNameInput.value = patient.owner.name;
            this.ownerPhoneInput.value = patient.owner.phone;
            this.ownerEmailInput.value = patient.owner.email || '';
        } else {
            this.ownerNameInput.value = '';
            this.ownerPhoneInput.value = '';
            this.ownerEmailInput.value = '';
        }
    }
    
    // View Management
    switchView(view) {
        this.currentView = view;
        
        // Update button states
        this.calendarViewBtn.classList.toggle('active', view === 'calendar');
        this.listViewBtn.classList.toggle('active', view === 'list');
        
        // Show/hide views
        this.calendarView.style.display = view === 'calendar' ? 'block' : 'none';
        this.listView.style.display = view === 'list' ? 'block' : 'none';
        
        if (view === 'calendar') {
            this.renderCalendar();
        } else {
            this.renderTermine();
        }
    }
    
    // Date Navigation
    navigateDate(direction) {
        const newDate = new Date(this.currentDate);
        newDate.setDate(newDate.getDate() + direction);
        this.currentDate = newDate;
        this.updateCurrentDate();
        this.renderTermine();
    }
    
    handleDatePreset(preset) {
        const today = new Date();
        let targetDate = new Date();
        
        switch (preset) {
            case 'today':
                targetDate = today;
                break;
            case 'tomorrow':
                targetDate.setDate(today.getDate() + 1);
                break;
            case 'week':
                // Start of current week
                const dayOfWeek = today.getDay();
                targetDate.setDate(today.getDate() - dayOfWeek);
                break;
            case 'month':
                // Start of current month
                targetDate.setDate(1);
                break;
        }
        
        this.currentDate = targetDate;
        this.updateCurrentDate();
        this.renderTermine();
    }
    
    updateCurrentDate() {
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        this.currentDateElement.textContent = this.currentDate.toLocaleDateString('de-DE', options);
    }
    
    // Calendar Management
    navigateWeek(direction) {
        this.currentWeek.setDate(this.currentWeek.getDate() + (direction * 7));
        this.renderWeeklyCalendar();
    }
    
    renderWeeklyCalendar() {
        const weekStart = this.getWeekStart(this.currentWeek);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        // Update week display
        const startDay = weekStart.getDate();
        const endDay = weekEnd.getDate();
        const monthNames = [
            'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
            'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
        ];
        
        let weekText = '';
        if (weekStart.getMonth() === weekEnd.getMonth()) {
            weekText = `${startDay}. - ${endDay}. ${monthNames[weekStart.getMonth()]} ${weekStart.getFullYear()}`;
        } else {
            weekText = `${startDay}. ${monthNames[weekStart.getMonth()]} - ${endDay}. ${monthNames[weekEnd.getMonth()]} ${weekStart.getFullYear()}`;
        }
        
        this.currentWeekElement.textContent = weekText;
        
        // Generate weekly calendar
        this.generateWeeklyCalendar(weekStart);
    }
    
    getWeekStart(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day;
        return new Date(d.setDate(diff));
    }
    
    generateWeeklyCalendar(weekStart) {
        this.weeklyCalendar.innerHTML = '';
        
        // Create time slots (7:00 - 19:00)
        const timeSlots = [];
        for (let hour = 7; hour <= 19; hour++) {
            timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
        }
        
        // Create header row with day names
        const headerRow = document.createElement('div');
        headerRow.className = 'weekly-calendar-header';
        
        // Add time column header
        const timeHeader = document.createElement('div');
        timeHeader.className = 'time-header';
        timeHeader.textContent = 'Zeit';
        headerRow.appendChild(timeHeader);
        
        // Add day headers
        const dayNames = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
        for (let i = 0; i < 7; i++) {
            const dayDate = new Date(weekStart);
            dayDate.setDate(dayDate.getDate() + i);
            
            const dayHeader = document.createElement('div');
            dayHeader.className = 'day-header';
            
            const dayName = document.createElement('div');
            dayName.className = 'day-name';
            dayName.textContent = dayNames[i];
            dayHeader.appendChild(dayName);
            
            const dayDateElement = document.createElement('div');
            dayDateElement.className = 'day-date';
            dayDateElement.textContent = dayDate.getDate();
            dayHeader.appendChild(dayDateElement);
            
            // Highlight today
            const today = new Date();
            if (dayDate.toDateString() === today.toDateString()) {
                dayHeader.classList.add('today');
            }
            
            headerRow.appendChild(dayHeader);
        }
        
        this.weeklyCalendar.appendChild(headerRow);
        
        // Create time slot rows
        timeSlots.forEach(timeSlot => {
            const timeRow = document.createElement('div');
            timeRow.className = 'weekly-calendar-row';
            
            // Add time column
            const timeColumn = document.createElement('div');
            timeColumn.className = 'time-column';
            timeColumn.textContent = timeSlot;
            timeRow.appendChild(timeColumn);
            
            // Add day columns
            for (let i = 0; i < 7; i++) {
                const dayDate = new Date(weekStart);
                dayDate.setDate(dayDate.getDate() + i);
                
                const dayColumn = document.createElement('div');
                dayColumn.className = 'day-column';
                dayColumn.dataset.date = dayDate.toISOString().split('T')[0];
                dayColumn.dataset.time = timeSlot;
                
                // Add events for this time slot
                const dayEvents = this.getTermineForDate(dayDate);
                const timeEvents = dayEvents.filter(event => event.time.startsWith(timeSlot.split(':')[0]));
                
                if (timeEvents.length > 0) {
                    // Show existing events
                    timeEvents.forEach(event => {
                        const eventElement = document.createElement('div');
                        eventElement.className = `weekly-event ${event.status}`;
                        eventElement.innerHTML = `
                            <div class="event-time">${event.time}</div>
                            <div class="event-patient">${event.patientName}</div>
                            <div class="event-type">${this.getTypeLabel(event.type)}</div>
                        `;
                        eventElement.title = `${event.time} - ${event.patientName} (${this.getTypeLabel(event.type)})`;
                        eventElement.addEventListener('click', (e) => {
                            e.stopPropagation();
                            this.openModal(event);
                        });
                        dayColumn.appendChild(eventElement);
                    });
                } else {
                    // Add clickable empty slot (no text)
                    const emptySlot = document.createElement('div');
                    emptySlot.className = 'empty-time-slot';
                    emptySlot.title = `Termin um ${timeSlot} buchen`;
                    emptySlot.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.openBookingModal(dayDate, timeSlot);
                    });
                    dayColumn.appendChild(emptySlot);
                }
                
                // Make the entire column clickable for booking (only if no events)
                if (timeEvents.length === 0) {
                    dayColumn.style.cursor = 'pointer';
                    dayColumn.title = `Termin um ${timeSlot} buchen`;
                    dayColumn.addEventListener('click', (e) => {
                        // Only trigger if clicking on the column itself, not on the empty slot
                        if (e.target === dayColumn) {
                            this.openBookingModal(dayDate, timeSlot);
                        }
                    });
                }
                
                timeRow.appendChild(dayColumn);
            }
            
            this.weeklyCalendar.appendChild(timeRow);
        });
    }
    
    // Form Validation and Submission
    validateForm() {
        let isValid = true;
        const errors = {};
        
        // Required fields
        const requiredFields = ['terminDate', 'terminTime', 'terminDuration', 'terminType', 'patientId'];
        
        requiredFields.forEach(fieldName => {
            const input = this.terminForm.querySelector(`[name="${fieldName}"]`);
            const value = input.value.trim();
            
            if (!value) {
                errors[fieldName] = 'Dieses Feld ist erforderlich';
                isValid = false;
            }
        });
        
        // Date validation
        const dateInput = this.terminForm.querySelector('[name="terminDate"]');
        const selectedDate = new Date(dateInput.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            errors.terminDate = 'Termine können nicht in der Vergangenheit liegen';
            isValid = false;
        }
        
        // Time validation
        const timeInput = this.terminForm.querySelector('[name="terminTime"]');
        if (timeInput.value && !this.isValidTime(timeInput.value)) {
            errors.terminTime = 'Bitte geben Sie eine gültige Uhrzeit ein';
            isValid = false;
        }
        
        this.displayFormErrors(errors);
        return isValid;
    }
    
    isValidTime(time) {
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return timeRegex.test(time);
    }
    
    displayFormErrors(errors) {
        // Clear previous errors
        this.terminForm.querySelectorAll('.form-group').forEach(group => {
            group.classList.remove('error');
            const errorMessage = group.querySelector('.error-message');
            if (errorMessage) {
                errorMessage.remove();
            }
        });
        
        // Display new errors
        Object.keys(errors).forEach(fieldName => {
            const input = this.terminForm.querySelector(`[name="${fieldName}"]`);
            if (input) {
                const formGroup = input.closest('.form-group');
                formGroup.classList.add('error');
                
                const errorMessage = document.createElement('div');
                errorMessage.className = 'error-message';
                errorMessage.textContent = errors[fieldName];
                formGroup.appendChild(errorMessage);
            }
        });
    }
    
    handleFormSubmit(e) {
        e.preventDefault();
        
        if (!this.validateForm()) {
            return;
        }
        
        const formData = this.getFormData();
        
        if (this.isEditing) {
            this.updateTermin(this.currentTermin.id, formData);
        } else {
            this.addTermin(formData);
        }
        
        this.closeModal();
        this.showAlert('Termin erfolgreich gespeichert!', 'success');
    }
    
    getFormData() {
        const formData = {};
        this.formInputs.forEach(input => {
            if (input.type === 'checkbox') {
                formData[input.name] = input.checked;
            } else {
                formData[input.name] = input.value.trim();
            }
        });
        
        return formData;
    }
    
    // Data Management
    addTermin(terminData) {
        const patient = this.patients.find(p => p.id === terminData.patientId);
        
        const newTermin = {
            id: this.generateId(),
            ...terminData,
            patientName: patient ? patient.name : 'Unbekannt',
            patientSpecies: patient ? patient.species : '',
            ownerName: patient ? patient.owner.name : '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        this.termine.push(newTermin);
        this.saveTermine();
        this.renderTermine();
        this.updateEmptyState();
    }
    
    updateTermin(terminId, terminData) {
        const index = this.termine.findIndex(t => t.id === terminId);
        if (index !== -1) {
            const patient = this.patients.find(p => p.id === terminData.patientId);
            
            this.termine[index] = {
                ...this.termine[index],
                ...terminData,
                patientName: patient ? patient.name : 'Unbekannt',
                patientSpecies: patient ? patient.species : '',
                ownerName: patient ? patient.owner.name : '',
                updatedAt: new Date().toISOString()
            };
            
            this.saveTermine();
            this.renderTermine();
        }
    }
    
    deleteTermin(terminId) {
        if (confirm('Sind Sie sicher, dass Sie diesen Termin löschen möchten?')) {
            this.termine = this.termine.filter(t => t.id !== terminId);
            this.saveTermine();
            this.renderTermine();
            this.updateEmptyState();
            this.showAlert('Termin erfolgreich gelöscht!', 'success');
        }
    }
    
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    // Search and Filter
    handleSearch() {
        this.renderTermine();
    }
    
    handleFilter() {
        this.renderTermine();
    }
    
    filterTermine() {
        let filtered = [...this.termine];
        
        // Search filter
        const searchTerm = this.searchInput.value.toLowerCase();
        if (searchTerm) {
            filtered = filtered.filter(termin => 
                termin.patientName.toLowerCase().includes(searchTerm) ||
                termin.ownerName.toLowerCase().includes(searchTerm) ||
                termin.type.toLowerCase().includes(searchTerm) ||
                termin.notes.toLowerCase().includes(searchTerm)
            );
        }
        
        // Status filter
        const statusFilter = this.statusFilter.value;
        if (statusFilter) {
            filtered = filtered.filter(termin => termin.status === statusFilter);
        }
        
        // Type filter
        const typeFilter = this.typeFilter.value;
        if (typeFilter) {
            filtered = filtered.filter(termin => termin.type === typeFilter);
        }
        
        return filtered;
    }
    
    // Rendering
    renderTermine() {
        if (this.currentView === 'calendar') {
            this.renderWeeklyCalendar();
        } else {
            const filteredTermine = this.filterTermine();
            this.renderTermineTable(filteredTermine);
            this.updateEmptyState(filteredTermine.length === 0);
        }
    }
    
    renderTermineTable(termine) {
        this.termineTableBody.innerHTML = '';
        
        if (termine.length === 0) {
            return;
        }
        
        // Sort by date and time
        termine.sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.time}`);
            const dateB = new Date(`${b.date}T${b.time}`);
            return dateA - dateB;
        });
        
        termine.forEach(termin => {
            const row = document.createElement('tr');
            
            const dateTime = new Date(`${termin.date}T${termin.time}`);
            const formattedDateTime = dateTime.toLocaleString('de-DE', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            row.innerHTML = `
                <td class="termin-datetime">${formattedDateTime}</td>
                <td class="termin-patient">${this.escapeHtml(termin.patientName)}</td>
                <td><span class="termin-type ${termin.type}">${this.getTypeLabel(termin.type)}</span></td>
                <td><span class="termin-status ${termin.status}">${this.getStatusLabel(termin.status)}</span></td>
                <td class="termin-staff">${this.escapeHtml(termin.assignedStaff || '-')}</td>
                <td class="termin-duration">${termin.duration} Min.</td>
                <td class="termin-actions">
                    <button class="btn btn-secondary btn-sm" onclick="termineManager.editTermin('${termin.id}')">
                        Bearbeiten
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="termineManager.deleteTermin('${termin.id}')">
                        Löschen
                    </button>
                </td>
            `;
            
            this.termineTableBody.appendChild(row);
        });
    }
    
    editTermin(terminId) {
        const termin = this.termine.find(t => t.id === terminId);
        if (termin) {
            this.openModal(termin);
        }
    }
    
    updateEmptyState(showEmpty = false) {
        const hasTermine = this.termine.length > 0;
        this.noTermine.style.display = (showEmpty || !hasTermine) ? 'block' : 'none';
        this.termineTable.style.display = (showEmpty || !hasTermine) ? 'none' : 'table';
    }
    
    getTermineForDate(date) {
        const dateString = date.toISOString().split('T')[0];
        return this.termine.filter(termin => termin.date === dateString);
    }
    
    getTypeLabel(type) {
        const labels = {
            konsultation: 'Konsultation',
            impfung: 'Impfung',
            operation: 'Operation',
            untersuchung: 'Untersuchung',
            behandlung: 'Behandlung',
            nachsorge: 'Nachsorge',
            notfall: 'Notfall',
            sonstiges: 'Sonstiges'
        };
        return labels[type] || type;
    }
    
    getStatusLabel(status) {
        const labels = {
            geplant: 'Geplant',
            bestätigt: 'Bestätigt',
            in_bearbeitung: 'In Bearbeitung',
            abgeschlossen: 'Abgeschlossen',
            abgesagt: 'Abgesagt',
            verschoben: 'Verschoben'
        };
        return labels[status] || status;
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    showAlert(message, type = 'info') {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;
        
        this.alertContainer.appendChild(alert);
        
        setTimeout(() => {
            alert.remove();
        }, 5000);
    }
    
    // Data Persistence
    loadTermine() {
        const stored = localStorage.getItem('vetmates_termine');
        return stored ? JSON.parse(stored) : this.getSampleTermine();
    }
    
    saveTermine() {
        localStorage.setItem('vetmates_termine', JSON.stringify(this.termine));
    }
    
    loadPatients() {
        const stored = localStorage.getItem('vetmates_patients');
        return stored ? JSON.parse(stored) : [];
    }
    
    getSampleTermine() {
        return [
            {
                id: '1',
                date: '2024-12-15',
                time: '09:00',
                duration: '30',
                type: 'konsultation',
                status: 'bestätigt',
                patientId: '1',
                patientName: 'Luna',
                patientSpecies: 'katze',
                ownerName: 'Max Mustermann',
                assignedStaff: 'dr_schmidt',
                treatmentRoom: 'raum_1',
                notes: 'Jährliche Untersuchung',
                sendReminder: true,
                sendEmail: false,
                createdAt: '2024-12-01T10:00:00Z',
                updatedAt: '2024-12-01T10:00:00Z'
            },
            {
                id: '2',
                date: '2024-12-15',
                time: '10:30',
                duration: '60',
                type: 'impfung',
                status: 'geplant',
                patientId: '2',
                patientName: 'Bello',
                patientSpecies: 'hund',
                ownerName: 'Anna Schmidt',
                assignedStaff: 'dr_mueller',
                treatmentRoom: 'raum_2',
                notes: 'Grundimmunisierung',
                sendReminder: true,
                sendEmail: true,
                createdAt: '2024-12-02T14:30:00Z',
                updatedAt: '2024-12-02T14:30:00Z'
            },
            {
                id: '3',
                date: '2024-12-16',
                time: '14:00',
                duration: '90',
                type: 'operation',
                status: 'geplant',
                patientId: '3',
                patientName: 'Milo',
                patientSpecies: 'hund',
                ownerName: 'Peter Weber',
                assignedStaff: 'dr_weber',
                treatmentRoom: 'operationssaal',
                notes: 'Kastration',
                sendReminder: true,
                sendEmail: true,
                createdAt: '2024-12-03T09:15:00Z',
                updatedAt: '2024-12-03T09:15:00Z'
            }
        ];
    }
}

// Initialize the Termine Manager
let termineManager;

document.addEventListener('DOMContentLoaded', () => {
    termineManager = new TermineManager();
});
