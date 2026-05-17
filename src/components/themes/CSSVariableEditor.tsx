"use client";

import { useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { THEMES, type StyleSettings, type Theme } from "./themes";
import { getComputedVar, hslStringToHex, hexToHsl } from "./utils";

type VarGroup = {
  label: string;
  vars: string[];
};

const VAR_GROUPS: VarGroup[] = [
  {
    label: "Base",
    vars: [
      "--background",
      "--foreground",
      "--border",
      "--input",
      "--ring",
      "--radius",
      "--grid-line-color",
      "--link",
    ],
  },
  {
    label: "Card / Popover",
    vars: ["--card", "--card-foreground", "--popover", "--popover-foreground"],
  },
  {
    label: "Primary",
    vars: ["--primary", "--primary-foreground"],
  },
  {
    label: "Secondary",
    vars: ["--secondary", "--secondary-foreground"],
  },
  {
    label: "Muted / Accent",
    vars: ["--muted", "--muted-foreground", "--accent", "--accent-foreground"],
  },
  {
    label: "Destructive",
    vars: ["--destructive", "--destructive-foreground"],
  },
  {
    label: "Semantic",
    vars: [
      "--success",
      "--success-foreground",
      "--success-muted",
      "--success-hover",
      "--warning",
      "--warning-foreground",
      "--warning-muted",
      "--warning-border",
      "--info",
      "--info-foreground",
      "--info-muted",
      "--destructive-muted",
      "--accent-muted",
      "--accent-ring",
    ],
  },
  {
    label: "Severity",
    vars: [
      "--severity-critical",
      "--severity-critical-muted",
      "--severity-high",
      "--severity-high-muted",
      "--severity-medium",
      "--severity-medium-muted",
      "--severity-low",
      "--severity-low-muted",
    ],
  },
  {
    label: "Sidebar",
    vars: [
      "--sidebar-background",
      "--sidebar-foreground",
      "--sidebar-accent",
      "--sidebar-accent-foreground",
      "--sidebar-border",
    ],
  },
  {
    label: "Header / Footer",
    vars: [
      "--header-background",
      "--header-foreground",
      "--header-muted-foreground",
      "--footer-background",
      "--footer-foreground",
      "--footer-muted-foreground",
    ],
  },
  {
    label: "Charts",
    vars: ["--chart-1", "--chart-2", "--chart-3", "--chart-4", "--chart-5"],
  },
  {
    label: "Shadow",
    vars: ["--tw-shadow-color"],
  },
  {
    label: "Font weights",
    vars: [
      "--font-weight-thin",
      "--font-weight-extralight",
      "--font-weight-light",
      "--font-weight-normal",
      "--font-weight-medium",
      "--font-weight-semibold",
      "--font-weight-bold",
      "--font-weight-extrabold",
      "--font-weight-black",
    ],
  },
];

function VarRow({
  name,
  onChange,
}: {
  name: string;
  onChange: (name: string, value: string) => void;
}) {
  const [value, setValue] = useState("");

  useEffect(() => {
    setValue(getComputedVar(name));
  }, [name]);

  const isHsl = /^\d/.test(value);
  const hexValue = isHsl ? hslStringToHex(value) : value;

  function handleColorChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newHsl = hexToHsl(e.target.value);
    setValue(newHsl);
    onChange(name, newHsl);
  }

  function handleTextChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue(e.target.value);
    onChange(name, e.target.value);
  }

  return (
    <div className="flex items-center gap-2 py-1 text-xs">
      <input
        type="color"
        value={hexValue.startsWith("#") ? hexValue : "#000000"}
        onChange={handleColorChange}
        className="h-6 w-6 shrink-0 cursor-pointer rounded border border-border bg-transparent p-0"
      />
      <span className="w-56 shrink-0 font-mono text-muted-foreground">
        {name}
      </span>
      <Input
        value={value}
        onChange={handleTextChange}
        className="h-auto w-full px-1.5 py-0.5 font-mono text-xs"
      />
    </div>
  );
}

