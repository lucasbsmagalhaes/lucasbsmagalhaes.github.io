document.addEventListener('DOMContentLoaded', () => {

  // ===== Ano no rodapé =====
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ===== Header: estado "scrolled" =====
  const header = document.getElementById('header');
  const onScroll = () => {
    if (window.scrollY > 24) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // ===== Menu mobile =====
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('open');
    navLinks.classList.toggle('open');
  });

  navLinks.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });

  // ===== Glow que segue o cursor =====
  const glow = document.getElementById('cursorGlow');
  let glowActive = false;

  window.addEventListener('mousemove', (e) => {
    glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
    if (!glowActive) {
      glow.classList.add('active');
      glowActive = true;
    }
  });

  window.addEventListener('mouseleave', () => {
    glow.classList.remove('active');
    glowActive = false;
  });

  // ===== Reveal on scroll (Intersection Observer) =====
  const revealEls = document.querySelectorAll('.reveal');

  // Aplica um pequeno delay escalonado para elementos dentro da mesma seção,
  // criando um efeito de entrada em cascata sutil.
  const groupedBySection = new Map();
  revealEls.forEach((el) => {
    const section = el.closest('section') || document.body;
    if (!groupedBySection.has(section)) groupedBySection.set(section, []);
    groupedBySection.get(section).push(el);
  });

  groupedBySection.forEach((els) => {
    els.forEach((el, index) => {
      el.style.setProperty('--reveal-delay', `${Math.min(index * 90, 360)}ms`);
    });
  });

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: '0px 0px -80px 0px',
    }
  );

  revealEls.forEach((el) => revealObserver.observe(el));

  // ===== Expansão de cards de projeto (estilo PS5/Xperia) =====
  const expandableCards = document.querySelectorAll('.project-card--expandable');
  let activeDetail = null;
  let activeCard = null;

  const isDesktopViewport = () => window.matchMedia('(min-width: 721px)').matches;

  const cardTransformTo = (card) => {
    const rect = card.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const scaleX = rect.width / vw;
    const scaleY = rect.height / vh;
    const translateX = rect.left + rect.width / 2 - vw / 2;
    const translateY = rect.top + rect.height / 2 - vh / 2;
    return `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`;
  };

  const openDetail = (card) => {
    const detail = document.getElementById(`detail-${card.dataset.project}`);
    if (!detail) return;

    activeDetail = detail;
    activeCard = card;
    card.setAttribute('aria-expanded', 'true');
    detail.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');

    detail.style.display = 'block';

    const scrollEl = detail.querySelector('.project-detail-scroll');
    if (scrollEl) scrollEl.scrollTop = 0;

    const initialTransform = isDesktopViewport()
      ? cardTransformTo(card)
      : 'translateY(28px) scale(1)';

    detail.style.transition = 'none';
    detail.style.opacity = '0';
    detail.style.transform = initialTransform;
    // força reflow para que a transição seguinte seja aplicada
    void detail.offsetHeight;
    detail.style.transition = '';

    requestAnimationFrame(() => {
      detail.classList.add('is-open');
      detail.style.opacity = '1';
      detail.style.transform = 'translate(0px, 0px) scale(1, 1)';
    });
  };

  const closeDetail = () => {
    if (!activeDetail) return;
    const detail = activeDetail;
    const card = activeCard;

    detail.classList.remove('is-open');
    detail.style.opacity = '0';
    detail.style.transform = (card && isDesktopViewport())
      ? cardTransformTo(card)
      : 'translateY(28px) scale(1)';

    if (card) card.setAttribute('aria-expanded', 'false');
    detail.setAttribute('aria-hidden', 'true');

    const onTransitionEnd = (event) => {
      if (event.target !== detail) return;
      detail.style.display = 'none';
      detail.style.transform = '';
      detail.style.opacity = '';
      detail.removeEventListener('transitionend', onTransitionEnd);
    };
    detail.addEventListener('transitionend', onTransitionEnd);

    document.body.classList.remove('no-scroll');
    activeDetail = null;
    activeCard = null;
  };

  expandableCards.forEach((card) => {
    card.addEventListener('click', () => openDetail(card));
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openDetail(card);
      }
    });
  });

  document.querySelectorAll('[data-close-detail]').forEach((btn) => {
    btn.addEventListener('click', closeDetail);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && activeDetail) closeDetail();
  });

});
