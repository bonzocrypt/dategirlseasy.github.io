(function () {
  "use strict";

  var STORAGE_KEY = "dge-consent-v1";
  var CONSENT_VERSION = 1;
  var GA_ID = "G-T2TQHDFBZP";
  var CLARITY_ID = "y72r4c6i9y";
  var currentChoice = readChoice();
  var analyticsLoaded = false;
  var lastPreferenceTrigger = null;

  function globalPrivacyControlEnabled() {
    return navigator.globalPrivacyControl === true;
  }

  function normalizedChoice(value) {
    if (!value || value.version !== CONSENT_VERSION) return null;
    if (typeof value.analytics !== "boolean" || typeof value.affiliate !== "boolean") return null;
    return {
      version: CONSENT_VERSION,
      analytics: value.analytics,
      affiliate: value.affiliate,
      updatedAt: value.updatedAt || null
    };
  }

  function readChoice() {
    try {
      return normalizedChoice(JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"));
    } catch (error) {
      return null;
    }
  }

  function writeChoice(choice) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(choice));
    } catch (error) {
      // Consent still applies to this page when browser storage is unavailable.
    }
  }

  function preferenceState() {
    var choice = currentChoice || {
      version: CONSENT_VERSION,
      analytics: false,
      affiliate: false,
      updatedAt: null
    };
    if (!globalPrivacyControlEnabled()) return choice;
    return Object.assign({}, choice, { affiliate: false });
  }

  function ensureClarityQueue() {
    window.clarity = window.clarity || function () {
      (window.clarity.q = window.clarity.q || []).push(arguments);
    };
  }

  function signalClarity(analyticsAllowed) {
    ensureClarityQueue();
    window.clarity("consentv2", {
      ad_Storage: "denied",
      analytics_Storage: analyticsAllowed ? "granted" : "denied"
    });
  }

  function loadClarity() {
    signalClarity(preferenceState().analytics);
    if (document.querySelector('script[data-dge-service="clarity"]')) return;
    var script = document.createElement("script");
    script.async = true;
    script.dataset.dgeService = "clarity";
    script.src = "https://www.clarity.ms/tag/" + CLARITY_ID;
    document.head.appendChild(script);
  }

  function ensureGoogleQueue() {
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  }

  function signalGoogle(analyticsAllowed) {
    ensureGoogleQueue();
    var settings = {
      analytics_storage: analyticsAllowed ? "granted" : "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied"
    };
    if (!analyticsLoaded) settings.wait_for_update = 500;
    window.gtag("consent", analyticsLoaded ? "update" : "default", settings);
  }

  function loadGoogleAnalytics() {
    if (analyticsLoaded || !preferenceState().analytics) return;
    analyticsLoaded = true;
    signalGoogle(true);
    var script = document.createElement("script");
    script.async = true;
    script.dataset.dgeService = "google-analytics";
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA_ID);
    document.head.appendChild(script);
    window.gtag("js", new Date());
    window.gtag("config", GA_ID, { anonymize_ip: true });
  }

  function expireAnalyticsCookies() {
    var names = document.cookie.split(";").map(function (item) {
      return item.split("=")[0].trim();
    }).filter(function (name) {
      return name === "_ga" || name === "_gid" || name.indexOf("_ga_") === 0 || name.indexOf("_gat") === 0;
    });
    names.forEach(function (name) {
      document.cookie = name + "=; Max-Age=0; path=/; SameSite=Lax";
      document.cookie = name + "=; Max-Age=0; path=/; domain=.dategirlseasy.com; SameSite=Lax";
    });
  }

  function emitChange() {
    document.dispatchEvent(new CustomEvent("dge:consentchange", { detail: preferenceState() }));
  }

  function applyChoice(choice, options) {
    var previous = preferenceState();
    currentChoice = {
      version: CONSENT_VERSION,
      analytics: choice.analytics === true,
      affiliate: choice.affiliate === true && !globalPrivacyControlEnabled(),
      updatedAt: new Date().toISOString()
    };
    writeChoice(currentChoice);
    signalClarity(currentChoice.analytics);
    signalGoogle(currentChoice.analytics);
    if (currentChoice.analytics) loadGoogleAnalytics();
    if (previous.analytics && !currentChoice.analytics) expireAnalyticsCookies();
    emitChange();
    renderChoice();
    if (options && options.closeDialog) closePreferences();
  }

  function allows(category) {
    if (category === "necessary") return true;
    return preferenceState()[category] === true;
  }

  function whenAllowed(category, callback) {
    if (allows(category)) {
      callback();
      return function () {};
    }
    function listener() {
      if (!allows(category)) return;
      document.removeEventListener("dge:consentchange", listener);
      callback();
    }
    document.addEventListener("dge:consentchange", listener);
    return function () { document.removeEventListener("dge:consentchange", listener); };
  }

  function markup() {
    return '<section class="consent-banner" data-consent-banner aria-labelledby="consent-banner-title" hidden>' +
      '<div class="consent-banner-copy"><p class="consent-kicker">Your privacy choices</p>' +
      '<h2 id="consent-banner-title">Choose what Date Girls Easy can use.</h2>' +
      '<p>Necessary storage keeps the site and your choices working. Analytics helps improve DGE. Affiliate content can load third-party recommendations. <a href="/privacy.html#privacy-choices">Read the privacy policy</a>.</p></div>' +
      '<div class="consent-banner-actions" aria-label="Cookie choices">' +
      '<button type="button" data-consent-action="all">Accept all</button>' +
      '<button type="button" data-consent-action="necessary">Necessary only</button>' +
      '<button type="button" data-consent-action="customize">Customize</button>' +
      '</div></section>' +
      '<dialog class="consent-dialog" data-consent-dialog aria-labelledby="consent-dialog-title">' +
      '<div class="consent-dialog-header"><div><p class="consent-kicker">Privacy choices</p><h2 id="consent-dialog-title">Choose your settings</h2></div>' +
      '<button class="consent-dialog-close" type="button" data-consent-close aria-label="Close privacy choices">&times;</button></div>' +
      '<p class="consent-dialog-intro">DGE remains available when optional categories are off. You can return to these settings from the footer.</p>' +
      '<div class="consent-option"><div><strong>Necessary</strong><p>Stores your privacy and requested display preferences. Always active.</p></div><input type="checkbox" checked disabled aria-label="Necessary storage is always active" /></div>' +
      '<label class="consent-option" for="dge-consent-analytics"><div><strong>Analytics</strong><p>Allows Google Analytics cookies and full Microsoft Clarity sessions. When off, Clarity uses its limited no-cookie mode.</p></div><input id="dge-consent-analytics" type="checkbox" data-consent-category="analytics" /></label>' +
      '<label class="consent-option" for="dge-consent-affiliate"><div><strong>Affiliate and third-party experiences</strong><p>Allows embedded partner content such as Viator. Ordinary disclosed links still work when this is off.</p><small data-consent-gpc-note hidden>Your browser is sending a Global Privacy Control signal, so this category remains off.</small></div><input id="dge-consent-affiliate" type="checkbox" data-consent-category="affiliate" /></label>' +
      '<div class="consent-dialog-actions">' +
      '<button type="button" data-consent-action="save">Save choices</button>' +
      '<button type="button" data-consent-action="necessary">Necessary only</button>' +
      '<button type="button" data-consent-action="all">Accept all</button>' +
      '</div><p class="consent-dialog-policy"><a href="/privacy.html#privacy-choices">Privacy and cookie details</a></p></dialog>';
  }

  function banner() { return document.querySelector("[data-consent-banner]"); }
  function dialog() { return document.querySelector("[data-consent-dialog]"); }

  function renderChoice() {
    var choice = preferenceState();
    var bannerNode = banner();
    var dialogNode = dialog();
    if (bannerNode) bannerNode.hidden = currentChoice !== null;
    if (dialogNode) {
      var analytics = dialogNode.querySelector('[data-consent-category="analytics"]');
      var affiliate = dialogNode.querySelector('[data-consent-category="affiliate"]');
      var gpcNote = dialogNode.querySelector("[data-consent-gpc-note]");
      if (analytics) analytics.checked = choice.analytics;
      if (affiliate) {
        affiliate.checked = choice.affiliate;
        affiliate.disabled = globalPrivacyControlEnabled();
      }
      if (gpcNote) gpcNote.hidden = !globalPrivacyControlEnabled();
    }
  }

  function openPreferences(trigger) {
    var dialogNode = dialog();
    if (!dialogNode) return;
    lastPreferenceTrigger = trigger || document.activeElement;
    renderChoice();
    if (typeof dialogNode.showModal === "function") dialogNode.showModal();
    else dialogNode.setAttribute("open", "");
    var firstControl = dialogNode.querySelector('[data-consent-category="analytics"]');
    if (firstControl) firstControl.focus();
  }

  function closePreferences() {
    var dialogNode = dialog();
    if (!dialogNode) return;
    if (typeof dialogNode.close === "function" && dialogNode.open) dialogNode.close();
    else dialogNode.removeAttribute("open");
    if (lastPreferenceTrigger && typeof lastPreferenceTrigger.focus === "function") lastPreferenceTrigger.focus();
  }

  function addPrivacyChoiceLinks() {
    document.querySelectorAll(".footer-nav-v2").forEach(function (footerNav) {
      if (footerNav.querySelector("[data-privacy-choices]")) return;
      var button = document.createElement("button");
      button.type = "button";
      button.className = "footer-privacy-choices";
      button.dataset.privacyChoices = "";
      button.textContent = "Privacy choices";
      footerNav.appendChild(button);
    });
  }

  function bindInterface() {
    document.body.insertAdjacentHTML("beforeend", markup());
    addPrivacyChoiceLinks();
    renderChoice();

    document.addEventListener("click", function (event) {
      var privacyTrigger = event.target.closest("[data-privacy-choices]");
      if (privacyTrigger) {
        openPreferences(privacyTrigger);
        return;
      }
      var action = event.target.closest("[data-consent-action]");
      if (!action) return;
      var name = action.dataset.consentAction;
      if (name === "customize") openPreferences(action);
      if (name === "all") applyChoice({ analytics: true, affiliate: true }, { closeDialog: true });
      if (name === "necessary") applyChoice({ analytics: false, affiliate: false }, { closeDialog: true });
      if (name === "save") {
        var dialogNode = dialog();
        applyChoice({
          analytics: dialogNode.querySelector('[data-consent-category="analytics"]').checked,
          affiliate: dialogNode.querySelector('[data-consent-category="affiliate"]').checked
        }, { closeDialog: true });
      }
    });

    var closeButton = document.querySelector("[data-consent-close]");
    if (closeButton) closeButton.addEventListener("click", closePreferences);
    var dialogNode = dialog();
    if (dialogNode) {
      dialogNode.addEventListener("click", function (event) {
        if (event.target === dialogNode) closePreferences();
      });
      dialogNode.addEventListener("close", function () {
        if (lastPreferenceTrigger && typeof lastPreferenceTrigger.focus === "function") lastPreferenceTrigger.focus();
      });
    }
  }

  window.DGEConsent = {
    version: CONSENT_VERSION,
    get: function () { return Object.assign({}, preferenceState()); },
    allows: allows,
    whenAllowed: whenAllowed,
    openPreferences: openPreferences,
    setCategory: function (category, allowed) {
      if (category !== "analytics" && category !== "affiliate") return;
      var choice = preferenceState();
      choice[category] = allowed === true;
      applyChoice(choice, { closeDialog: false });
    }
  };

  loadClarity();
  signalGoogle(preferenceState().analytics);
  if (preferenceState().analytics) loadGoogleAnalytics();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bindInterface);
  else bindInterface();
}());
