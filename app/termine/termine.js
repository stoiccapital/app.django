// Termine Page JavaScript

class TermineManager {
    constructor() {
        this.termine = this.loadTermine();
        this.patients = this.loadPatients();
        this.currentTermin = null;
        this.isEditing = false;
        this.currentView = 'list';
        this.currentDate = new Date();
        this.currentMonth = new Date();
        
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
        this.prevMonthBtn = document.getElementById('prevMonthBtn');
        this.nextMonthBtn = document.getElementById('nextMonthBtn');
        this.currentMonthElement = document.getElementById('currentMonth');
        this.calendarGrid = document.getElementById('calendarGrid');
        
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
        this.prevMonthBtn.addEventListener('click', () => this.navigateMonth(-1));
        this.nextMonthBtn.addEventListener('click', () => this.navigateMonth(1));
        
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
    navigateMonth(direction) {
        this.currentMonth.setMonth(this.currentMonth.getMonth() + direction);
        this.renderCalendar();
    }
    
    renderCalendar() {
        const year = this.currentMonth.getFullYear();
        const month = this.currentMonth.getMonth();
        
        // Update month display
        const monthNames = [
            'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
            'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
        ];
        this.currentMonthElement.textContent = `${monthNames[month]} ${year}`;
        
        // Generate calendar grid
        this.generateCalendarGrid(year, month);
    }
    
    generateCalendarGrid(year, month) {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        this.calendarGrid.innerHTML = '';
        
        // Add day headers
        const dayNames = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
        dayNames.forEach(day => {
            const header = document.createElement('div');
            header.className = 'calendar-day-header';
            header.textContent = day;
            this.calendarGrid.appendChild(header);
        });
        
        // Generate calendar days
        const today = new Date();
        let currentDate = new Date(startDate);
        
        for (let i = 0; i < 42; i++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            
            const isToday = currentDate.toDateString() === today.toDateString();
            const isOtherMonth = currentDate.getMonth() !== month;
            
            if (isToday) dayElement.classList.add('today');
            if (isOtherMonth) dayElement.classList.add('other-month');
            
            const dayNumber = document.createElement('div');
            dayNumber.className = 'calendar-day-number';
            dayNumber.textContent = currentDate.getDate();
            dayElement.appendChild(dayNumber);
            
            // Add events for this day
            const dayEvents = this.getTermineForDate(currentDate);
            dayEvents.forEach(event => {
                const eventElement = document.createElement('div');
                eventElement.className = `calendar-event ${event.status}`;
                eventElement.textContent = `${event.time} - ${event.patientName}`;
                eventElement.title = `${event.time} - ${event.patientName} (${event.type})`;
                eventElement.addEventListener('click', () => this.openModal(event));
                dayElement.appendChild(eventElement);
            });
            
            this.calendarGrid.appendChild(dayElement);
            currentDate.setDate(currentDate.getDate() + 1);
        }
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
        const filteredTermine = this.filterTermine();
        this.renderTermineTable(filteredTermine);
        this.updateEmptyState(filteredTermine.length === 0);
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
