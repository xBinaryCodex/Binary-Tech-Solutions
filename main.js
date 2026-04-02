/**
 * Binary Tech Solutions — main.js
 * Handles: sticky nav, hamburger menu, custom cursor,
 *          hero canvas animation, scroll animations (Intersection Observer)
 */

'use strict';

/* ─────────────────────────────────────────────────────────────────
   UTILITY: Throttle
───────────────────────────────────────────────────────────────── */
function throttle(fn, ms) {
  let last = 0;
  return function(...args) {
    const now = Date.now();
    if (now - last >= ms) {
      last = now;
      fn.apply(this, args);
    }
  };
}

/* ─────────────────────────────────────────────────────────────────
   1. STICKY NAVIGATION
   Adds .nav-scrolled class to #navbar after 20px of scroll
   Highlights the active section link
───────────────────────────────────────────────────────────────── */
function initNav() {
  const navbar   = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  if (!navbar) return;

  // Scroll handler
  const onScroll = throttle(() => {
    if (window.scrollY > 20) {
      navbar.classList.add('nav-scrolled');
    } else {
      navbar.classList.remove('nav-scrolled');
    }
    updateActiveLink();
  }, 80);

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load

  // Active link: highlight the nav link for the section currently in view
  function updateActiveLink() {
    const sections = document.querySelectorAll('section[id]');
    let current = '';

    sections.forEach(section => {
      const top = section.offsetTop - 100;
      if (window.scrollY >= top) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  }

  // Close mobile menu when a nav link is clicked
  navLinks.forEach(link => {
    link.addEventListener('click', () => closeMobileMenu());
  });
}

/* ─────────────────────────────────────────────────────────────────
   2. HAMBURGER / MOBILE MENU
───────────────────────────────────────────────────────────────── */
function initHamburger() {
  const hamburger   = document.getElementById('hamburger');
  const mobileMenu  = document.getElementById('mobileMenu');
  if (!hamburger || !mobileMenu) return;

  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.getAttribute('aria-expanded') === 'true';
    if (isOpen) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });

  // Close on mobile link click
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => closeMobileMenu());
  });

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMobileMenu();
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (
      hamburger.getAttribute('aria-expanded') === 'true' &&
      !mobileMenu.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {
      closeMobileMenu();
    }
  });
}

function openMobileMenu() {
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (!hamburger || !mobileMenu) return;
  hamburger.setAttribute('aria-expanded', 'true');
  mobileMenu.removeAttribute('hidden');
  document.body.style.overflow = 'hidden'; // prevent scroll behind menu
}

function closeMobileMenu() {
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (!hamburger || !mobileMenu) return;
  hamburger.setAttribute('aria-expanded', 'false');
  mobileMenu.setAttribute('hidden', '');
  document.body.style.overflow = '';
}

/* ─────────────────────────────────────────────────────────────────
   3. CUSTOM CURSOR
   Only active on devices with precise pointer (desktop)
───────────────────────────────────────────────────────────────── */
function initCursor() {
  // Only run on devices with a fine pointer (mouse)
  if (!window.matchMedia('(pointer: fine)').matches) return;

  const cursor    = document.getElementById('cursor');
  const cursorDot = document.getElementById('cursorDot');
  if (!cursor || !cursorDot) return;

  document.body.classList.add('custom-cursor-active');

  let mouseX = 0, mouseY = 0;
  let curX   = 0, curY   = 0;
  let dotX   = 0, dotY   = 0;
  let visible = false;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Show cursor on first move
    if (!visible) {
      visible = true;
      cursor.style.opacity    = '1';
      cursorDot.style.opacity = '1';
    }
  }, { passive: true });

  // Enlarge cursor on interactive elements
  const interactiveEls = 'a, button, [role="button"], input, textarea, select, label';

  document.addEventListener('mouseover', e => {
    if (e.target.closest(interactiveEls)) {
      cursor.classList.add('cursor--hover');
    }
  });

  document.addEventListener('mouseout', e => {
    if (e.target.closest(interactiveEls)) {
      cursor.classList.remove('cursor--hover');
    }
  });

  document.addEventListener('mouseleave', () => {
    cursor.style.opacity    = '0';
    cursorDot.style.opacity = '0';
    visible = false;
  });

  document.addEventListener('mouseenter', () => {
    if (visible) {
      cursor.style.opacity    = '1';
      cursorDot.style.opacity = '1';
    }
  });

  // Smooth cursor tracking with lerp
  function lerp(a, b, n) { return (1 - n) * a + n * b; }

  function animateCursor() {
    // Dot follows mouse exactly but with slight lag
    dotX = lerp(dotX, mouseX, 0.7);
    dotY = lerp(dotY, mouseY, 0.7);
    cursorDot.style.transform = `translate(${dotX}px, ${dotY}px) translate(-50%, -50%)`;

    // Outer ring lags more
    curX = lerp(curX, mouseX, 0.12);
    curY = lerp(curY, mouseY, 0.12);
    cursor.style.transform = `translate(${curX}px, ${curY}px) translate(-50%, -50%)`;

    requestAnimationFrame(animateCursor);
  }

  requestAnimationFrame(animateCursor);
}

