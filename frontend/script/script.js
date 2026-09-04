document.addEventListener("DOMContentLoaded", () => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ----------------------------------------------------------------
       Header: estado no scroll + navegacao mobile + link ativo
       ---------------------------------------------------------------- */
    const header = document.querySelector("header");
    const navToggle = document.querySelector(".nav-toggle");
    const headerNav = document.querySelector(".header-nav");
    const navLinks = document.querySelectorAll(".header-nav a");

    const onScroll = () => {
        header.classList.toggle("is-scrolled", window.scrollY > 12);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    if (navToggle && headerNav) {
        navToggle.addEventListener("click", () => {
            const isOpen = headerNav.classList.toggle("is-open");
            navToggle.classList.toggle("is-open", isOpen);
            navToggle.setAttribute("aria-expanded", String(isOpen));
        });

        navLinks.forEach((link) => {
            link.addEventListener("click", () => {
                headerNav.classList.remove("is-open");
                navToggle.classList.remove("is-open");
                navToggle.setAttribute("aria-expanded", "false");
            });
        });
    }

    const sections = ["sobre", "projetos", "contato"]
        .map((id) => document.getElementById(id))
        .filter(Boolean);

    if (sections.length && "IntersectionObserver" in window) {
        const navObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    navLinks.forEach((link) => {
                        link.classList.toggle(
                            "is-active",
                            link.getAttribute("href") === `#${entry.target.id}`
                        );
                    });
                });
            },
            { rootMargin: "-45% 0px -50% 0px" }
        );
        sections.forEach((section) => navObserver.observe(section));
    }

    /* ----------------------------------------------------------------
       Scroll reveal genérico (aplicado com moderação: cabeçalhos de
       seção e os dois blocos principais, não em cada item individual)
       ---------------------------------------------------------------- */
    const revealTargets = document.querySelectorAll(".reveal");

    if (revealTargets.length) {
        if (prefersReducedMotion || !("IntersectionObserver" in window)) {
            revealTargets.forEach((el) => el.classList.add("is-visible"));
        } else {
            const revealObserver = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add("is-visible");
                            revealObserver.unobserve(entry.target);
                        }
                    });
                },
                { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
            );
            revealTargets.forEach((el) => revealObserver.observe(el));
        }
    }

    /* ----------------------------------------------------------------
       Marca geométrica do painel de specs: desenha-se ao entrar em cena
       ---------------------------------------------------------------- */
    const specsPanel = document.querySelector(".specs-panel");

    if (specsPanel) {
        if (prefersReducedMotion || !("IntersectionObserver" in window)) {
            specsPanel.classList.add("is-visible");
        } else {
            const specsObserver = new IntersectionObserver((entries, obs) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        obs.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.3 });
            specsObserver.observe(specsPanel);
        }
    }

    /* ----------------------------------------------------------------
       Navegador de projetos (índice à esquerda + painel à direita)
       ---------------------------------------------------------------- */
    const projectItems = document.querySelectorAll(".project-index__item");
    const projectPanels = document.querySelectorAll(".project-panel");

    projectItems.forEach((item) => {
        item.addEventListener("click", () => {
            const target = item.getAttribute("data-project");
            if (!target) return;

            projectItems.forEach((el) => {
                const isMatch = el.getAttribute("data-project") === target;
                el.classList.toggle("is-active", isMatch);
                el.setAttribute("aria-selected", String(isMatch));
            });

            projectPanels.forEach((panel) => {
                panel.classList.toggle("is-active", panel.getAttribute("data-project") === target);
            });
        });
    });

    /* ----------------------------------------------------------------
       Sliders (documentos e projetos) + Lightbox
       ---------------------------------------------------------------- */
    const containers = document.querySelectorAll(".slides-wrapper");
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    const lightboxClose = document.querySelector(".lightbox-close");

    containers.forEach((container) => {
        const slides = container.querySelectorAll(".slide");
        const dotsNav = container.parentElement
            ? container.parentElement.querySelector(".dots-nav")
            : null;
        let currentSlide = 0;
        let dots = [];

        if (slides.length === 0) {
            return;
        }

        if (dotsNav && slides.length > 1) {
            slides.forEach((_, index) => {
                const dot = document.createElement("div");
                dot.classList.add("dot");
                dot.setAttribute("role", "button");
                dot.setAttribute("aria-label", `Ir para imagem ${index + 1}`);

                if (index === 0) {
                    dot.classList.add("active");
                }

                dot.addEventListener("click", () => {
                    mudarParaSlide(index);
                });

                dotsNav.appendChild(dot);
                dots.push(dot);
            });
        }

        if (slides[0]) {
            slides[0].classList.add("active");
        }

        const imagensDoSlider = container.querySelectorAll(".slide img");
        imagensDoSlider.forEach((img) => {
            img.style.cursor = "zoom-in";
            img.addEventListener("click", () => {
                if (!lightbox || !lightboxImg) return;
                lightboxImg.src = img.src;
                lightboxImg.alt = img.alt || "";
                lightbox.classList.add("show");
            });
        });

        let touchStartX = 0;
        let touchEndX = 0;

        container.addEventListener(
            "touchstart",
            (event) => {
                touchStartX = event.changedTouches[0].screenX;
            },
            { passive: true }
        );

        container.addEventListener(
            "touchend",
            (event) => {
                touchEndX = event.changedTouches[0].screenX;

                const limiteDistancia = 50;
                const diferenca = touchStartX - touchEndX;

                if (Math.abs(diferenca) > limiteDistancia && dotsNav) {
                    if (diferenca > 0) {
                        const proximoIndice = (currentSlide + 1) % slides.length;
                        mudarParaSlide(proximoIndice);
                    } else {
                        const indiceAnterior = (currentSlide - 1 + slides.length) % slides.length;
                        mudarParaSlide(indiceAnterior);
                    }
                }
            },
            { passive: true }
        );

        function mudarParaSlide(index) {
            slides[currentSlide].classList.remove("active");
            if (dots[currentSlide]) {
                dots[currentSlide].classList.remove("active");
            }

            currentSlide = index;

            slides[currentSlide].classList.add("active");
            if (dots[currentSlide]) {
                dots[currentSlide].classList.add("active");
            }
        }
    });

    if (lightboxClose && lightbox) {
        lightboxClose.addEventListener("click", () => {
            lightbox.classList.remove("show");
        });

        lightbox.addEventListener("click", (evento) => {
            if (evento.target === lightbox) {
                lightbox.classList.remove("show");
            }
        });

        document.addEventListener("keydown", (evento) => {
            if (evento.key === "Escape") {
                lightbox.classList.remove("show");
            }
        });
    }
    (function () {
        const botao = document.getElementById('quero-meu-site');
        if (!botao) return;

        let carregando = false;
        let carregado = false;

        botao.addEventListener('click', () => {
            if (carregado) {
                window.NixxLeadWidget.open();
                return;
            }
            if (carregando) return;
            carregando = true;

            const script = document.createElement('script');
            script.src = 'lead-widget/lead-widget.js';
            script.onload = () => {
                carregado = true;
                carregando = false;
                window.NixxLeadWidget.open();
            };
            document.body.appendChild(script);
        });
    })();
});