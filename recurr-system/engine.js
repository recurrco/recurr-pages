/* ============================================================
   RECURR ENGINE — V5 · MAR 2026
   Shared JS for recurr.co pages
   ============================================================ */

// -- Theme toggle --
(function() {
  var html = document.documentElement;
  var stored = localStorage.getItem('recurr-theme');
  if (stored) html.setAttribute('data-theme', stored);

  document.addEventListener('DOMContentLoaded', function() {
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;
    btn.addEventListener('click', function() {
      var current = html.getAttribute('data-theme');
      var next = current === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('recurr-theme', next);
      if (typeof window.drawDotGrid === 'function') window.drawDotGrid();
    });
  });
})();

// -- Live clock in nav (IST) --
(function() {
  function tick() {
    var el = document.getElementById('clock');
    if (!el) return;
    var now = new Date();
    var ist = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    var h = ist.getHours(), m = ist.getMinutes();
    var ampm = h >= 12 ? 'PM' : 'AM';
    var hh = h % 12 || 12;
    el.textContent = hh + ':' + String(m).padStart(2,'0') + ' ' + ampm + ' IST';
  }
  document.addEventListener('DOMContentLoaded', function() { tick(); setInterval(tick, 10000); });
})();

// -- Hero word-by-word animation --
(function() {
  document.addEventListener('DOMContentLoaded', function() {
    var h1 = document.getElementById('hero-h1');
    if (!h1) return;
    var text = h1.textContent;
    h1.innerHTML = '';
    text.split(' ').forEach(function(word, i, arr) {
      var s = document.createElement('span');
      s.className = 'word';
      s.textContent = word;
      s.style.transitionDelay = (i * 70) + 'ms';
      h1.appendChild(s);
      if (i < arr.length - 1) h1.appendChild(document.createTextNode(' '));
    });
    requestAnimationFrame(function() { requestAnimationFrame(function() {
      h1.querySelectorAll('.word').forEach(function(w) { w.classList.add('visible'); });
      var ascii = document.getElementById('hero-ascii');
      if (ascii) ascii.classList.add('visible');
    }); });
  });
})();

// -- Scroll reveal (IntersectionObserver) --
(function() {
  document.addEventListener('DOMContentLoaded', function() {
    var items = document.querySelectorAll('[data-reveal]');
    var obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) {
          var siblings = e.target.parentElement ? Array.from(e.target.parentElement.querySelectorAll(':scope > [data-reveal]')) : [];
          var idx = siblings.indexOf(e.target);
          var delay = idx >= 0 ? idx * 80 : 0;
          setTimeout(function() { e.target.classList.add('visible'); }, delay);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function(i) { obs.observe(i); });
  });
})();

// -- Dot grid background with parallax --
(function() {
  document.addEventListener('DOMContentLoaded', function() {
    var canvas = document.getElementById('dot-grid');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var gridSize = 28;
    var dotRadius = 1;
    var scrollY = 0;
    var time = 0;
    var isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    window.drawDotGrid = function() {
      isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      render();
    };

    function render() {
      var w = canvas.width;
      var h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      var dotColor = isDark ? 'rgba(42,46,45,0.8)' : 'rgba(197,202,200,0.55)';
      ctx.fillStyle = dotColor;

      var parallaxY = scrollY * 0.08;
      var driftX = Math.sin(time * 0.0005) * 2.5;

      var startCol = Math.floor((-driftX) / gridSize) - 1;
      var endCol = Math.ceil((w - driftX) / gridSize) + 1;
      var startRow = Math.floor((-parallaxY % gridSize - gridSize) / gridSize);
      var endRow = Math.ceil((h + gridSize) / gridSize) + 1;

      for (var row = startRow; row <= endRow; row++) {
        for (var col = startCol; col <= endCol; col++) {
          var x = col * gridSize + driftX;
          var y = row * gridSize + (parallaxY % gridSize);
          if (x >= -2 && x <= w + 2 && y >= -2 && y <= h + 2) {
            ctx.beginPath();
            ctx.arc(x, y, dotRadius, 0, 6.283);
            ctx.fill();
          }
        }
      }
    }

    function loop(ts) {
      time = ts || 0;
      render();
      requestAnimationFrame(loop);
    }

    window.addEventListener('scroll', function() {
      scrollY = window.scrollY;
    }, { passive: true });

    window.addEventListener('resize', function() {
      resize();
    });

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      resize();
      render();
      window.addEventListener('scroll', function() {
        scrollY = window.scrollY;
        render();
      }, { passive: true });
    } else {
      resize();
      scrollY = window.scrollY;
      loop(0);
    }
  });
})();

// -- ASCII self-draw utility --
// Usage: recurr.asciiDraw(containerId, asciiString)
window.recurr = window.recurr || {};
window.recurr.asciiDraw = function(containerId, art) {
  document.addEventListener('DOMContentLoaded', function() {
    var canvas = document.getElementById(containerId);
    if (!canvas) return;
    var html = '';
    for (var ci = 0; ci < art.length; ci++) {
      var c = art[ci];
      if (c === '\n') html += '\n';
      else if (c === ' ') html += ' ';
      else html += '<span class="ch">' + (c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '&' ? '&amp;' : c) + '</span>';
    }
    canvas.innerHTML = html;

    var fired = false;
    new IntersectionObserver(function(entries) {
      if (entries[0].isIntersecting && !fired) {
        fired = true;
        canvas.querySelectorAll('.ch').forEach(function(s, i) {
          setTimeout(function() { s.classList.add('v'); }, i * 3);
        });
      }
    }, { threshold: 0.2 }).observe(canvas);
  });
};

// -- Accordion toggle --
window.toggleAccordion = function(header) {
  var item = header.parentElement;
  var wasOpen = item.classList.contains('open');
  item.parentElement.querySelectorAll('.accordion-item').forEach(function(ai) {
    ai.classList.remove('open');
  });
  if (!wasOpen) item.classList.add('open');
};

// -- Tabs --
window.switchTab = function(btn) {
  var tabId = btn.getAttribute('data-tab');
  document.querySelectorAll('.tab-btn').forEach(function(b) { b.classList.remove('active'); });
  document.querySelectorAll('.tab-panel').forEach(function(p) { p.classList.remove('active'); });
  btn.classList.add('active');
  document.getElementById(tabId).classList.add('active');
};
