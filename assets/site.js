(function () {
  document.documentElement.classList.add("js");
  const themeStorageKey = "dge-theme";
  const themeButtons = Array.from(document.querySelectorAll("[data-theme-toggle]"));

  function activeTheme() {
    return document.documentElement.dataset.theme === "light" ? "light" : "dark";
  }

  function renderTheme(theme, persist) {
    const nextTheme = theme === "light" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    const nextLabel = nextTheme === "light" ? "Switch to dark theme" : "Switch to light theme";
    themeButtons.forEach(function (button) {
      button.setAttribute("aria-label", nextLabel);
      button.setAttribute("title", nextLabel);
    });
    if (persist) {
      try { localStorage.setItem(themeStorageKey, nextTheme); } catch (error) { /* The visual toggle still works. */ }
    }
  }

  renderTheme(activeTheme(), false);
  themeButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      renderTheme(activeTheme() === "light" ? "dark" : "light", true);
    });
  });

  window.addEventListener("storage", function (event) {
    if (event.key === themeStorageKey && (event.newValue === "light" || event.newValue === "dark")) {
      renderTheme(event.newValue, false);
    }
  });

  const menuButton = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector("[data-primary-nav]");
  const navGroups = Array.from(document.querySelectorAll("[data-nav-group]"));

  function closeNavGroup(group, returnFocus) {
    if (!group) return;
    const trigger = group.querySelector("[data-nav-trigger]");
    const submenu = group.querySelector("[data-nav-submenu]");
    if (!trigger || !submenu) return;
    trigger.setAttribute("aria-expanded", "false");
    submenu.dataset.open = "false";
    if (returnFocus) trigger.focus();
  }

  function closeNavGroups(exceptGroup) {
    navGroups.forEach(function (group) {
      if (group !== exceptGroup) closeNavGroup(group, false);
    });
  }

  function openNavGroup(group, focusFirstLink) {
    const trigger = group.querySelector("[data-nav-trigger]");
    const submenu = group.querySelector("[data-nav-submenu]");
    if (!trigger || !submenu) return;
    closeNavGroups(group);
    trigger.setAttribute("aria-expanded", "true");
    submenu.dataset.open = "true";
    if (focusFirstLink) {
      const firstLink = submenu.querySelector("a");
      if (firstLink) firstLink.focus();
    }
  }

  function closeMenu(returnFocus) {
    if (!menuButton || !nav) return;
    menuButton.setAttribute("aria-expanded", "false");
    nav.dataset.open = "false";
    closeNavGroups();
    if (returnFocus) menuButton.focus();
  }

  if (menuButton && nav) {
    menuButton.addEventListener("click", function () {
      const isOpen = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!isOpen));
      nav.dataset.open = String(!isOpen);
      if (isOpen) closeNavGroups();
    });

    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) closeMenu(false);
    });

    navGroups.forEach(function (group) {
      const trigger = group.querySelector("[data-nav-trigger]");
      const submenu = group.querySelector("[data-nav-submenu]");
      if (!trigger || !submenu) return;

      trigger.addEventListener("click", function () {
        const isOpen = trigger.getAttribute("aria-expanded") === "true";
        if (isOpen) closeNavGroup(group, false);
        else openNavGroup(group, false);
      });

      trigger.addEventListener("keydown", function (event) {
        if (event.key === "ArrowDown") {
          event.preventDefault();
          openNavGroup(group, true);
        }
      });

      submenu.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
          event.preventDefault();
          closeNavGroup(group, true);
        }
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape") return;
      const openGroup = navGroups.find(function (group) {
        return group.querySelector("[data-nav-trigger]")?.getAttribute("aria-expanded") === "true";
      });
      if (openGroup) {
        event.preventDefault();
        closeNavGroup(openGroup, true);
      } else if (nav.dataset.open === "true") {
        closeMenu(true);
      }
    });

    document.addEventListener("click", function (event) {
      if (!event.target.closest(".publisher-header")) closeNavGroups();
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

  const guideLibrary = document.querySelector("[data-guide-library]");
  if (guideLibrary) {
    const searchInput = guideLibrary.querySelector("[data-guide-search]");
    const filterButtons = Array.from(guideLibrary.querySelectorAll("[data-guide-filter]"));
    const guideItems = Array.from(guideLibrary.querySelectorAll("[data-guide-item]"));
    const resultCount = guideLibrary.querySelector("[data-guide-count]");
    const emptyState = guideLibrary.querySelector("[data-guide-empty]");
    const clearButton = guideLibrary.querySelector("[data-guide-clear]");
    const filters = { topic: "all", format: "all" };

    function normalized(value) {
      return String(value || "").trim().toLowerCase();
    }

    function updateGuideAddress() {
      const url = new URL(window.location.href);
      const query = normalized(searchInput?.value);
      if (query) url.searchParams.set("q", query);
      else url.searchParams.delete("q");
      Object.keys(filters).forEach(function (name) {
        if (filters[name] === "all") url.searchParams.delete(name);
        else url.searchParams.set(name, filters[name]);
      });
      window.history.replaceState({}, "", url.pathname + url.search + url.hash);
    }

    function renderGuideLibrary() {
      const query = normalized(searchInput?.value);
      let visible = 0;
      guideItems.forEach(function (item) {
        const matchesQuery = !query || normalized(item.dataset.guideSearch).includes(query);
        const matchesTopic = filters.topic === "all" || item.dataset.guideTopic === filters.topic;
        const matchesFormat = filters.format === "all" || item.dataset.guideFormat === filters.format;
        item.hidden = !(matchesQuery && matchesTopic && matchesFormat);
        if (!item.hidden) visible += 1;
      });
      if (resultCount) resultCount.textContent = `${visible} guide${visible === 1 ? "" : "s"} shown`;
      if (emptyState) emptyState.hidden = visible !== 0;
      updateGuideAddress();
    }

    function selectGuideFilter(button) {
      const group = button.dataset.guideFilter;
      if (!Object.prototype.hasOwnProperty.call(filters, group)) return;
      filters[group] = button.dataset.guideValue || "all";
      filterButtons.filter(function (candidate) { return candidate.dataset.guideFilter === group; }).forEach(function (candidate) {
        candidate.setAttribute("aria-pressed", String(candidate === button));
      });
      renderGuideLibrary();
    }

    const initialUrl = new URL(window.location.href);
    if (searchInput) {
      searchInput.value = initialUrl.searchParams.get("q") || "";
      searchInput.addEventListener("input", renderGuideLibrary);
    }
    Object.keys(filters).forEach(function (group) {
      const requested = initialUrl.searchParams.get(group);
      const requestedButton = filterButtons.find(function (button) {
        return button.dataset.guideFilter === group && button.dataset.guideValue === requested;
      });
      if (requestedButton) {
        filters[group] = requested;
        filterButtons.filter(function (button) { return button.dataset.guideFilter === group; }).forEach(function (button) {
          button.setAttribute("aria-pressed", String(button === requestedButton));
        });
      }
    });
    filterButtons.forEach(function (button) {
      button.addEventListener("click", function () { selectGuideFilter(button); });
    });
    if (clearButton) clearButton.addEventListener("click", function () {
      if (searchInput) searchInput.value = "";
      filters.topic = "all";
      filters.format = "all";
      filterButtons.forEach(function (button) {
        button.setAttribute("aria-pressed", String(button.dataset.guideValue === "all"));
      });
      renderGuideLibrary();
      if (searchInput) searchInput.focus();
    });
    renderGuideLibrary();
  }

  const compareInputs = Array.from(document.querySelectorAll("[data-compare-app]"));
  if (compareInputs.length) {
    const maximumApps = 3;
    const compareButton = document.querySelector("[data-compare-run]");
    const clearButton = document.querySelector("[data-compare-clear]");
    const statusNode = document.querySelector("[data-compare-status]");
    const resultsSection = document.querySelector("[data-compare-results]");
    const resultsHeading = document.querySelector("[data-compare-heading]");
    const resultCardGrid = document.querySelector("[data-compare-card-grid]");
    const overviewRows = new Map(Array.from(document.querySelectorAll("[data-compare-row]")).map(function (row) {
      return [row.dataset.compareRow, row];
    }));
    const comparisonCells = Array.from(document.querySelectorAll("[data-compare-column]"));
    const validApps = new Set(compareInputs.map(function (input) { return input.value; }));

    function selectedInputs() {
      return compareInputs.filter(function (input) { return input.checked; });
    }

    function selectedNames() {
      return selectedInputs().map(function (input) { return input.dataset.compareName || input.value; });
    }

    function selectedValues() {
      return selectedInputs().map(function (input) { return input.value; });
    }

    function joinNames(names) {
      if (names.length < 2) return names.join("");
      if (names.length === 2) return names.join(" vs ");
      return names.slice(0, -1).join(", ") + " and " + names[names.length - 1];
    }

    function updateControls(message) {
      const selected = selectedInputs();
      const atMaximum = selected.length >= maximumApps;
      compareInputs.forEach(function (input) {
        input.disabled = atMaximum && !input.checked;
      });
      if (compareButton) compareButton.disabled = selected.length < 2;
      if (!statusNode) return;
      if (message) {
        statusNode.textContent = message;
      } else if (selected.length === 0) {
        statusNode.textContent = "Select two or three apps to build a focused comparison.";
      } else if (selected.length === 1) {
        statusNode.textContent = "One app selected. Choose at least one more.";
      } else if (selected.length === 2) {
        statusNode.textContent = "Two apps selected. Compare now or add one more.";
      } else {
        statusNode.textContent = "Three apps selected. This is the maximum.";
      }
    }

    function updateAddress(values) {
      const url = new URL(window.location.href);
      if (values.length) url.searchParams.set("apps", values.join(","));
      else url.searchParams.delete("apps");
      window.history.replaceState({}, "", url.pathname + url.search + url.hash);
    }

    function renderComparisonCards(values) {
      if (!resultCardGrid) return;
      resultCardGrid.replaceChildren();
      values.forEach(function (value) {
        const sourceRow = overviewRows.get(value);
        if (!sourceRow) return;
        const card = document.createElement("article");
        card.className = "compare-result-card";
        card.dataset.compareColumn = value;

        const heading = document.createElement("h3");
        heading.textContent = sourceRow.querySelector("th")?.textContent || value;
        card.appendChild(heading);

        const details = document.createElement("dl");
        sourceRow.querySelectorAll("td[data-label]").forEach(function (sourceCell) {
          const row = document.createElement("div");
          const term = document.createElement("dt");
          const description = document.createElement("dd");
          term.textContent = sourceCell.dataset.label || "Detail";
          sourceCell.childNodes.forEach(function (child) { description.appendChild(child.cloneNode(true)); });
          row.append(term, description);
          details.appendChild(row);
        });
        card.appendChild(details);
        resultCardGrid.appendChild(card);
      });
    }

    function renderComparison(shouldFocus) {
      const values = selectedValues();
      const names = selectedNames();
      if (values.length < 2 || values.length > maximumApps || !resultsSection) {
        updateControls("Choose two or three apps before comparing.");
        return;
      }
      comparisonCells.forEach(function (cell) {
        cell.hidden = !values.includes(cell.dataset.compareColumn);
      });
      renderComparisonCards(values);
      if (resultsHeading) resultsHeading.textContent = joinNames(names) + ": focused comparison";
      resultsSection.hidden = false;
      updateAddress(values);
      updateControls(joinNames(names) + " comparison ready.");
      if (shouldFocus && resultsHeading) {
        resultsHeading.focus({ preventScroll: true });
        resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }

    compareInputs.forEach(function (input) {
      input.addEventListener("change", function () {
        if (selectedInputs().length > maximumApps) input.checked = false;
        updateControls();
      });
    });

    if (compareButton) compareButton.addEventListener("click", function () { renderComparison(true); });
    if (clearButton) clearButton.addEventListener("click", function () {
      compareInputs.forEach(function (input) { input.checked = false; input.disabled = false; });
      if (resultsSection) resultsSection.hidden = true;
      if (resultCardGrid) resultCardGrid.replaceChildren();
      updateAddress([]);
      updateControls("Selection cleared. All ten apps remain visible in the overview.");
    });

    const initialValues = new URL(window.location.href).searchParams.get("apps");
    if (initialValues) {
      const requested = initialValues.split(",").filter(function (value, index, values) {
        return validApps.has(value) && values.indexOf(value) === index;
      }).slice(0, maximumApps);
      compareInputs.forEach(function (input) { input.checked = requested.includes(input.value); });
      if (requested.length >= 2) renderComparison(false);
      else updateControls();
    } else {
      updateControls();
    }
  }

  document.querySelectorAll("[data-featured-link]").forEach(function (link) {
    link.addEventListener("click", function () {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "featured_content_click",
        featured_title: link.querySelector(".card-title")?.textContent.trim() || link.textContent.trim(),
        featured_destination: link.getAttribute("href"),
        featured_position: Number(link.dataset.featuredPosition || 0),
      });
    });
  });
})();
