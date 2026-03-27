function debounce(fn, ms = 100) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

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
    return null;
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
  window.addEventListener('resize', debounce(updateDots));
  updateDots();
}

function initSliders() {
  document.querySelectorAll('[data-slider-root]').forEach(initSlider);
}

function initStoreMap() {
  const mapElement = document.querySelector('[data-store-map]');

  if (!mapElement || !window.mapboxgl) {
    return;
  }

  const root = mapElement.closest('[data-store-map-root]') ?? mapElement.parentElement;
  const dataElement = root?.querySelector('[data-store-map-data]');
  const cardElements = Array.from(root?.querySelectorAll('[data-store-map-item]') ?? []);
  const token = mapElement.dataset.mapboxToken;

  if (!dataElement || !token) {
    return;
  }

  let locations;

  try {
    locations = JSON.parse(dataElement.textContent);
  } catch (error) {
    console.error('Unable to parse store map data.', error);
    return;
  }

  if (!Array.isArray(locations) || locations.length === 0) {
    return;
  }

  window.mapboxgl.accessToken = token;

  const map = new window.mapboxgl.Map({
    container: mapElement,
    style: 'mapbox://styles/mapbox/light-v11',
    center: [locations[0].lng, locations[0].lat],
    zoom: 8.2,
    attributionControl: false,
  });

  map.addControl(new window.mapboxgl.NavigationControl({ showCompass: false }), 'top-right');
  map.scrollZoom.disable();

  const bounds = new window.mapboxgl.LngLatBounds();
  const storeViews = new Map();

  const resizeMap = () => {
    map.resize();
  };

  const setActiveStore = (storeId) => {
    cardElements.forEach((card) => {
      card.classList.toggle('is-active', card.dataset.storeId === storeId);
    });

    storeViews.forEach(({ markerElement }, id) => {
      markerElement.classList.toggle('is-active', id === storeId);
    });
  };

  const focusStore = (storeId, { openPopup = true, flyTo = true } = {}) => {
    const storeView = storeViews.get(storeId);

    if (!storeView) {
      return;
    }

    setActiveStore(storeId);

    if (flyTo) {
      map.flyTo({
        center: [storeView.location.lng, storeView.location.lat],
        zoom: Math.max(map.getZoom(), 10.4),
        speed: 0.9,
        curve: 1.15,
        essential: true,
      });
    }

    if (openPopup) {
      storeViews.forEach(({ popup }, id) => {
        if (id !== storeId) {
          popup.remove();
        }
      });

      if (!storeView.popup.isOpen()) {
        storeView.marker.togglePopup();
      }
    }
  };

  locations.forEach((location) => {
    if (!Number.isFinite(location.lng) || !Number.isFinite(location.lat)) {
      return;
    }

    const marker = document.createElement('button');
    marker.type = 'button';
    marker.className = 'store-map-marker';
    marker.setAttribute('aria-label', location.name);

    const popupMarkup = `
      <div class="store-map-popup-content">
        <p class="store-map-popup-title">${location.name}</p>
        <p class="store-map-popup-copy">${location.address}</p>
        <p class="store-map-popup-copy">${location.hours}</p>
      </div>
    `;

    const popup = new window.mapboxgl.Popup({
      offset: 18,
      closeButton: false,
      className: 'store-map-popup',
    }).setHTML(popupMarkup);

    const markerInstance = new window.mapboxgl.Marker({ element: marker })
      .setLngLat([location.lng, location.lat])
      .setPopup(popup)
      .addTo(map);

    storeViews.set(location.id ?? location.name, {
      location,
      marker: markerInstance,
      markerElement: marker,
      popup,
    });

    marker.addEventListener('click', () => {
      setActiveStore(location.id ?? location.name);
    });

    bounds.extend([location.lng, location.lat]);
  });

  cardElements.forEach((card) => {
    const storeId = card.dataset.storeId;

    if (!storeId) {
      return;
    }

    card.addEventListener('click', () => {
      focusStore(storeId);
    });

    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        focusStore(storeId);
      }
    });

    card.addEventListener('mouseenter', () => {
      setActiveStore(storeId);
    });

    card.addEventListener('focus', () => {
      setActiveStore(storeId);
    });
  });

  if (!bounds.isEmpty()) {
    map.on('load', () => {
      resizeMap();
      map.fitBounds(bounds, {
        padding: {
          top: 72,
          right: 72,
          bottom: 72,
          left: 72,
        },
        maxZoom: 9.6,
      });

      const firstLocation = locations[0];
      if (firstLocation) {
        setActiveStore(firstLocation.id ?? firstLocation.name);
      }
    });
  }

  if (root && window.ResizeObserver) {
    const resizeObserver = new ResizeObserver(() => {
      resizeMap();
    });

    resizeObserver.observe(root);
  }

  root?.querySelectorAll('img').forEach((image) => {
    if (!image.complete) {
      image.addEventListener('load', resizeMap, { once: true });
    }
  });

  window.addEventListener('load', resizeMap, { once: true });
  window.addEventListener('resize', debounce(resizeMap));
  resizeMap();
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

