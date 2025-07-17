// Umsatz Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the page
    initializeUmsatzPage();
});

function initializeUmsatzPage() {
    console.log('Umsatz page initialized');
    
    // Initialize modal functionality
    initializeModal();
    
    // Initialize form functionality
    initializeForm();
    
    // Initialize chart controls
    initializeChartControls();
    
    // Initialize other page elements
    initializePageElements();
}

// Modal Management
function initializeModal() {
    const modal = document.getElementById('newRevenueModal');
    const newRevenueBtn = document.getElementById('newRevenueBtn');
    const closeModal = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const overlay = modal.querySelector('.modal-overlay');

    // Open modal
    newRevenueBtn.addEventListener('click', function(e) {
        e.preventDefault();
        openModal();
    });

    // Close modal handlers
    [closeModal, cancelBtn, overlay].forEach(element => {
        if (element) {
            element.addEventListener('click', closeModalHandler);
        }
    });

    // Close on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('modal-open')) {
            closeModalHandler();
        }
    });

    function openModal() {
        modal.classList.add('modal-open');
        document.body.style.overflow = 'hidden';
        
        // Focus on first input
        setTimeout(() => {
            const firstInput = modal.querySelector('input, select');
            if (firstInput) firstInput.focus();
        }, 100);
    }

    function closeModalHandler() {
        modal.classList.remove('modal-open');
        document.body.style.overflow = '';
        
        // Reset form
        resetForm();
    }
}

// Form Management
function initializeForm() {
    const form = document.getElementById('newRevenueForm');
    const addItemBtn = document.getElementById('addItemBtn');
    const createInvoiceBtn = document.getElementById('createInvoiceBtn');
    const itemsContainer = document.getElementById('itemsContainer');

    // Add new item row
    addItemBtn.addEventListener('click', addNewItem);

    // Create invoice
    createInvoiceBtn.addEventListener('click', createInvoice);

    // Initialize first item row
    initializeItemRow(document.querySelector('.item-row'));

    // Initialize diagnosis fields
    initializeDiagnosisFields();

    // Form validation
    form.addEventListener('input', validateForm);
    form.addEventListener('change', validateForm);
}

function initializeDiagnosisFields() {
    const diagnosisSelect = document.getElementById('diagnosis');
    const severitySelect = document.getElementById('diagnosisSeverity');
    
    // Handle custom diagnosis option
    diagnosisSelect.addEventListener('change', function() {
        if (this.value === 'custom') {
            // Create custom diagnosis input
            const customInput = document.createElement('input');
            customInput.type = 'text';
            customInput.id = 'customDiagnosis';
            customInput.name = 'customDiagnosis';
            customInput.placeholder = 'Geben Sie die benutzerdefinierte Diagnose ein...';
            customInput.className = 'form-group input';
            customInput.style.marginTop = 'var(--space-2)';
            customInput.required = true;
            
            // Insert after the diagnosis select
            const diagnosisGroup = this.closest('.form-group');
            diagnosisGroup.appendChild(customInput);
            
            // Focus on the new input
            setTimeout(() => customInput.focus(), 100);
        } else {
            // Remove custom input if it exists
            const customInput = document.getElementById('customDiagnosis');
            if (customInput) {
                customInput.remove();
            }
        }
        validateForm();
    });
    
    // Handle severity changes for visual feedback
    severitySelect.addEventListener('change', function() {
        const severity = this.value;
        const diagnosisSection = this.closest('.form-section');
        
        // Remove existing severity classes
        diagnosisSection.classList.remove('severity-mild', 'severity-moderate', 'severity-severe', 'severity-critical', 'severity-preventive');
        
        // Add new severity class
        if (severity) {
            diagnosisSection.classList.add(`severity-${severity}`);
        }
    });
}

