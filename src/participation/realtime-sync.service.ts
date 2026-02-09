import * as vscode from "vscode";
import { Result } from "@shared/models/result.model";
import { ProgrammingSubmission } from "@shared/models/submission.model";
import { GenericWebSocket, WebSocketConnectionState } from "../shared/websocket";
import { AUTH_ID } from "../authentication/authentication_provider";
import { fetch_exercise_details_by_id } from "../artemis/exercise.client";
import { getState, set_displayed_state } from "../shared/state";
import { handleResultMessage, handleSubmissionMessage } from "./realtime.handlers";

const RESULTS_TOPIC = `/user/topic/newResults`;
const SUBMISSIONS_TOPIC = `/user/topic/newSubmissions`;
const INITIAL_CONNECTION_TIMEOUT_MS = 12000;
const FALLBACK_POLL_INTERVAL_MS = 10000;

export class RealtimeSyncService implements vscode.Disposable {
  private readonly disposables: vscode.Disposable[] = [];
  private fallbackPollTimer: NodeJS.Timeout | undefined;
  private fallbackPollInFlight: Promise<void> | undefined;
  private subscriptionsInitialized = false;

  constructor(private readonly webSocket: GenericWebSocket = GenericWebSocket.instance) {
    this.disposables.push(
      this.webSocket.onConnectionStateChange((state) => {
        this.handleConnectionState(state);
      })
    );
  }

  public async start() {
    const connected = await this.webSocket.awaitConnected(INITIAL_CONNECTION_TIMEOUT_MS);

    if (connected) {
      this.ensureRealtimeSubscriptions();
      return;
    }

    this.startFallbackPolling();
  }

  public async refreshNow(): Promise<void> {
    // await this.pollDisplayedExerciseDetails();
  }

  public dispose(): void {
    if (this.fallbackPollTimer) {
      clearInterval(this.fallbackPollTimer);
      this.fallbackPollTimer = undefined;
    }

    for (const disposable of this.disposables) {
      disposable.dispose();
    }
  }

  private handleConnectionState(state: WebSocketConnectionState) {
    if (state === "connected") {
      this.ensureRealtimeSubscriptions();
      this.stopFallbackPolling();
      return;
    }

    if (state === "error" || state === "disconnected") {
      this.startFallbackPolling();
    }
  }

  private ensureRealtimeSubscriptions() {
    if (this.subscriptionsInitialized) {
      return;
    }

    const resultSubscription = this.webSocket.subscribeToTopic<Result>(RESULTS_TOPIC);
    this.disposables.push(
      resultSubscription.event((result) => {
        handleResultMessage(result);
      })
    );

    const submissionSubscription = this.webSocket.subscribeToTopic<ProgrammingSubmission>(SUBMISSIONS_TOPIC);
    this.disposables.push(
      submissionSubscription.event((submission) => {
        handleSubmissionMessage(submission);
      })
    );

    this.subscriptionsInitialized = true;
  }

  private startFallbackPolling() {
    if (this.fallbackPollTimer) {
      return;
    }

    this.fallbackPollTimer = setInterval(() => {
      this.pollDisplayedExerciseDetails().catch((error) => {
        console.debug("Fallback polling failed", error);
      });
    }, FALLBACK_POLL_INTERVAL_MS);

    this.pollDisplayedExerciseDetails().catch((error) => {
      console.debug("Initial fallback poll failed", error);
    });
  }

  private stopFallbackPolling() {
    if (!this.fallbackPollTimer) {
      return;
    }
    clearInterval(this.fallbackPollTimer);
    this.fallbackPollTimer = undefined;
  }

  private async pollDisplayedExerciseDetails() {
    if (this.fallbackPollInFlight) {
      return this.fallbackPollInFlight;
    }

    this.fallbackPollInFlight = this.runPollDisplayedExerciseDetails();
    try {
      await this.fallbackPollInFlight;
    } finally {
      this.fallbackPollInFlight = undefined;
    }
  }

  private async runPollDisplayedExerciseDetails() {
    const state = getState();
    const displayedExerciseId = state.displayedExercise?.id;

    if (!displayedExerciseId) {
      return;
    }

    const session = await vscode.authentication.getSession(AUTH_ID, [], {
      createIfNone: false,
    });

    if (!session) {
      return;
    }

    const refreshedExercise = await fetch_exercise_details_by_id(session.accessToken, displayedExerciseId);
    set_displayed_state(refreshedExercise.course ?? state.displayedCourse, refreshedExercise);
  }
}
