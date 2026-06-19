(() => {
  'use strict';

if (history.scrollRestoration) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

if (window.location.hash) {
  window.history.replaceState(null, null, window.location.pathname);
}

(() => {

  // ── Preloader ────────────────────────────────
  const preloader = document.getElementById('preloader');
  const preFill   = document.getElementById('preFill');
  const prePct    = document.getElementById('prePct');
  let prog = 0;
  let loaded = document.readyState === 'complete';
  const startTime = Date.now();
  let isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  const kickoff = () => {
    if (preloader) {
      preloader.classList.add('hidden');
      setTimeout(() => preloader.style.display = 'none', 800);
    }
    
    setTimeout(() => {
      document.querySelectorAll('.hero .reveal-fade').forEach((el, i) => {
        setTimeout(() => {
          el.classList.add('in');
          // Cleanup composite layers after animation finishes to prevent memory bloat/lag
          setTimeout(() => el.style.willChange = 'auto', 1000);
        }, i * 120);
      });
      if (typeof startTypewriter === 'function') startTypewriter();
    }, 150);
    
    setTimeout(() => window.scrollTo(0, 0), 200); // Force page to stay at the top
  };

  // Function to calculate accurate progress based on actual assets
  const calculateProgress = () => {
    if (loaded) return 100;
    let p = 0;
    
    // 1. Document Readiness (up to 40%)
    if (document.readyState === 'loading') p += 10;
    else if (document.readyState === 'interactive') p += 40;
    else if (document.readyState === 'complete') return 100;

    // 2. Image Loading (up to 55%)
    const images = Array.from(document.images);
    if (images.length > 0) {
      const loadedImages = images.filter(img => img.complete).length;
      p += (loadedImages / images.length) * 55;
    } else {
      p += 55; // No images to load
    }
    
    return Math.min(p, 95);
  };

  let simulatedProg = 0;
  const tick = setInterval(() => {
    let target = calculateProgress();
    
    // Add a gentle simulated crawl for slow networks so it doesn't freeze visually
    if (!loaded) {
      simulatedProg += (95 - simulatedProg) * 0.005;
      target = Math.max(target, simulatedProg);
    }
    
    // If network is full speed and page is loaded, skip the ease and jump straight to 100
    if (loaded) {
      prog = 100;
    } else {
      prog += (target - prog) * 0.15;
    }

    if (preFill) preFill.style.transform = `scaleX(${prog / 100})`;
    if (prePct) prePct.textContent = Math.floor(prog);
    
    // Completion depends ONLY on 'loaded', allowing cached offline pages to open
    if (prog >= 100 && loaded) {
      clearInterval(tick);

      // Ensure exact 100% visual state
      if (preFill) preFill.style.transform = 'scaleX(1)';
      if (prePct) prePct.textContent = '100';

      setTimeout(() => {
        const preInner = preloader ? preloader.querySelector('.pre-inner') : null;
        if (preInner) {
          preInner.style.animation = 'none'; // Kill delayed CSS animations
          preInner.style.transition = 'opacity 0.3s ease-out';
          preInner.style.opacity = '0';
        }
        setTimeout(kickoff, 300);
      }, 150); // Pause briefly at 100% so the user actually registers it
    }
  }, 50);

  window.addEventListener('load', () => { loaded = true; });
  // Ultimate fallback: 15s timeout to prevent infinite hanging on bad connections
  setTimeout(() => { loaded = true; }, 15000);
  
  window.addEventListener('offline', () => { isOnline = false; }, { passive: true });
  window.addEventListener('online', () => { 
    isOnline = true; 
    if (document.readyState === 'complete') loaded = true;
  }, { passive: true });
  
  // ── Typewriter ────────────────────────────────
  const roles = Object.freeze([
    'Full Stack Developer',
    'MERN Stack Engineer',
    'React Developer',
    'Node.js Backend Dev',
  ]);
  let rIdx = 0, cIdx = 0, typing = true;
  const typedEl = document.getElementById('typedRole');

  function startTypewriter() {
    if (!typedEl) return;
    typeStep();
  }

  function typeStep() {
    const current = roles[rIdx];
    if (typing) {
      typedEl.textContent = current.slice(0, cIdx + 1);
      cIdx++;
      if (cIdx === current.length) {
        typing = false;
        setTimeout(typeStep, 1800);
        return;
      }
      setTimeout(typeStep, 70);
    } else {
      typedEl.textContent = current.slice(0, cIdx - 1);
      cIdx--;
      if (cIdx === 0) {
        typing = true;
        rIdx = (rIdx + 1) % roles.length;
        setTimeout(typeStep, 300);
        return;
      }
      setTimeout(typeStep, 40);
    }
  }

  // ── Top Bar scroll ────────────────────────────
  const topbar = document.getElementById('topbar');
  let scrollTicking = false;

  const onScroll = () => {
    if (!scrollTicking) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        topbar.classList.toggle('scrolled', scrollY > 80);
        
        // Only update scroll progress if near the top to save layout computations
        if (scrollY < window.innerHeight * 1.5) {
          updateScrollProgress(scrollY);
        }
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  // ── Scroll progress in hero ───────────────────
  const hslProgress = document.querySelector('.hsl-progress');
  function updateScrollProgress(scrollY) {
    const max = document.body.scrollHeight - window.innerHeight;
    const pct = max > 0 ? (scrollY / max) : 0;
    if (hslProgress) hslProgress.style.transform = `scaleX(${pct})`;
  }

  // ── Top nav active state (Optimized) ──────────
  const sections = document.querySelectorAll('section[id]');
  const tbnLinks = document.querySelectorAll('.tbn-link');
  
  const navObserverOptions = {
    root: null,
    rootMargin: '-20% 0px -75% 0px',
    threshold: 0
  };

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        tbnLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === '#' + id);
        });
      }
    });
  }, navObserverOptions);

  sections.forEach(section => {
    navObserver.observe(section);
  });

  // ── Mobile Drawer ─────────────────────────────
  const tbMenu        = document.getElementById('tbMenu');
  const drawer        = document.getElementById('drawer');
  const drawerOverlay = document.getElementById('drawerOverlay');

  const openDrawer = () => {
    drawer.classList.add('open');
    drawerOverlay.classList.add('show');
    tbMenu.classList.add('open');
    topbar.classList.add('drawer-open');
    document.body.style.overflow = 'hidden';
  };
  const closeDrawer = () => {
    drawer.classList.remove('open');
    drawerOverlay.classList.remove('show');
    tbMenu.classList.remove('open');
    topbar.classList.remove('drawer-open');
    document.body.style.overflow = '';
  };

  let menuLock = false;
  const safeToggleDrawer = (e) => {
    if (e && e.cancelable) e.preventDefault(); // Instantly stops scroll & prevents ghost click
    if (menuLock) return; // Ignores duplicate event fires
    menuLock = true;
    setTimeout(() => menuLock = false, 300); // 300ms lock
    drawer.classList.contains('open') ? closeDrawer() : openDrawer();
  };

  tbMenu.addEventListener('click', safeToggleDrawer);
  tbMenu.addEventListener('touchstart', safeToggleDrawer, { passive: false });

  const safeCloseOverlay = (e) => {
    if (e && e.cancelable) e.preventDefault(); // Swallows the ghost click completely
    closeDrawer();
  };
  drawerOverlay.addEventListener('click', safeCloseOverlay);
  drawerOverlay.addEventListener('touchstart', safeCloseOverlay, { passive: false });

  document.querySelectorAll('.dn-link').forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  // ── Intersection Observer: reveal-up ──────────
  const revealEls = document.querySelectorAll('.reveal-up');
  const observer = new IntersectionObserver((entries) => {
    let delay = 0;
    entries.forEach(e => {
      if (e.isIntersecting) {
        setTimeout(() => {
          e.target.classList.add('in');
          setTimeout(() => {
            e.target.style.willChange = 'auto';
            e.target.classList.remove('reveal-up', 'in'); // Clean up DOM so hover transitions are unlocked
          }, 1200);
        }, delay);
        delay += 120; // Beautiful cascading stagger
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  revealEls.forEach(el => observer.observe(el));

  // ── Skill bar animate on enter ────────────────
  const skillCards = document.querySelectorAll('.skill-card');
  const skillObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('animate'), parseInt(e.target.style.getPropertyValue('--i') || 0) * 80);
        skillObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.2 });
  skillCards.forEach(c => skillObs.observe(c));

  // ── Edu bar animate on enter ──────────────────
  const eduBars = document.querySelectorAll('.edu-bar');
  if (eduBars.length > 0) {
    const eduObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add('animate'), 300);
          eduObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.4 });
    eduBars.forEach(bar => eduObs.observe(bar));
  }

  // ── Smooth hash scroll (clean URL) ───────────
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const hash = a.getAttribute('href');
      const target = document.querySelector(hash);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
        if (window.history.pushState) {
          window.history.pushState(null, null, hash);
        }
      }
    });
  });

  // ── Logo scroll to top ────────────────────────
  const tbLogo = document.querySelector('.tb-logo');
  let logoLock = false;
  const handleLogoClick = (e) => {
    if (e && e.cancelable) e.preventDefault();
    if (logoLock) return;
    logoLock = true;
    setTimeout(() => logoLock = false, 300);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (window.history.pushState) window.history.pushState(null, null, window.location.pathname);
  };
  if (tbLogo) {
    tbLogo.addEventListener('click', handleLogoClick);
    tbLogo.addEventListener('touchstart', handleLogoClick, { passive: false });
  }

  // ── Keyboard accessibility for drawer ────────
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) closeDrawer();
  });

})();