function initializeItemRow(itemRow) {
    const select = itemRow.querySelector('.item-select');
    const quantity = itemRow.querySelector('.item-quantity');
    const price = itemRow.querySelector('.item-price');
    const total = itemRow.querySelector('.item-total');
    const removeBtn = itemRow.querySelector('.btn-remove-item');

    // Handle item selection
    select.addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];
        const itemPrice = selectedOption.dataset.price || 0;
        
        price.value = itemPrice;
        calculateItemTotal(itemRow);
        updateSummary();
        validateForm();
    });

    // Handle quantity changes
    quantity.addEventListener('input', function() {
        calculateItemTotal(itemRow);
        updateSummary();
    });

    // Handle remove button
    if (removeBtn) {
        removeBtn.addEventListener('click', function() {
            removeItemRow(itemRow);
        });
    }
}

function addNewItem() {
    const itemsContainer = document.getElementById('itemsContainer');
    const itemCount = itemsContainer.children.length + 1;
    
    const newItemRow = document.createElement('div');
    newItemRow.className = 'item-row';
    newItemRow.dataset.itemId = itemCount;
    
    newItemRow.innerHTML = `
        <div class="form-row">
            <div class="form-group flex-2">
                <label>Leistung/Produkt *</label>
                <select class="item-select" name="items[${itemCount}][type]" required>
                    <option value="">Bitte wählen...</option>
                    <optgroup label="Behandlungen">
                        <option value="routineuntersuchung" data-price="65.00">Routineuntersuchung - €65.00</option>
                        <option value="impfung" data-price="45.00">Impfung - €45.00</option>
                        <option value="kastration" data-price="320.00">Kastration - €320.00</option>
                        <option value="zahnreinigung" data-price="180.00">Zahnreinigung - €180.00</option>
                        <option value="operation" data-price="450.00">Operation - €450.00</option>
                        <option value="notfall" data-price="200.00">Notfallbehandlung - €200.00</option>
                    </optgroup>
                    <optgroup label="Medikamente">
                        <option value="antibiotika" data-price="35.00">Antibiotika - €35.00</option>
                        <option value="schmerzmittel" data-price="25.00">Schmerzmittel - €25.00</option>
                        <option value="vitamine" data-price="15.00">Vitamine - €15.00</option>
                    </optgroup>
                    <optgroup label="Zubehör">
                        <option value="halsband" data-price="20.00">Halsband - €20.00</option>
                        <option value="futter" data-price="30.00">Spezialfutter - €30.00</option>
                        <option value="spielzeug" data-price="12.00">Spielzeug - €12.00</option>
                    </optgroup>
                </select>
            </div>
            <div class="form-group flex-1">
                <label>Menge</label>
                <input type="number" class="item-quantity" name="items[${itemCount}][quantity]" value="1" min="1" max="99">
            </div>
            <div class="form-group flex-1">
                <label>Preis (€)</label>
                <input type="number" class="item-price" name="items[${itemCount}][price]" step="0.01" min="0" readonly>
            </div>
            <div class="form-group flex-1">
                <label>Gesamt (€)</label>
                <input type="number" class="item-total" name="items[${itemCount}][total]" step="0.01" min="0" readonly>
            </div>
            <div class="form-group flex-0">
                <label>&nbsp;</label>
                <button type="button" class="btn btn-danger btn-remove-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
        </div>
    `;
    
    itemsContainer.appendChild(newItemRow);
    initializeItemRow(newItemRow);
    
    // Show remove button for all items if more than one
    updateRemoveButtons();
}

function removeItemRow(itemRow) {
    itemRow.remove();
    updateRemoveButtons();
    updateSummary();
    validateForm();
}

function updateRemoveButtons() {
    const itemRows = document.querySelectorAll('.item-row');
    const removeButtons = document.querySelectorAll('.btn-remove-item');
    
    removeButtons.forEach(btn => {
        btn.style.display = itemRows.length > 1 ? 'block' : 'none';
    });
}

function calculateItemTotal(itemRow) {
    const quantity = parseFloat(itemRow.querySelector('.item-quantity').value) || 0;
    const price = parseFloat(itemRow.querySelector('.item-price').value) || 0;
    const total = quantity * price;
    
    itemRow.querySelector('.item-total').value = total.toFixed(2);
}

