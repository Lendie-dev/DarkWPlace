// ==UserScript==
// @name         DarkWplace
// @namespace    lendie
// @version      1.0
// @description  Smooth dark/custom-winter toggle for wplace.live
// @match        https://wplace.live/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
  'use strict';

  const getTheme = () => (localStorage.getItem('theme') || 'dark').replace(/^['"]|['"]$/g, '');
  const setTheme = v => {
    localStorage.setItem('theme', v);
    document.documentElement.setAttribute('data-theme', v);
  };

  const isDark = getTheme() === 'dark';
  const btn = document.createElement('button');
  btn.textContent = isDark ? '☀️' : '🌙';
  btn.title = isDark ? 'Switch to custom-winter (light)' : 'Switch to dark mode';
  Object.assign(btn.style, {
    position: 'fixed',
    top: '12px',
    left: '12px',
    zIndex: '2147483647',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: '1px solid rgba(255,255,255,0.2)',
    cursor: 'grab',
    background: isDark ? '#1e293b' : '#f1f5f9',
    color: isDark ? '#facc15' : '#334155',
    fontSize: '20px',
    lineHeight: '38px',
    textAlign: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
    transition: 'background 0.25s ease, color 0.25s ease, top 0.2s ease, left 0.2s ease',
    willChange: 'transform',
  });

  btn.addEventListener('mouseenter', () => (btn.style.transform = 'scale(1.1)'));
  btn.addEventListener('mouseleave', () => (btn.style.transform = 'scale(1)'));

  try {
    const pos = JSON.parse(localStorage.getItem('dw_pos') || '{}');
    if (pos.left) btn.style.left = pos.left + 'px';
    if (pos.top) btn.style.top = pos.top + 'px';
  } catch {}

  let dragging = false,
    moved = false,
    startX = 0,
    startY = 0,
    startLeft = 0,
    startTop = 0;
  const threshold = 3;

  const applyPosition = (l, t) => {
    btn.style.left = l + 'px';
    btn.style.top = t + 'px';
  };

  btn.addEventListener('mousedown', e => {
    dragging = true;
    moved = false;
    startX = e.clientX;
    startY = e.clientY;
    startLeft = btn.offsetLeft;
    startTop = btn.offsetTop;
    btn.style.cursor = 'grabbing';
    btn.style.transition = 'none';
    e.preventDefault();
  });

  let dx = 0,
    dy = 0;

  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    dx = e.clientX - startX;
    dy = e.clientY - startY;
    if (Math.abs(dx) > threshold || Math.abs(dy) > threshold) moved = true;
    btn.style.transform = `translate(${dx}px, ${dy}px) scale(1.05)`;
  });

  document.addEventListener('mouseup', () => {
    if (!dragging) return;
    dragging = false;
    btn.style.cursor = 'grab';

    const newLeft = startLeft + dx;
    const newTop = startTop + dy;

    btn.style.transform = `translate(0,0)`;
    applyPosition(newLeft, newTop);

    requestAnimationFrame(() => {
      btn.style.transition =
        'background 0.25s ease, color 0.25s ease, top 0.2s ease, left 0.2s ease, transform 0.25s ease';
      btn.style.transform = 'scale(1)';
    });

    localStorage.setItem('dw_pos', JSON.stringify({ left: newLeft, top: newTop }));
    dx = dy = 0;
  });

  btn.addEventListener('click', () => {
    if (moved) {
      moved = false;
      return;
    }
    const next = getTheme() === 'dark' ? 'custom-winter' : 'dark';
    setTheme(next);
    location.reload();
  });

  const keepInView = () => {
    const rect = btn.getBoundingClientRect();
    const m = 10;
    const maxX = window.innerWidth - rect.width - m;
    const maxY = window.innerHeight - rect.height - m;
    const l = Math.min(parseInt(btn.style.left) || m, maxX);
    const t = Math.min(parseInt(btn.style.top) || m, maxY);
    applyPosition(Math.max(l, m), Math.max(t, m));
  };

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(keepInView, 100);
  });

  document.body.appendChild(btn);
})();
