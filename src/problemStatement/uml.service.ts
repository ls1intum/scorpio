import * as vscode from "vscode";

export function isEditorDarkTheme(): boolean {
  const theme = vscode.window.activeColorTheme.kind;
  return theme === vscode.ColorThemeKind.Dark || theme === vscode.ColorThemeKind.HighContrast;
}

export function getUmlBackgroundColor(): string {
  return isEditorDarkTheme()
    ? "#1e1e1e" // Default dark theme background
    : "#ffffff"; // Default light theme background;
}

export function addBackgroundColorToSvg(svg: string, backgroundColor: string): string {
  return svg.replace(
    /<svg([^>]*)>/,
    `<svg$1>
        <style>svg { background-color: ${backgroundColor}; }</style>
        `
  );
}
