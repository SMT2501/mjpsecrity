/* =============================================
   MJP SECURITY — JAVASCRIPT
   ============================================= */

'use strict';

// ---- NAVBAR: scroll behaviour ----
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}, { passive: true });

if (window.scrollY > 50) navbar.classList.add('scrolled');

// ---- HAMBURGER / MOBILE MENU ----
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
const mobileLinks = document.querySelectorAll('.mobile-link');

hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
});

mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
    });
});

// Close mobile menu on outside click
document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target)) {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
    }
});

// ---- SMOOTH SCROLL for in-page anchors ----
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            e.preventDefault();
            const navHeight = parseInt(
                getComputedStyle(document.documentElement)
                    .getPropertyValue('--nav-height') || '80'
            );
            const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    });
});

// ---- FADE-IN on scroll (Intersection Observer) ----
const fadeEls = document.querySelectorAll(
    '.service-card, .about-block, .stat-card, .contact-info, .contact-form-wrap, ' +
    '.why-us-text, .stats-grid, .about-image-inner, .sidebar-card'
);

fadeEls.forEach(el => el.classList.add('fade-in'));

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
});

fadeEls.forEach(el => observer.observe(el));

// Stagger service cards
document.querySelectorAll('.service-card').forEach((card, i) => {
    card.style.transitionDelay = `${i * 80}ms`;
});

// Stagger stat cards
document.querySelectorAll('.stat-card').forEach((card, i) => {
    card.style.transitionDelay = `${i * 100}ms`;
});

// ---- CONTACT FORM ----
const callbackForm = document.getElementById('callbackForm');
const formSuccess  = document.getElementById('formSuccess');
const formError    = document.getElementById('formError');

if (callbackForm) {
    callbackForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        formError && formError.classList.remove('visible');

        const inputs = callbackForm.querySelectorAll('input[required], textarea[required]');
        let valid = true;

        inputs.forEach(input => {
            input.style.borderColor = '';
            if (!input.value.trim()) {
                input.style.borderColor = '#e74c3c';
                valid = false;
            }
        });

        // Basic email validation
        const emailInput = callbackForm.querySelector('input[type="email"]');
        if (emailInput && emailInput.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)) {
            emailInput.style.borderColor = '#e74c3c';
            valid = false;
        }

        if (!valid) return;

        const submitBtn = callbackForm.querySelector('.submit-btn');
        const originalBtnHTML = submitBtn.innerHTML;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        const formData = new FormData(callbackForm);
        const payload = Object.fromEntries(formData.entries());

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error('Request failed');

            callbackForm.reset();
            submitBtn.style.display = 'none';
            formSuccess.classList.add('visible');

            setTimeout(() => {
                formSuccess.classList.remove('visible');
                submitBtn.style.display = '';
                submitBtn.innerHTML = originalBtnHTML;
                submitBtn.disabled = false;
            }, 7000);
        } catch (err) {
            formError && formError.classList.add('visible');
            submitBtn.innerHTML = originalBtnHTML;
            submitBtn.disabled = false;
        }
    });

    // Clear error highlight on input
    callbackForm.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('input', () => {
            input.style.borderColor = '';
        });
    });
}

// ---- NUMBER COUNTER ANIMATION for stats ----
function animateCounter(el, target, suffix = '') {
    let current = 0;
    const duration = 1500;
    const step = target / (duration / 16);

    const timer = setInterval(() => {
        current += step;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        el.textContent = Math.floor(current) + suffix;
    }, 16);
}

const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const el = entry.target;
            const text = el.textContent.trim();

            if (text === '24/7' || text === 'CPT') {
                // Static — no animation needed
            } else if (text.endsWith('%')) {
                animateCounter(el, parseInt(text), '%');
            } else if (text.endsWith('+')) {
                animateCounter(el, parseInt(text), '+');
            }

            statObserver.unobserve(el);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-num').forEach(el => statObserver.observe(el));
