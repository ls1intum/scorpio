import * as vscode from "vscode";

export class UmlFileProvider implements vscode.FileSystemProvider {
  umlStorage = new Map<string, Uint8Array>();

  // Required for changes tracking (even if unused)
  onDidChangeFile: vscode.Event<vscode.FileChangeEvent[]> = new vscode.EventEmitter<
    vscode.FileChangeEvent[]
  >().event;

  // Fetch metadata (simplified)
  stat(uri: vscode.Uri): vscode.FileStat {
    if (!this.umlStorage.has(uri.path)) {
      throw vscode.FileSystemError.FileNotFound(uri);
    }

    const content = this.umlStorage.get(uri.path)!;
    return {
      type: vscode.FileType.File,
      ctime: Date.now(),
      mtime: Date.now(),
      size: Buffer.byteLength(content),
    };
  }

  // Read the SVG string as bytes
  readFile(uri: vscode.Uri): Uint8Array {
    const content = this.umlStorage.get(uri.path);
    if (!content) {
      throw vscode.FileSystemError.FileNotFound(uri);
    }

    return content;
  }

  // Only need to implement minimal methods
  writeFile(uri: vscode.Uri, content: Uint8Array): void {
    const { resultId, umlId } = this.uriToIds(uri);

    // check if all existing umls have the same resultId
    // if not, clear the storage (displayed Result has changed)
    const existingKeys = Array.from(this.umlStorage.keys());
    for (const k of existingKeys) {
      const { resultId: existingResultId, umlId: existingUmlId } = this.uriToIds(vscode.Uri.parse(k));

      if (existingResultId !== resultId) {
        this.umlStorage.delete(k);
      }
    }

    this.umlStorage.set(uri.path, content);
  }

  // uml-preview:/resultId/umlId.svg
  private uriToIds(uri: vscode.Uri): { resultId: string; umlId: string } {
    const parts = uri.path.split("/").slice(1); // remove the leading "uml-preview:/"
    if (parts.length !== 2) {
      throw new Error("Invalid URI format");
    }

    return { resultId: parts[0], umlId: parts[1].split(".svg", 1)[0] };
  }

  public idsToUri(resultId: string, umlId: string): vscode.Uri {
    return vscode.Uri.parse(`uml-preview:/${resultId}/${umlId}.svg`);
  }

  // The rest are optional for read-only FS
  readDirectory(): [string, vscode.FileType][] {
    return [];
  }
  createDirectory(): void {}
  delete(): void {}
  rename(): void {}
  watch(): vscode.Disposable {
    return { dispose: () => {} };
  }
}

export const umlFileProvider = new UmlFileProvider();