function updateSummary() {
    const itemRows = document.querySelectorAll('.item-row');
    let subtotal = 0;
    
    itemRows.forEach(row => {
        const total = parseFloat(row.querySelector('.item-total').value) || 0;
        subtotal += total;
    });
    
    const tax = subtotal * 0.19; // 19% MwSt
    const total = subtotal + tax;
    
    document.getElementById('subtotal').textContent = `€${subtotal.toFixed(2)}`;
    document.getElementById('tax').textContent = `€${tax.toFixed(2)}`;
    document.getElementById('total').textContent = `€${total.toFixed(2)}`;
}

function validateForm() {
    const form = document.getElementById('newRevenueForm');
    const createInvoiceBtn = document.getElementById('createInvoiceBtn');
    const requiredFields = form.querySelectorAll('[required]');
    const itemRows = document.querySelectorAll('.item-row');
    
    let isValid = true;
    
    // Check required fields
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
        }
    });
    
    // Check if at least one item is selected
    let hasSelectedItem = false;
    itemRows.forEach(row => {
        const select = row.querySelector('.item-select');
        if (select.value) {
            hasSelectedItem = true;
        }
    });
    
    if (!hasSelectedItem) {
        isValid = false;
    }
    
    // Update button state
    createInvoiceBtn.disabled = !isValid;
    createInvoiceBtn.classList.toggle('btn-disabled', !isValid);
}

function resetForm() {
    const form = document.getElementById('newRevenueForm');
    form.reset();
    
    // Reset item rows
    const itemsContainer = document.getElementById('itemsContainer');
    const itemRows = itemsContainer.querySelectorAll('.item-row');
    
    // Keep only the first row
    for (let i = 1; i < itemRows.length; i++) {
        itemRows[i].remove();
    }
    
    // Reset first row
    const firstRow = itemRows[0];
    firstRow.querySelector('.item-select').value = '';
    firstRow.querySelector('.item-quantity').value = '1';
    firstRow.querySelector('.item-price').value = '';
    firstRow.querySelector('.item-total').value = '';
    
    // Reset diagnosis fields
    const diagnosisFields = ['diagnosis', 'diagnosisSeverity', 'symptoms', 'anamnesis', 'treatmentPlan'];
    diagnosisFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            if (field.tagName === 'SELECT') {
                field.selectedIndex = 0;
            } else {
                field.value = '';
            }
        }
    });
    
    // Remove custom diagnosis input if it exists
    const customDiagnosis = document.getElementById('customDiagnosis');
    if (customDiagnosis) {
        customDiagnosis.remove();
    }
    
    // Reset diagnosis section styling
    const diagnosisSection = document.querySelector('.form-section:nth-child(2)');
    if (diagnosisSection) {
        diagnosisSection.classList.remove('severity-mild', 'severity-moderate', 'severity-severe', 'severity-critical', 'severity-preventive');
    }
    
    // Update summary
    updateSummary();
    updateRemoveButtons();
    validateForm();
}

