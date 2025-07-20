# Page-Specific CSS Connection Pattern

## Overview
Each page now connects to its own CSS file separately, rather than importing all page CSS files through main.css.

## Connection Pattern

### 1. In the HTML file (e.g., patienten.html):
```html
<head>
    <!-- Main CSS Import (base styles and components) -->
    <link rel="stylesheet" href="../styles/main.css">
    
    <!-- Page-specific CSS -->
    <link rel="stylesheet" href="../styles/pages/patienten.css">
</head>
```

### 2. In the CSS file (e.g., patienten.css):
Use page-specific selectors to avoid conflicts:
```css
/* Use page container class for specificity */
.patienten-container .page-title {
  font-size: 5rem;
  text-align: left;
}

.patienten-container .page-description {
  font-size: 1.125rem;
  text-align: left;
}
```

## Benefits
- ✅ **No CSS conflicts** between pages
- ✅ **Faster loading** - only load CSS for current page
- ✅ **Better organization** - each page manages its own styles
- ✅ **Higher specificity** - page styles always win over global styles
- ✅ **Easier maintenance** - changes to one page don't affect others

## Files to Update
- `app/patienten/patienten.html` ✅ (Done)
- `app/mitarbeiter/mitarbeiter.html` (To do)
- `app/finanzen/finanzen.html` (To do)
- `app/kalender/kalender.html` (To do)
- etc.

## CSS Files to Update
- `app/styles/pages/patienten.css` ✅ (Done)
- `app/styles/pages/mitarbeiter.css` (To do)
- `app/styles/pages/finanzen.css` (To do)
- `app/styles/pages/kalender.css` (To do)
- etc. 