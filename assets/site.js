(function () {
  document.documentElement.classList.add("js");
  const menuButton = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector("[data-primary-nav]");

  function closeMenu(returnFocus) {
    if (!menuButton || !nav) return;
    menuButton.setAttribute("aria-expanded", "false");
    nav.dataset.open = "false";
    if (returnFocus) menuButton.focus();
  }

  if (menuButton && nav) {
    menuButton.addEventListener("click", function () {
      const isOpen = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!isOpen));
      nav.dataset.open = String(!isOpen);
    });

    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) closeMenu(false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && nav.dataset.open === "true") closeMenu(true);
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 800) closeMenu(false);
    });
  }

  document.querySelectorAll("[data-current-year]").forEach(function (node) {
    node.textContent = String(new Date().getFullYear());
  });

  const legacyYear = document.getElementById("yr");
  if (legacyYear) legacyYear.textContent = String(new Date().getFullYear());

  const checklistItems = Array.from(document.querySelectorAll("[data-checklist-item]"));
  if (checklistItems.length) {
    const storageKey = "dge-dating-app-reset-v1";
    const completeNode = document.querySelector("[data-checklist-complete]");
    const totalNode = document.querySelector("[data-checklist-total]");
    const meter = document.querySelector("[data-checklist-meter]");

    function renderChecklist() {
      const complete = checklistItems.filter(function (item) { return item.checked; }).length;
      if (completeNode) completeNode.textContent = String(complete);
      if (totalNode) totalNode.textContent = String(checklistItems.length);
      if (meter) meter.style.width = String((complete / checklistItems.length) * 100) + "%";
    }

    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
      checklistItems.forEach(function (item, index) { item.checked = saved[index] === true; });
    } catch (error) {
      // Storage can be unavailable in privacy-focused browsers; the checklist still works.
    }

    checklistItems.forEach(function (item) {
      item.addEventListener("change", function () {
        try {
          localStorage.setItem(storageKey, JSON.stringify(checklistItems.map(function (entry) { return entry.checked; })));
        } catch (error) {
          // Keep the in-page state even when local storage is unavailable.
        }
        renderChecklist();
      });
    });

    const resetButton = document.querySelector("[data-checklist-reset]");
    if (resetButton) resetButton.addEventListener("click", function () {
      checklistItems.forEach(function (item) { item.checked = false; });
      try { localStorage.removeItem(storageKey); } catch (error) { /* no-op */ }
      renderChecklist();
    });

    const printButton = document.querySelector("[data-print-checklist]");
    if (printButton) printButton.addEventListener("click", function () { window.print(); });
    renderChecklist();
  }
})();
