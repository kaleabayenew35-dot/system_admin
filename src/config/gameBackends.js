export const GAME_BACKENDS = [
  {
    key: 'system',
    name: 'System Backend',
    url: import.meta.env.VITE_SYSTEM_BACKEND_URL || import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000',
    healthPath: '/api/health',
    description: 'Shared platform API for users, auth, games, and admin data.'
  },
  {
    key: 'bingo',
    name: 'Bingo Backend',
    url: import.meta.env.VITE_BINGO_BACKEND_URL || 'http://localhost:5000',
    healthPath: '/',
    description: 'Bingo game service and betting stage engine.'
  },
  {
    key: 'dama',
    name: 'Dama Backend',
    url: import.meta.env.VITE_DAMA_BACKEND_URL || 'http://localhost:3001',
    healthPath: '/api/health',
    description: 'Dama game engine and websocket-based match server.'
  },
  {
    key: 'xo',
    name: 'XO Backend',
    url: import.meta.env.VITE_XO_BACKEND_URL || 'http://localhost:5000',
    healthPath: '/api/status',
    description: 'XO game backend with player accounting and callbacks.'
  },
  {
    key: 'ludo',
    name: 'Ludo Backend',
    url: import.meta.env.VITE_LUDO_BACKEND_URL || 'http://localhost:3000',
    healthPath: '/api/game',
    description: 'Ludo board-service backend for player and game operations.'
  }
]

export const getBackendByKey = (key) => GAME_BACKENDS.find((item) => item.key === key)
