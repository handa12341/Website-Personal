// script.js — combined functionality + playable mini-game (keyboard + pointer/touch) + Game Over
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
  // Controls: Arrow keys or WASD + pointer/touch dragging
  // Opens when click #playGameBtn. Close with close button or Escape.
  // Added: Game Over screen (targetScore or time)
  // -----------------------------
  (function miniGame() {
    // Create overlay elements (append to body) so we don't modify existing sections markup
    const overlay = document.createElement('div');
    overlay.id = 'gameOverlay';

    // inline styles to ensure centered overlay even if CSS missing
    overlay.style.cssText = [
      'position:fixed',
      'inset:0',
      'display:flex',
      'align-items:center',
      'justify-content:center',
      'z-index:2000',
      'background:linear-gradient(180deg, rgba(5,3,10,0.86), rgba(5,3,10,0.94))',
      'backdrop-filter: blur(6px)'
    ].join(';');

    overlay.innerHTML = `
      <div id="gameContainer" role="dialog" aria-modal="true" aria-label="Mini Game" style="width:90%;max-width:780px;background:rgba(10,20,40,0.95);border-radius:12px;padding:16px;border:1px solid rgba(255,255,255,0.04);box-shadow:0 20px 80px rgba(0,0,0,0.7);">
        <div id="gameHeader" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
          <h4 style="margin:0;font-size:16px;color:#d7ecff;">Mini-Game — Collect the stars! (Arrow keys / WASD)</h4>
          <div>
            <button id="gameCloseBtn" title="Close" style="background:transparent;border:none;color:#b7daff;font-size:18px;cursor:pointer;">✕</button>
          </div>
        </div>
        <canvas id="gameCanvas" width="720" height="420" tabindex="0" style="display:block;width:100%;height:auto;border-radius:8px;background:linear-gradient(180deg,#031735,#051b33);"></canvas>
        <div id="gameFooter" style="display:flex;justify-content:space-between;align-items:center;margin-top:10px;color:rgba(255,255,255,0.85);font-size:13px;">
          <div id="gameInstructions">Collect as many stars as you can. Close with ESC or ✕. (Tap & drag to move on mobile)</div>
          <div id="gameScore" style="font-weight:600">Score: 0</div>
        </div>

        <!-- Game Over panel (hidden by default) -->
        <div id="gameOverPanel" style="display:none;margin-top:12px;padding:12px;background:linear-gradient(180deg,rgba(0,0,0,0.24),rgba(255,255,255,0.02));border-radius:10px;">
          <h3 id="gameOverTitle" style="margin:0 0 8px 0;color:#fff;">Game Over</h3>
          <p id="gameOverText" style="margin:0 0 10px 0;color:rgba(255,255,255,0.9)">Your score: <strong id="finalScore">0</strong></p>
          <div style="display:flex;gap:10px;">
            <button id="restartBtn" class="btn" style="padding:8px 14px;border-radius:10px;">Restart</button>
            <button id="closePanelBtn" style="padding:8px 14px;border-radius:10px;background:transparent;border:1px solid rgba(255,255,255,0.08);color:#fff;">Close</button>
          </div>
        </div>

      </div>
    `;
    document.body.appendChild(overlay);

    const playBtn = qs('#playGameBtn');
    const closeBtn = qs('#gameCloseBtn') || qs('#closePanelBtn');
    const gameOverlay = qs('#gameOverlay');
    const canvas = qs('#gameCanvas');
    const scoreEl = qs('#gameScore');
    const finalScoreEl = qs('#finalScore');
    const gameOverPanel = qs('#gameOverPanel');
    const restartBtn = qs('#restartBtn');
    const closePanelBtn = qs('#closePanelBtn');

    // make sure canvas is focusable
    if (canvas && !canvas.hasAttribute('tabindex')) canvas.setAttribute('tabindex', '0');
    const ctx = canvas.getContext('2d');

    // show/hide
    function openGame() {
      if (!gameOverlay) return;
      gameOverlay.style.display = 'flex';
      fitCanvas();
      // small timeout to ensure visible before focus
      setTimeout(() => { try { canvas.focus(); } catch (e) {} }, 60);
      start();
    }
    function closeGame() {
      if (!gameOverlay) return;
      gameOverlay.style.display = 'none';
      stop();
      hideGameOver();
    }

    if (playBtn) playBtn.addEventListener('click', openGame);
    if (closeBtn) closeBtn.addEventListener('click', closeGame);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && gameOverlay.style.display === 'flex') closeGame();
    });

    // GAME STATE
    let animId = null;
    let running = false;
    let gameTimerId = null; // for timed mode (if used)
    const GAME_TARGET_SCORE = 10; // target to end game (you can change)
    const GAME_TIME_LIMIT = 30 * 1000; // 30 seconds limit (ms) — comment out if you want infinite
    const state = {
      player: { x: 100, y: 200, r: 12, speed: 3.6 },
      keys: {},
      stars: [],
      score: 0,
      lastSpawn: 0,
      startedAt: 0
    };

    // responsive canvas sizing
    function fitCanvas() {
      const container = qs('#gameContainer');
      if (!container || !canvas) return;
      const w = Math.min(780, container.clientWidth - 16); // padding safety
      const h = 420 * (w / 720);
      // preserve devicePixelRatio for crispness
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // keep player inside bounds on resize (convert ratios)
      state.player.x = Math.min(Math.max(state.player.x, state.player.r), (canvas.width / dpr) - state.player.r);
      state.player.y = Math.min(Math.max(state.player.y, state.player.r), (canvas.height / dpr) - state.player.r);
      // scale player radius based on canvas width
      state.player.r = Math.max(8, Math.min(18, (canvas.width / dpr) * 0.018));
    }

    window.addEventListener('resize', () => {
      fitCanvas();
    });

    // spawn a star
    function spawnStar() {
      const cw = canvas.width / (window.devicePixelRatio || 1);
      const ch = canvas.height / (window.devicePixelRatio || 1);
      const s = {
        x: Math.random() * (cw - 40) + 20,
        y: Math.random() * (ch - 40) + 20,
        vx: (Math.random() * 1.6 - 0.8),
        vy: (Math.random() * 1.2 - 0.6),
        r: 8 + Math.random() * 6,
        hue: 260 + Math.random() * 40
      };
      state.stars.push(s);
    }

    function resetGame() {
      const cw = canvas.width / (window.devicePixelRatio || 1);
      const ch = canvas.height / (window.devicePixelRatio || 1);
      state.player.x = cw / 4;
      state.player.y = ch / 2;
      state.player.r = Math.max(8, Math.min(18, cw * 0.018));
      state.stars = [];
      state.score = 0;
      state.lastSpawn = performance.now();
      state.startedAt = performance.now();
      updateScoreUI();
      hideGameOver();
    }

    // simple collision
    function distance(a, b) {
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      return Math.sqrt(dx * dx + dy * dy);
    }

    // check end conditions
    function checkEndConditions() {
      // 1) target score reached
      if (state.score >= GAME_TARGET_SCORE) {
        showGameOver('You reached the target!');
        return true;
      }
      // 2) time limit reached (optional)
      if (GAME_TIME_LIMIT > 0 && (performance.now() - state.startedAt) >= GAME_TIME_LIMIT) {
        showGameOver('Time\'s up!');
        return true;
      }
      return false;
    }

    // update
    function update(dt) {
      const cw = canvas.width / (window.devicePixelRatio || 1);
      const ch = canvas.height / (window.devicePixelRatio || 1);
      // player movement
      const p = state.player;
      const s = p.speed * (cw / 720); // scale speed by canvas width
      if (state.keys['ArrowLeft'] || state.keys['a']) p.x -= s;
      if (state.keys['ArrowRight'] || state.keys['d']) p.x += s;
      if (state.keys['ArrowUp'] || state.keys['w']) p.y -= s;
      if (state.keys['ArrowDown'] || state.keys['s']) p.y += s;
      // bounds
      p.x = Math.max(p.r, Math.min(cw - p.r, p.x));
      p.y = Math.max(p.r, Math.min(ch - p.r, p.y));

      // stars move
      for (let i = state.stars.length - 1; i >= 0; i--) {
        const st = state.stars[i];
        st.x += st.vx * dt * 0.06;
        st.y += st.vy * dt * 0.06;
        // bounce
        if (st.x < st.r || st.x > cw - st.r) st.vx *= -1;
        if (st.y < st.r || st.y > ch - st.r) st.vy *= -1;
        // collide with player?
        if (distance(p, st) < p.r + st.r) {
          state.stars.splice(i, 1);
          state.score += 1;
          updateScoreUI();
        }
      }

      // spawn periodically (every ~1200ms)
      if (performance.now() - state.lastSpawn > 1200 && state.stars.length < 8) {
        spawnStar();
        state.lastSpawn = performance.now();
      }

      // check end
      if (checkEndConditions()) {
        stop();
      }
    }

    // render
    function render() {
      // background
      const dpr = (window.devicePixelRatio || 1);
      const cw = canvas.width / dpr;
      const ch = canvas.height / dpr;
      ctx.clearRect(0, 0, cw, ch);

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

      // score UI (top-left)
      ctx.font = `${Math.max(12, cw * 0.03)}px Poppins, sans-serif`;
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
      // optional time limit: ensure we still check
      if (GAME_TIME_LIMIT > 0) {
        if (gameTimerId) clearTimeout(gameTimerId);
        gameTimerId = setTimeout(() => {
          if (running) {
            showGameOver('Time\'s up!');
            stop();
          }
        }, GAME_TIME_LIMIT);
      }
    }

    function stop() {
      running = false;
      if (animId) cancelAnimationFrame(animId);
      animId = null;
      if (gameTimerId) { clearTimeout(gameTimerId); gameTimerId = null; }
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

    // POINTER / TOUCH controls (drag to move player)
    let pointerActive = false;
    function eventToCanvasPos(e) {
      const rect = canvas.getBoundingClientRect();
      const dpr = (window.devicePixelRatio || 1);
      // handle touch events
      const clientX = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
      const clientY = (e.touches && e.touches[0]) ? e.touches[0].clientY : e.clientY;
      const x = ((clientX - rect.left) * (canvas.width / dpr)) / rect.width;
      const y = ((clientY - rect.top) * (canvas.height / dpr)) / rect.height;
      return { x, y };
    }
    function movePlayerToEventPos(pos) {
      // lerp / smooth movement for nicer feel
      const ease = 0.28;
      state.player.x += (pos.x - state.player.x) * ease;
      state.player.y += (pos.y - state.player.y) * ease;
    }
    function movePlayerToEvent(e) {
      const pos = eventToCanvasPos(e);
      movePlayerToEventPos(pos);
    }

    // pointer events (works for mouse + touch)
    canvas.addEventListener('pointerdown', (e) => {
      pointerActive = true;
      canvas.setPointerCapture && canvas.setPointerCapture(e.pointerId);
      movePlayerToEvent(e);
      e.preventDefault();
    }, { passive: false });

    canvas.addEventListener('pointermove', (e) => {
      if (!pointerActive) return;
      movePlayerToEvent(e);
      e.preventDefault();
    }, { passive: false });

    canvas.addEventListener('pointerup', (e) => {
      pointerActive = false;
      try { canvas.releasePointerCapture && canvas.releasePointerCapture(e.pointerId); } catch (err) {}
      e.preventDefault();
    }, { passive: false });

    // touch fallback (older devices)
    canvas.addEventListener('touchstart', (e) => { pointerActive = true; movePlayerToEvent(e); e.preventDefault(); }, { passive: false });
    canvas.addEventListener('touchmove', (e) => { if (!pointerActive) return; movePlayerToEvent(e); e.preventDefault(); }, { passive: false });
    canvas.addEventListener('touchend', (e) => { pointerActive = false; e.preventDefault(); }, { passive: false });

    // UI helpers: score and game over
    function updateScoreUI() {
      if (scoreEl) scoreEl.textContent = `Score: ${state.score}`;
      if (finalScoreEl) finalScoreEl.textContent = String(state.score);
    }
    function showGameOver(message) {
      // stop loop already done by caller
      if (gameOverPanel) {
        gameOverPanel.style.display = 'block';
        qs('#gameOverTitle').textContent = 'Game Over';
        qs('#gameOverText').innerHTML = `${message} Your score: <strong id="finalScoreInline">${state.score}</strong>`;
        // update final score element fallback
        if (finalScoreEl) finalScoreEl.textContent = String(state.score);
      }
      updateScoreUI();
    }
    function hideGameOver() {
      if (gameOverPanel) gameOverPanel.style.display = 'none';
    }

    // restart & close handlers
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        hideGameOver();
        resetGame();
        start();
        try { canvas.focus(); } catch (e) {}
      });
    }
    if (closePanelBtn) {
      closePanelBtn.addEventListener('click', () => {
        closeGame();
      });
    }

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
