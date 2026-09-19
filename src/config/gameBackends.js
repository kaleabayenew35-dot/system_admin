export const GAME_BACKENDS = [
  {
    key: 'system',
    name: 'System Backend',
    url: import.meta.env.VITE_SYSTEM_BACKEND_URL || import.meta.env.VITE_BACKEND_URL || 'https://system-backend-1u5m.onrender.com',
    healthPath: '/api/health',
    description: 'Shared platform API for users, auth, games, and admin data.'
  },
  {
    key: 'bingo',
    name: 'Bingo Backend',
    url: import.meta.env.VITE_BINGO_BACKEND_URL || 'https://bingo-i1br.onrender.com',
    healthPath: '/',
    description: 'Bingo game service and betting stage engine.'
  },
  {
    key: 'dama',
    name: 'Dama Backend',
    url: import.meta.env.VITE_DAMA_BACKEND_URL || 'https://dama-backend.onrender.com',
    healthPath: '/api/health',
    description: 'Dama game engine and websocket-based match server.'
  },
  {
    key: 'xo',
    name: 'XO Backend',
    url: import.meta.env.VITE_XO_BACKEND_URL || 'https://tic-tak-backend.onrender.com',
    healthPath: '/api/status',
    description: 'XO game backend with player accounting and callbacks.'
  },
  {
    key: 'ludo',
    name: 'Ludo Backend',
    url: import.meta.env.VITE_LUDO_BACKEND_URL || 'https://ludo-backend-wykz.onrender.com',
    healthPath: '/api/game',
    description: 'Ludo board-service backend for player and game operations.'
  }
]

export const getBackendByKey = (key) => GAME_BACKENDS.find((item) => item.key === key)