function splitScrubText(element) {
  if (element.dataset.scrubReady === 'true') {
    return Array.from(element.querySelectorAll('.scrub-char'));
  }

  const text = element.textContent.trim().replace(/\s+/g, ' ');

  if (!text) {
    return [];
  }

  element.setAttribute('aria-label', text);
  element.textContent = '';

  const characters = [];

  text.split(' ').forEach((word, wordIndex, words) => {
    const wordSpan = document.createElement('span');
    wordSpan.className = 'scrub-word';
    wordSpan.setAttribute('aria-hidden', 'true');

    Array.from(word).forEach((character) => {
      const span = document.createElement('span');
      span.className = 'scrub-char';
      span.textContent = character;
      wordSpan.append(span);
      characters.push(span);
    });

    element.append(wordSpan);

    if (wordIndex < words.length - 1) {
      element.append(document.createTextNode(' '));
    }
  });

  element.dataset.scrubReady = 'true';
  return characters;
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
        immediateRender: false,
        onStart: () => {
          state.value = 0;
          counter.textContent = '0';
        },
        onUpdate: () => {
          counter.textContent = formatCounterValue(Math.round(state.value));
        },
      }, index * 0.08);
    });
  });
}

function initAboutTimelineProgress(gsap, ScrollTrigger) {
  document.querySelectorAll('[data-about-timeline]').forEach((timeline) => {
    const progress = timeline.querySelector('.about-timeline-progress');
    const items = Array.from(timeline.querySelectorAll('.about-timeline-item'));

    if (!progress || items.length === 0) {
      return;
    }

    gsap.set(progress, { scaleY: 0 });

    gsap.to(progress, {
      scaleY: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: timeline,
        start: 'top 78%',
        end: 'bottom 62%',
        scrub: true,
      },
    });

    items.forEach((item) => {
      ScrollTrigger.create({
        trigger: item,
        start: 'top 72%',
        end: 'bottom 72%',
        onEnter: () => item.classList.add('is-active'),
        onEnterBack: () => item.classList.add('is-active'),
        onLeaveBack: () => item.classList.remove('is-active'),
      });
    });
  });
}

function initAboutStatementScrub(gsap, ScrollTrigger) {
  document.querySelectorAll('[data-about-statement]').forEach((panel) => {
    const copy = panel.querySelector('[data-about-statement-copy]');
    const watermark = panel.querySelector('[data-about-statement-watermark]');

    if (!copy) {
      return;
    }

    const characters = splitScrubText(copy);

    if (characters.length === 0) {
      return;
    }

    gsap.set(characters, { opacity: 0.18 });

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: panel,
        start: 'top 72%',
        end: 'bottom 38%',
        scrub: 0.8,
      },
    });

    timeline.to(characters, {
      opacity: 1,
      duration: 1,
      ease: 'none',
      stagger: {
        each: 0.018,
        from: 'start',
      },
    }, 0);

    if (watermark) {
      timeline.fromTo(watermark, {
        scale: 0.9,
        opacity: 0.04,
      }, {
        scale: 1.06,
        opacity: 0.08,
        ease: 'none',
      }, 0);
    }
  });
}