// ─── Shadow presets ──────────────────────────────────────────────────────────
type ShadowPreset = { label: string; css: string | null };
const SHADOW_PRESETS: ShadowPreset[] = [
  { label: "Default", css: null },
  { label: "None", css: `*,*::before,*::after{box-shadow:none!important}` },
];

// ─── Font family presets ──────────────────────────────────────────────────────
type FontPreset = { label: string; stack: string };
const FONT_PRESETS: FontPreset[] = [
  { label: "Default (Inter)", stack: "" },
  { label: "Lexend", stack: "Lexend, sans-serif" },
  { label: "System UI", stack: "system-ui, sans-serif" },
  { label: "Georgia (serif)", stack: "Georgia, 'Times New Roman', serif" },
  {
    label: "Mono",
    stack: "'Fira Code', 'Fira Mono', 'Cascadia Code', monospace",
  },
  {
    label: "Rounded",
    stack:
      "ui-rounded, 'Hiragino Maru Gothic ProN', Quicksand, Comfortaa, Manjari, 'Arial Rounded MT', Calibri, source-sans-pro, sans-serif",
  },
];

// ─── Letter spacing presets ───────────────────────────────────────────────────
const LETTER_SPACING_PRESETS = [
  { label: "Default", value: "" },
  { label: "Tight", value: "-0.03em" },
  { label: "Normal", value: "0em" },
  { label: "Wide", value: "0.04em" },
  { label: "Wider", value: "0.08em" },
];

// ─── Line height presets ──────────────────────────────────────────────────────
const LINE_HEIGHT_PRESETS = [
  { label: "Default", value: "" },
  { label: "Tight", value: "1.3" },
  { label: "Snug", value: "1.45" },
  { label: "Normal", value: "1.6" },
  { label: "Relaxed", value: "1.8" },
];

// ─── Font size presets ────────────────────────────────────────────────────────
const FONT_SIZE_PRESETS = [
  { label: "XS", value: "13px" },
  { label: "SM", value: "14px" },
  { label: "MD", value: "16px" },
  { label: "LG", value: "18px" },
  { label: "XL", value: "20px" },
];

const LS_KEY = "css-var-editor-overrides";
const LS_TAB_KEY = "css-var-editor-tab";
const LS_STYLE_KEY = "css-var-editor-style";

type TabType = "themes" | "style" | "vars";

const DEFAULT_STYLE: StyleSettings = {
  shadowPreset: "Default",
  fontFamily: "",
  displayFont: "",
  fontSize: "16px",
  letterSpacing: "",
  lineHeight: "",
};

export const CSS_VARS_CHANGED = "css-vars-changed";

function notifyCssChanged() {
  window.dispatchEvent(new Event(CSS_VARS_CHANGED));
}

function applyOverrides(overrides: Record<string, string>) {
  for (const [name, value] of Object.entries(overrides)) {
    document.documentElement.style.setProperty(name, value);
  }
  notifyCssChanged();
}

function getOrCreateStyleEl(id: string): HTMLStyleElement {
  let el = document.getElementById(id) as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement("style");
    el.id = id;
    document.head.appendChild(el);
  }
  return el;
}

function applyShadowPreset(presetLabel: string) {
  const preset =
    SHADOW_PRESETS.find((p) => p.label === presetLabel) ?? SHADOW_PRESETS[0];
  const el = getOrCreateStyleEl("dev-shadow-override");
  el.textContent = preset.css ?? "";
  notifyCssChanged();
}

function applyFontFamily(stack: string) {
  const el = getOrCreateStyleEl("dev-body-font-override");
  el.textContent = stack
    ? `.font-body,body{font-family:${stack}!important}`
    : "";
  notifyCssChanged();
}

function applyFontSize(size: string) {
  document.documentElement.style.setProperty("--base-font-size", size);
  notifyCssChanged();
}

function applyLetterSpacing(value: string) {
  const el = getOrCreateStyleEl("dev-letter-spacing-override");
  el.textContent = value
    ? `body,p,span,div,button,input,a,li{letter-spacing:${value}!important}`
    : "";
  notifyCssChanged();
}

function applyLineHeight(value: string) {
  const el = getOrCreateStyleEl("dev-line-height-override");
  el.textContent = value ? `body,p,div,li{line-height:${value}!important}` : "";
  notifyCssChanged();
}

