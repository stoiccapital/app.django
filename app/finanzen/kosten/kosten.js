// Kosten Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the page
    initializeKostenPage();
});

function initializeKostenPage() {
    // Add any specific functionality for the Kosten page
    console.log('Kosten page initialized');
    
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
    
    // Enhanced click handler for "Neue Kosten" button
    const newExpenseBtn = document.getElementById('newExpenseBtn');
    if (newExpenseBtn) {
        newExpenseBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('New expense button clicked');
            
            // Add loading state
            this.classList.add('btn-loading');
            this.disabled = true;
            
            // Simulate API call or form opening
            setTimeout(() => {
                this.classList.remove('btn-loading');
                this.disabled = false;
                
                // Here you would typically open a modal or navigate to a form
                openNewExpenseModal();
            }, 1000);
        });
        
        // Add keyboard shortcut support
        document.addEventListener('keydown', function(e) {
            // Cmd+E (Mac) or Ctrl+E (Windows/Linux) for expenses
            if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
                e.preventDefault();
                newExpenseBtn.click();
            }
        });
        
        // Add hover sound effect (optional)
        newExpenseBtn.addEventListener('mouseenter', function() {
            // You could add a subtle sound effect here
            console.log('Button hovered');
        });
    }
    
    // Function to open new expense modal
    function openNewExpenseModal() {
        console.log('Opening new expense modal...');
        // Here you would implement the modal opening logic
        // For now, we'll just show an alert
        alert('Neue Kosten Modal würde hier geöffnet werden');
    }
    
    // Example: Add click handler for "Alle anzeigen" button
    const showAllBtn = document.querySelector('.btn-secondary');
    if (showAllBtn) {
        showAllBtn.addEventListener('click', function() {
            console.log('Show all expenses clicked');
            // Here you would typically navigate to a full expenses page
        });
    }
    
    // Example: Add hover effects for breakdown items
    const breakdownItems = document.querySelectorAll('.breakdown-item');
    breakdownItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.backgroundColor = 'var(--bg-secondary)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.backgroundColor = 'transparent';
        });
    });
}
