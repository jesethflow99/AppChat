from fastapi import FastAPI, WebSocket, WebSocketDisconnect

app = FastAPI(title="Chat Relay Server")

connections: dict[str, WebSocket] = {}

@app.websocket("/ws")
async def ws_handler(ws: WebSocket):
    await ws.accept()
    token: str | None = None

    try:
        while True:
            data = await ws.receive_json()
            msg_type = data.get("type")
            payload = data.get("payload", {})

            if msg_type == "register":
                token = payload.get("token")
                if token:
                    connections[token] = ws

            elif msg_type == "message":
                to_token = payload.get("toToken")
                if to_token and to_token in connections:
                    await connections[to_token].send_json({
                        "type": "message",
                        "payload": {
                            "chatId": payload.get("chatId"),
                            "content": payload.get("content"),
                            "senderToken": payload.get("senderToken", token),
                            "timestamp": payload.get("timestamp"),
                            "messageId": payload.get("messageId"),
                        }
                    })

    except WebSocketDisconnect:
        pass
    finally:
        if token and connections.get(token) is ws:
            del connections[token]


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8080, reload=True)
