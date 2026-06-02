if (history.scrollRestoration) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);
if (window.location.hash) {
  window.history.replaceState(null, null, window.location.pathname);
}

const preloader = document.getElementById('preloader');
const loaderProgress = document.getElementById('loaderProgress');
const loaderStatus = document.getElementById('loaderStatus');

let progress = 0;
let isLoaded = document.readyState === 'complete';
let isOnline = navigator.onLine;

function updateLoaderStatus() {
  if (!loaderStatus) return;
  const displayProgress = Math.floor(progress);
  
  if (!isOnline) {
    const offlineTexts = [
      "Connection lost...", 
      "Waiting for network...", 
      "Trying to reconnect...", 
      "Check your internet..."
    ];
    const textIdx = Math.floor(Date.now() / 2000) % offlineTexts.length;
    loaderStatus.textContent = `${offlineTexts[textIdx]} ${displayProgress}%`;
  } else {
    if (progress >= 100) loaderStatus.textContent = `Here you go!`;
    else if (progress > 85) loaderStatus.textContent = `Almost there... ${displayProgress}%`;
    else if (progress > 55) loaderStatus.textContent = `Loading interface... ${displayProgress}%`;
    else if (progress > 25) loaderStatus.textContent = `Loading assets... ${displayProgress}%`;
    else loaderStatus.textContent = `Connecting... ${displayProgress}%`;
  }
}

const loaderInterval = setInterval(() => {
  if (!isLoaded || !isOnline) {
    let increment = (95 - progress) * 0.05;
    if (increment < 0.1) increment = 0.1;
    progress += increment;
    if (progress > 95) progress = 95;
  } else {
    progress = 100;
  }
  
  if (loaderProgress) loaderProgress.style.width = progress + '%';
  updateLoaderStatus();

  if (progress >= 100 && isLoaded && isOnline) {
    clearInterval(loaderInterval);
    setTimeout(() => { // Wait 0.5 sec as requested
      if (preloader) { preloader.classList.add('hidden'); setTimeout(() => preloader.style.display = 'none', 600); }
    }, 500);
  }
}, 100);

let isPreloaderFinished = false;
const finishPreloader = () => {
  if (isPreloaderFinished) return;
  isPreloaderFinished = true;
  isLoaded = true;
};

window.addEventListener('load', finishPreloader);
// Increased safety fallback to 15 seconds so slow connections have enough time to load
setTimeout(finishPreloader, 15000);

window.addEventListener('offline', () => { isOnline = false; updateLoaderStatus(); });
window.addEventListener('online', () => { 
  isOnline = true; 
  updateLoaderStatus();
  if (document.readyState === 'complete') isLoaded = true;
});

// Sticky header
const mainHeader = document.getElementById('mainHeader');
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) mainHeader.classList.add('scrolled');
  else mainHeader.classList.remove('scrolled');
});

// Mobile menu
const menuBtn = document.getElementById('menuBtn');
const navLinks = document.getElementById('navLinks');
const sidebarClose = document.getElementById('sidebarClose');

sidebarClose.addEventListener('click', () => {
  navLinks.classList.remove('active');
  menuBtn.classList.remove('open');
});

menuBtn.addEventListener('click', () => {
  navLinks.classList.toggle('active');
  menuBtn.classList.toggle('open');
});
document.querySelectorAll('.nav-links a').forEach(a => {
  a.addEventListener('click', () => {
    navLinks.classList.remove('active');
    menuBtn.classList.remove('open');
  });
});
document.addEventListener('click', e => {
  if (navLinks.classList.contains('active') && !navLinks.contains(e.target) && !menuBtn.contains(e.target)) {
    navLinks.classList.remove('active');
    menuBtn.classList.remove('open');
  }
});

