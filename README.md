# 🌱 Community Environment Hub

A modern, responsive Progressive Web App (PWA) designed to help communities report, track, and resolve environmental issues together.

## ✨ Features

### 🏠 **Main Dashboard**
- Clean, modern interface with gradient backgrounds and smooth animations
- Four main action cards: Generate Request, Listed Problems, Progress Made, Interactive Map
- Fully responsive design optimized for all devices and screen sizes
- PWA installation prompt for mobile users
- **NEW**: Advanced theme system with dark/light/auto modes
- **NEW**: Real-time notification system with sound effects
- **NEW**: Enhanced accessibility features and keyboard navigation

### 📸 **Problem Reporting**
- **Multi-image upload** with drag-and-drop support
- **GPS location capture** with reverse geocoding
- **Category selection**: Waste, Infrastructure, Environment, Pollution, Other
- **Priority levels**: Low, Medium, High with visual indicators
- **Rich descriptions** with validation
- **Real-time status feedback** with animations

### 📋 **Problem Management**
- **Advanced filtering**: Search, status, category, priority, sorting
- **Real-time statistics**: Total problems, pending, resolved counts
- **Visual priority and category badges**
- **Location information display**
- **One-click problem resolution**
- **Image galleries** with modal viewing

### 📊 **Analytics & Reporting**
- **Interactive statistics dashboard** with charts
- **CSV export functionality** for data analysis
- **Category and priority breakdowns**
- **Resolution rate tracking**
- **Recent activity timeline**
- **Visual progress indicators**

### 🗺️ **Interactive Map System**
- **OpenStreetMap integration** with Leaflet.js for beautiful mapping
- **Marker clustering** for performance with many issues
- **Layer filtering** by category with toggle controls
- **Click-to-report** functionality directly on the map
- **GPS location detection** with user positioning
- **Fullscreen mode** and custom map controls
- **Real-time issue statistics** display
- **Deep linking** to specific issues via URL parameters

### 📱 **Progressive Web App Features**
- **Offline functionality** with service worker caching
- **Add to home screen** installation prompt
- **Push notifications** support (ready for implementation)
- **Background sync** capabilities
- **Responsive design** for all screen sizes

### 🎆 **Advanced Theme System**
- **Three theme modes**: Light, Dark, and Auto (system preference)
- **Smooth transitions** between themes with visual feedback
- **Persistent storage** of user theme preferences
- **Keyboard shortcuts** (Ctrl+Shift+T to toggle)
- **System preference detection** for auto mode
- **Accessibility compliant** color schemes

### 🔔 **Real-time Notification System**
- **Toast notifications** with 4 types (success, error, warning, info)
- **Notification center** with history and management
- **Sound effects** for different notification types (optional)
- **Customizable settings** (position, timing, sounds)
- **Progress notifications** for long-running operations
- **Action buttons** in notifications for quick actions
- **Smart positioning** that adapts to screen size

## 🚀 Quick Start

### 1. **Download & Setup**
```bash
# Clone or download the project
cd Community-Environment-Hub

# No build process required - it's vanilla HTML/CSS/JS!
```

### 2. **Run Locally**
You can run this in multiple ways:

**Option A: Simple HTTP Server (Recommended)**
```bash
# Using Python (if installed)
python -m http.server 8000

# Using Node.js (if installed)
npx serve .

# Using PHP (if installed)
php -S localhost:8000
```

**Option B: Live Server Extension**
- Install \"Live Server\" extension in VS Code
- Right-click on `Index.html` and select \"Open with Live Server\"

**Option C: Direct File Access**
- Simply open `Index.html` in your browser
- Note: Some PWA features may not work without HTTPS

### 3. **Access the App**
- Open your browser and go to `http://localhost:8000`
- The app will automatically register the service worker
- You'll see an install prompt on supported browsers

## 📁 Project Structure

```
Community-Environment-Hub/
├── 📄 Index.html              # Main dashboard page
├── 📄 request.html            # Problem reporting page
├── 📄 listed.html             # Problem management page
├── 📄 progress.html           # Progress tracking page
├── 📄 map.html                # Interactive map page
├── 🎨 enhanced-base.css        # Enhanced base styles with CSS reset
├── 🎨 style.css              # Main page styles
├── 🎨 *-modern.css           # Modern page-specific styles
├── 🎨 global*.css            # Global enhancements and themes
├── ⚙️ theme-system.js         # Advanced theme switching system
├── ⚙️ notification-system.js  # Real-time notification system
├── ⚙️ map-system.js           # Interactive map integration
├── ⚙️ request.js             # Request page functionality
├── ⚙️ listed.js              # Listed page functionality
├── ⚙️ progress.js            # Progress page functionality
├── 🛠️ sw.js                  # Service worker for PWA
├── 📱 manifest.json          # PWA manifest file
└── 📚 README.md              # This documentation
```

## 🎯 Usage Guide

### **Reporting a Problem**

1. **Click \"Generate Request\"** from the main dashboard
2. **Upload images**: Click the file input or drag & drop multiple images
3. **Select category**: Choose from Waste, Infrastructure, Environment, Pollution, or Other
4. **Set priority**: Select Low, Medium, or High based on urgency
5. **Add description**: Provide detailed information about the issue
6. **Capture location**: Click \"Get Current Location\" or enter manually
7. **Submit**: Review and submit your report

### **Managing Problems**

