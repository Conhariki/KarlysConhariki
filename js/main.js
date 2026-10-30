/* =====================================================================
   CONHARIKI ENGENHARIA — Scripts principais
   Módulos:
     1. Utilitários
     2. Inicialização (hero, ano, no-js)
     3. Header (estado ao rolar + barra de progresso)
     4. Menu mobile
     5. Link ativo da navegação
     6. Scroll reveal
     7. Contadores animados
     8. Brilho dos cards (bento)
     9. Portfólio com scroll horizontal
    10. Timeline do processo
    11. Parallax
    12. Botão flutuante de WhatsApp
    13. Formulário de contato
    14. Loop de scroll centralizado
   ===================================================================== */

(function () {
  "use strict";

  /* -------------------------------------------------------------------
     1. UTILITÁRIOS
     ------------------------------------------------------------------- */
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const lerp = (start, end, factor) => start + (end - start) * factor;
  const pad = (number) => String(number).padStart(2, "0");

  const debounce = (fn, wait = 150) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), wait);
    };
  };

  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const prefersReducedMotion = () => reducedMotionQuery.matches;

  const WHATSAPP_NUMBER = "5515981757894";
  const CONTACT_EMAIL = "contato@conhariki.com.br";

  /* -------------------------------------------------------------------
     2. INICIALIZAÇÃO
     ------------------------------------------------------------------- */
  document.documentElement.classList.remove("no-js");

  const yearEl = $("#year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  const startHeroAnimation = () => {
    setTimeout(() => document.body.classList.add("is-loaded"), 60);
  };

  if (document.readyState === "complete") {
    startHeroAnimation();
  } else {
    window.addEventListener("load", startHeroAnimation, { once: true });
    // Garantia: se a imagem do hero demorar, o conteúdo aparece mesmo assim
    setTimeout(startHeroAnimation, 1200);
  }

  /* -------------------------------------------------------------------
     2b. TEMA CLARO / ESCURO
     -------------------------------------------------------------------
     O tema inicial é aplicado por um script inline no <head> (sem
     "piscar"). Aqui ficam o botão de alternância, a persistência em
     localStorage e o acompanhamento da preferência do sistema enquanto
     o visitante não escolher um tema manualmente.
     ------------------------------------------------------------------- */
  const THEME_KEY = "ck-theme";
  const root = document.documentElement;
  const themeToggle = $("#themeToggle");
  const themeColorMeta = $("#themeColorMeta");
  const systemLightQuery = window.matchMedia("(prefers-color-scheme: light)");

  const getSavedTheme = () => {
    try {
      return localStorage.getItem(THEME_KEY);
    } catch (error) {
      return null;
    }
  };

  const applyTheme = (theme, { persist = false } = {}) => {
    root.setAttribute("data-theme", theme);

    if (themeColorMeta) {
      themeColorMeta.setAttribute("content", theme === "light" ? "#f7f6f3" : "#121212");
    }

    if (themeToggle) {
      const next = theme === "light" ? "escuro" : "claro";
      themeToggle.setAttribute("aria-label", `Alternar para tema ${next}`);
      themeToggle.setAttribute("aria-pressed", theme === "light" ? "true" : "false");
    }

    if (persist) {
      try {
        localStorage.setItem(THEME_KEY, theme);
      } catch (error) {
        /* Navegação privada sem acesso ao localStorage: mantém só na sessão */
      }
    }
  };

  applyTheme(root.getAttribute("data-theme") === "light" ? "light" : "dark");

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      applyTheme(next, { persist: true });
    });
  }

  systemLightQuery.addEventListener("change", (event) => {
    if (!getSavedTheme()) {
      applyTheme(event.matches ? "light" : "dark");
    }
  });

  /* -------------------------------------------------------------------
     3. HEADER
     ------------------------------------------------------------------- */
  const header = $("#header");
  const scrollProgress = $("#scrollProgress");

  const updateHeader = (scrollY) => {
    header.classList.toggle("is-scrolled", scrollY > 40);

    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? scrollY / maxScroll : 0;
    scrollProgress.style.transform = `scaleX(${clamp(progress, 0, 1)})`;
  };

  /* -------------------------------------------------------------------
     4. MENU MOBILE
     ------------------------------------------------------------------- */
  const hamburger = $("#hamburger");
  const nav = $("#nav");
  const navLinks = $$(".nav__link");
  const desktopQuery = window.matchMedia("(min-width: 1024px)");

  const openMenu = () => {
    nav.classList.add("is-open");
    hamburger.setAttribute("aria-expanded", "true");
    hamburger.setAttribute("aria-label", "Fechar menu");
    document.body.classList.add("menu-open");
    header.classList.add("is-scrolled");
    setTimeout(() => navLinks[0] && navLinks[0].focus({ preventScroll: true }), 350);
  };

  const closeMenu = (returnFocus = false) => {
    nav.classList.remove("is-open");
    hamburger.setAttribute("aria-expanded", "false");
    hamburger.setAttribute("aria-label", "Abrir menu");
    document.body.classList.remove("menu-open");
    updateHeader(window.scrollY);
    if (returnFocus) {
      hamburger.focus();
    }
  };

  const isMenuOpen = () => nav.classList.contains("is-open");

  hamburger.addEventListener("click", () => {
    if (isMenuOpen()) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (isMenuOpen()) {
        closeMenu();
      }
    });
  });

  document.addEventListener("keydown", (event) => {
    if (!isMenuOpen()) return;

    if (event.key === "Escape") {
      closeMenu(true);
      return;
    }

    // Mantém o foco dentro do menu aberto (focus trap)
    if (event.key === "Tab") {
      const focusables = [hamburger, ...$$("a", nav)];
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  desktopQuery.addEventListener("change", (event) => {
    if (event.matches && isMenuOpen()) {
      closeMenu();
    }
  });

  /* -------------------------------------------------------------------
     5. LINK ATIVO DA NAVEGAÇÃO
     ------------------------------------------------------------------- */
  const navSections = [
    { id: "home", el: $("#home") },
    { id: "home", el: $("#sobre") },
    { id: "servicos", el: $("#servicos") },
    { id: "portfolio", el: $("#portfolio") },
    { id: "diferenciais", el: $("#diferenciais") },
    { id: "diferenciais", el: $("#depoimentos") },
    { id: "contato", el: $("#contato") }
  ].filter((item) => item.el);

  let currentActive = "home";

  const updateActiveLink = () => {
    const marker = window.innerHeight * 0.4;
    let activeId = "home";

    navSections.forEach(({ id, el }) => {
      if (el.getBoundingClientRect().top <= marker) {
        activeId = id;
      }
    });

    // No fim da página, destaca sempre "Contato"
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
      activeId = "contato";
    }

    if (activeId === currentActive) return;
    currentActive = activeId;

    navLinks.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${activeId}`;
      link.classList.toggle("is-active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  /* -------------------------------------------------------------------
     6. SCROLL REVEAL
     ------------------------------------------------------------------- */
  const revealElements = $$(".reveal");

  // Atraso escalonado entre elementos irmãos que entram juntos na tela
  const applyStagger = () => {
    const groups = new Map();
    revealElements.forEach((el) => {
      if (el.style.getPropertyValue("--reveal-delay")) return;
      const parent = el.parentElement;
      if (!groups.has(parent)) groups.set(parent, []);
      groups.get(parent).push(el);
    });

    groups.forEach((items) => {
      items.forEach((el, index) => {
        if (!getComputedStyle(el).getPropertyValue("--reveal-delay").trim()) {
          el.style.setProperty("--reveal-delay", `${Math.min(index * 0.08, 0.4)}s`);
        }
      });
    });
  };

  if ("IntersectionObserver" in window && !prefersReducedMotion()) {
    applyStagger();

    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );

    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    revealElements.forEach((el) => el.classList.add("is-visible"));
  }

  // Ao saltar por um link do menu, elementos que passaram "por cima" da tela
  // sem nunca cruzá-la não disparam o observer: revela-os aqui.
  let lastRevealCheck = 0;
  const revealSkipped = () => {
    const now = performance.now();
    if (now - lastRevealCheck < 250) return;
    lastRevealCheck = now;
    revealElements.forEach((el) => {
      if (!el.classList.contains("is-visible") && el.getBoundingClientRect().bottom < 0) {
        el.classList.add("is-visible");
      }
    });
  };

  /* -------------------------------------------------------------------
     7. CONTADORES ANIMADOS
     ------------------------------------------------------------------- */
  const counters = $$("[data-counter]");

  const animateCounter = (el) => {
    const target = parseInt(el.dataset.counter, 10);
    if (Number.isNaN(target)) return;

    if (prefersReducedMotion()) {
      el.textContent = target;
      return;
    }

    const duration = 1800;
    const start = performance.now();

    const tick = (now) => {
      const elapsed = clamp((now - start) / duration, 0, 1);
      const eased = 1 - Math.pow(1 - elapsed, 4);
      el.textContent = Math.round(target * eased);
      if (elapsed < 1) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  };

  if ("IntersectionObserver" in window) {
    const counterObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Contadores do hero aguardam a animação de entrada
            const delay = entry.target.closest(".hero") ? 700 : 0;
            setTimeout(() => animateCounter(entry.target), delay);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((el) => counterObserver.observe(el));
  } else {
    counters.forEach((el) => {
      el.textContent = el.dataset.counter;
    });
  }

  /* -------------------------------------------------------------------
     8. BRILHO DOS CARDS (BENTO)
     ------------------------------------------------------------------- */
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

  $$("[data-tilt], .bento__card--cta").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      if (!finePointer.matches) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      card.style.setProperty("--my", `${event.clientY - rect.top}px`);
    });
  });

  /* -------------------------------------------------------------------
     9. PORTFÓLIO COM SCROLL HORIZONTAL
     -------------------------------------------------------------------
     Desktop (mouse + tela ≥ 1024px): a seção fica "presa" (sticky) e a
     rolagem vertical da página é convertida em deslocamento horizontal
     da trilha de projetos, com suavização (lerp).
     Mobile/tablet/touch: rolagem horizontal nativa com scroll-snap,
     que responde naturalmente ao gesto de swipe.
     ------------------------------------------------------------------- */
  const portfolio = $("#portfolio");
  const viewport = $("#portfolioViewport");
  const track = $("#portfolioTrack");
  const prevBtn = $("#portfolioPrev");
  const nextBtn = $("#portfolioNext");
  const currentLabel = $("#portfolioCurrent");
  const totalLabel = $("#portfolioTotal");
  const progressBar = $("#portfolioProgress");
  const projectCards = $$(".project:not(.project--cta)", track);
  const allItems = $$(".project", track);

  const horizontalQuery = window.matchMedia(
    "(min-width: 1024px) and (hover: hover) and (pointer: fine)"
  );

  const portfolioState = {
    horizontal: false,
    distance: 0,
    sectionTop: 0,
    current: 0,
    target: 0,
    rafId: null
  };

  totalLabel.textContent = pad(projectCards.length);

  const setPortfolioUI = (progress) => {
    const safeProgress = clamp(progress, 0, 1);
    progressBar.style.transform = `scaleX(${safeProgress})`;

    const index = Math.round(safeProgress * (projectCards.length - 1));
    currentLabel.textContent = pad(index + 1);

    prevBtn.disabled = safeProgress <= 0.005;
    nextBtn.disabled = safeProgress >= 0.995;
  };

  const measurePortfolio = () => {
    const shouldBeHorizontal = horizontalQuery.matches && !prefersReducedMotion();

    if (shouldBeHorizontal !== portfolioState.horizontal) {
      portfolioState.horizontal = shouldBeHorizontal;
      portfolio.classList.toggle("is-horizontal", shouldBeHorizontal);

      if (!shouldBeHorizontal) {
        portfolio.style.height = "";
        track.style.transform = "";
        portfolioState.current = 0;
        portfolioState.target = 0;
      }
    }

    if (portfolioState.horizontal) {
      // Distância horizontal total = largura da trilha − largura visível
      portfolioState.distance = Math.max(track.scrollWidth - document.documentElement.clientWidth, 0);
      portfolio.style.height = `${window.innerHeight + portfolioState.distance}px`;
      portfolioState.sectionTop = portfolio.getBoundingClientRect().top + window.scrollY;
      updatePortfolioTarget(window.scrollY);
      portfolioState.current = portfolioState.target;
      track.style.transform = `translate3d(${-portfolioState.current}px, 0, 0)`;
      setPortfolioUI(portfolioState.distance ? portfolioState.current / portfolioState.distance : 0);
    } else {
      updateNativePortfolioUI();
    }
  };

  const updatePortfolioTarget = (scrollY) => {
    if (!portfolioState.horizontal) return;
    const offset = scrollY - portfolioState.sectionTop;
    portfolioState.target = clamp(offset, 0, portfolioState.distance);
  };

  const renderPortfolio = () => {
    const { target } = portfolioState;
    portfolioState.current = lerp(portfolioState.current, target, 0.12);

    if (Math.abs(target - portfolioState.current) < 0.3) {
      portfolioState.current = target;
    }

    track.style.transform = `translate3d(${-portfolioState.current.toFixed(2)}px, 0, 0)`;
    setPortfolioUI(portfolioState.distance ? portfolioState.current / portfolioState.distance : 0);

    if (portfolioState.current !== target) {
      portfolioState.rafId = requestAnimationFrame(renderPortfolio);
    } else {
      portfolioState.rafId = null;
    }
  };

  const requestPortfolioRender = () => {
    if (!portfolioState.horizontal || portfolioState.rafId) return;
    portfolioState.rafId = requestAnimationFrame(renderPortfolio);
  };

  const updateNativePortfolioUI = () => {
    const max = viewport.scrollWidth - viewport.clientWidth;
    setPortfolioUI(max > 0 ? viewport.scrollLeft / max : 0);
  };

  viewport.addEventListener(
    "scroll",
    () => {
      if (!portfolioState.horizontal) {
        updateNativePortfolioUI();
      }
    },
    { passive: true }
  );

  // Retorna a posição (offsetLeft relativo à trilha) de cada item
  const getItemPositions = () => {
    const trackPadding = parseFloat(getComputedStyle(track).paddingLeft) || 0;
    return allItems.map((item) => item.offsetLeft - trackPadding);
  };

  const goToPortfolioItem = (direction) => {
    const positions = getItemPositions();

    if (portfolioState.horizontal) {
      const current = portfolioState.target;
      let destination;

      if (direction > 0) {
        destination = positions.find((pos) => pos > current + 10);
        if (destination === undefined) destination = portfolioState.distance;
      } else {
        const previous = positions.filter((pos) => pos < current - 10);
        destination = previous.length ? previous[previous.length - 1] : 0;
      }

      destination = clamp(destination, 0, portfolioState.distance);
      window.scrollTo({
        top: portfolioState.sectionTop + destination,
        behavior: prefersReducedMotion() ? "auto" : "smooth"
      });
    } else {
      const current = viewport.scrollLeft;
      let destination;

      if (direction > 0) {
        destination = positions.find((pos) => pos > current + 10);
        if (destination === undefined) destination = viewport.scrollWidth;
      } else {
        const previous = positions.filter((pos) => pos < current - 10);
        destination = previous.length ? previous[previous.length - 1] : 0;
      }

      viewport.scrollTo({
        left: destination,
        behavior: prefersReducedMotion() ? "auto" : "smooth"
      });
    }
  };

  prevBtn.addEventListener("click", () => goToPortfolioItem(-1));
  nextBtn.addEventListener("click", () => goToPortfolioItem(1));

  // Navegação por teclado quando o foco está dentro do portfólio
  portfolio.addEventListener("keydown", (event) => {
    if (event.target.closest("input, textarea, select")) return;
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goToPortfolioItem(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      goToPortfolioItem(-1);
    }
  });

  // Ao focar um card via Tab no modo horizontal, rola até ele
  track.addEventListener("focusin", (event) => {
    if (!portfolioState.horizontal) return;
    const item = event.target.closest(".project");
    if (!item) return;
    const index = allItems.indexOf(item);
    const position = clamp(getItemPositions()[index], 0, portfolioState.distance);
    window.scrollTo({ top: portfolioState.sectionTop + position, behavior: "auto" });
  });

  // Mobile: arrastar com o mouse também funciona (útil em tablets híbridos)
  let isDragging = false;
  let dragMoved = false;
  let dragStartX = 0;
  let dragStartScroll = 0;

  viewport.addEventListener("pointerdown", (event) => {
    if (portfolioState.horizontal || event.pointerType !== "mouse") return;
    isDragging = true;
    dragMoved = false;
    dragStartX = event.clientX;
    dragStartScroll = viewport.scrollLeft;
  });

  viewport.addEventListener("pointermove", (event) => {
    if (!isDragging) return;
    const delta = event.clientX - dragStartX;

    if (!dragMoved && Math.abs(delta) > 6) {
      dragMoved = true;
      viewport.style.scrollSnapType = "none";
      viewport.setPointerCapture(event.pointerId);
    }

    if (dragMoved) {
      viewport.scrollLeft = dragStartScroll - delta;
    }
  });

  const endDrag = (event) => {
    if (!isDragging) return;
    isDragging = false;
    viewport.style.scrollSnapType = "";
    if (viewport.hasPointerCapture(event.pointerId)) {
      viewport.releasePointerCapture(event.pointerId);
    }
  };

  viewport.addEventListener("pointerup", endDrag);
  viewport.addEventListener("pointercancel", endDrag);

  // Um arraste não deve ser interpretado como clique na foto
  viewport.addEventListener(
    "click",
    (event) => {
      if (dragMoved) {
        event.preventDefault();
        event.stopPropagation();
        dragMoved = false;
      }
    },
    true
  );

  /* -------------------------------------------------------------------
     9b. LIGHTBOX — AMPLIAÇÃO DAS FOTOS DO PORTFÓLIO
     ------------------------------------------------------------------- */
  const lightbox = $("#lightbox");
  const lightboxImg = $("#lightboxImg");
  const lightboxTitle = $("#lightboxTitle");
  const lightboxCategory = $("#lightboxCategory");
  const lightboxCounter = $("#lightboxCounter");
  const lightboxPrev = $("#lightboxPrev");
  const lightboxNext = $("#lightboxNext");
  const lightboxClose = $("#lightboxClose");

  const galleryItems = projectCards.map((item) => {
    const media = $(".project__media", item);
    const img = $("img", media);
    return {
      media,
      src: img.getAttribute("src"),
      alt: img.getAttribute("alt"),
      title: $(".project__title", item).textContent.trim(),
      category: $(".project__category", item).textContent.trim()
    };
  });

  let lightboxIndex = 0;
  let lightboxTrigger = null;

  const showLightboxItem = (index) => {
    const total = galleryItems.length;
    lightboxIndex = (index + total) % total;
    const item = galleryItems[lightboxIndex];

    lightboxImg.classList.add("is-changing");
    const preload = new Image();
    preload.onload = preload.onerror = () => {
      lightboxImg.src = item.src;
      lightboxImg.alt = item.alt;
      lightboxImg.classList.remove("is-changing");
    };
    preload.src = item.src;

    lightboxTitle.textContent = item.title;
    lightboxCategory.textContent = item.category;
    lightboxCounter.textContent = `${pad(lightboxIndex + 1)} / ${pad(total)}`;
  };

  const openLightbox = (index) => {
    if (!lightbox || typeof lightbox.showModal !== "function") return;
    lightboxTrigger = document.activeElement;
    showLightboxItem(index);
    lightbox.showModal();
    document.body.classList.add("lightbox-open");
    lightboxClose.focus();
  };

  const closeLightbox = () => {
    if (lightbox.open) lightbox.close();
  };

  if (lightbox) {
    galleryItems.forEach((item, index) => {
      const { media } = item;
      media.setAttribute("tabindex", "0");
      media.setAttribute("role", "button");
      media.setAttribute("aria-label", `Ampliar foto: ${item.title}`);

      const badge = document.createElement("span");
      badge.className = "project__zoom";
      badge.setAttribute("aria-hidden", "true");
      badge.innerHTML =
        '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M16 16l4.5 4.5M11 8.5v5M8.5 11h5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg><span>Ampliar</span>';
      media.appendChild(badge);

      media.addEventListener("click", () => openLightbox(index));
      media.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openLightbox(index);
        }
      });
    });

    lightboxPrev.addEventListener("click", () => showLightboxItem(lightboxIndex - 1));
    lightboxNext.addEventListener("click", () => showLightboxItem(lightboxIndex + 1));
    lightboxClose.addEventListener("click", closeLightbox);

    // Clique fora da foto (no fundo escurecido) fecha
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox || event.target.classList.contains("lightbox__inner")) {
        closeLightbox();
      }
    });

    lightbox.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight") showLightboxItem(lightboxIndex + 1);
      if (event.key === "ArrowLeft") showLightboxItem(lightboxIndex - 1);
    });

    // Swipe horizontal no celular para trocar de foto
    let touchStartX = null;
    lightbox.addEventListener("touchstart", (event) => {
      touchStartX = event.touches[0].clientX;
    }, { passive: true });
    lightbox.addEventListener("touchend", (event) => {
      if (touchStartX === null) return;
      const delta = event.changedTouches[0].clientX - touchStartX;
      if (Math.abs(delta) > 50) showLightboxItem(lightboxIndex + (delta < 0 ? 1 : -1));
      touchStartX = null;
    }, { passive: true });

    lightbox.addEventListener("close", () => {
      document.body.classList.remove("lightbox-open");
      if (lightboxTrigger && typeof lightboxTrigger.focus === "function") {
        lightboxTrigger.focus({ preventScroll: true });
      }
    });
  }

  // Recalcula quando as imagens carregam (alteram a largura da trilha)
  $$("img", track).forEach((img) => {
    if (!img.complete) {
      img.addEventListener("load", debounce(measurePortfolio, 100), { once: true });
    }
  });

  /* -------------------------------------------------------------------
     10. TIMELINE DO PROCESSO
     ------------------------------------------------------------------- */
  const timeline = $("#timeline");
  const timelineFill = $("#timelineFill");

  const updateTimeline = () => {
    if (!timeline || !timelineFill) return;
    const rect = timeline.getBoundingClientRect();
    const start = window.innerHeight * 0.75;
    const progress = clamp((start - rect.top) / (rect.height * 0.9), 0, 1);
    const axis = desktopQuery.matches ? "X" : "Y";
    timelineFill.style.transform = `scale${axis}(${progress})`;
  };

  /* -------------------------------------------------------------------
     11. PARALLAX
     ------------------------------------------------------------------- */
  const heroImgs = $$(".hero__img");
  const hero = $(".hero");
  const ctaBg = $(".cta-banner__bg");
  const ctaSection = $(".cta-banner");

  const updateParallax = (scrollY) => {
    if (prefersReducedMotion()) return;

    if (heroImgs.length && scrollY < hero.offsetHeight) {
      heroImgs.forEach((img) => {
        img.style.translate = `0 ${scrollY * 0.25}px`;
      });
    }

    if (ctaBg && ctaSection) {
      const rect = ctaSection.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        const centerOffset = rect.top + rect.height / 2 - window.innerHeight / 2;
        ctaBg.style.transform = `translate3d(0, ${centerOffset * -0.15}px, 0)`;
      }
    }
  };

  /* -------------------------------------------------------------------
     12. BOTÃO FLUTUANTE DE WHATSAPP
     ------------------------------------------------------------------- */
  const whatsappFloat = $(".whatsapp-float");

  const updateWhatsappFloat = (scrollY) => {
    whatsappFloat.classList.toggle("is-visible", scrollY > window.innerHeight * 0.6);
  };

  /* -------------------------------------------------------------------
     13. FORMULÁRIO DE CONTATO
     -------------------------------------------------------------------
     Sem necessidade de backend: valida os campos e envia a solicitação
     formatada pelo WhatsApp comercial ou pelo cliente de e-mail do
     visitante, conforme o canal escolhido.
     ------------------------------------------------------------------- */
  const form = $("#contactForm");
  const formStatus = $("#formStatus");
  const phoneInput = $("#phone");
  const serviceSelect = $("#service");
  const submitBtn = $(".form__submit", form);
  const submitText = $(".form__submit-text", form);

  // Máscara de telefone brasileiro: (00) 00000-0000
  phoneInput.addEventListener("input", () => {
    const digits = phoneInput.value.replace(/\D/g, "").slice(0, 11);
    let masked = digits;

    if (digits.length > 10) {
      masked = digits.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, "($1) $2-$3");
    } else if (digits.length > 6) {
      masked = digits.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3");
    } else if (digits.length > 2) {
      masked = digits.replace(/^(\d{2})(\d{0,5})/, "($1) $2");
    } else if (digits.length > 0) {
      masked = digits.replace(/^(\d{0,2})/, "($1");
    }

    phoneInput.value = masked;
  });

  serviceSelect.addEventListener("change", () => {
    serviceSelect.classList.toggle("has-value", serviceSelect.value !== "");
  });

  const validators = {
    name: (value) => {
      if (!value.trim()) return "Informe seu nome.";
      if (value.trim().length < 3) return "O nome deve ter pelo menos 3 caracteres.";
      return "";
    },
    phone: (value) => {
      const digits = value.replace(/\D/g, "");
      if (!digits) return "Informe um telefone para contato.";
      if (digits.length < 10) return "Telefone incompleto. Inclua o DDD.";
      return "";
    },
    email: (value) => {
      if (!value.trim()) return "Informe seu e-mail.";
      const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      if (!pattern.test(value.trim())) return "Digite um e-mail válido.";
      return "";
    },
    service: (value) => (value ? "" : "Selecione o serviço de interesse."),
    message: (value) => {
      if (!value.trim()) return "Descreva brevemente seu projeto.";
      if (value.trim().length < 10) return "Escreva pelo menos 10 caracteres.";
      return "";
    },
    consent: (_value, field) => (field.checked ? "" : "É necessário autorizar o contato.")
  };

  const showFieldState = (fieldName, message) => {
    const field = form.elements[fieldName];
    const wrapper = field.closest(".form__field");
    const errorEl = $(`[data-error-for="${fieldName}"]`, form);

    if (errorEl) errorEl.textContent = message;
    field.setAttribute("aria-invalid", message ? "true" : "false");

    if (wrapper) {
      wrapper.classList.toggle("is-invalid", Boolean(message));
      wrapper.classList.toggle("is-valid", !message);
    }
  };

  const validateField = (fieldName) => {
    const field = form.elements[fieldName];
    const message = validators[fieldName](field.value, field);
    showFieldState(fieldName, message);
    return !message;
  };

  Object.keys(validators).forEach((fieldName) => {
    const field = form.elements[fieldName];
    const errorEl = $(`[data-error-for="${fieldName}"]`, form);
    if (errorEl) {
      errorEl.id = `error-${fieldName}`;
      field.setAttribute("aria-describedby", errorEl.id);
    }

    field.addEventListener("blur", () => {
      if (field.value || field.type === "checkbox") validateField(fieldName);
    });

    field.addEventListener("input", () => {
      if (field.getAttribute("aria-invalid") === "true") validateField(fieldName);
    });

    field.addEventListener("change", () => {
      if (field.getAttribute("aria-invalid") === "true") validateField(fieldName);
    });
  });

  const buildMessage = (data) =>
    [
      "*Nova solicitação pelo site — Conhariki Engenharia*",
      "",
      `*Nome:* ${data.name}`,
      `*Telefone:* ${data.phone}`,
      `*E-mail:* ${data.email}`,
      `*Serviço:* ${data.service}`,
      "",
      "*Mensagem:*",
      data.message
    ].join("\n");

  const setStatus = (message, type) => {
    formStatus.textContent = message;
    formStatus.classList.remove("is-success", "is-error");
    if (type) formStatus.classList.add(`is-${type}`);
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const results = Object.keys(validators).map(validateField);
    const isValid = results.every(Boolean);

    if (!isValid) {
      setStatus("Verifique os campos destacados.", "error");
      const firstInvalid = $('[aria-invalid="true"]', form);
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    const data = {
      name: form.elements.name.value.trim(),
      phone: form.elements.phone.value.trim(),
      email: form.elements.email.value.trim(),
      service: form.elements.service.value,
      message: form.elements.message.value.trim(),
      channel: form.elements.channel.value
    };

    submitBtn.classList.add("is-loading");
    submitText.textContent = "Preparando envio...";
    setStatus("", null);

    setTimeout(() => {
      const text = buildMessage(data);
      let url;

      if (data.channel === "email") {
        const subject = `Solicitação de proposta — ${data.service}`;
        const body = text.replace(/\*/g, "");
        url = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = url;
      } else {
        url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
        // Sem a flag "noopener" para que window.open retorne a referência
        // (com ela o retorno é sempre null); o opener é anulado manualmente.
        const opened = window.open(url, "_blank");
        if (opened) {
          opened.opener = null;
        } else {
          window.location.href = url;
        }
      }

      submitBtn.classList.remove("is-loading");
      submitText.textContent = "Enviar solicitação";
      setStatus(
        data.channel === "email"
          ? "Pronto! Seu aplicativo de e-mail foi aberto com a mensagem preenchida."
          : "Pronto! O WhatsApp foi aberto com sua mensagem. É só confirmar o envio.",
        "success"
      );

      form.reset();
      serviceSelect.classList.remove("has-value");
      $$(".form__field", form).forEach((wrapper) => wrapper.classList.remove("is-valid", "is-invalid"));
      $$("[aria-invalid]", form).forEach((field) => field.removeAttribute("aria-invalid"));
    }, 600);
  });

  /* -------------------------------------------------------------------
     14. LOOP DE SCROLL CENTRALIZADO
     ------------------------------------------------------------------- */
  let scrollTicking = false;

  const onScrollFrame = () => {
    const scrollY = window.scrollY;
    if (!isMenuOpen()) updateHeader(scrollY);
    updateActiveLink();
    updatePortfolioTarget(scrollY);
    requestPortfolioRender();
    updateTimeline();
    updateParallax(scrollY);
    updateWhatsappFloat(scrollY);
    revealSkipped();
    scrollTicking = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (!scrollTicking) {
        scrollTicking = true;
        requestAnimationFrame(onScrollFrame);
      }
    },
    { passive: true }
  );

  const onResize = debounce(() => {
    measurePortfolio();
    onScrollFrame();
  }, 120);

  window.addEventListener("resize", onResize);
  window.addEventListener("orientationchange", onResize);
  horizontalQuery.addEventListener("change", onResize);
  reducedMotionQuery.addEventListener("change", onResize);
  window.addEventListener("load", onResize);

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(onResize);
  }

  measurePortfolio();
  onScrollFrame();
})();
