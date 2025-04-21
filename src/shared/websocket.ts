import * as vscode from "vscode";
import { EventEmitter } from "vscode";
import { AUTH_ID } from "../authentication/authentication_provider";
import WebSocket from "ws";
import { settings } from "./settings";
const StompJs = require("@stomp/stompjs");
import SockJS from "sockjs-client";
import { Result } from "@shared/models/result.model";

export class GenericWebSocket {
  static #instance: GenericWebSocket;

  private stompClient: any;
  private isConnecting: boolean = false;

  private subscriptions = new Map<string, EventEmitter<any>>();

  constructor() {
    // if already instantiated return the instance
    if (GenericWebSocket.#instance) {
      return GenericWebSocket.#instance;
    }

    // otherwise create instance
    this.setup()
      .then(() => {
        GenericWebSocket.#instance = this;
        this.connect();
      })
      .catch((error) => {
        console.error(error);
      });
  }

  public static get instance(): GenericWebSocket {
    // instantiate the singleton if it is not already
    return new GenericWebSocket();
  }

  public get connected(): boolean {
    return this.stompClient && this.stompClient.connected;
  }

  private async setup() {
    const session = await vscode.authentication.getSession(AUTH_ID, [], {
      createIfNone: false,
    });

    if (!session) {
      throw Error("Not authenticated");
    }

    const url = new URL(settings.base_url!);
    url.pathname = "/websocket/websocket";
    // url.searchParams.append("token", session.accessToken);

    this.stompClient = new StompJs.Client({
      brokerURL: url.toString(),
      webSocketFactory: () => new WebSocket(url, { headers: { Authorization: `Bearer ${session.accessToken}` } }),
      connectHeaders: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      debug: function (str: string) {
        console.debug(str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
    });

    this.stompClient.onConnect = (frame: any) => {
      this.onConnect(frame);
    };
    this.stompClient.onStompError = this.onError;
  }

  private onConnect(frame: any) {
    this.isConnecting = false;
  }

  private onError(frame: any) {
    console.error(`Error: ${frame.body}`);
  }

  private connect(): void {
    if (this.isConnecting) {
      console.warn("Already connecting to WebSocket.");
      return;
    }

    this.isConnecting = true;
    this.stompClient.activate();
  }

  public subscribeToTopic<T>(topic: string): EventEmitter<T> {
    if (this.subscriptions.has(topic)) {
      return this.subscriptions.get(topic)!;
    }

    if (!this.stompClient.connected) {
      throw Error(`Cannot subscribe to topic ${topic}: WebSocket is not connected.`);
    }

    const subscription = new EventEmitter<T>();
    this.subscriptions.set(topic, subscription);

    this.stompClient.subscribe(topic, (message: any) => {
      let json = JSON.parse(message.body);

      subscription.fire(json as T);
    });
    console.debug(`Subscribed to topic: ${topic}`);
    return subscription;
  }

  public sendMessage(topic: string, message: object): void {
    if (!this.stompClient.connected) {
      console.error("Cannot send message: WebSocket is not connected.");
      return;
    }

    this.stompClient.publish({
      destination: topic,
      body: JSON.stringify(message),
    });
  }

  public disconnect(): void {
    this.stompClient.deactivate();
  }
}