1. **Click \"Listed Problems\"** from the main dashboard
2. **Search & Filter**: Use the search bar and dropdown filters
3. **View details**: See problem descriptions, images, locations, and priority
4. **Mark as resolved**: Click the \"Mark as Resolved\" button when fixed
5. **Export data**: Click \"Export CSV\" to download problem data
6. **View statistics**: Click \"View Stats\" for detailed analytics

### **Tracking Progress**

1. **Click \"Progress Made\"** from the main dashboard
2. **See all resolved issues** with completion dates
3. **View before/after images** (if available)
4. **Check resolution statistics**
5. **Monitor community impact**

## 🔧 Technical Details

### **Data Storage**
- **Local Storage**: All data is stored locally in the browser
- **Data Structure**: JSON format with unique IDs and timestamps
- **Persistence**: Data persists across sessions
- **Export**: CSV export functionality for data backup

### **PWA Implementation**
- **Service Worker**: Caches resources for offline use
- **Manifest**: Defines app metadata and icons
- **Installation**: Browser-native install prompts
- **Offline Support**: Core functionality works offline

### **Browser Compatibility**
- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 11+
- ✅ Edge 79+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

### **API Dependencies**
- **Geolocation API**: For GPS coordinate capture
- **BigDataCloud API**: For reverse geocoding (optional)
- **Notification API**: For push notifications
- **File API**: For image handling

## 🎨 Customization

### **Styling**
The app uses CSS custom properties for easy theming:

```css
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --success-color: #48bb78;
  --danger-color: #f56565;
  --warning-color: #ed8936;
}
```

### **Categories & Priorities**
Modify the categories and priorities in the respective JavaScript files:

```javascript
// In request.js and listed.js
const categories = [
  'waste', 'infrastructure', 'environment', 
  'pollution', 'other'
];

const priorities = ['low', 'medium', 'high'];
```

### **Branding**
- Update `manifest.json` for app name and colors
- Replace the emoji icons with your own images
- Modify the gradient backgrounds in CSS files

## 🌐 Deployment Options

### **GitHub Pages**
1. Upload files to a GitHub repository
2. Enable GitHub Pages in repository settings
3. Access via `https://yourusername.github.io/repository-name`

### **Netlify**
1. Drag and drop the project folder to Netlify
2. Your site will be live immediately
3. Automatic HTTPS and PWA support

### **Vercel**
1. Connect your GitHub repository
2. Deploy with zero configuration
3. Automatic deployments on updates

### **Traditional Web Hosting**
1. Upload all files to your web server
2. Ensure HTTPS is enabled for PWA features
3. Configure server to serve JSON files correctly

## 🔒 Security Considerations

### **Data Privacy**
- All data is stored locally - no server transmission
- Users have full control over their data
- No analytics or tracking scripts included

### **Content Security**
- No external dependencies loaded at runtime
- Images are stored as base64 in localStorage
- XSS protection through proper data sanitization

### **HTTPS Requirements**
- PWA features require HTTPS in production
- Service worker registration needs HTTPS
- Geolocation API requires HTTPS

## 🚀 Future Enhancements

### **Short Term** (Ready to implement)
- ✅ Problem categories and priorities
- ✅ Advanced filtering and search
- ✅ Data export functionality  
- ✅ PWA installation support
- ✅ Offline functionality

### **Medium Term** (Planned)
- 🔄 Server-side data synchronization
- 🗺️ Interactive maps with problem locations
- 👥 Multi-user support with authentication
- 📧 Email notifications for stakeholders
- 📊 Advanced analytics and dashboards

### **Long Term** (Ideas)
- 🤝 Integration with municipal systems
- 🔔 Real-time push notifications
- 🏆 Gamification with user rewards
- 🤖 AI-powered problem categorization
- 📱 Native mobile apps

## 🐛 Troubleshooting

### **Common Issues**

**PWA Features Not Working**
- Ensure you're accessing via HTTP(S), not file://
- Check browser console for service worker errors
- Verify manifest.json is accessible

**Images Not Displaying**
- Check if images are too large (localStorage limit ~5-10MB)
- Verify file types are supported (jpg, png, webp)
- Check browser console for errors

**Location Not Working**
- Ensure HTTPS is enabled
- Check if location permissions are granted
- Verify geolocation API is supported

**Data Not Persisting**
- Check if localStorage is enabled
- Verify you're not in private/incognito mode
- Check if storage quota is exceeded

### **Debug Mode**
Open browser developer tools (F12) to:
- View console messages from service worker
- Inspect localStorage data
- Monitor network requests
- Debug responsive design

## 📞 Support

### **Getting Help**
- 📧 Create an issue on the project repository
- 💬 Check existing issues for solutions
- 📚 Review this documentation thoroughly
- 🔍 Search online communities for similar problems

### **Contributing**
We welcome contributions! Here's how:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **Design Inspiration**: Modern PWA design principles
- **Icons**: Emoji icons for universal accessibility
- **Color Palette**: Carefully selected for accessibility
- **Community**: Built with community feedback in mind

---

**Built with ❤️ for communities everywhere** 🌱

*Last updated: 2025*

## 🔗 Quick Links

- 🏠 [Live Demo](#) *(Add your deployment URL)*
- 📱 [Install as PWA](#) *(Add installation guide link)*
- 🐛 [Report Issues](#) *(Add issues URL)*
- 📧 [Contact](#) *(Add contact information)*

---

*Made with vanilla HTML, CSS, and JavaScript - no frameworks required!* ⚡