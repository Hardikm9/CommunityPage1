// Enhanced Theme Management and CSS Fix System
document.addEventListener('DOMContentLoaded', function() {
    // Fix CSS loading issues
    applyCSSFixes();
    
    // Initialize theme system
    initializeTheme();
    
    // Apply landing page enhancements
    if (document.body.classList.contains('landing')) {
        initializeLandingPage();
    }
});

function applyCSSFixes() {
    // Create a style element for critical CSS fixes
    const style = document.createElement('style');
    style.id = 'css-fixes';
    style.textContent = `
        /* Critical CSS Fixes */
        body {
            font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif !important;
            background: linear-gradient(135deg, #f0f9ff 0%, #ecfdf5 50%, #fffbeb 100%) !important;
            background-attachment: fixed;
            min-height: 100vh;
            margin: 0;
            padding: 0;
            line-height: 1.6;
            color: #0f172a;
        }
        
        /* Landing page specific fixes */
        body.landing {
            background: linear-gradient(135deg, #1a4d3a 0%, #2d5a3d 25%, #1e3a2e 50%, #0f2419 100%) !important;
            color: white !important;
        }
        
        /* Header fixes */
        header {
            text-align: center;
            padding: 3rem 2rem 2rem;
            color: #059669;
            position: relative;
        }
        
        body.landing header {
            color: white;
        }
        
        header h1 {
            margin: 0;
            font-size: 3rem;
            font-weight: 800;
            background: linear-gradient(135deg, #059669, #0891b2);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 0.5rem;
            letter-spacing: -0.02em;
        }
        
        body.landing header h1 {
            background: linear-gradient(135deg, #22c55e 0%, #34d399 100%);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        
        header p {
            font-size: 1.25rem;
            margin-top: 0.5rem;
            color: #334155;
            font-weight: 500;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
        }
        
        body.landing header p {
            color: #d1d5db;
        }
        
        /* Main container fixes */
        .main-container {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        
        /* Options/Cards fixes */
        .options {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 2rem;
            flex-wrap: wrap;
            padding: 2rem;
        }
        
        .card {
            background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
            border-radius: 20px;
            box-shadow: 0 8px 32px rgba(15, 23, 42, 0.08);
            text-decoration: none;
            color: #0f172a;
            padding: 2.5rem 2rem;
            width: 320px;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            text-align: center;
            border: 1px solid rgba(226, 232, 240, 0.8);
            position: relative;
            overflow: hidden;
            backdrop-filter: blur(10px);
        }
        
        .card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #059669, #0891b2);
            transform: scaleX(0);
            transform-origin: left;
            transition: transform 0.4s ease;
        }
        
        .card:hover {
            transform: translateY(-12px) scale(1.02);
            box-shadow: 0 25px 50px rgba(15, 23, 42, 0.15);
            border-color: rgba(5, 150, 105, 0.3);
        }
        
        .card:hover::before {
            transform: scaleX(1);
        }
        
        .card h2 {
            margin-bottom: 1rem;
            font-size: 1.5rem;
            font-weight: 700;
            color: #0f172a;
        }
        
        .card:hover h2 {
            color: #059669;
        }
        
        .card p {
            color: #64748b;
            line-height: 1.6;
            margin: 0;
        }
        
        /* Button fixes */
        .btn, button[type="submit"], .back {
            appearance: none;
            border: none;
            border-radius: 12px;
            padding: 0.875rem 1.5rem;
            font-weight: 600;
            font-size: 0.9rem;
            cursor: pointer;
            position: relative;
            overflow: hidden;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .btn-primary, button[type="submit"] {
            background: linear-gradient(135deg, #059669, #0891b2);
            color: white;
            box-shadow: 0 4px 12px rgba(5, 150, 105, 0.2);
        }
        
        .btn-primary:hover, button[type="submit"]:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(5, 150, 105, 0.3);
        }
        
        .back {
            background: linear-gradient(135deg, #059669, #0891b2);
            color: white;
            border: 2px solid rgba(5, 150, 105, 0.7);
            border-radius: 25px;
            padding: 0.6rem 1rem;
            font-size: 0.9rem;
        }
        
        .back:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(5, 150, 105, 0.3);
            text-decoration: none;
        }
        
        /* Footer fixes */
        footer {
            text-align: center;
            padding: 1.5rem;
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(10px);
            border-top: 1px solid rgba(226, 232, 240, 0.6);
            margin-top: auto;
            color: #64748b;
            font-size: 0.875rem;
            font-weight: 500;
        }
        
        /* Navigation fixes */
        .nav-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(15, 23, 42, 0.8);
            backdrop-filter: blur(10px);
            z-index: 2000;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        }
        
        .nav-overlay.show {
            opacity: 1;
            visibility: visible;
        }
        
        .nav-content {
            background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
            border-radius: 24px;
            padding: 2rem;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
            border: 1px solid rgba(226, 232, 240, 0.8);
            position: relative;
            min-width: 300px;
            text-align: center;
        }
        
        .nav-close {
            position: absolute;
            top: 1rem;
            right: 1rem;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: rgba(15, 23, 42, 0.1);
            color: #64748b;
            text-decoration: none;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            transition: all 0.3s ease;
        }
        
        .nav-close:hover {
            background: #ef4444;
            color: white;
            transform: scale(1.1);
        }
        
        .nav-links {
            list-style: none;
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }
        
        .nav-links a {
            display: block;
            padding: 1rem 1.5rem;
            background: linear-gradient(135deg, #059669, #0891b2);
            color: white;
            text-decoration: none;
            border-radius: 12px;
            font-weight: 600;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }
        
        .nav-links a:hover {
            transform: translateX(8px);
            box-shadow: 0 8px 25px rgba(5, 150, 105, 0.3);
        }
        
        /* Menu button fixes */
        .menu-btn {
            background: #059669 !important;
            color: white !important;
            border: none !important;
            padding: 0.75rem 1rem !important;
            border-radius: 8px !important;
            cursor: pointer !important;
            font-size: 0.9rem !important;
            font-weight: 600 !important;
            transition: all 0.3s ease !important;
            box-shadow: 0 2px 8px rgba(5, 150, 105, 0.3) !important;
            position: absolute !important;
            top: 1rem !important;
            right: 1rem !important;
        }
        
        .menu-btn:hover {
            background: #047857 !important;
            transform: translateY(-2px) !important;
            box-shadow: 0 4px 15px rgba(5, 150, 105, 0.4) !important;
        }
        
        /* Responsive fixes */
        @media (max-width: 768px) {
            .options {
                flex-direction: column;
                gap: 1.5rem;
                padding: 1.5rem;
            }
            
            .card {
                width: 100%;
                max-width: 400px;
                padding: 2rem 1.5rem;
                margin: 0 auto;
            }
            
            header {
                padding: 2rem 1.5rem 1.5rem;
            }
            
            header h1 {
                font-size: 2.5rem;
            }
            
            header p {
                font-size: 1.125rem;
            }
            
            .menu-btn {
                font-size: 0.8rem !important;
                padding: 0.5rem 0.75rem !important;
            }
        }
        
        @media (max-width: 480px) {
            body {
                font-size: 0.875rem;
            }
            
            header {
                padding: 1.5rem 1rem 1rem;
            }
            
            header h1 {
                font-size: 2rem;
                line-height: 1.1;
            }
            
            header p {
                font-size: 1rem;
            }
            
            .card {
                padding: 1.5rem 1rem;
            }
            
            .card h2 {
                font-size: 1.25rem;
            }
            
            .options {
                gap: 1rem;
                padding: 1rem;
            }
        }
        
        /* Animation improvements */
        .stagger-item {
            opacity: 0;
            transform: translateY(20px);
            animation: staggerIn 0.5s ease-out forwards;
        }
        
        .stagger-item:nth-child(1) { animation-delay: 0.1s; }
        .stagger-item:nth-child(2) { animation-delay: 0.2s; }
        .stagger-item:nth-child(3) { animation-delay: 0.3s; }
        
        @keyframes staggerIn {
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    
    document.head.appendChild(style);
}

function initializeTheme() {
    // Apply theme-specific enhancements
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Add theme toggle functionality if needed
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

function initializeLandingPage() {
    // Add floating elements for landing page
    createFloatingElements();
    
    // Initialize any landing-specific features
    if (typeof initializeLandingFeatures === 'function') {
        initializeLandingFeatures();
    }
}

function createFloatingElements() {
    if (document.querySelector('.floating-leaves')) {
        return; // Already exists
    }
    
    const floatingContainer = document.createElement('div');
    floatingContainer.className = 'floating-leaves';
    
    // Create floating leaf elements
    const floatingElements = [
        { emoji: '🍃', class: 'leaf-float', style: 'top: 20%; left: 10%;' },
        { emoji: '🌿', class: 'leaf-float-delayed', style: 'top: 60%; left: 85%;' },
        { emoji: '🍃', class: 'leaf-float-slow', style: 'top: 40%; left: 70%;' },
        { emoji: '🌱', class: 'leaf-float-fast', style: 'top: 80%; left: 30%;' },
        { emoji: '🔋', class: 'icon-float', style: 'top: 15%; left: 80%;' },
        { emoji: '⚡', class: 'icon-float-delayed', style: 'top: 70%; left: 15%;' },
        { emoji: '🌍', class: 'eco-float', style: 'top: 30%; left: 50%;' },
        { emoji: '♻️', class: 'eco-float-delayed', style: 'top: 55%; left: 25%;' },
        { emoji: '⭐', class: 'star-float', style: 'top: 10%; left: 60%;' },
        { emoji: '✨', class: 'star-float-delayed', style: 'top: 45%; left: 90%;' },
        { emoji: '🌟', class: 'star-float-fast', style: 'top: 75%; left: 60%;' },
        { emoji: '💫', class: 'star-float-slow', style: 'top: 25%; left: 5%;' }
    ];
    
    floatingElements.forEach(element => {
        const span = document.createElement('span');
        span.className = element.class;
        span.textContent = element.emoji;
        span.setAttribute('style', element.style);
        floatingContainer.appendChild(span);
    });
    
    document.body.appendChild(floatingContainer);
}

// Export functions for global use
window.toggleNav = function() {
    const navOverlay = document.getElementById('navOverlay');
    if (navOverlay) {
        navOverlay.classList.toggle('show');
    }
};

window.applyCSSFixes = applyCSSFixes;
window.toggleTheme = toggleTheme;