// Ensure back button correctly scrolls to the previous section
window.addEventListener('hashchange', () => {
  // Close mobile menu if it is open while navigating back
  const activeDrawer = document.getElementById('drawer');
  if (activeDrawer && activeDrawer.classList.contains('open')) {
    activeDrawer.classList.remove('open');
    document.getElementById('tbMenu')?.classList.remove('open');
    document.getElementById('drawerOverlay')?.classList.remove('show');
    document.body.style.overflow = '';
  }

  setTimeout(() => {
    const hash = window.location.hash;
    if (hash) {
      // Use getElementById instead of querySelector to prevent CSS selector injection
      // and unhandled DOM exceptions if the user inputs a malformed hash in the URL.
      const targetId = hash.substring(1);
      try {
        const target = document.getElementById(decodeURIComponent(targetId));
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      } catch (e) {}
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, 10);
});

// Theme
const themeOptions = document.querySelectorAll('.theme-option');
let currentTheme = 'system';

function updateThemeUI(theme) {
  if (theme === 'light') { document.documentElement.classList.add('light-theme'); }
  else if (theme === 'dark') { document.documentElement.classList.remove('light-theme'); }
  else {
    document.documentElement.classList.toggle('light-theme', window.matchMedia('(prefers-color-scheme: light)').matches);
  }
  if (themeOptions) themeOptions.forEach(opt => opt.classList.toggle('active', opt.dataset.theme === theme));
  document.querySelectorAll('.dt-toggle').forEach(t => t.setAttribute('data-active', theme));
}
updateThemeUI(currentTheme);
window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => { if (currentTheme === 'system') updateThemeUI('system'); });

themeOptions.forEach(opt => {
  opt.addEventListener('click', e => {
    currentTheme = opt.dataset.theme;
    updateThemeUI(currentTheme);
  });
});

// Allow drag/swipe over theme toggles on mobile to shift options smoothly
document.querySelectorAll('.dt-toggle').forEach(toggle => {
  toggle.addEventListener('touchmove', e => {
    const touch = e.touches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    const btn = el ? el.closest('.theme-option') : null;
    
    if (btn && toggle.contains(btn)) {
      e.preventDefault(); // Prevents page from scrolling while swiping toggle
      const targetTheme = btn.dataset.theme;
      if (targetTheme !== currentTheme) {
        currentTheme = targetTheme;
        updateThemeUI(currentTheme);
      }
    }
  }, { passive: false });
});

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
if (toastClose) toastClose.addEventListener('click', () => { toast.classList.remove('show-toast'); clearTimeout(toastTimeout); });

// --- Resume PDF Loader Logic ---
let pdfLoaderInterval;
let pdfPhaseTimeout;
let pdfErrorTimeout;

function loadPdfDocument(e, attempt = 1) {
  const isRefresh = e instanceof Event && e.currentTarget && e.currentTarget.id === 'refreshPdfBtn';
  const resumeModal = document.getElementById('resumeModal');
  const iframe = resumeModal ? resumeModal.querySelector('.resume-iframe') : null;
  const pdfLoader = document.getElementById('pdfLoader');
  const pdfLoaderProgress = document.getElementById('pdfLoaderProgress');
  const loaderStatus = pdfLoader ? pdfLoader.querySelector('.loader-status') : null;
  const downloadModalBtn = document.querySelector('.resume-modal-download');
  const refreshPdfBtn = document.getElementById('refreshPdfBtn');

  if (!iframe) return;

  // Only reset UI completely if it's the first attempt or a manual user refresh
  if (attempt === 1 || isRefresh) {
    iframe.removeAttribute('data-error');
    if (pdfLoader) pdfLoader.classList.remove('hidden');
    if (loaderStatus) {
      loaderStatus.textContent = attempt === 1 ? 'Loading Document...' : 'Refreshing Document...';
      loaderStatus.style.color = 'var(--gold)';
    }
    if (pdfLoaderProgress) {
      pdfLoaderProgress.style.width = '0%';
      pdfLoaderProgress.style.background = 'var(--gold)';
    }
    if (downloadModalBtn) downloadModalBtn.style.display = 'flex';
    if (refreshPdfBtn) refreshPdfBtn.style.display = 'none';

    clearInterval(pdfLoaderInterval);
    let simProgress = 0;
    pdfLoaderInterval = setInterval(() => {
      simProgress += (90 - simProgress) * 0.05;
      if (pdfLoaderProgress) pdfLoaderProgress.style.width = simProgress + '%';
    }, 100);
  }

  clearTimeout(pdfPhaseTimeout);
  clearTimeout(pdfErrorTimeout);

  const isAndroid = /Android/i.test(navigator.userAgent);
  const isInAppBrowser = /Instagram|FBAV|FBAN/i.test(navigator.userAgent);
  let targetSrc = '';
  const timestamp = new Date().getTime();

  if (isAndroid || isInAppBrowser) {
    const cacheParam = (isRefresh || attempt > 1) ? `?t=${timestamp}` : '';
    const absoluteUrl = new URL(`view.cv.pdf${cacheParam}`, window.location.href).href;
    if (absoluteUrl.startsWith('http')) {
      targetSrc = `https://docs.google.com/gview?url=${encodeURIComponent(absoluteUrl)}&embedded=true`;
    } else {
      targetSrc = iframe.getAttribute('data-src');
    }
  } else {
    const baseSrc = iframe.getAttribute('data-src');
    // Security: Strict allowlist to prevent data:, javascript:, vbscript:, etc. injections
    const isSafeUrl = /^(https?:\/\/|\/)/i.test(baseSrc.trim()) || /^[a-zA-Z0-9_.-]+\.pdf/i.test(baseSrc.trim());
    if (!baseSrc || !isSafeUrl) return;
    const base = baseSrc.split('#')[0];
    const hash = baseSrc.split('#')[1] || '';
    const isFile = window.location.protocol === 'file:';
    
    let finalSrc = base;
    if (!isFile && (isRefresh || attempt > 1)) {
      finalSrc += `?t=${timestamp}`;
    }
    if (hash) finalSrc += `#${hash}`;
    
    targetSrc = finalSrc;
  }

  const finishLoading = () => {
    clearInterval(pdfLoaderInterval);
    clearTimeout(pdfPhaseTimeout);
    clearTimeout(pdfErrorTimeout);
    iframe.removeAttribute('data-error');
    if (pdfLoaderProgress) pdfLoaderProgress.style.width = '100%';
    setTimeout(() => { if (pdfLoader) pdfLoader.classList.add('hidden'); }, 400);
  };

  // Success handler: Only fires when the document actually finishes rendering bytes
  iframe.onload = finishLoading;
  
  // Assign src to trigger load
  iframe.src = targetSrc;

  // Timeout routing based on attempt level
  if (attempt === 1 && !isRefresh) {
    // Phase 1: Give it 3.5s before attempting an auto-reload optimization
    pdfPhaseTimeout = setTimeout(() => {
      if (loaderStatus) {
        loaderStatus.textContent = 'Optimizing connection... Auto-reloading...';
      }
      loadPdfDocument(e, 2);
    }, 3500);
  } else {
    // Phase 2: Post-reload or Manual Refresh
    pdfPhaseTimeout = setTimeout(() => {
      if (loaderStatus) {
        loaderStatus.textContent = 'Sorry for interrupting, it is taking longer than usual...';
      }
      
      // Phase 3: Final error timeout if still not loaded
      pdfErrorTimeout = setTimeout(() => {
        clearInterval(pdfLoaderInterval);
        iframe.setAttribute('data-error', 'true');
        if (loaderStatus) {
          loaderStatus.textContent = 'Failed to load document. Please refresh and try again.';
          loaderStatus.style.color = '#e05252';
        }
        if (pdfLoaderProgress) {
          pdfLoaderProgress.style.background = '#e05252';
        }
        if (downloadModalBtn) downloadModalBtn.style.display = 'none';
        if (refreshPdfBtn) refreshPdfBtn.style.display = 'flex';
      }, 7000);
    }, 4000);
  }

  // Special Native Desktop bypass: since native browsers usually don't fire reliable onloads 
  // or show their own inner loading UI, we bypass our custom loader early to hand off to native UI
  if (!isAndroid && !isInAppBrowser) {
    setTimeout(() => {
      if (iframe.getAttribute('data-error') !== 'true') {
         finishLoading();
      }
    }, 2500);
  }
}

const refreshPdfBtn = document.getElementById('refreshPdfBtn');
if (refreshPdfBtn) refreshPdfBtn.addEventListener('click', loadPdfDocument);

// Resume button loading animation
const resumeBtn = document.getElementById('viewResumeBtn');
if (resumeBtn) {
  resumeBtn.addEventListener('click', e => {
    e.preventDefault(); // Stop immediate navigation
      
      const resumeModal = document.getElementById('resumeModal');
      if (resumeModal) {
        const iframe = resumeModal.querySelector('.resume-iframe');
        // If iframe hasn't been loaded yet, or if it errored out previously, trigger fetch
        if (iframe && (!iframe.getAttribute('src') || iframe.getAttribute('data-error') === 'true')) {
          loadPdfDocument();
        }

        resumeModal.classList.add('show');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
      }
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
    
    // Security: Strict allowlist for download links to prevent malicious mutations
    const isSafeHref = /^(https?:\/\/|\/)/i.test(href.trim()) || /^[a-zA-Z0-9_.-]+\.pdf/i.test(href.trim());
    if (!href || !isSafeHref) return;

    const filename = this.getAttribute('download');
    const originalHTML = this.innerHTML;
    
    // Bypass Blob conversion for Instagram / In-App browsers as they block it silently
    const isInAppBrowser = /Instagram|FBAV|FBAN|LinkedIn/i.test(navigator.userAgent);
    if (isInAppBrowser) {
      const fallbackLink = document.createElement('a');
      fallbackLink.style.display = 'none';
      fallbackLink.href = href;
      fallbackLink.download = filename || 'Hriday_Resume.pdf';
      fallbackLink.target = '_blank';
      fallbackLink.rel = 'noopener noreferrer';
      document.body.appendChild(fallbackLink);
      fallbackLink.click();
      setTimeout(() => document.body.removeChild(fallbackLink), 1000);
      
      this.style.pointerEvents = 'auto';
      this.innerHTML = originalHTML;
      return;
    }
    
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
})();

// ── Security: Anti-Inspect & Self-XSS Deterrent ───────────────────

// Console Self-XSS Warning (Industry Standard Practice)
console.log(
  "%cStop!",
  "color: #ff3333; font-family: sans-serif; font-size: 4rem; font-weight: bolder; text-shadow: #000 1px 1px;"
);
console.log(
  "%cThis is a browser feature intended for developers. If someone told you to copy-paste something here to enable a feature or 'hack' an account, it is a scam and will give them access to your private information.",
  "font-family: sans-serif; font-size: 1.25rem; color: #fff;"
);