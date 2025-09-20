# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is the **Community Environment Hub** - a vanilla HTML/CSS/JavaScript Progressive Web App (PWA) designed for community environmental issue reporting and tracking. No build tools or frameworks are required; it runs entirely in the browser with local storage persistence.

## Development Commands

### Local Development Server
Since this is a static PWA, you need an HTTP server to properly test PWA features:

```powershell
# Using Python (if available)
python -m http.server 8000

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8000

# Using Python 3 specifically
python3 -m http.server 8000
```

Then access at: `http://localhost:8000`

### Testing PWA Features
- **Install prompt**: Only works over HTTPS or localhost
- **Service Worker**: Only registers over HTTPS or localhost  
- **Geolocation**: Requires HTTPS in production
- **Notifications**: Need user permission (automatic prompt included)

### File Validation
```powershell
# Check all HTML files are valid
# (Manual validation needed - no automated tools configured)

# Validate CSS
# (Manual validation needed - no linters configured)

# Check JavaScript syntax
# (Manual validation needed - no linters configured)
```

## Architecture

### Application Structure
This is a **Multi-Page Application (MPA)** with a **page-per-feature** architecture:

```
Index.html         → Main dashboard (navigation hub)
request.html       → Problem reporting (image upload + geolocation)
listed.html        → Problem management (filtering + statistics)
progress.html      → Progress tracking (resolved issues)
```

### Data Flow Architecture
- **Storage**: Browser localStorage (JSON format)
- **State**: Each page manages its own state independently
- **Communication**: Pages communicate via localStorage events
- **Persistence**: All data persists between sessions locally

### Core Data Model
```javascript
// Problem Object Structure
{
  id: timestamp,                    // Unique identifier
  description: string,              // User-provided description
  category: "waste"|"infrastructure"|"environment"|"pollution"|"other",
  priority: "low"|"medium"|"high",
  status: "Pending"|"Resolved",
  submittedOn: "MM/DD/YYYY",
  resolvedOn: "MM/DD/YYYY" | null,
  images: [{ data: base64, name: string, size: number, type: string }],
  location: { latitude: number, longitude: number, accuracy: number } | null,
  manualLocation: string,
  submittedAt: ISO_string
}
```

### Service Worker Strategy
- **Static resources**: Cache-first strategy
- **API requests**: Network-first with cache fallback
- **Offline support**: Full functionality available offline
- **Update mechanism**: Automatic with user confirmation prompt

### JavaScript Architecture
Each page has its dedicated JavaScript file with specific responsibilities:

- **`script.js`**: Legacy main script (minimal functionality)
- **`request.js`**: Form handling, image processing, geolocation, submission
- **`listed.js`**: Filtering, sorting, statistics, CSV export, modal management
- **`progress.js`**: Simple resolved issues display with image modals
- **`sw.js`**: Service worker with comprehensive caching and offline strategies
- **`theme.js`**: Dark/light mode toggle with localStorage persistence

### CSS Architecture
- **`global.css`**: Design system, CSS custom properties, base components
- **`style.css`**: Homepage-specific styles
- **`style-[page].css`**: Page-specific styles for request, listed, progress
- **`animations.css`**: Animation utilities and transitions

## Key Development Guidelines

### Storage Management
- **Storage key**: `"problems"` contains array of problem objects
- **Size limit**: ~5-10MB localStorage limit (base64 images consume significant space)
- **Data integrity**: Always JSON.parse/stringify when accessing localStorage
- **Error handling**: Graceful degradation if localStorage unavailable

### Image Handling
- Images converted to base64 and stored locally
- Multiple image upload supported (request.js handles FileReader operations)
- Image modal functionality for viewing (implemented in listed.js and progress.js)
- Consider storage limits when adding image features

### Geolocation Integration
- Uses browser Geolocation API with fallback to manual input
- Reverse geocoding via BigDataCloud API (optional external dependency)
- Location accuracy displayed to users
- Proper error handling for permission denied/unavailable scenarios

### PWA Implementation
- **Manifest**: `manifest.json` defines app metadata and install behavior
- **Service Worker**: Comprehensive offline-first strategy
- **Install prompt**: Custom implementation with user dismissal memory
- **Background sync**: Prepared for future server synchronization
- **Push notifications**: Framework ready, needs server implementation

### Styling Patterns
- Uses CSS custom properties for theming (see `:root` in global.css)
- Automatic dark mode support via `prefers-color-scheme`
- Component-based CSS classes (`.card`, `.btn`, etc.)
- Responsive design with mobile-first approach
- Consistent spacing using CSS custom property scale

### State Management Patterns
- Each page is responsible for its own state initialization
- localStorage serves as the single source of truth
- No global state management - pages are independent
- State updates trigger UI re-renders (manual DOM manipulation)

### Error Handling Patterns
- User-friendly error messages with emoji prefixes
- Console logging for debugging (especially service worker events)
- Graceful degradation for missing browser features
- Form validation with immediate feedback

## Common Development Tasks

### Adding New Problem Categories
1. Update category options in `request.html` select element
2. Add category icon mapping in `listed.js` `getCategoryIcon()`
3. Update CSV export headers if needed
4. Test filtering functionality

### Adding New Priority Levels
1. Update priority options in `request.html` select element
2. Update priority icon mapping in `listed.js` `getPriorityIcon()`
3. Update CSS priority classes in relevant stylesheets
4. Update sorting logic in `listed.js` `sortProblems()`

### Modifying Data Structure
1. Update the data model documentation above
2. Consider migration strategy for existing localStorage data
3. Update all read/write operations across all JS files
4. Test CSV export functionality
5. Update statistics calculations in `listed.js`

### Adding External API Integration
1. Add API patterns to service worker `API_CACHE_PATTERNS`
2. Implement network-first caching strategy
3. Add proper error handling for offline scenarios
4. Consider rate limiting and API key management
5. Test offline functionality thoroughly

### Styling Updates
1. Modify CSS custom properties in `global.css` `:root`
2. Test both light and dark mode variants
3. Ensure responsive design across all screen sizes
4. Validate accessibility (focus states, color contrast)
5. Test PWA manifest theme color consistency

## Important API Dependencies

- **BigDataCloud API**: Used for reverse geocoding (optional, has fallback)
- **Geolocation API**: Browser built-in, requires HTTPS in production
- **Notification API**: Browser built-in, requires user permission
- **Service Worker API**: Browser built-in, requires HTTPS in production

## Browser Support Requirements

- Modern browsers supporting ES6+ features
- Service Worker support required for PWA functionality
- localStorage support required for data persistence
- Geolocation API support required for location features
- File API support required for image upload

## Deployment Considerations

- Must be served over HTTPS for full PWA functionality
- Static hosting compatible (GitHub Pages, Netlify, Vercel)
- No server-side requirements
- Consider CDN for global distribution
- Test install prompts on mobile devices
- Verify service worker registration in production