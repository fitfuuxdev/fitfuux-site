(() => {
  'use strict';

  const header = document.querySelector('[data-header]');
  const burger = document.querySelector('.burger');
  const nav = document.getElementById('site-nav');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const preloader = document.querySelector('[data-preloader]');

  if (preloader && document.documentElement.classList.contains('preloader-active')) {
    const compact = window.matchMedia('(max-width: 700px)').matches;
    const minShow = compact ? 1000 : 1300;
    const revealTime = compact ? 520 : 600;
    const started = window.__preStart || performance.now();
    const wait = Math.max(0, minShow - (performance.now() - started));

    window.setTimeout(() => {
      document.documentElement.classList.add('preloader-reveal');
      preloader.classList.add('is-opening');
      window.setTimeout(() => {
        document.documentElement.classList.remove('preloader-active', 'preloader-play', 'preloader-reveal');
        preloader.classList.add('is-done');
        window.setTimeout(() => preloader.remove(), 80);
      }, revealTime);
    }, wait);
  }

  const parallaxImages = Array.from(document.querySelectorAll('.hero-media img, .page-hero__bg img, .case-hero__bg img, .cta-band__bg img'));
  const textParallaxItems = Array.from(document.querySelectorAll('[data-text-parallax]'));
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const updateParallax = () => {
    if (reduced || window.innerWidth < 720 || !parallaxImages.length) return;
    parallaxImages.forEach((img) => {
      const section = img.closest('.hero, .page-hero, .case-hero, .cta-band');
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const limit = Math.min(28, rect.height * 0.035);
      const y = clamp((window.innerHeight / 2 - center) * 0.22, -limit, limit);
      const scale = 1.1 + Math.min(.025, Math.abs(y) / 900);
      img.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0) scale(${scale.toFixed(3)})`;
    });
  };

  const updateTextParallax = () => {
    if (!textParallaxItems.length) return;
    if (reduced || window.innerWidth < 900) {
      textParallaxItems.forEach((el) => { el.style.transform = ''; });
      return;
    }
    textParallaxItems.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const y = clamp((window.innerHeight / 2 - center) * 0.05, -16, 16);
      el.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;
    });
  };

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      if (header) header.classList.toggle('is-scrolled', window.scrollY > 18);
      updateParallax();
      updateTextParallax();
      ticking = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', updateTextParallax, { passive: true });
  onScroll();

  if (burger && nav) {
    const links = nav.querySelectorAll('a');
    const setOpen = (open) => {
      burger.classList.toggle('is-open', open);
      nav.classList.toggle('is-open', open);
      document.body.classList.toggle('menu-open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
      if (open) {
        const first = nav.querySelector('.nav-link');
        if (first) first.focus({ preventScroll: true });
      }
    };

    burger.addEventListener('click', () => {
      setOpen(!nav.classList.contains('is-open'));
    });

    links.forEach((link) => link.addEventListener('click', () => setOpen(false)));

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) {
        setOpen(false);
        burger.focus();
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 980 && nav.classList.contains('is-open')) setOpen(false);
    }, { passive: true });
  }

  const toTop = document.querySelector('[data-to-top]');
  if (toTop) {
    toTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    });
  }

  const counters = Array.from(document.querySelectorAll('[data-count]'));
  if (counters.length && !reduced && 'IntersectionObserver' in window) {
    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        if (!Number.isFinite(target)) return;
        const start = performance.now();
        const duration = 900;
        const tick = (now) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 3);
          el.textContent = String(Math.round(target * eased));
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        countObserver.unobserve(el);
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => countObserver.observe(el));
  }

  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  if (reduced || !('IntersectionObserver' in window)) {
    reveals.forEach((el) => el.classList.add('is-in'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  reveals.forEach((el) => io.observe(el));
})();