function applyDisplayFont(stack: string) {
  const el = getOrCreateStyleEl("dev-display-font-override");
  el.textContent = stack
    ? `h1,h2,h3,h4,h5,h6,.font-display{font-family:${stack}!important}`
    : "";
  notifyCssChanged();
}

function applyStyleSettings(s: StyleSettings) {
  applyShadowPreset(s.shadowPreset);
  applyFontFamily(s.fontFamily);
  applyDisplayFont(s.displayFont);
  applyFontSize(s.fontSize);
  applyLetterSpacing(s.letterSpacing);
  applyLineHeight(s.lineHeight);
}

function PresetSection({
  label,
  presets,
  current,
  onChange,
}: {
  label: string;
  presets: { label: string; value: string }[];
  current: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {presets.map((p) => (
          <Button
            key={p.label}
            size="xs"
            variant={current === p.value ? "default" : "secondary"}
            onClick={() => onChange(p.value)}
          >
            {p.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

function FontPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (stack: string) => void;
}) {
  return (
    <div>
      <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="flex flex-col gap-1.5">
        {FONT_PRESETS.map((p) => (
          <Button
            key={p.label}
            variant={value === p.stack ? "secondary" : "outline"}
            onClick={() => onChange(p.stack)}
            className={`h-auto justify-between px-2.5 py-1.5 text-xs ${value === p.stack ? "border-primary" : ""}`}
          >
            <span>{p.label}</span>
            <span
              className="text-[11px] opacity-60"
              style={{ fontFamily: p.stack || "inherit" }}
            >
              Aa
            </span>
          </Button>
        ))}
        <Input
          placeholder="Custom font stack…"
          value={FONT_PRESETS.some((p) => p.stack === value) ? "" : value}
          onChange={(e) => onChange(e.target.value)}
          className="h-7 text-xs"
        />
      </div>
    </div>
  );
}

export function CSSVariableEditor() {
  const { setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<TabType>("themes");
  const [activeTheme, setActiveTheme] = useState<string | null>(null);
  const [styleSettings, setStyleSettings] =
    useState<StyleSettings>(DEFAULT_STYLE);

  function saveStyleSettings(next: StyleSettings) {
    setStyleSettings(next);
    localStorage.setItem(LS_STYLE_KEY, JSON.stringify(next));
  }

  function handleChange(name: string, value: string) {
    document.documentElement.style.setProperty(name, value);
    setActiveTheme(null);
    setOverrides((prev) => {
      const next = { ...prev, [name]: value };
      localStorage.setItem(LS_KEY, JSON.stringify(next));
      return next;
    });
  }

  function applyTheme(theme: Theme) {
    for (const name of Object.keys(overrides)) {
      document.documentElement.style.removeProperty(name);
    }
    setTheme(theme.dark ? "dark" : "light");
    applyOverrides(theme.vars);
    setOverrides(theme.vars);
    setActiveTheme(theme.name);
    localStorage.setItem(LS_KEY, JSON.stringify(theme.vars));

    const s = { ...DEFAULT_STYLE, ...theme.style };
    saveStyleSettings(s);
    applyStyleSettings(s);
  }

  function reset() {
    for (const name of Object.keys(overrides)) {
      document.documentElement.style.removeProperty(name);
    }
    setOverrides({});
    setActiveTheme(null);
    localStorage.removeItem(LS_KEY);

    const def = DEFAULT_STYLE;
    saveStyleSettings(def);
    applyStyleSettings(def);
  }

  function copyOverrides() {
    const lines = Object.entries(overrides)
      .map(([k, v]) => `  ${k}: ${v};`)
      .join("\n");
    navigator.clipboard.writeText(`:root {\n${lines}\n}`);
  }

  function switchTab(t: TabType) {
    setTab(t);
    localStorage.setItem(LS_TAB_KEY, t);
  }

  const filteredGroups = useMemo(
    () =>
      VAR_GROUPS.map((g) => ({
        ...g,
        vars: g.vars.filter((v) =>
          v.toLowerCase().includes(search.toLowerCase()),
        ),
      })).filter((g) => g.vars.length > 0),
    [search],
  );

  const hasOverrides =
    Object.keys(overrides).length > 0 ||
    styleSettings.shadowPreset !== "Default" ||
    styleSettings.fontFamily !== "" ||
    styleSettings.displayFont !== "" ||
    styleSettings.fontSize !== "16px" ||
    styleSettings.letterSpacing !== "" ||
    styleSettings.lineHeight !== "";

  if (!open) {
    return (
      <Button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-[9999] rounded-full"
        size="xs"
      >
        CSS Vars
      </Button>
    );
  }

  return (
    <div className="fixed bottom-0 right-0 z-[9999] flex h-[80vh] w-96 flex-col rounded-tl-lg border border-border bg-card shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <span className="text-sm font-semibold">CSS Variable Editor</span>
        <div className="flex gap-1.5">
          {hasOverrides && (
            <>
              <Button size="xs" variant="secondary" onClick={copyOverrides}>
                Copy
              </Button>
              <Button size="xs" variant="destructive" onClick={reset}>
                Reset
              </Button>
            </>
          )}
          <Button size="xs" variant="secondary" onClick={() => setOpen(false)}>
            ✕
          </Button>
        </div>
      </div>

      <Tabs
        value={tab}
        onValueChange={(v) => switchTab(v as TabType)}
        className="flex flex-1 flex-col overflow-hidden"
      >
        <TabsList className="mx-3 mt-2 mb-0 shrink-0 grid grid-cols-3">
          <TabsTrigger value="themes" className="text-xs">
            Themes
          </TabsTrigger>
          <TabsTrigger value="style" className="text-xs">
            Style
          </TabsTrigger>
          <TabsTrigger value="vars" className="text-xs">
            Vars
          </TabsTrigger>
        </TabsList>

        {/* ── Themes tab ── */}
        <TabsContent value="themes" className="flex-1 overflow-y-auto p-3 mt-0">
          <div className="grid grid-cols-2 gap-2">
            {THEMES.map((theme) => {
              const isActive = activeTheme === theme.name;
              return (
                <button
                  key={theme.name}
                  onClick={() => applyTheme(theme)}
                  className={`group relative flex flex-col overflow-hidden rounded-lg border-2 text-left transition-all ${
                    isActive
                      ? "border-primary"
                      : "border-border hover:border-muted-foreground"
                  }`}
                  style={{ background: `hsl(${theme.vars["--background"]})` }}
                >
                  <div
                    className="flex h-16 flex-col gap-1 p-2"
                    style={{ background: `hsl(${theme.vars["--background"]})` }}
                  >
                    <div
                      className="h-2 w-full rounded-sm"
                      style={{
                        background: `hsl(${theme.vars["--header-background"]})`,
                      }}
                    />
                    <div className="flex flex-1 gap-1">
                      <div
                        className="w-5 rounded-sm"
                        style={{
                          background: `hsl(${theme.vars["--sidebar-background"]})`,
                          border: `1px solid hsl(${theme.vars["--sidebar-border"]})`,
                        }}
                      />
                      <div className="flex flex-1 flex-col gap-1">
                        <div
                          className="h-2 flex-1 rounded-sm"
                          style={{
                            background: `hsl(${theme.vars["--card"]})`,
                            border: `1px solid hsl(${theme.vars["--border"]})`,
                          }}
                        />
                        <div className="flex gap-1">
                          <div
                            className="h-2 w-8 rounded-sm"
                            style={{ background: theme.swatch }}
                          />
                          <div
                            className="h-2 flex-1 rounded-sm"
                            style={{
                              background: `hsl(${theme.vars["--card"]})`,
                              border: `1px solid hsl(${theme.vars["--border"]})`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    className="flex items-center gap-1.5 border-t px-2 py-1.5"
                    style={{ background: `hsl(${theme.vars["--background"]})` }}
                  >
                    <div
                      className="h-2.5 w-2.5 rounded-full ring-1 ring-white/20"
                      style={{ background: theme.swatch }}
                    />
                    <span
                      className="text-xs font-medium"
                      style={{ color: `hsl(${theme.vars["--foreground"]})` }}
                    >
                      {theme.name}
                    </span>
                    {isActive && (
                      <span className="ml-auto text-[10px] text-primary">
                        active
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </TabsContent>

        {/* ── Style tab ── */}
        <TabsContent
          value="style"
          className="flex-1 overflow-y-auto px-3 py-3 mt-0 space-y-5"
        >
          <PresetSection
            label="Shadow"
            presets={SHADOW_PRESETS.map((p) => ({
              label: p.label,
              value: p.label,
            }))}
            current={styleSettings.shadowPreset}
            onChange={(v) => {
              applyShadowPreset(v);
              saveStyleSettings({ ...styleSettings, shadowPreset: v });
            }}
          />
          {/* Font size */}
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Base font size
            </div>
            <div className="flex gap-1.5 flex-wrap mb-3">
              {FONT_SIZE_PRESETS.map((p) => (
                <Button
                  key={p.value}
                  size="xs"
                  variant={
                    styleSettings.fontSize === p.value ? "default" : "secondary"
                  }
                  onClick={() => {
                    applyFontSize(p.value);
                    saveStyleSettings({ ...styleSettings, fontSize: p.value });
                  }}
                >
                  {p.label} — {p.value}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <Slider
                showBadge={false}
                min={10}
                max={24}
                step={1}
                value={[parseInt(styleSettings.fontSize)]}
                onValueChange={([v]) => {
                  const val = `${v}px`;
                  applyFontSize(val);
                  saveStyleSettings({ ...styleSettings, fontSize: val });
                }}
                className="flex-1"
              />
              <span className="w-10 shrink-0 text-right font-mono text-xs text-muted-foreground">
                {styleSettings.fontSize}
              </span>
            </div>
          </div>

          <PresetSection
            label="Letter spacing"
            presets={LETTER_SPACING_PRESETS}
            current={styleSettings.letterSpacing}
            onChange={(v) => {
              applyLetterSpacing(v);
              saveStyleSettings({ ...styleSettings, letterSpacing: v });
            }}
          />
          <PresetSection
            label="Line height"
            presets={LINE_HEIGHT_PRESETS}
            current={styleSettings.lineHeight}
            onChange={(v) => {
              applyLineHeight(v);
              saveStyleSettings({ ...styleSettings, lineHeight: v });
            }}
          />

          <FontPicker
            label="Body font"
            value={styleSettings.fontFamily}
            onChange={(stack) => {
              applyFontFamily(stack);
              saveStyleSettings({ ...styleSettings, fontFamily: stack });
            }}
          />
          <FontPicker
            label="Display font (headings)"
            value={styleSettings.displayFont}
            onChange={(stack) => {
              applyDisplayFont(stack);
              saveStyleSettings({ ...styleSettings, displayFont: stack });
            }}
          />
        </TabsContent>

        {/* ── Vars tab ── */}
        <TabsContent
          value="vars"
          className="flex flex-col flex-1 overflow-hidden mt-0"
        >
          <div className="border-b border-border px-3 py-1.5 space-y-1.5">
            <Input
              placeholder="Search variables…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-7 text-xs"
            />
            <p className="text-[10px] text-muted-foreground">
              💡 For transparency, append{" "}
              <code className="font-mono">/ 0.5</code> to any value — e.g.{" "}
              <code className="font-mono">225 59% 21% / 0.5</code>
            </p>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-2">
            {filteredGroups.map((group) => (
              <div key={group.label} className="mb-3">
                <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.label}
                </div>
                {group.vars.map((v) => (
                  <VarRow key={v} name={v} onChange={handleChange} />
                ))}
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      {hasOverrides && (
        <div className="border-t border-border px-3 py-1.5 text-xs text-muted-foreground">
          {activeTheme ? (
            <span>
              Theme: <strong>{activeTheme}</strong>
            </span>
          ) : (
            <span>
              {Object.keys(overrides).length} variable
              {Object.keys(overrides).length !== 1 ? "s" : ""} overridden
            </span>
          )}
        </div>
      )}
    </div>
  );
}
