# Standardized Modal Component

A comprehensive, reusable modal component for the Vetmates application that provides consistent modal functionality across all pages.

## Features

- ✅ **Consistent Styling**: Unified design across all modals
- ✅ **Multiple Sizes**: sm, md, lg, xl, full
- ✅ **Theme Variants**: light, dark, info, success, warning, error
- ✅ **Animation Types**: fade-in, slide-in
- ✅ **Content Types**: Form, Detail, List, Loading, Empty State
- ✅ **Accessibility**: ARIA support, focus management, keyboard navigation
- ✅ **Responsive**: Works on all device sizes
- ✅ **Stacking**: Support for multiple modals
- ✅ **Customizable**: Extensive configuration options

## Quick Start

### 1. Include CSS and JS

Add to your HTML file:

```html
<!-- CSS -->
<link rel="stylesheet" href="../styles/components/modal.css">

<!-- JavaScript -->
<script src="../components/modal/modal.js"></script>
```

### 2. Basic Usage

```javascript
// Simple modal
modalManager.create({
    title: 'My Modal',
    content: '<p>Modal content here</p>',
    buttons: [
        { text: 'Cancel', class: 'btn-secondary' },
        { text: 'Save', class: 'btn-primary' }
    ]
});
```

## Modal Types

### 1. Basic Modal

```javascript
modalManager.create({
    title: 'Basic Modal',
    content: '<p>This is a basic modal with custom content.</p>',
    size: 'md', // sm, md, lg, xl, full
    theme: 'light', // light, dark, info, success, warning, error
    buttons: [
        { text: 'Close', class: 'btn-secondary' }
    ]
});
```

### 2. Form Modal

```javascript
modalManager.createFormModal({
    title: 'Add New Patient',
    formFields: [
        { name: 'name', label: 'Name', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'email' },
        { name: 'phone', label: 'Phone', type: 'tel' },
        { name: 'notes', label: 'Notes', type: 'textarea', rows: 4 }
    ],
    onSubmit: (formData) => {
        console.log('Form submitted:', formData);
        // Handle form submission
    }
});
```

### 3. Detail Modal

```javascript
modalManager.createDetailModal({
    title: 'Patient Details',
    details: [
        {
            title: 'Basic Information',
            items: [
                { label: 'Name', value: 'Max' },
                { label: 'Species', value: 'Hund' },
                { label: 'Breed', value: 'Golden Retriever' }
            ]
        },
        {
            title: 'Owner Information',
            items: [
                { label: 'Owner Name', value: 'John Doe' },
                { label: 'Phone', value: '+49 123 456 789' },
                { label: 'Email', value: 'john@example.com' }
            ]
        }
    ]
});
```

### 4. List Modal

```javascript
modalManager.createListModal({
    title: 'Select Patient',
    items: [
        { 
            content: '<h4>Max</h4><p>Golden Retriever - John Doe</p>',
            onClick: () => selectPatient('max-id')
        },
        { 
            content: '<h4>Luna</h4><p>Katze - Jane Smith</p>',
            onClick: () => selectPatient('luna-id')
        }
    ]
});
```

### 5. Loading Modal

```javascript
const modal = modalManager.create({
    title: 'Loading...',
    content: '<div class="modal-loading"></div>',
    closeOnEscape: false,
    closeOnBackdrop: false
});

// Close when done
setTimeout(() => {
    modalManager.close(modal.id);
}, 2000);
```

### 6. Empty State Modal

```javascript
modalManager.create({
    title: 'No Results',
    content: `
        <div class="modal-empty">
            <div class="modal-empty-icon">🔍</div>
            <div class="modal-empty-title">No Patients Found</div>
            <div class="modal-empty-description">Try adjusting your search criteria.</div>
        </div>
    `
});
```

## Configuration Options

### Modal Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `title` | string | 'Modal' | Modal title |
| `content` | string/HTMLElement | - | Modal content |
| `size` | string | 'md' | Modal size (sm, md, lg, xl, full) |
| `theme` | string | 'light' | Modal theme (light, dark, info, success, warning, error) |
| `animation` | string | 'fade-in' | Animation type (fade-in, slide-in) |
| `position` | string | 'center' | Modal position (center, top, bottom, left, right) |
| `backdrop` | boolean | true | Show backdrop |
| `closeOnEscape` | boolean | true | Close on Escape key |
| `closeOnBackdrop` | boolean | true | Close on backdrop click |
| `focusTrap` | boolean | true | Enable focus trap |
| `autoFocus` | boolean | true | Auto focus first element |
| `buttons` | array | [] | Modal buttons |

### Button Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `text` | string | - | Button text |
| `class` | string | 'btn-secondary' | Button CSS class |
| `action` | function | - | Button click handler |
| `close` | boolean | true | Close modal after action |

### Form Field Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `name` | string | - | Field name |
| `label` | string | - | Field label |
| `type` | string | 'text' | Input type (text, email, tel, textarea, select) |
| `required` | boolean | false | Required field |
| `placeholder` | string | - | Field placeholder |
| `value` | string | - | Default value |
| `options` | array | - | Select options (for select type) |
| `rows` | number | 3 | Textarea rows |

## API Methods

### Core Methods

```javascript
// Create and show modal
const modal = modalManager.create(options);

// Open existing modal
modalManager.open(modalId);

// Close modal
modalManager.close(modalId);

// Close all modals
modalManager.closeAll();

// Check if modal is open
const isOpen = modalManager.isOpen(modalId);

// Get modal instance
const modalInstance = modalManager.getModal(modalId);

// Get active modals count
const count = modalManager.getActiveCount();
```

