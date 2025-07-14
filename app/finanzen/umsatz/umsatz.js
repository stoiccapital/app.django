// Umsatz Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the page
    initializeUmsatzPage();
});

function initializeUmsatzPage() {
    // Add any specific functionality for the Umsatz page
    console.log('Umsatz page initialized');
    
    // Example: Add click handlers for chart controls
    const chartControls = document.querySelectorAll('.chart-controls .btn');
    chartControls.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            chartControls.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            // Here you would typically update the chart data
            console.log('Chart period changed:', this.textContent.trim());
        });
    });
    
    // Enhanced click handler for "Neuer Umsatz" button
    const newRevenueBtn = document.getElementById('newRevenueBtn');
    if (newRevenueBtn) {
        newRevenueBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('New revenue button clicked');
            
            // Add loading state
            this.classList.add('btn-loading');
            this.disabled = true;
            
            // Simulate API call or form opening
            setTimeout(() => {
                this.classList.remove('btn-loading');
                this.disabled = false;
                
                // Here you would typically open a modal or navigate to a form
                openNewRevenueModal();
            }, 1000);
        });
        
        // Add keyboard shortcut support
        document.addEventListener('keydown', function(e) {
            // Cmd+N (Mac) or Ctrl+N (Windows/Linux)
            if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
                e.preventDefault();
                newRevenueBtn.click();
            }
        });
        
        // Add hover sound effect (optional)
        newRevenueBtn.addEventListener('mouseenter', function() {
            // You could add a subtle sound effect here
            console.log('Button hovered');
        });
    }
    
    // Function to open new revenue modal
    function openNewRevenueModal() {
        console.log('Opening new revenue modal...');
        // Here you would implement the modal opening logic
        // For now, we'll just show an alert
        alert('Neuer Umsatz Modal würde hier geöffnet werden');
    }
    
    // Example: Add click handler for "Alle anzeigen" button
    const showAllBtn = document.querySelector('.btn-secondary');
    if (showAllBtn) {
        showAllBtn.addEventListener('click', function() {
            console.log('Show all transactions clicked');
            // Here you would typically navigate to a full transactions page
        });
    }
}
