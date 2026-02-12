import * as vscode from "vscode";
import { authenticateToken } from "../artemis/authentication.client";
import { theiaEnv } from "../theia/theia";
import { settings } from "../shared/settings";
import { hostname } from "os";

export const AUTH_ID = "artemis";
const AUTH_NAME = `Credentials`; // what is displayed on the profile button
var SESSIONS_SECRET_KEY = `${AUTH_ID}.sessions`;

class ArtemisSession implements vscode.AuthenticationSession {
  id: string = AUTH_ID;
  accessToken: string;
  account: { label: string; id: string };
  scopes: string[];

  constructor(accessToken: string, username: string, scopes: string[]) {
    this.accessToken = accessToken;
    this.account = {
      label: username,
      id: username,
    };
    this.scopes = scopes ?? [];
  }
}

export class ArtemisAuthenticationProvider
  implements vscode.AuthenticationProvider, vscode.Disposable
{
  private readonly _disposable: vscode.Disposable | undefined;
  private sessionPromise: Promise<ArtemisSession | undefined>;

  constructor(private readonly secretStorage: vscode.SecretStorage) {
    SESSIONS_SECRET_KEY = `${AUTH_ID}.${settings.base_url}.sessions`;
    this.sessionPromise = this.getSessionFromStorage();

    this._disposable = vscode.Disposable.from(
      vscode.authentication.registerAuthenticationProvider(AUTH_ID, AUTH_NAME, this),
      secretStorage.onDidChange(() => this.checkForUpdates()),
    );
  }

  public onAuthSessionsChange =
    new vscode.EventEmitter<vscode.AuthenticationProviderAuthenticationSessionsChangeEvent>();
  get onDidChangeSessions(): vscode.Event<vscode.AuthenticationProviderAuthenticationSessionsChangeEvent> {
    return this.onAuthSessionsChange.event;
  }

  /**
   * Get the existing sessions
   * @param scopes
   * @returns
   */
  public async getSessions(): Promise<vscode.AuthenticationSession[]> {
    const session = await this.getSessionFromStorage();
    return session ? [session] : [];
  }

  private async getSessionFromStorage() {
    return this.secretStorage
      .get(SESSIONS_SECRET_KEY)
      .then((sessionString) => (sessionString ? JSON.parse(sessionString) : undefined));
  }

  private async loginDialog(): Promise<{ username: string; password: string }> {
    const username = await vscode.window.showInputBox({
      ignoreFocusOut: true,
      prompt: "Enter your Artemis username",
    });
    if (!username) {
      throw new Error("No username provided");
    }

    const password = await vscode.window.showInputBox({
      ignoreFocusOut: true,
      prompt: "Enter your Artemis password",
      password: true,
    });
    if (!password) {
      throw new Error("No password provided");
    }

    return { username, password };
  }

  /**
   * Create a new auth session
   * @param scopes
   * @returns
   */
  public async createSession(scopes: string[]): Promise<vscode.AuthenticationSession> {
    var token = "";
    var username = "";
    if (theiaEnv.ARTEMIS_TOKEN) {
      token = theiaEnv.ARTEMIS_TOKEN;
      username = theiaEnv.GIT_USER ?? hostname();
    } else {
      const { username: _username, password: _password } = await this.loginDialog();
      token = (await authenticateToken(_username, _password)).access_token;
      if (!token) {
        throw new Error(`login failure`);
      }

      username = _username;
    }

    const session = new ArtemisSession(token, username, scopes);

    await this.secretStorage.store(SESSIONS_SECRET_KEY, JSON.stringify(session));

    this.onAuthSessionsChange.fire({
      added: [session],
      removed: [],
      changed: [],
    });

    return session;
  }

  // This function is called when the end user signs out of the account.
  async removeSession(_sessionId: string = ""): Promise<void> {
    const session = await this.sessionPromise;
    if (!session) {
      return;
    }
    await this.secretStorage.delete(SESSIONS_SECRET_KEY);

    this.onAuthSessionsChange.fire({
      added: [],
      removed: [session],
      changed: [],
    });
  }

  // This is a crucial function that handles whether or not the token has changed in
  // a different window of VS Code and sends the necessary event if it has.
  private async checkForUpdates(): Promise<void> {
    const added: vscode.AuthenticationSession[] = [];
    const removed: vscode.AuthenticationSession[] = [];

    const previousSession = await this.sessionPromise;
    this.sessionPromise = this.getSessionFromStorage();
    const currentSession = await this.sessionPromise;
    if (!currentSession) {
      return;
    }

    if (previousSession?.accessToken !== currentSession?.accessToken) {
      if (previousSession) {
        removed.push(previousSession);
      }

      if (currentSession) {
        added.push(currentSession);
      }
    } else {
      return;
    }

    this.onAuthSessionsChange.fire({
      added: added,
      removed: removed,
      changed: [],
    });
  }

  dispose(): void {
    this._disposable?.dispose();
  }
}
