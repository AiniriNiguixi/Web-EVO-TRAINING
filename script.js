/* EVO Training Olot — JS vanilla. Cada bloc és independent (safe) */
(function () {
  'use strict';
  function safe(fn, name) { try { fn(); } catch (e) { console.warn('EVO init error:', name, e); } }
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  // Header: transparent sobre el hero, blanc/fosc en fer scroll
  safe(function () {
    var h = $('.hdr'), darks = $$('.dark');
    function upd() {
      var y = window.scrollY, sc = y > 40, onDark = false;
      darks.forEach(function (d) {
        var r = d.getBoundingClientRect();
        if (r.top <= 36 && r.bottom > 36) onDark = true;
      });
      h.classList.toggle('sc', sc);
      h.classList.toggle('on-dark', sc && onDark);
    }
    window.addEventListener('scroll', upd, { passive: true }); upd();
  }, 'header');

  // Menú mòbil
  safe(function () {
    var b = $('#burger'), n = $('#nav');
    function close() { n.classList.remove('open'); b.setAttribute('aria-expanded', 'false'); }
    b.addEventListener('click', function () {
      var o = n.classList.toggle('open'); b.setAttribute('aria-expanded', o);
    });
    $$('a', n).forEach(function (a) { a.addEventListener('click', close); });
  }, 'menu');

  // Reveal (fade-up) amb IntersectionObserver + timeout de seguretat
  safe(function () {
    document.documentElement.classList.add('js');
    var els = $$('.rv');
    if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) {
        if (x.isIntersecting) {
          var sib = x.target.parentNode.children, i = Array.prototype.indexOf.call(sib, x.target);
          x.target.style.transitionDelay = Math.min(i, 4) * 80 + 'ms';
          x.target.classList.add('in'); io.unobserve(x.target);
        }
      });
    }, { threshold: 0.05 });
    els.forEach(function (e) { io.observe(e); });
    setTimeout(function () { els.forEach(function (e) { e.classList.add('in'); }); }, 6000);
  }, 'reveal');

  // Parallax molt lleu al hero
  safe(function () {
    var p = $('.parallax'); if (!p) return;
    var tick = false;
    window.addEventListener('scroll', function () {
      if (tick) return; tick = true;
      requestAnimationFrame(function () {
        if (window.scrollY < window.innerHeight * 1.2) p.style.transform = 'translateY(' + window.scrollY * 0.12 + 'px)';
        tick = false;
      });
    }, { passive: true });
  }, 'parallax');

  // Galeria: vista ampliada
  safe(function () {
    var lb = $('#lb'), img = $('img', lb);
    $$('.gallery .ph').forEach(function (b) {
      b.addEventListener('click', function () { img.src = b.dataset.full; lb.hidden = false; });
    });
    lb.addEventListener('click', function () { lb.hidden = true; });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') lb.hidden = true; });
  }, 'lightbox');

  // Formulari: DEMO. SUBSTITUEIX per enviament real (Formspree, PHP...)
  safe(function () {
    var f = $('#form');
    f.addEventListener('submit', function (e) {
      if (f.getAttribute('action') === '#') { e.preventDefault(); $('#ok').hidden = false; f.reset(); }
    });
  }, 'form');

  // ===== V2 =====
  // Loader amb barra de progrés (reinicia a cada càrrega / refresc)
  safe(function () {
    var d = document.documentElement, bar = $('#lbar'), num = $('#lnum'), p = 0, ready = document.readyState === 'complete', t0 = Date.now(), over = false;
    window.addEventListener('load', function () { ready = true; });
    function finish() {
      if (over) return; over = true;
      d.classList.remove('loading'); d.classList.add('loaded');
    }
    (function step() {
      if (over) return;
      var target = (ready && Date.now() - t0 > 1300) ? 100 : 88;
      p += (target - p) * 0.05 + 0.12; if (p > 100) p = 100;
      bar.style.transform = 'scaleX(' + p / 100 + ')'; num.textContent = Math.round(p) + '%';
      if (p >= 99.6) { setTimeout(finish, 250); return; }
      requestAnimationFrame(step);
    })();
    setTimeout(finish, 5000);
  }, 'loader');

  // Barra de progrés d'scroll + nav activa
  safe(function () {
    var sp = $('#sp'), tick = false;
    window.addEventListener('scroll', function () {
      if (tick) return; tick = true;
      requestAnimationFrame(function () {
        var h = document.documentElement.scrollHeight - innerHeight;
        sp.style.transform = 'scaleX(' + (h > 0 ? scrollY / h : 0) + ')'; tick = false;
      });
    }, { passive: true });
    var links = $$('#nav a'), map = {};
    links.forEach(function (a) { map[a.getAttribute('href')] = a; });
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) {
        if (x.isIntersecting) {
          links.forEach(function (a) { a.classList.remove('act'); });
          var a = map['#' + x.target.id]; if (a) a.classList.add('act');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('section[id]').forEach(function (s) { io.observe(s); });
  }, 'progress-nav');

  // Cursor personalitzat (només ratolí)
  safe(function () {
    if (!matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    var c = $('#cur'), x = 0, y = 0, cx = 0, cy = 0;
    document.addEventListener('mousemove', function (e) { x = e.clientX; y = e.clientY; c.classList.add('on'); });
    document.addEventListener('mouseleave', function () { c.classList.remove('on'); });
    document.addEventListener('mouseover', function (e) {
      c.classList.toggle('big', !!e.target.closest('a,button,summary,.gallery .ph,.p'));
    });
    (function loop() {
      cx += (x - cx) * 0.18; cy += (y - cy) * 0.18;
      c.style.transform = 'translate(' + cx + 'px,' + cy + 'px)';
      requestAnimationFrame(loop);
    })();
  }, 'cursor');

  // Botons magnètics
  safe(function () {
    if (!matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    $$('.btn').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + (e.clientX - r.left - r.width / 2) * 0.22 + 'px,' + (e.clientY - r.top - r.height / 2) * 0.3 + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }, 'magnetic');

  // Tilt 3D a les targetes
  safe(function () {
    if (!matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    $$('.card').forEach(function (c) {
      c.classList.add('tilt');
      c.addEventListener('mousemove', function (e) {
        var r = c.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = 'perspective(800px) rotateX(' + -py * 7 + 'deg) rotateY(' + px * 9 + 'deg) translateY(-6px)';
      });
      c.addEventListener('mouseleave', function () { c.style.transform = ''; });
    });
  }, 'tilt');

  // Parallax intern a les imatges
  safe(function () {
    var imgs = $$('.mosaic .ph, .gallery .ph, .tall'), tick = false;
    function upd() {
      imgs.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        var k = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
        el.style.setProperty('--py', (k * -24).toFixed(1) + 'px');
      });
      tick = false;
    }
    window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true });
    upd();
  }, 'img-parallax');

  // Panells interactius "Per què EVO?" + llum que segueix el ratolí
  safe(function () {
    var ps = $$('#pan .p'), sec = $('#per-que'), cur = 0, timer, touched = false;
    function open(i) { ps.forEach(function (p, j) { p.classList.toggle('active', i === j); }); cur = i; }
    ps.forEach(function (p, i) {
      p.addEventListener('click', function () { touched = true; open(i); });
      p.addEventListener('focus', function () { touched = true; open(i); });
      if (matchMedia('(hover:hover)').matches) p.addEventListener('mouseenter', function () { touched = true; open(i); });
    });
    timer = setInterval(function () { if (!touched && !document.hidden) open((cur + 1) % ps.length); }, 4200);
    sec.addEventListener('mousemove', function (e) {
      var r = sec.getBoundingClientRect();
      sec.style.setProperty('--mx', (e.clientX - r.left) + 'px'); sec.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  }, 'why-panels');

  // Panells interactius dels valors d'EVO
  safe(function () {
    var panels = $$('#valors .value-panel');
    function open(i) {
      panels.forEach(function (panel, j) {
        var active = i === j;
        panel.classList.toggle('active', active);
        panel.setAttribute('aria-pressed', String(active));
      });
    }
    panels.forEach(function (panel, i) {
      panel.addEventListener('click', function () { open(i); });
      panel.addEventListener('focus', function () { open(i); });
      panel.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); }
      });
      if (matchMedia('(hover:hover)').matches) panel.addEventListener('mouseenter', function () { open(i); });
    });
  }, 'value-panels');
})();
