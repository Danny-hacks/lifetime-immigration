/* Lifetime Immigration — mockup interactions
   Vanilla JS, no dependencies. */
(function () {
  'use strict';

  /* Signal that JS is running. Until this lands, .reveal content stays
     visible — see the fail-safe note in style.css. */
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reducedMotion && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('js');
  }

  /* --- Mobile navigation ------------------------------------------------ */
  var toggle = document.querySelector('.nav-toggle');
  var navWrap = document.querySelector('.nav-wrap');
  var scrim = document.querySelector('.nav-scrim');

  function setNav(open) {
    toggle.setAttribute('aria-expanded', String(open));
    navWrap.classList.toggle('is-open', open);
    scrim.classList.toggle('is-open', open);
    scrim.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
  }

  if (toggle && navWrap && scrim) {
    toggle.addEventListener('click', function () {
      setNav(toggle.getAttribute('aria-expanded') !== 'true');
    });

    scrim.addEventListener('click', function () { setNav(false); });

    // Close on Escape, and return focus to the toggle
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setNav(false);
        toggle.focus();
      }
    });

    // Close after following an in-page link
    navWrap.addEventListener('click', function (e) {
      if (e.target.closest('a') && window.matchMedia('(max-width: 900px)').matches) {
        setNav(false);
      }
    });

    // Reset when resizing back up to desktop
    window.addEventListener('resize', function () {
      if (window.innerWidth > 900 && navWrap.classList.contains('is-open')) setNav(false);
    });
  }

  /* --- Analytics ---------------------------------------------------------
     Deliberately empty. The site currently makes zero third-party requests.
     When paid acquisition starts, load a consent-gated GA4 + Meta Pixel here
     and fire conversion events on enquiry submit and assessment click.
     Note: the assessment form is on a different domain, so the conversion
     happens off-site — that needs solving before ad attribution can work. */


  /* --- Continuous testimonial slider ------------------------------------ */
  var marquee = document.querySelector('[data-marquee]');
  if (marquee) {
    var track = marquee.querySelector('.marquee-track');

    // Left alone, the markup is already a scrollable row — which is what
    // reduced-motion visitors and anyone without JS get.
    if (!reducedMotion) {
      // Duplicate the cards so the loop has no visible seam. The keyframe
      // translates by exactly half the track, landing back on the original.
      Array.prototype.slice.call(track.children).forEach(function (node) {
        var clone = node.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        // clones are decorative — keep them out of the tab order
        Array.prototype.forEach.call(clone.querySelectorAll('a, button'), function (el) {
          el.setAttribute('tabindex', '-1');
        });
        track.appendChild(clone);
      });

      // Pace by content width so adding cards later doesn't change the speed.
      var distance = track.scrollWidth / 2;
      track.style.animationDuration = Math.round(distance / 55) + 's';
      marquee.classList.add('is-running');
    }
  }

  /* --- Scroll reveal ---------------------------------------------------- */
  var revealables = document.querySelectorAll('.reveal, .sec-head');

  if (document.documentElement.classList.contains('js')) {
    // Stagger each item by its position within its own grid, so a row of four
    // cards cascades but two separate sections don't inherit each other's delay.
    Array.prototype.forEach.call(revealables, function (el) {
      if (!el.classList.contains('reveal')) return;
      var siblings = el.parentNode.querySelectorAll(':scope > .reveal');
      var i = Array.prototype.indexOf.call(siblings, el);
      el.style.setProperty('--d', (i > 0 ? i * 80 : 0) + 'ms');
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });

    Array.prototype.forEach.call(revealables, function (el) { io.observe(el); });

    // Safety net: whatever happens with the observer, nothing stays invisible.
    setTimeout(function () {
      Array.prototype.forEach.call(revealables, function (el) {
        el.classList.add('is-visible');
      });
    }, 3000);
  } else {
    Array.prototype.forEach.call(revealables, function (el) {
      el.classList.add('is-visible');
    });
  }
})();

/* --- Click-to-load maps ---------------------------------------------------
   Google is not contacted until the visitor asks for the map, so the page
   makes no third-party requests on load. */
(function () {
  'use strict';
  Array.prototype.forEach.call(document.querySelectorAll('[data-map]'), function (panel) {
    var btn = panel.querySelector('[data-map-load]');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var frame = document.createElement('iframe');
      frame.src = panel.getAttribute('data-map');
      frame.title = panel.getAttribute('data-map-title') || 'Map';
      frame.loading = 'lazy';
      frame.referrerPolicy = 'no-referrer-when-downgrade';
      frame.setAttribute('allowfullscreen', '');
      panel.innerHTML = '';
      panel.appendChild(frame);
    });
  });
})();

/* --- Stat counters --------------------------------------------------------
   Counts up once, the first time the band scrolls into view. Visitors who
   prefer reduced motion get the final figure immediately. */
(function () {
  'use strict';
  var counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function format(n) { return n.toLocaleString('en-CA'); }

  function settle(el) {
    el.textContent = format(Number(el.getAttribute('data-count'))) +
                     (el.getAttribute('data-suffix') || '');
  }

  if (reduced || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(counters, settle);
    return;
  }

  function run(el) {
    var target = Number(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-suffix') || '';
    var duration = 1400;
    var start = null;

    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      // ease-out so it decelerates into the final figure
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = format(Math.round(target * eased)) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      run(entry.target);
      io.unobserve(entry.target);
    });
  }, { threshold: 0.4 });

  Array.prototype.forEach.call(counters, function (el) { io.observe(el); });

  // Safety net: never leave a counter showing its placeholder.
  setTimeout(function () {
    Array.prototype.forEach.call(counters, function (el) {
      if (el.textContent.trim() === '0' || el.textContent.trim() === '') settle(el);
    });
  }, 4000);
})();
