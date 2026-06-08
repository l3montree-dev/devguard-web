// Dev-only: restores CSS variable overrides and style settings from localStorage
// before first paint to prevent flash of unstyled content.
// This file is only loaded in development (see layout.tsx).
try {
  var root = document.documentElement;

  // 1. Restore raw CSS variable overrides (from the Variables tab)
  var overrides = JSON.parse(
    localStorage.getItem("css-var-editor-overrides") || "{}",
  );
  for (var key in overrides) {
    root.style.setProperty(key, overrides[key]);
  }

  // 2. Restore style settings (from the Style tab)
  var s = JSON.parse(localStorage.getItem("css-var-editor-style") || "{}");

  if (s.fontSize) {
    root.style.setProperty("--base-font-size", s.fontSize);
  }

  if (s.fontFamily) {
    var bodyFontEl = document.createElement("style");
    bodyFontEl.id = "dev-body-font-override";
    bodyFontEl.textContent =
      ".font-body,body{font-family:" + s.fontFamily + "!important}";
    document.head.appendChild(bodyFontEl);
  }

  if (s.displayFont) {
    var displayFontEl = document.createElement("style");
    displayFontEl.id = "dev-display-font-override";
    displayFontEl.textContent =
      "h1,h2,h3,h4,h5,h6,.font-display{font-family:" +
      s.displayFont +
      "!important}";
    document.head.appendChild(displayFontEl);
  }

  if (s.letterSpacing) {
    var letterSpacingEl = document.createElement("style");
    letterSpacingEl.id = "dev-letter-spacing-override";
    letterSpacingEl.textContent =
      "body,p,span,div,button,input,a,li{letter-spacing:" +
      s.letterSpacing +
      "!important}";
    document.head.appendChild(letterSpacingEl);
  }

  if (s.lineHeight) {
    var lineHeightEl = document.createElement("style");
    lineHeightEl.id = "dev-line-height-override";
    lineHeightEl.textContent =
      "body,p,div,li{line-height:" + s.lineHeight + "!important}";
    document.head.appendChild(lineHeightEl);
  }

  if (s.shadowPreset === "None") {
    var shadowEl = document.createElement("style");
    shadowEl.id = "dev-shadow-override";
    shadowEl.textContent = "*,*::before,*::after{box-shadow:none!important}";
    document.head.appendChild(shadowEl);
  }
} catch (e) {}
