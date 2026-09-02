(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const nav = document.getElementById("siteNav");
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");
  const progressBar = document.getElementById("scrollProgress");
  const heroBrand = document.getElementById("heroBrand");
  const analytics = window.MedCaliperAnalytics;

  const closeMenu = () => {
    if (!menuToggle || !navLinks) return;
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");
    navLinks.classList.remove("open");
    nav?.classList.remove("menu-active");
    document.body.classList.remove("menu-open");
  };

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      const willOpen = menuToggle.getAttribute("aria-expanded") !== "true";
      menuToggle.setAttribute("aria-expanded", String(willOpen));
      menuToggle.setAttribute(
        "aria-label",
        willOpen ? "Close navigation menu" : "Open navigation menu"
      );
      navLinks.classList.toggle("open", willOpen);
      nav?.classList.toggle("menu-active", willOpen);
      document.body.classList.toggle("menu-open", willOpen);
    });

    navLinks.addEventListener("click", (event) => {
      if (event.target.closest("a")) closeMenu();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 860) closeMenu();
    });
  }

  const updateScrollUI = () => {
    const scrollTop = window.scrollY;
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = documentHeight > 0 ? (scrollTop / documentHeight) * 100 : 0;
    const isPrivacyPage = document.body.classList.contains("privacy-page");

    nav?.classList.toggle("scrolled", scrollTop > 72 || isPrivacyPage);
    if (progressBar) progressBar.style.width = `${Math.min(progress, 100)}%`;

    if (heroBrand) {
      if (reduceMotion) {
        heroBrand.style.opacity = scrollTop > 72 ? "0" : "1";
        heroBrand.style.transform = "none";
      } else {
        const transitionDistance = Math.max(window.innerHeight * 0.22, 180);
        const brandProgress = Math.min(scrollTop / transitionDistance, 1);
        heroBrand.style.opacity = String(1 - brandProgress);
        heroBrand.style.transform =
          `translateY(${brandProgress * -22}px) scale(${1 - brandProgress * 0.08})`;
      }
    }
  };

  updateScrollUI();
  window.addEventListener("scroll", updateScrollUI, { passive: true });

  const revealElements = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealElements.forEach((element) => element.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px" }
    );

    revealElements.forEach((element) => revealObserver.observe(element));
  }

  const trackedSections = Array.from(
    document.querySelectorAll("main section[id]")
  );
  const navigationAnchors = Array.from(
    document.querySelectorAll('.nav-links a[href^="#"]')
  );

  if ("IntersectionObserver" in window && trackedSections.length) {
    const activeSectionObserver = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visibleEntry) return;
        navigationAnchors.forEach((anchor) => {
          anchor.classList.toggle(
            "active",
            anchor.getAttribute("href") === `#${visibleEntry.target.id}`
          );
        });
      },
      { rootMargin: "-25% 0px -60% 0px", threshold: [0, 0.25, 0.5] }
    );

    trackedSections.forEach((section) => activeSectionObserver.observe(section));
  }

  const insightPanel = document.getElementById("insightPanel");
  if (insightPanel && !reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    insightPanel.addEventListener("pointermove", (event) => {
      const bounds = insightPanel.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      insightPanel.style.transform =
        `perspective(900px) rotateX(${y * -4}deg) rotateY(${x * 5}deg) translateY(-2px)`;
    });

    insightPanel.addEventListener("pointerleave", () => {
      insightPanel.style.transform = "";
    });
  }

  const year = document.getElementById("currentYear");
  if (year) year.textContent = new Date().getFullYear();

  // Privacy and analytics preferences
  const consentBanner = document.getElementById("consentBanner");
  const acceptButton = document.getElementById("acceptAnalytics");
  const declineButton = document.getElementById("declineAnalytics");
  const settingsButton = document.getElementById("privacySettings");
  const privacyDialog = document.getElementById("privacyDialog");
  const preferenceInput = document.getElementById("analyticsPreference");
  const savePreferences = document.getElementById("savePrivacyPreferences");

  const hideBanner = () => {
    if (consentBanner) consentBanner.hidden = true;
  };

  const showBannerWhenNeeded = () => {
    if (!consentBanner || !analytics) return;
    if (analytics.getConsent() === null) {
      consentBanner.hidden = false;
    }
  };

  const openPrivacyDialog = () => {
    if (!privacyDialog || !analytics) return;
    if (preferenceInput) {
      preferenceInput.checked = analytics.getConsent() === "granted";
    }

    if (typeof privacyDialog.showModal === "function") {
      privacyDialog.showModal();
    } else {
      privacyDialog.setAttribute("open", "");
    }
  };

  acceptButton?.addEventListener("click", () => {
    analytics?.setConsent(true);
    hideBanner();
  });

  declineButton?.addEventListener("click", () => {
    analytics?.setConsent(false);
    hideBanner();
  });

  settingsButton?.addEventListener("click", openPrivacyDialog);

  savePreferences?.addEventListener("click", () => {
    analytics?.setConsent(Boolean(preferenceInput?.checked));
    hideBanner();
    privacyDialog?.close();
  });

  privacyDialog?.addEventListener("click", (event) => {
    if (event.target === privacyDialog) privacyDialog.close();
  });

  showBannerWhenNeeded();
})();
