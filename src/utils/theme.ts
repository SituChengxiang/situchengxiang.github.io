export function changePageTheme(theme: string) {
  document.documentElement.setAttribute("data-theme", theme);
}

export function getSystemTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

const themeKey = "gyoza-theme";

export function getLocalTheme() {
  const local = localStorage.getItem(themeKey);
  if (local === "dark" || local === "light" || local === "system") {
    return local;
  }
  return "system";
}

export function setLocalTheme(theme: string) {
  localStorage.setItem(themeKey, theme);
}
