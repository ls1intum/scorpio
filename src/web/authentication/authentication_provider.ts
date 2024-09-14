import {
  AuthenticationProvider,
  AuthenticationProviderAuthenticationSessionsChangeEvent,
  AuthenticationSession,
  Disposable,
  Event,
  EventEmitter,
  SecretStorage,
  authentication,
  window,
} from "vscode";
import { authenticateToken } from "./authentication_api";

export const AUTH_ID = "artemis";
const AUTH_NAME = `Artemis`;
const SESSIONS_SECRET_KEY = `${AUTH_ID}.sessions`;

class ArtemisSession implements AuthenticationSession {
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
  implements AuthenticationProvider, Disposable
{
  private readonly _disposable: Disposable | undefined;
  private sessionPromise: Promise<ArtemisSession | undefined>;

  constructor(private readonly secretStorage: SecretStorage) {
    this.sessionPromise = this.getSessionFromStorage();

    this._disposable = Disposable.from(
      authentication.registerAuthenticationProvider(AUTH_ID, AUTH_NAME, this),
      secretStorage.onDidChange(() => this.checkForUpdates())
    );
  }

  public onAuthSessionsChange =
    new EventEmitter<AuthenticationProviderAuthenticationSessionsChangeEvent>();
  get onDidChangeSessions(): Event<AuthenticationProviderAuthenticationSessionsChangeEvent> {
    return this.onAuthSessionsChange.event;
  }

  /**
   * Get the existing sessions
   * @param scopes
   * @returns
   */
  public async getSessions(
    scopes: string[] = []
  ): Promise<AuthenticationSession[]> {
    const session = await this.getSessionFromStorage();
    return session ? [session] : [];
  }

  private async getSessionFromStorage() {
    return this.secretStorage
      .get(SESSIONS_SECRET_KEY)
      .then((sessionString) =>
        sessionString ? JSON.parse(sessionString) : undefined
      );
  }

  /**
   * Create a new auth session
   * @param scopes
   * @returns
   */
  public async createSession(scopes: string[]): Promise<AuthenticationSession> {
    const username = await window.showInputBox({
      ignoreFocusOut: true,
      prompt: "Enter your username",
    });
    if (!username) {
      throw new Error("No username provided");
    }

    const password = await window.showInputBox({
      ignoreFocusOut: true,
      prompt: "Enter your password",
      password: true,
    });
    if (!password) {
      throw new Error("No password provided");
    }

    const token = await authenticateToken(username, password);
    if (!token) {
      throw new Error(`login failure`);
    }

    const session = new ArtemisSession(token, username, scopes);

    await this.secretStorage.store(
      SESSIONS_SECRET_KEY,
      JSON.stringify(session)
    );

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
    const added: AuthenticationSession[] = [];
    const removed: AuthenticationSession[] = [];

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
