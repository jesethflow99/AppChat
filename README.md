# Chat App

Aplicación de chat anónima entre dos dispositivos usando tokens numéricos en lugar de números telefónicos.

## Arquitectura

```
┌─────────────┐     WebSocket      ┌──────────────┐
│  App (Expo) │ ◄──────────────► │  Relay Server │
│  RN, MMKV   │     ws://host     │  FastAPI      │
└─────────────┘     :8080/ws       └──────────────┘
```

- **App**: React Native / Expo. Almacenamiento local con MMKV (AsyncStorage en Expo Go).
- **Server**: FastAPI + WebSocket. Solo reenvía mensajes entre peers conectados. Sin base de datos.

## Estructura

```
chat-app/
├── app/                 ← Aplicación React Native / Expo
│   ├── src/
│   │   ├── services/    ← WebSocket client, Storage
│   │   ├── store/       ← ChatContext (estado global)
│   │   └── types/       ← TypeScript interfaces
│   └── app/             ← Expo Router (pantallas)
└── server/              ← Relay server (FastAPI)
    └── main.py          ← Endpoint WebSocket
```

## Inicio rápido (desarrollo)

### Servidor relay

```bash
cd server
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8080 --reload
```

### App

```bash
cd app
npx expo install
npx expo start -c
```

Escanea el QR con Expo Go o presiona `w` para web, `a` para Android emulator.

## Docker

```bash
docker compose up --build
```

- Relay en `http://localhost:8080`
- App web en `http://localhost:8081`

## Cómo funciona

1. Cada usuario genera un token numérico de 10 dígitos
2. Comparte su token con otro usuario
3. El otro usuario agrega el token como nuevo contacto
4. Los mensajes viajan por WebSocket al relay, que los reenvía al destinatario
5. El relay no persiste nada — todo se almacena localmente en cada dispositivo (MMKV en Android/iOS, AsyncStorage en Expo Go/web)

## Licencia

MIT
# AppChat
