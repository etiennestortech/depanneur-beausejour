function updateHeaderHeight() {
  const header = document.querySelector('header');

  if (!header) {
    return;
  }

  document.documentElement.style.setProperty('--header-h', `${header.offsetHeight}px`);
}

function initLenis() {
  if (!window.Lenis) {
    return;
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    return;
  }

  const lenis = new window.Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);
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

updateHeaderHeight();
window.addEventListener('resize', updateHeaderHeight);

initLenis();
initMobileMenu();
initNavDropdowns();
initSliders();
