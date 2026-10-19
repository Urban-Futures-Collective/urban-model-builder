// Keep the login in the brand's light design, also when the operating system
// is in dark mode: keycloak.v2 adds "pf-v5-theme-dark" on <html> from
// prefers-color-scheme; remove it whenever it appears.
(function () {
  var root = document.documentElement;
  var keepLight = function () {
    if (root.classList.contains("pf-v5-theme-dark")) {
      root.classList.remove("pf-v5-theme-dark");
    }
  };
  new MutationObserver(keepLight).observe(root, {
    attributes: true,
    attributeFilter: ["class"],
  });
  keepLight();
})();
