# Standardized Table Component Documentation

This document explains how to use the standardized table component across all pages in the application.

## Basic Usage

### Simple Table
```html
<table class="table">
  <thead>
    <tr>
      <th>Name</th>
      <th>Email</th>
      <th>Status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>John Doe</td>
      <td>john@example.com</td>
      <td><span class="status-cell active">Active</span></td>
    </tr>
  </tbody>
</table>
```

### Table with Container
```html
<div class="table-container">
  <div class="table-header">
    <h2 class="table-title">Users</h2>
    <p class="table-subtitle">Manage your user accounts</p>
  </div>
  
  <div class="table-responsive">
    <table class="table">
      <!-- table content -->
    </table>
  </div>
</div>
```

## Table Variants

### Striped Table
```html
<table class="table table-striped">
  <!-- Alternating row colors -->
</table>
```

### Bordered Table
```html
<table class="table table-bordered">
  <!-- All cells have borders -->
</table>
```

### Borderless Table
```html
<table class="table table-borderless">
  <!-- No borders between cells -->
</table>
```

## Table Sizes

### Small Table
```html
<table class="table table-sm">
  <!-- Compact spacing -->
</table>
```

### Large Table
```html
<table class="table table-lg">
  <!-- Larger spacing -->
</table>
```

### Compact Table
```html
<table class="table table-compact">
  <!-- Very compact spacing -->
</table>
```

## Interactive Features

### Sortable Table
```html
<table class="table table-sortable">
  <thead>
    <tr>
      <th class="sort-asc">Name</th> <!-- Shows ascending arrow -->
      <th class="sort-desc">Date</th> <!-- Shows descending arrow -->
      <th>Status</th> <!-- Shows bidirectional arrow -->
    </tr>
  </thead>
</table>
```

### Selectable Table
```html
<table class="table table-selectable">
  <tbody>
    <tr class="selected">
      <td>Selected row</td>
    </tr>
    <tr>
      <td>Clickable row</td>
    </tr>
  </tbody>
</table>
```

## Special Cell Types

### Status Cells
```html
<td>
  <span class="status-cell active">Active</span>
  <span class="status-cell inactive">Inactive</span>
  <span class="status-cell warning">Warning</span>
  <span class="status-cell error">Error</span>
  <span class="status-cell info">Info</span>
</td>
```

### Avatar Cells
```html
<td class="avatar-cell">
  <div class="avatar">JD</div>
  <div>
    <div>John Doe</div>
    <small>john@example.com</small>
  </div>
</td>
```

### Action Cells
```html
<td class="action-cell">
  <button class="btn btn-sm btn-primary">Edit</button>
  <button class="btn btn-sm btn-secondary">Delete</button>
</td>
```

## Table Components

### Complete Table with All Features
```html
<div class="table-container">
  <!-- Header -->
  <div class="table-header">
    <h2 class="table-title">Patient Records</h2>
    <p class="table-subtitle">View and manage patient information</p>
  </div>
  
  <!-- Filters -->
  <div class="table-filters">
    <div class="form-group">
      <label class="form-label">Search</label>
      <input type="text" class="form-control" placeholder="Search patients...">
    </div>
    <div class="form-group">
      <label class="form-label">Status</label>
      <select class="form-control">
        <option>All</option>
        <option>Active</option>
        <option>Inactive</option>
      </select>
    </div>
  </div>
  
  <!-- Table -->
  <div class="table-responsive">
    <table class="table table-striped table-sortable">
      <thead>
        <tr>
          <th class="table-col-20">Patient Name</th>
          <th class="table-col-20">Owner</th>
          <th class="table-col-15">Species</th>
          <th class="table-col-15">Status</th>
          <th class="table-col-15">Last Visit</th>
          <th class="table-col-15">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="avatar-cell">
            <div class="avatar">BD</div>
            <div>
              <div>Buddy</div>
              <small>ID: #12345</small>
            </div>
          </td>
          <td>John Smith</td>
          <td>Dog</td>
          <td><span class="status-cell active">Active</span></td>
          <td>2024-01-15</td>
          <td class="action-cell">
            <button class="btn btn-sm btn-primary">View</button>
            <button class="btn btn-sm btn-secondary">Edit</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  
  <!-- Actions -->
  <div class="table-actions">
    <button class="btn btn-primary">Add Patient</button>
    <button class="btn btn-secondary">Export</button>
  </div>
  
  <!-- Pagination -->
  <div class="table-pagination">
    <div class="table-pagination-info">
      Showing 1-10 of 50 results
    </div>
    <div class="table-pagination-controls">
      <button class="table-pagination-btn" disabled>‹</button>
      <button class="table-pagination-btn active">1</button>
      <button class="table-pagination-btn">2</button>
      <button class="table-pagination-btn">3</button>
      <button class="table-pagination-btn">›</button>
    </div>
  </div>
</div>
```

