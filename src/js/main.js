function updateHeaderHeight() {
  const header = document.querySelector('header');

  if (!header) {
    return;
  }

  document.documentElement.style.setProperty('--header-h', `${header.offsetHeight}px`);
}

function initLenis() {
  if (!window.Lenis) {
    return null;
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    return;
  }

  const lenis = new window.Lenis({
    duration: 0.9,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });

  return lenis;
}

function initMobileMenu() {
  const toggle = document.querySelector('.site-mobile-toggle');
  const menu = document.getElementById('mobile-menu');

  if (!toggle || !menu) {
    return;
  }

  toggle.addEventListener('click', () => {
    const open = menu.hidden;
    menu.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !menu.hidden) {
      menu.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
      toggle.focus();
    }
  });
}

function initNavDropdowns() {
  document.querySelectorAll('[data-nav-dropdown]').forEach((dropdown) => {
    const trigger = dropdown.querySelector('.nav-dropdown-trigger');

    if (!trigger) {
      return;
    }

    function open() {
      dropdown.setAttribute('data-open', '');
      trigger.setAttribute('aria-expanded', 'true');
    }

    function close() {
      dropdown.removeAttribute('data-open');
      trigger.setAttribute('aria-expanded', 'false');
    }

    function toggle() {
      if (dropdown.hasAttribute('data-open')) {
        close();
        return;
      }

      open();
    }

    trigger.addEventListener('click', toggle);
    dropdown.addEventListener('mouseenter', open);
    dropdown.addEventListener('mouseleave', close);

    dropdown.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        close();
        trigger.focus();
      }
    });

    document.addEventListener('click', (event) => {
      if (!dropdown.contains(event.target)) {
        close();
      }
    });
  });
}

function initSlider(root) {
  const slider = root.querySelector('[data-slider]');
  const dots = root.querySelector('[data-slider-dots]');
  const buttons = root.querySelectorAll('[data-slider-dir]');
  const items = Array.from(root.querySelectorAll('[data-slider-item]'));

  if (!slider || !dots || items.length === 0) {
    return;
  }

  dots.replaceChildren();

  const dotButtons = items.map((item, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'slider-dot';
    button.setAttribute('aria-label', `Aller au magasin ${index + 1}`);
    button.addEventListener('click', () => {
      slider.scrollTo({ left: item.offsetLeft, behavior: 'smooth' });
    });
    dots.append(button);
    return button;
  });

  function getActiveIndex() {
    let activeIndex = 0;
    let smallestDistance = Number.POSITIVE_INFINITY;

    items.forEach((item, index) => {
      const distance = Math.abs(slider.scrollLeft - item.offsetLeft);

      if (distance < smallestDistance) {
        smallestDistance = distance;
        activeIndex = index;
      }
    });

    return activeIndex;
  }

  function updateDots() {
    const activeIndex = getActiveIndex();

    dotButtons.forEach((button, index) => {
      const isActive = index === activeIndex;
      button.classList.toggle('slider-dot--active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });
  }

  function getScrollStep() {
    if (items.length < 2) {
      return items[0].getBoundingClientRect().width;
    }

    return items[1].offsetLeft - items[0].offsetLeft;
  }

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const direction = button.dataset.sliderDir === 'next' ? 1 : -1;

      slider.scrollBy({
        left: direction * getScrollStep(),
        behavior: 'smooth',
      });
    });
  });

  slider.addEventListener('scroll', updateDots, { passive: true });
  window.addEventListener('resize', updateDots);
  updateDots();
}

function initSliders() {
  document.querySelectorAll('[data-slider-root]').forEach(initSlider);
}

function createButtonLabelMarkup(text) {
  const container = document.createElement('span');
  container.className = 'button-label-stack';
  container.dataset.label = text;

  const label = document.createElement('span');
  label.className = 'button-label';
  label.textContent = text;

  container.append(label);

  return container;
}