function initHeroIntro() {
  const card = document.querySelector('[data-hero-intro]');
  if (!card || !window.gsap) return;

  const gsap = window.gsap;
  const media = card.querySelector('.hero-v2-media');
  const content = card.querySelector('.hero-v2-content');
  const title = card.querySelector('.hero-v2-title');
  const bottom = card.querySelector('.hero-v2-bottom');
  const description = card.querySelector('.hero-v2-description');
  const pills = card.querySelectorAll('.hero-v2-pill');
  const line = card.querySelector('.hero-v2-line');

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    card.removeAttribute('data-hero-intro');
    return;
  }

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  // 1. Image scales down from 1.05 → 1 (settles into place)
  tl.to(media, {
    scale: 1,
    duration: 1.6,
    ease: 'power2.out',
  });

  // 2. Content container fades in
  tl.to(content, {
    opacity: 1,
    duration: 0.5,
  }, 0.4);

  // 4. Title words stagger in (reuse reveal-word-inner if split already happened)
  if (title) {
    const words = title.querySelectorAll('.reveal-word-inner');
    if (words.length) {
      gsap.set(words, { yPercent: 110, opacity: 0 });
      tl.to(words, {
        yPercent: 0,
        opacity: 1,
        duration: 0.7,
        stagger: 0.04,
        ease: 'power2.out',
      }, 0.6);
    }
  }

  // 5. Bottom row slides up
  if (bottom) {
    gsap.set(bottom, { yPercent: 30, opacity: 0 });
    tl.to(bottom, {
      yPercent: 0,
      opacity: 1,
      duration: 0.6,
    }, 1.0);
  }

  // 6. Line grows
  if (line) {
    gsap.set(line, { scaleX: 0, transformOrigin: 'left center' });
    tl.to(line, {
      scaleX: 1,
      duration: 0.8,
      ease: 'power2.inOut',
    }, 1.1);
  }

  // 7. Description fades in
  if (description) {
    gsap.set(description, { yPercent: 20, opacity: 0 });
    tl.to(description, {
      yPercent: 0,
      opacity: 1,
      duration: 0.6,
    }, 1.0);
  }

  // 8. Pills stagger in
  if (pills?.length) {
    gsap.set(pills, { yPercent: 20, opacity: 0 });
    tl.to(pills, {
      yPercent: 0,
      opacity: 1,
      duration: 0.5,
      stagger: 0.08,
    }, 1.2);
  }

  // Mark intro as complete then set up scroll parallax
  tl.call(() => {
    card.removeAttribute('data-hero-intro');

    // Parallax picks up from where intro left off (scale 1)
    if (window.ScrollTrigger) {
      gsap.to(media, {
        yPercent: 6,
        scale: 1.05,
        ease: 'none',
        scrollTrigger: {
          trigger: card,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    }
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
    // Skip hero title — already animated by initHeroIntro
    if (element.closest('[data-hero-intro]') || element.closest('.hero-v2-card')) return;

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
    // Skip hero image — its parallax is handled after the intro timeline
    if (element.closest('[data-hero-intro]') || element.closest('.hero-v2-card')) return;

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
  initAboutTimelineProgress(gsap, ScrollTrigger);
  initAboutStatementScrub(gsap, ScrollTrigger);

  ScrollTrigger.refresh();
}

updateHeaderHeight();
window.addEventListener('resize', debounce(updateHeaderHeight));

const lenis = initLenis();
initMobileMenu();
initNavDropdowns();
initSliders();
initStoreMap();
initButtonEffects();
// Split hero title text before hero intro so word spans exist
const heroTitle = document.querySelector('[data-hero-intro] [data-reveal-text]');
if (heroTitle) splitRevealText(heroTitle);
initHeroIntro();
initRevealAnimations(lenis);
