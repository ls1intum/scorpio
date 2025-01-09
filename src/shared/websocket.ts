import { EventEmitter } from "vscode";
import WebSocket from "ws";
import { settings } from "./settings";
const StompJs = require("@stomp/stompjs");
import SockJS from "sockjs-client";

export type WebSocketMessage<T> = {
  data: T;
};

export type WebSocketError = {
  error: Error;
};

export class GenericWebSocket<T> {
  private stompClient: any;
  private isConnecting: boolean = false;

  public readonly subscription: EventEmitter<WebSocketMessage<T> | WebSocketError> = new EventEmitter();

  constructor(authToken: string, topic: string) {
    const url = new URL(settings.base_url!);
    // url.protocol = url.protocol === "http:" ? "ws" : "wss";
    url.pathname = "/websocket";
    console.log(`WebSocket URL: ${url}`);

    this.stompClient = new StompJs.Client({
      brokerURL: url.toString(),
      webSocketFactory: () => new WebSocket(url), // Use 'ws' library
      connectHeaders: {
        Authorization: `Bearer ${authToken}`,
        login: `Bearer ${authToken}`,
      },
      debug: function (str: string) {
        console.log(str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
    });

    // Fallback code
    if (typeof WebSocket !== "function") {
      // For SockJS you need to set a factory that creates a new SockJS instance
      // to be used for each (re)connect
      this.stompClient.webSocketFactory = function () {
        console.log(`Creating SockJS instance for URL: ${url.toString()}`);
        return new SockJS(url.toString());
      };
    }

    this.stompClient.onConnect = (frame: any) => {
      this.subscribeToTopic(topic);
      this.onConnect(frame);
    };
    this.stompClient.onStompError = this.onError;

    this.connect();
  }

  private onConnect(frame: any) {
    this.isConnecting = false;
  }

  private onError(frame: any) {
    console.error(`Error: ${frame.body}`);
    this.subscription.fire({ error: new Error(frame.body) });
  }

  private connect(): void {
    if (this.isConnecting) {
      console.log("Already connecting to WebSocket.");
      return;
    }

    this.isConnecting = true;
    this.stompClient.activate();
  }

  private subscribeToTopic(topic: string): void {
    if (!this.stompClient.connected) {
      console.error("Cannot subscribe to topic: WebSocket is not connected.");
      this.subscription.fire({ error: new Error("WebSocket is not connected.") });
      return;
    }

    this.stompClient.subscribe(topic, (message: any) => {
      console.log(`Received message: ${message.body}`);
      this.subscription.fire({ data: JSON.parse(message.body) });
    });
    console.log(`Subscribed to topic: ${topic}`);
  }

  public sendMessage(topic: string, message: object): void {
    if (!this.stompClient.connected) {
      console.error("Cannot send message: WebSocket is not connected.");
      this.subscription.fire({ error: new Error("WebSocket is not connected.") });
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