function createInvoice() {
    const form = document.getElementById('newRevenueForm');
    const formData = new FormData(form);
    
    // Get diagnosis text (handle custom diagnosis)
    let diagnosisText = formData.get('diagnosis');
    if (diagnosisText === 'custom') {
        const customDiagnosis = document.getElementById('customDiagnosis');
        diagnosisText = customDiagnosis ? customDiagnosis.value : 'Benutzerdefinierte Diagnose';
    }
    
    // Collect form data
    const invoiceData = {
        customer: {
            name: formData.get('customerName'),
            email: formData.get('customerEmail')
        },
        patient: {
            name: formData.get('patientName'),
            type: formData.get('patientType')
        },
        diagnosis: {
            main: diagnosisText,
            severity: formData.get('diagnosisSeverity'),
            symptoms: formData.get('symptoms'),
            anamnesis: formData.get('anamnesis'),
            treatmentPlan: formData.get('treatmentPlan')
        },
        items: [],
        notes: formData.get('notes'),
        date: new Date().toISOString(),
        invoiceNumber: generateInvoiceNumber()
    };
    
    // Collect items
    const itemRows = document.querySelectorAll('.item-row');
    itemRows.forEach(row => {
        const select = row.querySelector('.item-select');
        const quantity = row.querySelector('.item-quantity');
        const price = row.querySelector('.item-price');
        const total = row.querySelector('.item-total');
        
        if (select.value) {
            invoiceData.items.push({
                type: select.value,
                name: select.options[select.selectedIndex].text,
                quantity: parseInt(quantity.value),
                price: parseFloat(price.value),
                total: parseFloat(total.value)
            });
        }
    });
    
    // Calculate totals
    const subtotal = invoiceData.items.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.19;
    const total = subtotal + tax;
    
    invoiceData.subtotal = subtotal;
    invoiceData.tax = tax;
    invoiceData.total = total;
    
    // Show success message and generate invoice
    showSuccessMessage('Rechnung erfolgreich erstellt!');
    generateInvoicePDF(invoiceData);
    
    // Close modal after delay
    setTimeout(() => {
        document.getElementById('newRevenueModal').classList.remove('modal-open');
        document.body.style.overflow = '';
        resetForm();
    }, 2000);
}

function generateInvoiceNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    return `INV-${year}${month}${day}-${random}`;
}

