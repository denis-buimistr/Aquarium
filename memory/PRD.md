# AquaGacha - Product Requirements Document

## Original Problem Statement
Геймифицированный аквариум с системой гача для коллекционирования рыбок в стиле "В поисках Немо".

## Core Requirements
1. **Аутентификация:** Регистрация и вход по email/паролю
2. **Аквариум:** 2D Canvas аквариум с анимированными рыбками (3D заблокирован из-за несовместимости библиотек)
3. **Геймификация:** Система открытия кейсов (гача) с анимацией "слот-машины"
4. **Редкость:** 15-20 видов рыбок с 4-5 уровнями редкости
5. **Рейтинг:** Таблица лидеров
6. **Коллекция:** Страница для просмотра собранных рыбок

## Technical Stack
- **Backend:** FastAPI + MongoDB + JWT
- **Frontend:** React + Canvas API
- **Language:** Russian UI

## What's Implemented (2024-02-14)
- [x] Full-stack application (FastAPI + React + MongoDB)
- [x] User authentication (register/login)
- [x] 2D Canvas aquarium with animated fish
- [x] Fish styled like "Finding Nemo" characters
- [x] Gacha case opening with slot-machine animation and sound
- [x] Fish info sidebar on click
- [x] Leaderboard with toggle visibility (show/hide)
- [x] Collection page
- [x] Fish collision avoidance (fish don't overlap)
- [x] Aquarium decorations (plants, seaweed, coral, rocks, sandy bottom)
- [x] Buttons "Collection" and "Open Case" on same level

## Known Blocked Items
- 3D Aquarium with @react-three/fiber (incompatible with React 18/19)

## API Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/user/me` - Get current user
- `GET /api/fish/all` - Get all fish types
- `GET /api/fish/aquarium` - Get fish in aquarium
- `GET /api/fish/:id` - Get fish details
- `POST /api/gacha/open` - Open a case
- `GET /api/gacha/status` - Get remaining cases
- `GET /api/leaderboard` - Get leaderboard
- `GET /api/user/collection` - Get user's collection
- `GET /api/user/stats` - Get user stats

## File Structure
```
/app/
├── backend/
│   ├── server.py          # FastAPI app, all endpoints
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Aquarium2D.js      # Canvas aquarium
│   │   │   ├── GachaSlotMachine.js # Case animation
│   │   │   ├── GachaButton.js     # Bottom buttons
│   │   │   ├── Leaderboard.js     # Leaderboard with toggle
│   │   │   ├── FishSidebar.js     # Fish info panel
│   │   │   └── UserStats.js       # User stats header
│   │   ├── pages/
│   │   │   ├── AuthPage.js        # Login/Register
│   │   │   ├── MainPage.js        # Main app page
│   │   │   └── CollectionPage.js  # Collection view
│   │   └── App.js
│   └── package.json
```

## Future Enhancements (Backlog)
- P1: Re-attempt 3D aquarium if compatible library versions found
- P2: Additional fish species
- P3: Trading system between users
- P4: Daily rewards/bonuses
