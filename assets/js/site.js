// Native controls for the Bootstrap 2 stylesheet; no HTML strings or selectors
// are constructed from page attributes or visitor input.
(function () {
  'use strict';

  var navigation = document.getElementById('site-navigation');
  var menuButton = document.querySelector('.btn-navbar');
  var dropdowns = Array.from(document.querySelectorAll('.dropdown-toggle'));

  function closeDropdowns(except) {
    dropdowns.forEach(function (toggle) {
      if (toggle !== except) {
        toggle.parentElement.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  if (menuButton && navigation) {
    menuButton.addEventListener('click', function () {
      var open = navigation.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', String(open));
      if (!open) closeDropdowns();
    });
  }

  dropdowns.forEach(function (toggle) {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.addEventListener('click', function (event) {
      event.preventDefault();
      var open = !toggle.parentElement.classList.contains('open');
      closeDropdowns(toggle);
      toggle.parentElement.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
    });
    toggle.addEventListener('keydown', function (event) {
      if (event.key === ' ') {
        event.preventDefault();
        toggle.click();
      }
    });
  });

  document.addEventListener('click', function (event) {
    if (!event.target.closest('.dropdown-toggle')) closeDropdowns();
  });
  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') return;
    var openToggle = dropdowns.find(function (toggle) {
      return toggle.parentElement.classList.contains('open');
    });
    closeDropdowns();
    if (openToggle) {
      openToggle.focus();
    } else if (navigation && navigation.classList.contains('is-open')) {
      navigation.classList.remove('is-open');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.focus();
    }
  });

  document.querySelectorAll('.carousel').forEach(function (carousel) {
    var slides = Array.from(carousel.querySelectorAll('.carousel-inner > .item'));
    if (slides.length < 2) return;
    var current = Math.max(0, slides.findIndex(function (slide) {
      return slide.classList.contains('active');
    }));
    var moving = false;
    var timer;
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    function updateSlides() {
      slides.forEach(function (slide, index) {
        slide.setAttribute('aria-hidden', String(index !== current));
        slide.inert = index !== current;
      });
    }

    function move(step) {
      if (moving) return;
      var previous = slides[current];
      current = (current + step + slides.length) % slides.length;
      var next = slides[current];
      var position = step > 0 ? 'next' : 'prev';
      var direction = step > 0 ? 'left' : 'right';
      moving = true;
      next.classList.add(position);
      // Commit the starting position before applying the CSS transition.
      void next.offsetWidth;
      previous.classList.add(direction);
      next.classList.add(direction);
      updateSlides();
      window.setTimeout(function () {
        previous.classList.remove('active', direction);
        next.classList.remove(position, direction);
        next.classList.add('active');
        moving = false;
      }, reducedMotion.matches ? 0 : 600);
    }

    function restart() {
      window.clearInterval(timer);
      if (!document.hidden && !reducedMotion.matches &&
          !carousel.matches(':hover') && !carousel.contains(document.activeElement)) {
        timer = window.setInterval(function () { move(1); }, 10000);
      }
    }

    carousel.querySelectorAll('[data-slide]').forEach(function (control) {
      control.addEventListener('click', function (event) {
        event.preventDefault();
        move(control.getAttribute('data-slide') === 'prev' ? -1 : 1);
        restart();
      });
    });
    carousel.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        move(event.key === 'ArrowLeft' ? -1 : 1);
      }
    });
    carousel.addEventListener('mouseenter', restart);
    carousel.addEventListener('mouseleave', restart);
    carousel.addEventListener('focusin', restart);
    carousel.addEventListener('focusout', function () { window.setTimeout(restart, 0); });
    document.addEventListener('visibilitychange', restart);
    reducedMotion.addEventListener('change', restart);
    updateSlides();
    restart();
  });
}());
