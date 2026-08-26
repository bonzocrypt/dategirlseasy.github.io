(function () {
  "use strict";

  var PARTNER_ID = "P00316944";
  var WIDGET_REF = "W-1e85be51-22c9-4ee6-981a-a49ddc586901";
  var WIDGET_SCRIPT = "https://www.viator.com/orion/partner/widget.js";
  var pendingLocation = "";
  var renderSequence = 0;

  function cleanLocation(value) {
    return String(value || "").replace(/\s+/g, " ").trim().slice(0, 100);
  }

  function affiliateAllowed() {
    return Boolean(window.DGEConsent && window.DGEConsent.allows("affiliate"));
  }

  function setStatus(message) {
    var status = document.querySelector("[data-date-ideas-status]");
    if (status) status.textContent = message;
  }

  function removeWidget() {
    document.querySelectorAll('script[data-dge-service="viator-widget"]').forEach(function (script) {
      script.remove();
    });
    var host = document.querySelector("[data-viator-host]");
    if (host) {
      host.replaceChildren();
      host.removeAttribute("aria-busy");
    }
  }

  function showConsentGate(location) {
    var gate = document.querySelector("[data-viator-consent-gate]");
    var place = document.querySelector("[data-consent-location]");
    if (place) place.textContent = location;
    if (gate) gate.hidden = false;
    setStatus("Affiliate consent is needed before Viator can show recommendations for " + location + ".");
  }

  function hideConsentGate() {
    var gate = document.querySelector("[data-viator-consent-gate]");
    if (gate) gate.hidden = true;
  }

  function renderWidget(location) {
    if (!affiliateAllowed()) {
      showConsentGate(location);
      return;
    }

    var host = document.querySelector("[data-viator-host]");
    if (!host) return;
    hideConsentGate();
    removeWidget();

    var widget = document.createElement("div");
    widget.dataset.viPartnerId = PARTNER_ID;
    widget.dataset.viWidgetRef = WIDGET_REF;
    widget.dataset.viSearchTerm = location;
    host.appendChild(widget);
    host.setAttribute("aria-busy", "true");

    var script = document.createElement("script");
    script.async = true;
    script.dataset.dgeService = "viator-widget";
    script.dataset.renderSequence = String(++renderSequence);
    script.src = WIDGET_SCRIPT;
    script.addEventListener("load", function () {
      host.removeAttribute("aria-busy");
      setStatus("Showing current Viator experiences for " + location + ".");
    });
    script.addEventListener("error", function () {
      host.removeAttribute("aria-busy");
      setStatus("Viator could not load right now. Try again in a moment or choose another destination.");
    });
    document.body.appendChild(script);
  }

  function requestLocation(location) {
    pendingLocation = cleanLocation(location);
    if (!pendingLocation) {
      setStatus("Enter a city or destination first.");
      return;
    }
    var input = document.querySelector("[data-date-location]");
    if (input) input.value = pendingLocation;
    var url = new URL(window.location.href);
    url.searchParams.set("city", pendingLocation);
    history.replaceState(null, "", url.pathname + url.search + url.hash);
    renderWidget(pendingLocation);
  }

  function initialize() {
    var form = document.querySelector("[data-date-ideas-form]");
    var input = document.querySelector("[data-date-location]");
    if (!form || !input) return;

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      requestLocation(input.value);
    });

    document.querySelectorAll("[data-location-example]").forEach(function (button) {
      button.addEventListener("click", function () {
        requestLocation(button.dataset.locationExample);
      });
    });

    var privacyButton = document.querySelector("[data-open-affiliate-consent]");
    if (privacyButton) {
      privacyButton.addEventListener("click", function () {
        if (window.DGEConsent) window.DGEConsent.openPreferences(privacyButton);
      });
    }

    document.addEventListener("dge:consentchange", function (event) {
      if (event.detail && event.detail.affiliate) {
        if (pendingLocation) renderWidget(pendingLocation);
        return;
      }
      removeWidget();
      if (pendingLocation) showConsentGate(pendingLocation);
    });

    var initial = cleanLocation(new URLSearchParams(window.location.search).get("city"));
    if (initial) requestLocation(initial);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize);
  else initialize();
}());