function enhanceButtonLabel(button, host) {
  if (!host || button.dataset.buttonReady === 'true') {
    return;
  }

  const text = host.textContent.trim().replace(/\s+/g, ' ');

  if (!text) {
    return;
  }

  host.textContent = '';
  host.append(createButtonLabelMarkup(text));
  button.dataset.buttonReady = 'true';
}

function initButtonEffects() {
  document.querySelectorAll('.btn-primary, .btn-secondary, .btn-neutral').forEach((button) => {
    enhanceButtonLabel(button, button);
  });

  document.querySelectorAll('.hero-v2-cta').forEach((button) => {
    const labelHost = button.querySelector('span:not(.hero-v2-cta-icon)');
    enhanceButtonLabel(button, labelHost);
  });
}

function splitRevealText(element) {
  if (element.dataset.revealReady === 'true') {
    return;
  }

  const text = element.textContent.trim().replace(/\s+/g, ' ');

  if (!text) {
    return;
  }

  element.setAttribute('aria-label', text);
  element.textContent = '';

  text.split(' ').forEach((word, index, words) => {
    const outer = document.createElement('span');
    outer.className = 'reveal-word';

    const inner = document.createElement('span');
    inner.className = 'reveal-word-inner';
    inner.textContent = word;

    outer.append(inner);
    element.append(outer);

    if (index < words.length - 1) {
      element.append(document.createTextNode(' '));
    }
  });

  element.dataset.revealReady = 'true';
}

function formatCounterValue(value) {
  return new Intl.NumberFormat('fr-CA', {
    maximumFractionDigits: 0,
  }).format(value).replace(/[\u202F\u00A0]/g, ' ');
}

function initStatCounters(gsap, ScrollTrigger) {
  document.querySelectorAll('[data-stats-group]').forEach((group) => {
    const counters = Array.from(group.querySelectorAll('[data-counter-target]'));

    if (counters.length === 0) {
      return;
    }

    const timeline = gsap.timeline({
      defaults: {
        ease: 'power2.out',
      },
      scrollTrigger: {
        trigger: group,
        start: 'top 85%',
        once: true,
      },
    });

    timeline.from(group.children, {
      y: 18,
      opacity: 0,
      duration: 0.55,
      stagger: 0.08,
    });

    counters.forEach((counter, index) => {
      const target = Number(counter.dataset.counterTarget);

      if (!Number.isFinite(target)) {
        return;
      }

      const state = { value: 0 };

      timeline.fromTo(state, {
        value: 0,
      }, {
        value: target,
        duration: 1.15,
        ease: 'power2.out',
        onStart: () => {
          counter.textContent = '0';
        },
        onUpdate: () => {
          counter.textContent = formatCounterValue(Math.round(state.value));
        },
      }, index * 0.08);
    });
  });
}

function initRevealAnimations(lenis) {
  if (!window.gsap || !window.ScrollTrigger) {
    return;
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;

  gsap.registerPlugin(ScrollTrigger);

  if (lenis && typeof lenis.on === 'function') {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  }

  document.querySelectorAll('[data-reveal-text]').forEach((element) => {
    splitRevealText(element);

    const words = element.querySelectorAll('.reveal-word-inner');

    gsap.set(words, { yPercent: 110, opacity: 0 });

    gsap.to(words, {
      yPercent: 0,
      opacity: 1,
      duration: 0.8,
      ease: 'power2.out',
      stagger: 0.03,
      scrollTrigger: {
        trigger: element,
        start: 'top 88%',
        once: true,
      },
    });
  });

  document.querySelectorAll('[data-parallax]').forEach((element) => {
    const trigger = element.closest('[data-parallax-container]') || element;

    gsap.fromTo(element, {
      yPercent: -3,
      scale: 1.02,
    }, {
      yPercent: 3,
      scale: 1.05,
      ease: 'none',
      scrollTrigger: {
        trigger,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });
  });

  initStatCounters(gsap, ScrollTrigger);

  ScrollTrigger.refresh();
}

updateHeaderHeight();
window.addEventListener('resize', updateHeaderHeight);

const lenis = initLenis();
initMobileMenu();
initNavDropdowns();
initSliders();
initButtonEffects();
initRevealAnimations(lenis);