### Content Methods

```javascript
// Update modal content
modalManager.updateContent(modalId, '<p>New content</p>');

// Update modal title
modalManager.updateTitle(modalId, 'New Title');

// Show loading state
modalManager.showLoading(modalId);

// Show empty state
modalManager.showEmpty(modalId, {
    icon: '📭',
    title: 'No Data',
    description: 'No items found'
});
```

### Specialized Methods

```javascript
// Create form modal
const formModal = modalManager.createFormModal(options);

// Create detail modal
const detailModal = modalManager.createDetailModal(options);

// Create list modal
const listModal = modalManager.createListModal(options);
```

## Events

The modal manager triggers custom events that you can listen to:

```javascript
// Listen for modal opened
document.addEventListener('modal:opened', (event) => {
    console.log('Modal opened:', event.detail.modalId);
});

// Listen for modal closed
document.addEventListener('modal:closed', (event) => {
    console.log('Modal closed:', event.detail.modalId);
});
```

## CSS Classes

### Modal Sizes
- `.modal-sm` - Small modal (400px)
- `.modal-md` - Medium modal (600px) - Default
- `.modal-lg` - Large modal (800px)
- `.modal-xl` - Extra large modal (1000px)
- `.modal-full` - Full screen modal

### Modal Themes
- `.modal-light` - Light theme (default)
- `.modal-dark` - Dark theme
- `.modal-info` - Info theme (blue)
- `.modal-success` - Success theme (green)
- `.modal-warning` - Warning theme (orange)
- `.modal-error` - Error theme (red)

### Modal Animations
- `.modal-fade-in` - Fade in animation (default)
- `.modal-slide-in` - Slide in animation

### Modal Positions
- `.modal-center` - Center position (default)
- `.modal-top` - Top position
- `.modal-bottom` - Bottom position
- `.modal-left` - Left position
- `.modal-right` - Right position

### Footer Alignments
- `.modal-footer` - Right aligned (default)
- `.modal-footer-center` - Center aligned
- `.modal-footer-between` - Space between
- `.modal-footer-left` - Left aligned

## Accessibility Features

- **ARIA Support**: Proper ARIA attributes for screen readers
- **Focus Management**: Automatic focus trapping and restoration
- **Keyboard Navigation**: Tab navigation within modal
- **Escape Key**: Close modal with Escape key
- **Screen Reader**: Proper announcements and labels

## Responsive Design

The modal component is fully responsive and adapts to different screen sizes:

- **Desktop**: Full modal with proper spacing
- **Tablet**: Adjusted padding and sizing
- **Mobile**: Full-width modal with touch-friendly buttons

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Examples

### Complete Patient Form Modal

```javascript
modalManager.createFormModal({
    title: 'Neuen Patienten hinzufügen',
    size: 'lg',
    formFields: [
        { name: 'patientName', label: 'Name', type: 'text', required: true },
        { name: 'patientSpecies', label: 'Tierart', type: 'select', required: true, options: [
            { value: 'hund', label: 'Hund' },
            { value: 'katze', label: 'Katze' },
            { value: 'pferd', label: 'Pferd' }
        ]},
        { name: 'patientBreed', label: 'Rasse', type: 'text' },
        { name: 'ownerName', label: 'Besitzer Name', type: 'text', required: true },
        { name: 'ownerPhone', label: 'Telefon', type: 'tel', required: true },
        { name: 'ownerEmail', label: 'E-Mail', type: 'email' },
        { name: 'notes', label: 'Notizen', type: 'textarea', rows: 4 }
    ],
    buttons: [
        { text: 'Abbrechen', class: 'btn-secondary' },
        { text: 'Patient speichern', class: 'btn-primary', action: handlePatientSave }
    ]
});
```

### Treatment History Modal

```javascript
modalManager.createDetailModal({
    title: 'Behandlungshistorie - Max',
    size: 'xl',
    details: [
        {
            title: 'Letzte Behandlungen',
            items: [
                { label: 'Untersuchung', value: '15.01.2024' },
                { label: 'Impfung', value: '10.12.2023' },
                { label: 'Zahnreinigung', value: '05.11.2023' }
            ]
        },
        {
            title: 'Medikamente',
            items: [
                { label: 'Aktuell', value: 'Keine' },
                { label: 'Allergien', value: 'Keine bekannt' }
            ]
        }
    ],
    buttons: [
        { text: 'Neue Behandlung', class: 'btn-primary', action: addNewTreatment },
        { text: 'Schließen', class: 'btn-secondary' }
    ]
});
```

## Migration Guide

If you're migrating from existing modal implementations:

1. **Replace HTML modals** with JavaScript creation
2. **Update event handlers** to use the new API
3. **Replace CSS classes** with the standardized ones
4. **Test accessibility** features

## Troubleshooting

### Modal not showing
- Check if modal CSS is loaded
- Verify modalManager is initialized
- Check console for JavaScript errors

### Styling issues
- Ensure modal.css is loaded after other CSS files
- Check for CSS conflicts with existing styles
- Verify CSS variables are defined

### Accessibility issues
- Ensure proper ARIA attributes
- Test with screen readers
- Verify keyboard navigation works

## Contributing

When adding new features to the modal component:

1. Follow the existing code structure
2. Add proper documentation
3. Include accessibility features
4. Test across different browsers
5. Update this README file 