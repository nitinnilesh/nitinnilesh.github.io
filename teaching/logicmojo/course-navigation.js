(function () {
  "use strict";

  const courseBase = "/teaching/logicmojo/";
  const topics = [
    { slug: "linear-regression", path: "linear-regression", label: "Linear Regression" },
    { slug: "polynomial-regression", path: "polynomial-regression", label: "Polynomial Regression" },
    { slug: "logistic-regression", path: "logistic-regression", label: "Logistic Regression" },
    { slug: "knn", path: "knn", label: "K-Nearest Neighbors" },
    { slug: "pca", path: "pca", label: "Principal Component Analysis" },
    { slug: "naive-bayes", path: "naive-bayes", label: "Naive Bayes" },
    { slug: "svm", path: "svm", label: "Support Vector Machines" },
    { slug: "decision-trees", path: "decision-trees", label: "Decision Trees" },
    { slug: "random-forests", path: "random-forests", label: "Random Forests" },
    { slug: "gradient-boosting", path: "gradient-boosting", label: "Gradient Boosting" },
    { slug: "model-evaluation", path: "model-evaluation", label: "Model Evaluation" },
    { slug: "time-series-forecasting", path: "time-series-forecasting", label: "Time-Series Forecasting" },
    {
      slug: "neural-networks",
      path: "neural-networks/class_1_foundations",
      label: "Neural-Network Foundations",
    },
    {
      slug: "ml-interview-preparation",
      path: "ml-interview-preparation",
      label: "ML Interview Preparation",
    },
  ];

  function topicUrl(topic) {
    return `${courseBase}${topic.path}/`;
  }

  function linkFor(topic, direction) {
    if (!topic) {
      const span = document.createElement("span");
      span.className = `lm-course-nav__step lm-course-nav__step--${direction} is-disabled`;
      span.setAttribute("aria-disabled", "true");
      span.innerHTML = direction === "previous"
        ? '<span aria-hidden="true">←</span><span>Previous</span>'
        : '<span>Next</span><span aria-hidden="true">→</span>';
      return span;
    }

    const link = document.createElement("a");
    link.className = `lm-course-nav__step lm-course-nav__step--${direction}`;
    link.href = topicUrl(topic);
    link.title = `${direction === "previous" ? "Previous" : "Next"}: ${topic.label}`;
    link.setAttribute("aria-label", link.title);
    link.innerHTML = direction === "previous"
      ? '<span aria-hidden="true">←</span><span>Previous</span>'
      : '<span>Next</span><span aria-hidden="true">→</span>';
    return link;
  }

  function buildNavigation() {
    if (document.getElementById("lm-course-navigation")) return;

    const relativePath = window.location.pathname.split(courseBase)[1] || "";
    const topicSlug = relativePath.split("/").filter(Boolean)[0];
    const currentIndex = topics.findIndex((topic) => topic.slug === topicSlug);
    if (currentIndex < 0) return;

    const current = topics[currentIndex];
    const root = document.createElement("div");
    root.id = "lm-course-navigation";
    root.innerHTML = `
      <section class="lm-course-nav__panel" id="lm-course-nav-panel" aria-label="LogicMojo lecture menu" hidden>
        <nav class="lm-course-nav__breadcrumbs" aria-label="Breadcrumb">
          <a href="/teaching/">Teaching</a>
          <span aria-hidden="true">/</span>
          <a href="/teaching/logicmojo-machine-learning/">LogicMojo Machine Learning</a>
          <span aria-hidden="true">/</span>
          <span aria-current="page">${current.label}</span>
        </nav>
        <div class="lm-course-nav__panel-heading">
          <div>
            <p class="lm-course-nav__eyebrow">Course contents</p>
            <h2>Lectures</h2>
          </div>
          <button class="lm-course-nav__close" type="button" aria-label="Close lecture menu">×</button>
        </div>
        <ol class="lm-course-nav__list"></ol>
      </section>
      <nav class="lm-course-nav__dock" aria-label="LogicMojo course navigation">
        <div class="lm-course-nav__previous"></div>
        <button class="lm-course-nav__menu-button" type="button" aria-expanded="false" aria-controls="lm-course-nav-panel">
          <span>LogicMojo course</span>
          <strong>${current.label}</strong>
        </button>
        <div class="lm-course-nav__next"></div>
      </nav>`;

    const list = root.querySelector(".lm-course-nav__list");
    topics.forEach((topic, index) => {
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.href = topicUrl(topic);
      link.innerHTML = `<span>${String(index + 1).padStart(2, "0")}</span><strong>${topic.label}</strong>`;
      if (index === currentIndex) {
        item.className = "is-current";
        link.setAttribute("aria-current", "page");
      }
      item.appendChild(link);
      list.appendChild(item);
    });

    root.querySelector(".lm-course-nav__previous").appendChild(linkFor(topics[currentIndex - 1], "previous"));
    root.querySelector(".lm-course-nav__next").appendChild(linkFor(topics[currentIndex + 1], "next"));
    document.body.appendChild(root);
    document.body.classList.add("lm-course-nav-ready");

    const panel = root.querySelector(".lm-course-nav__panel");
    const menuButton = root.querySelector(".lm-course-nav__menu-button");
    const closeButton = root.querySelector(".lm-course-nav__close");

    function setOpen(open) {
      panel.hidden = !open;
      menuButton.setAttribute("aria-expanded", String(open));
      if (open) closeButton.focus();
      else menuButton.focus();
    }

    menuButton.addEventListener("click", () => setOpen(panel.hidden));
    closeButton.addEventListener("click", () => setOpen(false));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !panel.hidden) setOpen(false);
    });
    document.addEventListener("click", (event) => {
      if (!panel.hidden && !root.contains(event.target)) setOpen(false);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildNavigation);
  } else {
    buildNavigation();
  }
})();