// Ensure back button correctly scrolls to the previous section
window.addEventListener('hashchange', () => {
  // Close mobile menu if it is open while navigating back
  navLinks.classList.remove('active');
  menuBtn.classList.remove('open');

  setTimeout(() => {
    const hash = window.location.hash;
    if (hash) {
      // Use getElementById instead of querySelector to prevent CSS selector injection
      // and unhandled DOM exceptions if the user inputs a malformed hash in the URL.
      const targetId = hash.substring(1);
      const target = document.getElementById(targetId);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, 10);
});

// Scroll reveal
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.12 });
revealEls.forEach(el => revealObserver.observe(el));

// Theme
const themeToggleBtn = document.getElementById('themeToggleBtn');
const themeDropdown = document.getElementById('themeDropdown');
const themeOptions = document.querySelectorAll('.theme-option');
const currentThemeIcon = document.getElementById('currentThemeIcon');
let currentTheme = sessionStorage.getItem('theme') || 'system';

function updateThemeUI(theme) {
  if (theme === 'light') { document.documentElement.classList.add('light-theme'); currentThemeIcon.className = 'bi bi-sun-fill'; }
  else if (theme === 'dark') { document.documentElement.classList.remove('light-theme'); currentThemeIcon.className = 'bi bi-moon-stars-fill'; }
  else {
    document.documentElement.classList.toggle('light-theme', window.matchMedia('(prefers-color-scheme: light)').matches);
    currentThemeIcon.className = 'bi bi-display';
  }
  themeOptions.forEach(opt => opt.classList.toggle('active', opt.dataset.theme === theme));
}
updateThemeUI(currentTheme);
window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => { if (currentTheme === 'system') updateThemeUI('system'); });
themeToggleBtn.addEventListener('click', e => { e.stopPropagation(); themeDropdown.classList.toggle('show'); });
themeOptions.forEach(opt => {
  opt.addEventListener('click', e => { 
    e.stopPropagation(); 
    currentTheme = opt.dataset.theme; 
    if (currentTheme === 'system') sessionStorage.removeItem('theme');
    else sessionStorage.setItem('theme', currentTheme);
    updateThemeUI(currentTheme); 
    themeDropdown.classList.remove('show'); 
  });
});
document.addEventListener('click', e => { if (!themeToggleBtn.contains(e.target) && !themeDropdown.contains(e.target)) themeDropdown.classList.remove('show'); });

// Toast
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');
const toastClose = document.getElementById('toastClose');
let toastTimeout;
function showToast(msg) {
  toastMessage.textContent = msg;
  toast.classList.remove('show-toast');
  void toast.offsetWidth;
  toast.classList.add('show-toast');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove('show-toast'), 2500);
}
toastClose.addEventListener('click', () => { toast.classList.remove('show-toast'); clearTimeout(toastTimeout); });

// Resume button loading animation
const resumeBtn = document.getElementById('viewResumeBtn');
if (resumeBtn) {
  resumeBtn.addEventListener('click', e => {
    e.preventDefault(); // Stop immediate navigation
    if (resumeBtn.classList.contains('is-loading')) return; // Prevent double clicks

    // Lock exact fractional button dimensions to prevent any layout shifts
    const rect = resumeBtn.getBoundingClientRect();
    resumeBtn.style.width = rect.width + 'px';
    resumeBtn.style.height = rect.height + 'px';

    const originalHTML = resumeBtn.innerHTML;

    resumeBtn.classList.add('is-loading');
    resumeBtn.innerHTML = '<span class="btn-spinner"></span> Fetching...';

    setTimeout(() => {
      resumeBtn.innerHTML = '<span class="btn-spinner"></span> Loading...';
    }, 750);

    setTimeout(() => {
      resumeBtn.classList.remove('is-loading');
      resumeBtn.innerHTML = originalHTML;
      resumeBtn.style.width = '';
      resumeBtn.style.height = '';
      
      const resumeModal = document.getElementById('resumeModal');
      if (resumeModal) {
        // Handle PDF rendering dynamically to fix Instagram/Android popup redirect issues
        const iframe = resumeModal.querySelector('.resume-iframe');
        if (iframe && !iframe.getAttribute('src')) {
          const isAndroid = /Android/i.test(navigator.userAgent);
          const isInAppBrowser = /Instagram|FBAV|FBAN/i.test(navigator.userAgent);
          
          if (isAndroid || isInAppBrowser) {
            // Android WebViews cannot render PDFs natively. We use Google Docs Viewer to display it inline as HTML.
            // Adding a cache-buster (?t=...) forces Google to fetch the freshly deployed Vercel file instead of showing an "Open" error.
            const cacheBuster = new Date().getTime();
            const absoluteUrl = new URL(`view.cv.pdf?t=${cacheBuster}`, window.location.href).href;
            if (absoluteUrl.startsWith('http')) {
              iframe.src = `https://docs.google.com/gview?url=${encodeURIComponent(absoluteUrl)}&embedded=true`;
            } else {
              iframe.src = iframe.getAttribute('data-src');
            }
          } else {
            iframe.src = iframe.getAttribute('data-src');
          }
        }

        resumeModal.classList.add('show');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
      }
    }, 1500);
  });
}

