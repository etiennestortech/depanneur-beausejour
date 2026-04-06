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

function initStatCounters(gsap) {
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

function initAboutStatementScrub(gsap) {
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

function initInnerHeroIntro() {
  const card = document.querySelector('.inner-hero-card');
  if (!card || !window.gsap) return null;
  // Skip if homepage hero exists (it has its own intro)
  if (document.querySelector('[data-hero-intro]')) return null;

  const gsap = window.gsap;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null;

  const bg = card.querySelector('.inner-hero-bg');
  const content = card.querySelector('.inner-hero-content');
  const eyebrow = content?.querySelector('.eyebrow');
  const title = content?.querySelector('.inner-hero-title');
  const desc = content?.querySelector('.inner-hero-desc');

  const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

  // 1. Image zoom settles (1.08 → 1)
  if (bg) {
    gsap.set(bg, { scale: 1.08 });
    tl.to(bg, { scale: 1, duration: 1.6, ease: 'power2.out' });
  }

  // 2. Eyebrow fades in
  if (eyebrow) {
    gsap.set(eyebrow, { y: 12, autoAlpha: 0 });
    tl.to(eyebrow, { y: 0, autoAlpha: 1, duration: 0.5 }, 0.3);
  }

  // 3. Title words stagger in
  if (title) {
    splitRevealText(title);
    const words = title.querySelectorAll('.reveal-word-inner');
    if (words.length) {
      gsap.set(words, { yPercent: 110, opacity: 0 });
      tl.to(words, { yPercent: 0, opacity: 1, duration: 0.7, stagger: 0.04 }, 0.5);
    }
  }

  // 4. Description fades in
  if (desc) {
    gsap.set(desc, { y: 16, autoAlpha: 0 });
    tl.to(desc, { y: 0, autoAlpha: 1, duration: 0.6 }, 0.9);
  }

  // After intro, set up parallax on scroll
  tl.call(() => {
    if (bg && window.ScrollTrigger) {
      gsap.to(bg, {
        yPercent: 8,
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

  return tl;
}

function initAboutHeroIntro() {
  const heroCopy = document.querySelector('.about-hero-copy');
  if (!heroCopy || !window.gsap) return null;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null;

  const gsap = window.gsap;
  const title = heroCopy.querySelector('[data-reveal-text]');
  const descs = heroCopy.querySelectorAll('.page-description');
  const ribbon = document.querySelector('.about-hero-ribbon');

  const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

  // 1. Title words stagger in
  if (title) {
    splitRevealText(title);
    const words = title.querySelectorAll('.reveal-word-inner');
    if (words.length) {
      gsap.set(words, { yPercent: 110, opacity: 0 });
      tl.to(words, { yPercent: 0, opacity: 1, duration: 0.8, stagger: 0.03 }, 0);
    }
  }

  // 2. Description paragraphs fade in
  if (descs.length) {
    gsap.set(descs, { y: 16, autoAlpha: 0 });
    tl.to(descs, { y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.15 }, 0.6);
  }

  // 3. Ribbon slides up and fades in
  if (ribbon) {
    gsap.set(ribbon, { y: 40, autoAlpha: 0 });
    tl.to(ribbon, { y: 0, autoAlpha: 1, duration: 0.9 }, 1.0);
  }

  return tl;
}

function initSimpleHeroIntro() {
  const hero = document.querySelector('.simple-hero');
  if (!hero || !window.gsap) return null;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null;

  const gsap = window.gsap;
  const eyebrow = hero.querySelector('.eyebrow');
  const title = hero.querySelector('[data-reveal-text]');
  const desc = hero.querySelector('.simple-hero-desc');

  const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

  // 1. Eyebrow fades in
  if (eyebrow) {
    gsap.set(eyebrow, { y: 10, autoAlpha: 0 });
    tl.to(eyebrow, { y: 0, autoAlpha: 1, duration: 0.5 }, 0);
  }

  // 2. Title words stagger in
  if (title) {
    splitRevealText(title);
    const words = title.querySelectorAll('.reveal-word-inner');
    if (words.length) {
      gsap.set(words, { yPercent: 110, opacity: 0 });
      tl.to(words, { yPercent: 0, opacity: 1, duration: 0.7, stagger: 0.03 }, eyebrow ? 0.2 : 0);
    }
  }

  // 3. Description fades in
  if (desc) {
    gsap.set(desc, { y: 12, autoAlpha: 0 });
    tl.to(desc, { y: 0, autoAlpha: 1, duration: 0.5 }, 0.7);
  }

  return tl;
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
  }

  document.querySelectorAll('[data-reveal-text]').forEach((element) => {
    // Skip hero titles — already animated by initHeroIntro / initInnerHeroIntro / initAboutHeroIntro / initSimpleHeroIntro
    if (element.closest('[data-hero-intro]') || element.closest('.hero-v2-card') || element.closest('.inner-hero-card') || element.closest('.about-hero-copy') || element.closest('.simple-hero')) return;

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
        start: 'clamp(top 88%)',
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

  // Mosaic image clip-reveal
  const mosaicImages = [
    { selector: '.intro-mosaic-aerial', clipFrom: 'inset(0 100% 0 0)', clipTo: 'inset(0 0% 0 0)' },
    { selector: '.intro-mosaic-erick',  clipFrom: 'inset(100% 0 0 0)', clipTo: 'inset(0% 0 0 0)' },
    { selector: '.intro-mosaic-shell',  clipFrom: 'inset(0 0 100% 0)', clipTo: 'inset(0 0 0% 0)' },
  ];

  mosaicImages.forEach(({ selector, clipFrom, clipTo }) => {
    const wrapper = document.querySelector(selector);
    if (!wrapper) return;
    const img = wrapper.querySelector('img');

    gsap.set(img, { clipPath: clipFrom, scale: 1.15 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: wrapper,
        start: 'top 85%',
        once: true,
      },
    });

    tl.to(img, {
      clipPath: clipTo,
      duration: 1.8,
      ease: 'power3.inOut',
    });
    tl.to(img, {
      scale: 1,
      duration: 2.2,
      ease: 'power2.out',
    }, 0);
  });

  // Generic image reveal (top-to-bottom clip, staggered)
  const revealImages = document.querySelectorAll('[data-reveal-image]');
  revealImages.forEach((wrapper) => {
    const img = wrapper.querySelector('img');
    if (!img) return;
    gsap.set(img, { clipPath: 'inset(0 0 100% 0)', scale: 1.15 });
  });

  ScrollTrigger.batch('[data-reveal-image]', {
    start: 'top 85%',
    once: true,
    onEnter: (batch) => {
      batch.forEach((wrapper, i) => {
        const img = wrapper.querySelector('img');
        const delay = i * 0.15;

        gsap.to(img, {
          clipPath: 'inset(0 0 0% 0)',
          duration: 1.8,
          ease: 'power3.inOut',
          delay,
        });
        gsap.to(img, {
          scale: 1,
          duration: 2.2,
          ease: 'power2.out',
          delay,
        });
      });
    },
  });

  // Split icon — U-shape and half-circle scrub together
  const iconSplit = document.querySelector('[data-icon-split]');
  if (iconSplit) {
    const top = iconSplit.querySelector('[data-icon-top]');
    const bottom = iconSplit.querySelector('[data-icon-bottom]');

    gsap.set(top, { yPercent: -40 });
    gsap.set(bottom, { yPercent: 60 });

    const iconTl = gsap.timeline({
      scrollTrigger: {
        trigger: iconSplit,
        start: 'top 80%',
        end: 'top 40%',
        scrub: 1,
      },
    });

    iconTl.to(top, { yPercent: 0, ease: 'none' }, 0);
    iconTl.to(bottom, { yPercent: 0, ease: 'none' }, 0);
  }

  initStatCounters(gsap);
  initAboutTimelineProgress(gsap, ScrollTrigger);
  initAboutStatementScrub(gsap);

  // Content fade-ups (subtitles, eyebrows, section CTAs)
  // Skip elements inside hero cards — already animated by hero intros
  const fadeUpEls = Array.from(document.querySelectorAll(
    'main .section-subtitle, main .eyebrow'
  )).filter((el) => !el.closest('.inner-hero-card') && !el.closest('.hero-v2-card') && !el.closest('[data-hero-intro]') && !el.closest('.about-hero-copy') && !el.closest('.simple-hero'));

  if (fadeUpEls.length) {
    gsap.set(fadeUpEls, { y: 16, autoAlpha: 0 });
    ScrollTrigger.batch(fadeUpEls, {
      start: 'clamp(top 90%)',
      once: true,
      onEnter: (batch) => {
        gsap.to(batch, { y: 0, autoAlpha: 1, duration: 0.6, ease: 'power2.out', stagger: 0.06, overwrite: true });
      },
    });
  }

  // Card stagger entrances
  [document.querySelectorAll('.carwash-card'), document.querySelectorAll('[data-stagger-cards] > *')].forEach((nodeList) => {
    const cards = Array.from(nodeList);
    if (cards.length === 0) return;
    gsap.set(cards, { y: 24, autoAlpha: 0 });
    ScrollTrigger.batch(cards, {
      start: 'clamp(top 85%)',
      once: true,
      onEnter: (batch) => {
        gsap.to(batch, { y: 0, autoAlpha: 1, duration: 0.55, ease: 'power2.out', stagger: 0.1, overwrite: true });
      },
    });
  });

  // Store slider entrance
  const sliderRoot = document.querySelector('[data-slider-root]');
  if (sliderRoot) {
    gsap.set(sliderRoot, { y: 30, autoAlpha: 0 });
    gsap.to(sliderRoot, { y: 0, autoAlpha: 1, duration: 0.7, ease: 'power2.out', scrollTrigger: { trigger: sliderRoot, start: 'top 85%', once: true } });
  }

  // Footer logo entrance
  const footerLogo = document.querySelector('.footer-inner img[src*="logo-large"]');
  if (footerLogo) {
    gsap.set(footerLogo, { y: 20, autoAlpha: 0 });
    gsap.to(footerLogo, { y: 0, autoAlpha: 1, duration: 0.7, ease: 'power2.out', scrollTrigger: { trigger: footerLogo, start: 'top 92%', once: true } });
  }

  ScrollTrigger.refresh();
}

function initNavbarScroll() {
  const header = document.querySelector('header');
  if (!header) return;

  // Pull mobile menu out before wrapping so it stays outside the card
  const mobileMenu = header.querySelector('.site-mobile-menu');

  const inner = document.createElement('div');
  while (header.firstChild) inner.appendChild(header.firstChild);

  const headerStyles = getComputedStyle(header);
  inner.style.padding = headerStyles.padding;
  inner.style.backgroundColor = 'var(--color-surface-card)';
  inner.style.borderRadius = 'var(--radius-card-lg)';
  inner.style.transition = 'box-shadow 0.3s ease, border-color 0.3s ease';
  inner.style.border = '1px solid transparent';

  header.style.position = 'sticky';
  header.style.top = '0';
  header.style.zIndex = '50';
  header.style.padding = '0';
  header.style.paddingInline = 'calc(var(--layout-gutter-outer) + 0.5rem)';
  header.style.paddingBlock = 'var(--space-section-gap)';
  header.style.backgroundColor = 'transparent';

  header.appendChild(inner);

  // Move mobile menu outside the inner card, below it in the header
  if (mobileMenu) {
    inner.removeChild(mobileMenu);
    header.appendChild(mobileMenu);
  }

  // Logo crossfade: full wordmark → icon mark on scroll
  const logoFull = header.querySelector('[data-nav-logo-full]');
  const logoIcon = header.querySelector('[data-nav-logo-icon]');
  let logoState = 'full';

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY > 10;

    inner.style.borderColor = scrolled ? 'rgba(0, 0, 0, 0.06)' : 'transparent';
    inner.style.boxShadow = scrolled ? '0 1px 4px rgba(0, 0, 0, 0.04)' : 'none';

    if (logoFull && logoIcon) {
      const shouldSwap = window.scrollY > 80;
      if (shouldSwap && logoState === 'full') {
        logoState = 'icon';
        logoFull.style.transition = 'opacity 0.3s ease, visibility 0.3s ease';
        logoIcon.style.transition = 'opacity 0.3s ease, visibility 0.3s ease';
        logoFull.style.opacity = '0';
        logoFull.style.visibility = 'hidden';
        logoIcon.style.opacity = '1';
        logoIcon.style.visibility = 'visible';
      } else if (!shouldSwap && logoState === 'icon') {
        logoState = 'full';
        logoFull.style.transition = 'opacity 0.3s ease, visibility 0.3s ease';
        logoIcon.style.transition = 'opacity 0.3s ease, visibility 0.3s ease';
        logoFull.style.opacity = '1';
        logoFull.style.visibility = 'visible';
        logoIcon.style.opacity = '0';
        logoIcon.style.visibility = 'hidden';
      }
    }
  }, { passive: true });
}

updateHeaderHeight();
window.addEventListener('resize', debounce(updateHeaderHeight));

const lenis = initLenis();

// Drive Lenis immediately via GSAP ticker so scroll works during hero animations.
// ScrollTrigger.update is wired later inside initRevealAnimations once ST is registered.
if (lenis && window.gsap) {
  window.gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  window.gsap.ticker.lagSmoothing(0);
}

initMobileMenu();
initNavDropdowns();
initSliders();
initStoreMap();
initButtonEffects();
const heroTitle = document.querySelector('[data-hero-intro] [data-reveal-text]');
if (heroTitle) splitRevealText(heroTitle);
initHeroIntro();
const innerHeroTl = initInnerHeroIntro();
const aboutHeroTl = initAboutHeroIntro();
const simpleHeroTl = initSimpleHeroIntro();
const pageHeroTl = innerHeroTl || aboutHeroTl || simpleHeroTl;

// Hide scroll-animated elements immediately so they don't flash.
// ScrollTriggers are created after the hero intro finishes.
if (pageHeroTl && window.gsap) {
  const gsapRef = window.gsap;

  // Immediately hide everything that will animate on scroll
  // (skip elements already owned by the hero intro)
  document.querySelectorAll('[data-reveal-text]').forEach((el) => {
    if (el.closest('.inner-hero-card') || el.closest('.hero-v2-card') || el.closest('[data-hero-intro]') || el.closest('.about-hero-copy') || el.closest('.simple-hero')) return;
    splitRevealText(el);
    gsapRef.set(el.querySelectorAll('.reveal-word-inner'), { yPercent: 110, opacity: 0 });
  });

  const fadeEls = Array.from(document.querySelectorAll(
    'main .section-subtitle, main .eyebrow'
  )).filter((el) => !el.closest('.inner-hero-card') && !el.closest('.hero-v2-card') && !el.closest('[data-hero-intro]') && !el.closest('.about-hero-copy') && !el.closest('.simple-hero'));
  gsapRef.set(fadeEls, { y: 16, autoAlpha: 0 });

  document.querySelectorAll('.carwash-card').forEach((el) => gsapRef.set(el, { y: 24, autoAlpha: 0 }));
  document.querySelectorAll('[data-stagger-cards] > *').forEach((el) => gsapRef.set(el, { y: 24, autoAlpha: 0 }));

  // After hero finishes, create the ScrollTriggers
  pageHeroTl.call(() => {
    initRevealAnimations(lenis);
  });
} else {
  initRevealAnimations(lenis);
}

initNavbarScroll();
// Re-measure after navbar scroll adds padding to the header element
updateHeaderHeight();
