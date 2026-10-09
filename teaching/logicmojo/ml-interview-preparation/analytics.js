(function () {
  "use strict";

  const measurementId = "G-542ZGVBSCS";
  const consentKey = "nitinnilesh-analytics-consent";
  const validMeasurementId = /^G-[A-Z0-9]+$/.test(measurementId) && measurementId !== "G-XXXXXXXXXX";

  if (!validMeasurementId) return;

  function loadGoogleAnalytics() {
    if (window.__logicMojoAnalyticsLoaded) return;
    window.__logicMojoAnalyticsLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", measurementId, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    });

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    document.head.appendChild(script);
    bindCourseEvents();
  }

  function track(name, parameters) {
    if (window.__logicMojoAnalyticsLoaded && window.gtag) {
      window.gtag("event", name, parameters || {});
    }
  }

  function bindCourseEvents() {
    document.addEventListener("click", (event) => {
      const link = event.target.closest("a");
      if (!link) return;

      const url = new URL(link.href, window.location.href);
      const parameters = {
        link_text: (link.textContent || "").trim().slice(0, 100),
        link_url: url.href,
      };

      if (link.closest("#lm-course-navigation")) {
        track("course_navigation", parameters);
      } else if (link.closest(".navlinks, .pager")) {
        track("lesson_navigation", parameters);
      } else if (url.origin !== window.location.origin) {
        track("outbound_resource", parameters);
      }
    });

    const reached = new Set();
    window.addEventListener("scroll", () => {
      const available = document.documentElement.scrollHeight - window.innerHeight;
      if (available <= 0) return;
      const percentage = Math.round((window.scrollY / available) * 100);
      [25, 50, 75, 90].forEach((milestone) => {
        if (percentage >= milestone && !reached.has(milestone)) {
          reached.add(milestone);
          track("lesson_scroll", { percent_scrolled: milestone });
        }
      });
    }, { passive: true });

    const discussion = document.getElementById("discussion");
    if (discussion && "IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          track("discussion_view");
          observer.disconnect();
        }
      }, { threshold: 0.25 });
      observer.observe(discussion);
    }
  }

  function saveChoice(choice) {
    localStorage.setItem(consentKey, choice);
    document.querySelector(".lm-consent")?.remove();
    if (choice === "granted") loadGoogleAnalytics();
  }

  function showConsent() {
    if (document.querySelector(".lm-consent")) return;
    const banner = document.createElement("aside");
    banner.className = "lm-consent";
    banner.setAttribute("aria-label", "Analytics preferences");
    banner.innerHTML = `
      <div>
        <strong>Help improve this course</strong>
        <p>Optional analytics show which lessons are useful and where readers get stuck. No advertising or personalized marketing is used. <a href="/privacy/">Privacy details</a></p>
      </div>
      <div class="lm-consent__actions">
        <button type="button" data-consent="denied">No thanks</button>
        <button type="button" class="is-primary" data-consent="granted">Allow analytics</button>
      </div>`;
    banner.addEventListener("click", (event) => {
      const choice = event.target.closest("[data-consent]")?.dataset.consent;
      if (choice) saveChoice(choice);
    });
    document.body.appendChild(banner);
  }

  const savedChoice = localStorage.getItem(consentKey);
  if (savedChoice === "granted") loadGoogleAnalytics();
  else if (savedChoice !== "denied") showConsent();
})();
