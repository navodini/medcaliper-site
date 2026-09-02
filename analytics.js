/*
 * medCaliper consent-aware analytics
 *
 * Activation:
 * 1. Create a Google Analytics 4 property for medcaliper.co.uk.
 * 2. Replace G-XXXXXXXXXX below with its Measurement ID.
 * 3. Keep the privacy notice in privacy.html aligned with your property settings.
 *
 * The Google tag is not requested until a visitor explicitly accepts analytics.
 */
(() => {
  "use strict";

  const CONSENT_KEY = "medcaliper_analytics_consent_v1";
  const MEASUREMENT_ID = "G-XXXXXXXXXX";
  let analyticsLoaded = false;

  const hasValidMeasurementId = () =>
    /^G-[A-Z0-9]{6,}$/i.test(MEASUREMENT_ID) &&
    !MEASUREMENT_ID.includes("XXXX");

  const getConsent = () => {
    try {
      const value = localStorage.getItem(CONSENT_KEY);
      return value === "granted" || value === "denied" ? value : null;
    } catch {
      return null;
    }
  };

  const storeConsent = (value) => {
    try {
      localStorage.setItem(CONSENT_KEY, value);
    } catch {
      // The site remains usable if storage is unavailable.
    }
  };

  const clearAnalyticsCookies = () => {
    const cookieNames = document.cookie
      .split(";")
      .map((cookie) => cookie.trim().split("=")[0])
      .filter((name) => name === "_ga" || name.startsWith("_ga_"));

    const hostnameParts = window.location.hostname.split(".");
    const domains = [window.location.hostname];

    if (hostnameParts.length > 2) {
      domains.push("." + hostnameParts.slice(-2).join("."));
    }

    cookieNames.forEach((name) => {
      domains.forEach((domain) => {
        document.cookie = `${name}=; Max-Age=0; path=/; domain=${domain}; SameSite=Lax`;
      });
      document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
    });
  };

  const loadAnalytics = () => {
    if (analyticsLoaded || getConsent() !== "granted" || !hasValidMeasurementId()) {
      return false;
    }

    analyticsLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function gtag() {
      window.dataLayer.push(arguments);
    };

    window.gtag("js", new Date());
    window.gtag("config", MEASUREMENT_ID, {
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(MEASUREMENT_ID)}`;
    script.referrerPolicy = "strict-origin-when-cross-origin";
    document.head.appendChild(script);

    track("page_view", {
      page_title: document.title,
      page_path: window.location.pathname
    });

    document.dispatchEvent(new CustomEvent("medcaliper:analytics-ready"));
    return true;
  };

  const track = (eventName, parameters = {}) => {
    if (
      getConsent() !== "granted" ||
      !hasValidMeasurementId() ||
      typeof window.gtag !== "function"
    ) {
      return;
    }

    const safeParameters = Object.fromEntries(
      Object.entries(parameters)
        .filter(([, value]) => ["string", "number", "boolean"].includes(typeof value))
        .map(([key, value]) => [
          key,
          typeof value === "string" ? value.slice(0, 100) : value
        ])
    );

    window.gtag("event", eventName, safeParameters);
  };

  const setConsent = (granted) => {
    const value = granted ? "granted" : "denied";
    storeConsent(value);

    if (granted) {
      loadAnalytics();
    } else {
      clearAnalyticsCookies();
    }

    document.dispatchEvent(
      new CustomEvent("medcaliper:consent-changed", {
        detail: { value }
      })
    );
  };

  const setupInteractionTracking = () => {
    document.addEventListener("click", (event) => {
      const target = event.target.closest("[data-track-event]");
      if (!target) return;

      track(target.dataset.trackEvent, {
        item_label: target.dataset.trackLabel || "Unlabelled interaction"
      });
    });

    document.querySelectorAll("[data-track-details]").forEach((details) => {
      details.addEventListener("toggle", () => {
        if (details.open) {
          track("faq_open", {
            item_label: details.dataset.trackDetails
          });
        }
      });
    });

    if ("IntersectionObserver" in window) {
      const viewedSections = new Set();
      const sectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const label = entry.target.dataset.trackSection;
            if (entry.isIntersecting && !viewedSections.has(label)) {
              viewedSections.add(label);
              track("section_view", { section_name: label });
              sectionObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.35 }
      );

      document
        .querySelectorAll("[data-track-section]")
        .forEach((section) => sectionObserver.observe(section));
    }

    const video = document.getElementById("explainerVideo");
    if (video) {
      const reachedMilestones = new Set();
      let started = false;

      video.addEventListener("play", () => {
        if (!started) {
          started = true;
          track("video_start", { video_title: "medCaliper explainer" });
        } else {
          track("video_resume", { video_title: "medCaliper explainer" });
        }
      });

      video.addEventListener("pause", () => {
        if (!video.ended && video.currentTime > 0) {
          track("video_pause", {
            video_title: "medCaliper explainer",
            video_percent: Math.round((video.currentTime / video.duration) * 100) || 0
          });
        }
      });

      video.addEventListener("timeupdate", () => {
        if (!Number.isFinite(video.duration) || video.duration === 0) return;
        const progress = (video.currentTime / video.duration) * 100;

        [25, 50, 75].forEach((milestone) => {
          if (progress >= milestone && !reachedMilestones.has(milestone)) {
            reachedMilestones.add(milestone);
            track("video_progress", {
              video_title: "medCaliper explainer",
              video_percent: milestone
            });
          }
        });
      });

      video.addEventListener("ended", () => {
        track("video_complete", { video_title: "medCaliper explainer" });
      });
    }
  };

  window.MedCaliperAnalytics = Object.freeze({
    getConsent,
    setConsent,
    track,
    load: loadAnalytics,
    isConfigured: hasValidMeasurementId
  });

  setupInteractionTracking();

  if (getConsent() === "granted") {
    loadAnalytics();
  }
})();