// Modal closing logic
const resumeModal = document.getElementById('resumeModal');
const closeResumeModal = document.getElementById('closeResumeModal');

if (resumeModal && closeResumeModal) {
  const closeModal = () => {
    resumeModal.classList.remove('show');
    document.body.style.overflow = '';
  };
  closeResumeModal.addEventListener('click', closeModal);
  resumeModal.addEventListener('click', e => {
    if (e.target === resumeModal) closeModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && resumeModal.classList.contains('show')) closeModal();
  });
}

// Direct download for resume to prevent browser redirection
const downloadModalBtn = document.querySelector('.resume-modal-download');
if (downloadModalBtn) {
  downloadModalBtn.addEventListener('click', async function(e) {
    e.preventDefault();
    
    // Prevent multiple clicks while downloading
    if (this.style.pointerEvents === 'none') return;
    
    const href = this.getAttribute('href');
    const filename = this.getAttribute('download');
    const originalHTML = this.innerHTML;
    
    // Show loading spinner in the download icon
    this.style.pointerEvents = 'none';
    this.innerHTML = '<i class="bi bi-arrow-repeat" style="animation: spin 1s linear infinite;"></i>';
    
    try {
      const response = await fetch(href);
      if (!response.ok) throw new Error('Network response was not ok');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const tempLink = document.createElement('a');
      tempLink.style.display = 'none';
      tempLink.href = blobUrl;
      tempLink.download = filename;
      document.body.appendChild(tempLink);
      tempLink.click();
      
      setTimeout(() => {
        document.body.removeChild(tempLink);
        window.URL.revokeObjectURL(blobUrl);
      }, 1000);
    } catch (err) {
      // Fallback if fetch is blocked (e.g., local file:// testing)
      const fallbackLink = document.createElement('a');
      fallbackLink.style.display = 'none';
      fallbackLink.href = href;
      fallbackLink.download = filename || 'Hriday_Resume.pdf';
      fallbackLink.target = '_blank'; // Prevents redirecting your portfolio page
      fallbackLink.rel = 'noopener noreferrer'; // Security best practice for _blank links
      document.body.appendChild(fallbackLink);
      fallbackLink.click();
      setTimeout(() => {
        document.body.removeChild(fallbackLink);
      }, 1000);
    } finally {
      this.style.pointerEvents = 'auto';
      this.innerHTML = originalHTML;
    }
  });
}

// Scroll top
const scrollTopBtn = document.getElementById('scrollTopBtn');
const aboutSection = document.getElementById('about');
let lastST = 0, stTimeout;
window.addEventListener('scroll', () => {
  const cur = window.pageYOffset;
  if (cur > aboutSection.offsetTop && cur < lastST) scrollTopBtn.classList.add('show');
  else scrollTopBtn.classList.remove('show');
  lastST = cur <= 0 ? 0 : cur;
  clearTimeout(stTimeout);
  stTimeout = setTimeout(() => scrollTopBtn.classList.remove('show'), 1500);
});