/* ─────────────────────────────────────────────────────────────────
   4. HERO CANVAS — Animated dot grid
   Draws a subtle grid of dots. Dots near the mouse glow brighter
   and shift toward cyan.
───────────────────────────────────────────────────────────────── */
function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, cols, rows, dots;
  let mouseX = -9999, mouseY = -9999;
  let animId;
  const SPACING  = 36;    // px between dots
  const DOT_R    = 1.2;   // base dot radius
  const INFLUENCE = 180;  // mouse glow radius

  // Skip heavy canvas on reduced-motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    canvas.style.display = 'none';
    return;
  }

  function buildGrid() {
    cols = Math.ceil(W / SPACING) + 1;
    rows = Math.ceil(H / SPACING) + 1;
    dots = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        dots.push({
          x:       c * SPACING,
          y:       r * SPACING,
          baseAlpha: 0.12 + Math.random() * 0.08,
        });
      }
    }
  }

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    buildGrid();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    for (const dot of dots) {
      const dx   = dot.x - mouseX;
      const dy   = dot.y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const t    = Math.max(0, 1 - dist / INFLUENCE);

      // Alpha boost near mouse
      const alpha = dot.baseAlpha + t * 0.65;

      // Color: interpolate from muted white → cyan
      const r = Math.round(lerp(120, 0,   t));
      const g = Math.round(lerp(140, 212, t));
      const b = Math.round(lerp(160, 255, t));

      ctx.beginPath();
      ctx.arc(dot.x, dot.y, DOT_R + t * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
      ctx.fill();
    }

    animId = requestAnimationFrame(draw);
  }

  function lerp(a, b, t) { return a + (b - a) * t; }

  // Track mouse over the hero section
  const hero = canvas.parentElement;
  hero.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  }, { passive: true });

  hero.addEventListener('mouseleave', () => {
    mouseX = -9999;
    mouseY = -9999;
  });

  // Handle resize
  const onResize = throttle(() => {
    cancelAnimationFrame(animId);
    resize();
    draw();
  }, 200);

  window.addEventListener('resize', onResize, { passive: true });

  resize();
  draw();
}

/* ─────────────────────────────────────────────────────────────────
   5. SCROLL ANIMATIONS (Intersection Observer)
   Elements with [data-animate] get .is-visible when they
   enter the viewport.
───────────────────────────────────────────────────────────────── */
function initScrollAnimations() {
  const targets = document.querySelectorAll('[data-animate]');
  if (!targets.length) return;

  // Skip on reduced motion — CSS handles fallback
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    targets.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target); // animate once
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px',
  });

  targets.forEach(el => observer.observe(el));
}

/* ─────────────────────────────────────────────────────────────────
   6. SMOOTH ANCHOR SCROLL
   Overrides default jump-scroll for same-page links to provide
   smooth, offset-corrected scrolling.
───────────────────────────────────────────────────────────────── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href').slice(1);
      const target   = document.getElementById(targetId);
      if (!target) return;

      e.preventDefault();
      const navHeight = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--nav-height')
      ) || 72;

      const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top, behavior: 'smooth' });

      // Update URL without jump
      history.pushState(null, '', `#${targetId}`);
    });
  });
}

/* ─────────────────────────────────────────────────────────────────
   6. CONTACT FORM — AJAX submission via Formsubmit.co
   No account needed. First submission sends a verification email
   to info@binarytsolutions.com — click confirm once, then all
   future submissions go straight to your inbox automatically.
───────────────────────────────────────────────────────────────── */
function initContactForm() {
  const form      = document.getElementById('contactForm');
  const btn       = document.getElementById('formSubmitBtn');
  const success   = document.getElementById('formSuccess');
  const error     = document.getElementById('formError');
  if (!form || !btn) return;

  const icon    = btn.querySelector('.form-submit__icon');
  const spinner = btn.querySelector('.form-submit__spinner');
  const label   = btn.querySelector('.form-submit__label');

  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    // Basic client-side validation
    const name  = form.querySelector('#name');
    const email = form.querySelector('#email');
    if (!name.value.trim() || !email.value.trim()) {
      name.value.trim()  || name.focus();
      email.value.trim() || email.focus();
      return;
    }

    // Honeypot check — if filled by a bot, silently bail
    const honey = form.querySelector('[name="_honey"]');
    if (honey && honey.value) return;

    // Loading state
    btn.disabled    = true;
    icon.style.display    = 'none';
    spinner.style.display = 'block';
    label.textContent     = 'Sending…';
    if (error) error.hidden = true;

    // Build payload
    const data = {
      name:     form.querySelector('#name').value.trim(),
      email:    form.querySelector('#email').value.trim(),
      business: form.querySelector('#business').value.trim(),
      phone:    form.querySelector('#phone').value.trim(),
      service:  form.querySelector('#service').value,
      message:  form.querySelector('#message').value.trim(),
    };

    try {
      const res = await fetch('https://formsubmit.co/ajax/info@binarytsolutions.com', {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept':       'application/json',
        },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        // Hide form, show success message
        form.hidden    = true;
        success.hidden = false;
        success.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        throw new Error('Submission failed');
      }

    } catch (_) {
      // Show inline error, reset button
      if (error) error.hidden = false;
      btn.disabled          = false;
      icon.style.display    = 'block';
      spinner.style.display = 'none';
      label.textContent     = 'Send Message';
    }
  });
}

/* ─────────────────────────────────────────────────────────────────
   INIT — run everything on DOMContentLoaded
───────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initHamburger();
  initCursor();
  initHeroCanvas();
  initScrollAnimations();
  initSmoothScroll();
  initContactForm();
});
