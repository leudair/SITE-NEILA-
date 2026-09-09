/* ---------- Elegant placeholder for missing images ---------- */
function placeholderSVG(label) {
  const safeLabel = (label || 'imagem').replace(/[<&>]/g, '');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#1a1712"/>
        <stop offset="1" stop-color="#0b0b0b"/>
      </linearGradient>
    </defs>
    <rect width="800" height="600" fill="url(#g)"/>
    <rect x="1" y="1" width="798" height="598" fill="none" stroke="#C8A86A" stroke-opacity="0.35"/>
    <text x="50%" y="47%" font-family="Georgia, 'Playfair Display', serif" font-size="28" fill="#C8A86A" text-anchor="middle">Neila Bertram</text>
    <text x="50%" y="56%" font-family="Arial, sans-serif" font-size="13" letter-spacing="3" fill="#B9B4AA" text-anchor="middle">${safeLabel.toUpperCase()}</text>
  </svg>`;
  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
}

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Replace broken images with placeholder ---------- */
  document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', function handler() {
      img.removeEventListener('error', handler);
      const name = (img.getAttribute('src') || '').split('/').pop();
      img.src = placeholderSVG(name);
    });
  });

  /* ---------- Loader ---------- */
  const loader = document.getElementById('loader');
  const loaderBar = document.getElementById('loader-bar');
  let progress = 0;
  const loaderInterval = setInterval(() => {
    progress += Math.random() * 18;
    if (progress >= 100) progress = 100;
    loaderBar.style.width = progress + '%';
  }, 120);

  window.addEventListener('load', () => {
    clearInterval(loaderInterval);
    loaderBar.style.width = '100%';
    setTimeout(() => loader.classList.add('is-hidden'), 300);
  });
  // Safety fallback in case 'load' is delayed by slow assets
  setTimeout(() => {
    clearInterval(loaderInterval);
    loader.classList.add('is-hidden');
  }, 4000);

  /* ---------- Header scroll state ---------- */
  const header = document.getElementById('site-header');
  const onScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 40);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Mobile menu ---------- */
  const menuToggle = document.getElementById('menu-toggle');
  const mainNav = document.getElementById('main-nav');
  menuToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('is-open');
    menuToggle.classList.toggle('is-open', isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });
  mainNav.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('is-open');
      menuToggle.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------- Active nav link on scroll ---------- */
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = Array.from(navLinks)
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = '#' + entry.target.id;
        navLinks.forEach(link => link.classList.toggle('is-active', link.getAttribute('href') === id));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(sec => navObserver.observe(sec));

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => revealObserver.observe(el));

  /* ---------- Counter animation ---------- */
  const counters = document.querySelectorAll('.stat-number');
  const animateCounter = (el) => {
    const target = parseFloat(el.dataset.value);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const duration = 1600;
    const start = performance.now();
    const step = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = target * eased;
      el.textContent = value.toFixed(decimals);
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = target.toFixed(decimals);
    };
    requestAnimationFrame(step);
  };
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });
  counters.forEach(el => counterObserver.observe(el));

  /* ---------- Testimonial carousel ---------- */
  const track = document.getElementById('testimonial-track');
  const dotsWrap = document.getElementById('testimonial-dots');
  const prevBtn = document.getElementById('testimonial-prev');
  const nextBtn = document.getElementById('testimonial-next');

  if (track) {
    const cards = Array.from(track.children);
    cards.forEach((_, i) => {
      const dot = document.createElement('span');
      if (i === 0) dot.classList.add('is-active');
      dot.addEventListener('click', () => scrollToCard(i));
      dotsWrap.appendChild(dot);
    });
    const dots = Array.from(dotsWrap.children);

    const cardWidth = () => cards[0].getBoundingClientRect().width + 26;

    function scrollToCard(index) {
      track.scrollTo({ left: cardWidth() * index, behavior: 'smooth' });
    }

    let current = 0;
    function updateActiveDot() {
      const index = Math.round(track.scrollLeft / cardWidth());
      current = Math.max(0, Math.min(index, cards.length - 1));
      dots.forEach((d, i) => d.classList.toggle('is-active', i === current));
    }
    track.addEventListener('scroll', () => {
      window.clearTimeout(track._scrollTimeout);
      track._scrollTimeout = window.setTimeout(updateActiveDot, 100);
    }, { passive: true });

    prevBtn.addEventListener('click', () => scrollToCard(Math.max(current - 1, 0)));
    nextBtn.addEventListener('click', () => scrollToCard(Math.min(current + 1, cards.length - 1)));

    let autoplay = setInterval(() => {
      const next = current + 1 >= cards.length ? 0 : current + 1;
      scrollToCard(next);
    }, 5000);
    [track, prevBtn, nextBtn, dotsWrap].forEach(el => {
      el.addEventListener('mouseenter', () => clearInterval(autoplay));
      el.addEventListener('mouseleave', () => {
        autoplay = setInterval(() => {
          const next = current + 1 >= cards.length ? 0 : current + 1;
          scrollToCard(next);
        }, 5000);
      });
    });
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.faq-item').forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');
      document.querySelectorAll('.faq-item.is-open').forEach(openItem => {
        if (openItem !== item) {
          openItem.classList.remove('is-open');
          openItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
          openItem.querySelector('.faq-answer').style.maxHeight = null;
        }
      });
      item.classList.toggle('is-open', !isOpen);
      question.setAttribute('aria-expanded', String(!isOpen));
      answer.style.maxHeight = !isOpen ? answer.scrollHeight + 'px' : null;
    });
  });

  /* ---------- Service/course card hover video preview ---------- */
  document.querySelectorAll('.service-card, .course-card').forEach(card => {
    const video = card.querySelector('.service-video, .course-video');
    if (!video) return;
    card.addEventListener('mouseenter', () => {
      video.currentTime = 0;
      video.play().catch(() => {});
    });
    card.addEventListener('mouseleave', () => video.pause());
  });

  /* ---------- Subtle hero parallax ---------- */
  const heroImg = document.querySelector('.hero-img');
  if (heroImg && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.addEventListener('scroll', () => {
      const offset = window.scrollY;
      if (offset < window.innerHeight) {
        heroImg.style.transform = `translateY(${offset * 0.12}px) scale(1.05)`;
      }
    }, { passive: true });
  }

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

});