## Loading and Empty States

### Loading State
```html
<div class="table-loading">
  <!-- Loading spinner will appear -->
</div>
```

### Empty State
```html
<div class="table-empty">
  <div class="table-empty-icon">📋</div>
  <h3 class="table-empty-title">No data found</h3>
  <p class="table-empty-description">Try adjusting your search or filters</p>
</div>
```

## Utility Classes

### Column Widths
```html
<th class="table-col-10">10% width</th>
<th class="table-col-25">25% width</th>
<th class="table-col-50">50% width</th>
```

### Text Alignment
```html
<td class="table-text-left">Left aligned</td>
<td class="table-text-center">Center aligned</td>
<td class="table-text-right">Right aligned</td>
```

### Vertical Alignment
```html
<td class="table-align-top">Top aligned</td>
<td class="table-align-middle">Middle aligned</td>
<td class="table-align-bottom">Bottom aligned</td>
```

## Responsive Design

The table component is fully responsive:

- **Desktop**: Full table with all features
- **Tablet**: Slightly reduced padding
- **Mobile**: Horizontal scroll with optimized spacing

### Mobile Optimizations
- Filters stack vertically
- Pagination controls stack
- Reduced font sizes and padding
- Touch-friendly interaction areas

## Accessibility Features

- **Keyboard Navigation**: Sortable headers and selectable rows are keyboard accessible
- **Screen Reader Support**: Proper ARIA labels and semantic markup
- **High Contrast Mode**: Enhanced visibility for accessibility
- **Reduced Motion**: Respects user's motion preferences
- **Focus Indicators**: Clear focus states for interactive elements

## JavaScript Integration

### Sorting Example
```javascript
document.querySelectorAll('.table-sortable th').forEach(header => {
  header.addEventListener('click', () => {
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
    
    // Implement your sorting logic here
  });
});
```

### Selection Example
```javascript
document.querySelectorAll('.table-selectable tbody tr').forEach(row => {
  row.addEventListener('click', () => {
    row.classList.toggle('selected');
  });
});
```

## Best Practices

1. **Always use semantic HTML**: Use proper `<table>`, `<thead>`, `<tbody>`, `<th>`, and `<td>` elements
2. **Include proper headers**: Every table should have a header row with descriptive column titles
3. **Use appropriate variants**: Choose the right table variant for your use case
4. **Implement responsive design**: Always wrap tables in `.table-responsive` for mobile compatibility
5. **Add loading states**: Show loading indicators for dynamic data
6. **Handle empty states**: Provide helpful messages when no data is available
7. **Test accessibility**: Ensure keyboard navigation and screen reader compatibility
8. **Optimize performance**: Use pagination for large datasets

## Customization

The table component uses CSS custom properties, making it easy to customize:

```css
:root {
  --table-cell-padding: var(--space-4) var(--space-6);
  --table-border-width: var(--border-1);
  --table-stripe-color: var(--bg-tertiary);
}
```

You can override these variables in your page-specific CSS files to customize the appearance while maintaining consistency. 