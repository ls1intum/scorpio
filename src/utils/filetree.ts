import * as vscode from "vscode";

export async function getLevel1Subfolders(folderUri: vscode.Uri): Promise<vscode.Uri[]> {
    const subfolders: vscode.Uri[] = [];
    const entries = await vscode.workspace.fs.readDirectory(folderUri);
  
    for (const [name, type] of entries) {
      if (type === vscode.FileType.Directory) {
        subfolders.push(vscode.Uri.joinPath(folderUri, name));
      }
    }
  
    return subfolders;
  }

  export async function getLevel1SubfoldersOfWorkspace(workspaceFolders :readonly vscode.WorkspaceFolder[])
  : Promise<vscode.Uri[]> {
    return Promise.all(
        workspaceFolders.map((folder) => getLevel1Subfolders(folder.uri))
      ).then((results) => {
        const level1SubfoldersPath = results.flat();
        return level1SubfoldersPath;
      });
  }
  