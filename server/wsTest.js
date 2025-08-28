const WebSocket = require("ws");

function connectWebSocket() {
  const ws = new WebSocket("ws://localhost:3001", {
    headers: {
      origin: "http://localhost:3000", // เพิ่ม origin เพื่อให้สอดคล้องกับ server
    },
  });

  ws.on("open", () => {
    console.log("WebSocket connected");
    // ส่งข้อความทดสอบ
    ws.send(JSON.stringify({ type: "test", message: "Hello from client" }));
  });

  ws.on("message", (data) => {
    console.log("Received:", data.toString());
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });

  ws.on("close", (code, reason) => {
    console.log(`WebSocket disconnected. Code: ${code}, Reason: ${reason.toString()}`);
    // พยายาม reconnect หลังจาก 5 วินาที
    setTimeout(connectWebSocket, 5000);
  });
}

connectWebSocket();