function generateInvoicePDF(invoiceData) {
    // Get diagnosis display text
    let diagnosisText = invoiceData.diagnosis.main;
    if (invoiceData.diagnosis.main === 'custom') {
        const customDiagnosis = document.getElementById('customDiagnosis');
        diagnosisText = customDiagnosis ? customDiagnosis.value : 'Benutzerdefinierte Diagnose';
    } else {
        const diagnosisSelect = document.getElementById('diagnosis');
        const selectedOption = diagnosisSelect.options[diagnosisSelect.selectedIndex];
        diagnosisText = selectedOption ? selectedOption.text : invoiceData.diagnosis.main;
    }
    
    // Get severity display text
    const severitySelect = document.getElementById('diagnosisSeverity');
    const severityText = severitySelect.options[severitySelect.selectedIndex]?.text || invoiceData.diagnosis.severity;
    
    // Create invoice HTML
    const invoiceHTML = `
        <!DOCTYPE html>
        <html lang="de">
        <head>
            <meta charset="UTF-8">
            <title>Rechnung ${invoiceData.invoiceNumber}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                .header { text-align: center; margin-bottom: 30px; }
                .invoice-info { margin-bottom: 30px; }
                .customer-info { margin-bottom: 30px; }
                .diagnosis-info { margin-bottom: 30px; background: #f8f9fa; padding: 20px; border-radius: 8px; }
                .diagnosis-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
                .diagnosis-item { margin-bottom: 15px; }
                .diagnosis-label { font-weight: bold; color: #495057; margin-bottom: 5px; }
                .diagnosis-value { color: #212529; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
                th { background-color: #f5f5f5; }
                .total { text-align: right; font-weight: bold; }
                .footer { margin-top: 50px; text-align: center; color: #666; }
                .section-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #495057; border-bottom: 2px solid #dee2e6; padding-bottom: 5px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Vetmates Tierarztpraxis</h1>
                <h2>Rechnung & Behandlungsbericht</h2>
            </div>
            
            <div class="invoice-info">
                <p><strong>Rechnungsnummer:</strong> ${invoiceData.invoiceNumber}</p>
                <p><strong>Datum:</strong> ${new Date(invoiceData.date).toLocaleDateString('de-DE')}</p>
            </div>
            
            <div class="customer-info">
                <div class="section-title">Patienteninformationen</div>
                <p><strong>Kunde:</strong> ${invoiceData.customer.name}</p>
                <p><strong>E-Mail:</strong> ${invoiceData.customer.email || 'Nicht angegeben'}</p>
                <p><strong>Patient:</strong> ${invoiceData.patient.name} (${invoiceData.patient.type})</p>
            </div>
            
            <div class="diagnosis-info">
                <div class="section-title">Diagnose & Behandlungsplan</div>
                <div class="diagnosis-grid">
                    <div class="diagnosis-item">
                        <div class="diagnosis-label">Hauptdiagnose:</div>
                        <div class="diagnosis-value">${diagnosisText}</div>
                    </div>
                    <div class="diagnosis-item">
                        <div class="diagnosis-label">Schweregrad:</div>
                        <div class="diagnosis-value">${severityText}</div>
                    </div>
                </div>
                ${invoiceData.diagnosis.symptoms ? `
                    <div class="diagnosis-item">
                        <div class="diagnosis-label">Symptome:</div>
                        <div class="diagnosis-value">${invoiceData.diagnosis.symptoms}</div>
                    </div>
                ` : ''}
                ${invoiceData.diagnosis.anamnesis ? `
                    <div class="diagnosis-item">
                        <div class="diagnosis-label">Anamnese:</div>
                        <div class="diagnosis-value">${invoiceData.diagnosis.anamnesis}</div>
                    </div>
                ` : ''}
                ${invoiceData.diagnosis.treatmentPlan ? `
                    <div class="diagnosis-item">
                        <div class="diagnosis-label">Behandlungsplan:</div>
                        <div class="diagnosis-value">${invoiceData.diagnosis.treatmentPlan}</div>
                    </div>
                ` : ''}
            </div>
            
            <div class="section-title">Leistungen & Produkte</div>
            <table>
                <thead>
                    <tr>
                        <th>Leistung/Produkt</th>
                        <th>Menge</th>
                        <th>Preis (€)</th>
                        <th>Gesamt (€)</th>
                    </tr>
                </thead>
                <tbody>
                    ${invoiceData.items.map(item => `
                        <tr>
                            <td>${item.name}</td>
                            <td>${item.quantity}</td>
                            <td>${item.price.toFixed(2)}</td>
                            <td>${item.total.toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div class="total">
                <p>Zwischensumme: €${invoiceData.subtotal.toFixed(2)}</p>
                <p>MwSt. (19%): €${invoiceData.tax.toFixed(2)}</p>
                <p><strong>Gesamtbetrag: €${invoiceData.total.toFixed(2)}</strong></p>
            </div>
            
            ${invoiceData.notes ? `
                <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                    <div class="section-title">Anmerkungen</div>
                    <p>${invoiceData.notes}</p>
                </div>
            ` : ''}
            
            <div class="footer">
                <p>Vielen Dank für Ihr Vertrauen!</p>
                <p>Vetmates Tierarztpraxis</p>
                <p style="font-size: 12px; margin-top: 20px;">
                    Diese Rechnung enthält auch einen medizinischen Behandlungsbericht.<br>
                    Bitte bewahren Sie dieses Dokument für Ihre Unterlagen auf.
                </p>
            </div>
        </body>
        </html>
    `;
    
    // Open invoice in new window for printing
    const newWindow = window.open('', '_blank');
    newWindow.document.write(invoiceHTML);
    newWindow.document.close();
    
    // Auto-print after a short delay
    setTimeout(() => {
        newWindow.print();
    }, 500);
}

function showSuccessMessage(message) {
    // Create success notification
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22,4 12,14.01 9,11.01"></polyline>
            </svg>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Chart Controls
function initializeChartControls() {
    const chartControls = document.querySelectorAll('.chart-controls .btn');
    chartControls.forEach(button => {
        button.addEventListener('click', function() {
            chartControls.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            console.log('Chart period changed:', this.textContent.trim());
        });
    });
}

// Page Elements
function initializePageElements() {
    const showAllBtn = document.querySelector('.btn-secondary');
    if (showAllBtn) {
        showAllBtn.addEventListener('click', function() {
            console.log('Show all transactions clicked');
        });
    }
}
