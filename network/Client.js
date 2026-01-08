export default class Client {
  constructor() {
    this.socket = null;
  }

  connect() {
    this.socket = new WebSocket("ws://localhost:3000");
    this.socket.onopen = () => console.log("Connected to server");
    this.socket.onmessage = (msg) => {
      console.log("Server:", msg.data);
      // TODO: handle world updates
    };
  }

  send(data) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    }
  }
}
