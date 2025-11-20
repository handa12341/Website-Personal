// script.js — combined functionality:
// - year injection
// - original site logic (reveal, skills, typing, nav highlight, orbit parallax, form)
// - logo animation activation
// - mini-game overlay & logic
(function () {
  // -----------------------------
  // Utility selectors
  // -----------------------------
  const qs = (s, ctx = document) => ctx.querySelector(s);
  const qsa = (s, ctx = document) => Array.from((ctx || document).querySelectorAll(s));

  // -----------------------------
  // Year
  // -----------------------------
  document.addEventListener('DOMContentLoaded', () => {
    const yearEl = qs('#year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  });

  // -----------------------------
  // ORIGINAL: INITIALIZE REVEAL + SKILLS + TYPING + NAV HIGHLIGHT + ORBIT PARALLAX + FORM + KEY JUMPS
  // (kept intact with minimal additions)
  // -----------------------------
  (function coreFeatures() {
    // 1) Add 'reveal' class to all sections so CSS base applies
    const sections = qsa('.section');
    sections.forEach(sec => sec.classList.add('reveal'));

    // 2) IntersectionObserver for reveal & skill bars
    const ioOptions = { threshold: 0.18 };
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          const bars = entry.target.querySelectorAll('.bar span');
          bars.forEach(span => {
            const v = span.getAttribute('data-value') || '0%';
            span.style.width = (String(v).trim().endsWith('%') ? v : (v + '%'));
          });
          revealObserver.unobserve(entry.target);
        }
      });
    }, ioOptions);
    sections.forEach(sec => revealObserver.observe(sec));

    // 3) Ensure any meter spans that appear outside sections
    const skillSpans = qsa('.bar span');
    skillSpans.forEach(span => {
      span.style.width = span.style.width || '0%';
    });

    // 4) Typing effect for hero
    (function typingEffect() {
      const typingSpan = qs('.typing-text span');
      if (!typingSpan) return;
      const words = [
        'Full-Stack Developer',
        'Frontend Specialist',
        'UI / UX Designer',
        'Motion & Interaction Designer',
        'Product-focused Engineer'
      ];
      let wIndex = 0, charIndex = 0, deleting = false;
      const TYPING_SPEED = 70, PAUSE_AFTER = 1400;
      function tick() {
        const word = words[wIndex];
        if (!deleting) {
          typingSpan.textContent = word.slice(0, charIndex + 1);
          charIndex++;
          if (charIndex === word.length) {
            deleting = true;
            setTimeout(tick, PAUSE_AFTER);
            return;
          }
        } else {
          typingSpan.textContent = word.slice(0, charIndex - 1);
          charIndex--;
          if (charIndex === 0) {
            deleting = false;
            wIndex = (wIndex + 1) % words.length;
          }
        }
        setTimeout(tick, deleting ? TYPING_SPEED / 1.7 : TYPING_SPEED);
      }
      tick();
    })();

    // 5) Navbar active highlight based on scroll position
    (function navHighlight() {
      const navLinks = qsa('.nav a');
      if (!navLinks.length) return;
      const linkMap = navLinks
        .map(a => ({ a, id: (a.getAttribute('href') || '').replace('#', '') }))
        .filter(x => x.id);
      function onScroll() {
        const scrollPos = window.scrollY + 160;
        let currentId = '';
        linkMap.forEach(({ id }) => {
          const el = document.getElementById(id);
          if (!el) return;
          if (el.offsetTop <= scrollPos) currentId = id;
        });
        linkMap.forEach(({ a, id }) => {
          if (id === currentId) a.classList.add('active');
          else a.classList.remove('active');
        });
      }
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('load', onScroll);
      onScroll();
    })();

    // 6) Orbit subtle parallax following mouse (non-blocking)
    (function orbitParallax() {
      const orbit = qs('.orbit');
      if (!orbit) return;
      let mouseX = 0, mouseY = 0, posX = 0, posY = 0;
      const damp = 0.08;
      document.addEventListener('mousemove', (ev) => {
        const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
        mouseX = (ev.clientX - cx) / cx;
        mouseY = (ev.clientY - cy) / cy;
      }, { passive: true });
      function loop() {
        posX += (mouseX - posX) * damp;
        posY += (mouseY - posY) * damp;
        const tx = posX * 10, ty = posY * 8;
        orbit.style.transform = `translate(-50%, -50%) rotate(${(Date.now() / 50) % 360}deg) translate(${tx}px, ${ty}px)`;
        requestAnimationFrame(loop);
      }
      loop();
    })();

    // 7) Form submit simulation
    (function contactForm() {
      const forms = qsa('.contact-form');
      if (!forms.length) return;
      forms.forEach(form => {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const name = form.querySelector('input[type="text"]')?.value || '';
          const email = form.querySelector('input[type="email"]')?.value || '';
          if (!name || !email) {
            alert('Please provide your name and email.');
            return;
          }
          const btn = form.querySelector('button') || null;
          if (btn) {
            const original = btn.textContent;
            btn.textContent = 'Sending...';
            btn.disabled = true;
            setTimeout(() => {
              btn.textContent = 'Message Sent ✓';
              btn.style.background = 'linear-gradient(90deg,#8a4bff,#c4b5fd)';
              setTimeout(() => {
                btn.textContent = original;
                btn.disabled = false;
              }, 2200);
            }, 900);
          } else {
            alert('Message sent — thank you! (This is a simulation.)');
          }
        });
      });
    })();

    // 8) Accessibility: allow keyboard shortcuts 1..6 to jump to sections
    (function quickJumpKeys() {
      const map = ['home','services','skills','education','experience','contact'];
      document.addEventListener('keydown', (e) => {
        if (e.key >= '1' && e.key <= '6') {
          const idx = Number(e.key) - 1;
          const id = map[idx];
          const el = document.getElementById(id);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }
      });
    })();

    // safety: ensure skill bars visible on load are filled
    document.addEventListener('DOMContentLoaded', () => {
      qsa('.bar span').forEach(span => {
        const rect = span.getBoundingClientRect();
        if (rect.top < window.innerHeight - 80) {
          const v = span.getAttribute('data-value') || '0%';
          span.style.width = (String(v).trim().endsWith('%') ? v : (v + '%'));
        }
      });
    });

  })(); // end coreFeatures

  // -----------------------------
  // LOGO: add floating class and small interactive pulse on mousemove
  // -----------------------------
  (function logoEnhance() {
    const logo = qs('#mainLogo');
    if (!logo) return;
    logo.classList.add('floating');
    // small responsive tilt based on mouse position over header
    const header = qs('.header');
    if (!header) return;
    header.addEventListener('mousemove', (e) => {
      const rect = header.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / rect.width;
      const dy = (e.clientY - cy) / rect.height;
      logo.style.transform = `perspective(600px) rotateX(${ -dy * 6 }deg) rotateY(${ dx * 8 }deg) scale(1.02)`;
    }, { passive: true });
    header.addEventListener('mouseleave', () => {
      logo.style.transform = '';
    });
  })();

  // -----------------------------
  // MINI-GAME: overlay + canvas simple collectible game
  // Controls: Arrow keys or WASD. Player is small circle, collect moving stars.
  // Opens when click #playGameBtn. Close with close button or Escape.
  // -----------------------------
  (function miniGame() {
    // Create overlay elements (append to body) so we don't modify existing sections markup
    const overlay = document.createElement('div');
    overlay.id = 'gameOverlay';
    overlay.innerHTML = `
      <div id="gameContainer" role="dialog" aria-modal="true" aria-label="Mini Game">
        <div id="gameHeader">
          <h4>Mini-Game — Collect the stars! (Arrow keys / WASD)</h4>
          <div>
            <button id="gameCloseBtn" title="Close">✕</button>
          </div>
        </div>
        <canvas id="gameCanvas" width="720" height="420"></canvas>
        <div id="gameInstructions">Collect as many stars as you can. Close with ESC or ✕.</div>
      </div>
    `;
    document.body.appendChild(overlay);

    const playBtn = qs('#playGameBtn');
    const closeBtn = qs('#gameCloseBtn');
    const gameOverlay = qs('#gameOverlay');
    const canvas = qs('#gameCanvas');
    const ctx = canvas.getContext('2d');

    // show/hide
    function openGame() {
      gameOverlay.style.display = 'flex';
      // focus for keyboard
      canvas.focus();
      start();
    }
    function closeGame() {
      gameOverlay.style.display = 'none';
      stop();
    }

    if (playBtn) playBtn.addEventListener('click', openGame);
    if (closeBtn) closeBtn.addEventListener('click', closeGame);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && gameOverlay.style.display === 'flex') closeGame();
    });

    // GAME STATE
    let animId = null;
    let running = false;
    const state = {
      player: { x: 100, y: 200, r: 12, speed: 3.6 },
      keys: {},
      stars: [],
      score: 0,
      lastSpawn: 0
    };

    // responsive canvas sizing
    function fitCanvas() {
      const container = qs('#gameContainer');
      if (!container) return;
      const w = Math.min(720, container.clientWidth);
      const h = 420 * (w / 720);
      canvas.width = w;
      canvas.height = h;
      // keep player inside bounds on resize
      state.player.x = Math.min(Math.max(state.player.x, state.player.r), canvas.width - state.player.r);
      state.player.y = Math.min(Math.max(state.player.y, state.player.r), canvas.height - state.player.r);
    }

    window.addEventListener('resize', fitCanvas);

    // spawn a star
    function spawnStar() {
      const s = {
        x: Math.random() * (canvas.width - 40) + 20,
        y: Math.random() * (canvas.height - 40) + 20,
        vx: (Math.random() * 1.6 - 0.8),
        vy: (Math.random() * 1.2 - 0.6),
        r: 8 + Math.random() * 6,
        hue: 260 + Math.random() * 40
      };
      state.stars.push(s);
    }

    function resetGame() {
      state.player.x = canvas.width / 4;
      state.player.y = canvas.height / 2;
      state.player.r = Math.max(10, Math.min(16, canvas.width * 0.018));
      state.stars = [];
      state.score = 0;
      state.lastSpawn = performance.now();
    }

    // simple collision
    function distance(a, b) {
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      return Math.sqrt(dx * dx + dy * dy);
    }

    // update
    function update(dt) {
      // player movement
      const p = state.player;
      const s = p.speed * (canvas.width / 720); // scale speed by canvas width
      if (state.keys['ArrowLeft'] || state.keys['a']) p.x -= s;
      if (state.keys['ArrowRight'] || state.keys['d']) p.x += s;
      if (state.keys['ArrowUp'] || state.keys['w']) p.y -= s;
      if (state.keys['ArrowDown'] || state.keys['s']) p.y += s;
      // bounds
      p.x = Math.max(p.r, Math.min(canvas.width - p.r, p.x));
      p.y = Math.max(p.r, Math.min(canvas.height - p.r, p.y));

      // stars move
      for (let i = state.stars.length - 1; i >= 0; i--) {
        const st = state.stars[i];
        st.x += st.vx * dt * 0.06;
        st.y += st.vy * dt * 0.06;
        // bounce
        if (st.x < st.r || st.x > canvas.width - st.r) st.vx *= -1;
        if (st.y < st.r || st.y > canvas.height - st.r) st.vy *= -1;
        // collide with player?
        if (distance(p, st) < p.r + st.r) {
          state.stars.splice(i, 1);
          state.score += 1;
        }
      }

      // spawn periodically (every ~1200ms)
      if (performance.now() - state.lastSpawn > 1200 && state.stars.length < 8) {
        spawnStar();
        state.lastSpawn = performance.now();
      }
    }

    // render
    function render() {
      // background
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // stars (collectibles)
      for (const st of state.stars) {
        ctx.beginPath();
        // glow
        ctx.fillStyle = `rgba(140,70,255,0.08)`;
        ctx.arc(st.x, st.y, st.r * 2.1, 0, Math.PI * 2);
        ctx.fill();

        // star body
        ctx.beginPath();
        ctx.fillStyle = `hsl(${st.hue} 80% 70%)`;
        ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
        ctx.fill();

        // twinkle
        ctx.beginPath();
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.arc(st.x - st.r * 0.4, st.y - st.r * 0.5, st.r * 0.25, 0, Math.PI * 2);
        ctx.fill();
      }

      // player
      const p = state.player;
      // player glow
      const grad = ctx.createRadialGradient(p.x, p.y, p.r * 0.2, p.x, p.y, p.r * 3);
      grad.addColorStop(0, 'rgba(200,150,255,0.8)');
      grad.addColorStop(1, 'rgba(80,40,120,0.02)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 2.6, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.fillStyle = 'rgba(250,250,255,0.95)';
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();

      // score UI
      ctx.font = `${Math.max(12, canvas.width * 0.03)}px Poppins, sans-serif`;
      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      ctx.fillText(`Score: ${state.score}`, 12, 26);
    }

    // game loop
    let lastTime = 0;
    function loop(time) {
      if (!running) return;
      const dt = time - (lastTime || time);
      lastTime = time;
      update(dt);
      render();
      animId = requestAnimationFrame(loop);
    }

    function start() {
      if (running) return;
      running = true;
      fitCanvas();
      resetGame();
      lastTime = performance.now();
      animId = requestAnimationFrame(loop);
    }

    function stop() {
      running = false;
      if (animId) cancelAnimationFrame(animId);
      animId = null;
    }

    // keyboard
    window.addEventListener('keydown', (e) => {
      if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','a','w','s','d'].includes(e.key)) {
        state.keys[e.key] = true;
        e.preventDefault();
      }
    }, { passive: false });
    window.addEventListener('keyup', (e) => {
      if (state.keys[e.key]) state.keys[e.key] = false;
    });

    // ensure overlay hidden initially
    gameOverlay.style.display = 'none';

    // accessibility: trap focus to close button when open (simple)
    gameOverlay.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        qs('#gameCloseBtn').focus();
      }
    });
  })();

})(); // end main IIFE