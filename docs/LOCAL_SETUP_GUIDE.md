# AquaGacha - Руководство по локальному запуску

## Содержание
1. [Необходимое ПО](#1-необходимое-по)
2. [Настройка MongoDB Atlas](#2-настройка-mongodb-atlas)
3. [Запуск Backend](#3-запуск-backend)
4. [Запуск Frontend](#4-запуск-frontend)
5. [Проверка работы](#5-проверка-работы)
6. [Частые проблемы и решения](#6-частые-проблемы-и-решения)
7. [Структура проекта](#7-структура-проекта)
8. [API Endpoints](#8-api-endpoints)

---

## 1. Необходимое ПО

Установите следующие программы:

| Программа | Версия | Ссылка для скачивания |
|-----------|--------|----------------------|
| Python | 3.10+ | https://www.python.org/downloads/ |
| Node.js | 18+ | https://nodejs.org/ |
| Git | Любая | https://git-scm.com/download/win |
| VS Code | Любая | https://code.visualstudio.com/ |

### Важно при установке Python:
- ✅ Поставьте галочку **"Add Python to PATH"** при установке!

### Проверка установки:
```powershell
python --version   # Должно показать Python 3.x.x
node --version     # Должно показать v18.x.x или выше
git --version      # Должно показать git version x.x.x
```

---

## 2. Настройка MongoDB Atlas (Бесплатная облачная БД)

### Шаг 2.1: Создание аккаунта
1. Перейдите на https://www.mongodb.com/cloud/atlas/register
2. Зарегистрируйтесь (можно через Google)

### Шаг 2.2: Создание кластера
1. Нажмите **"Build a Database"**
2. Выберите **FREE / M0** (бесплатный)
3. Провайдер: **AWS**
4. Регион: **Frankfurt (eu-central-1)** или ближайший
5. Имя кластера: **Cluster0**
6. Нажмите **"Create Deployment"**

### Шаг 2.3: Создание пользователя базы данных
1. В левом меню: **Database Access**
2. Нажмите **"+ ADD NEW DATABASE USER"**
3. Заполните:
   - **Authentication Method**: Password
   - **Username**: `aquauser`
   - **Password**: `Aqua123456` (⚠️ БЕЗ спецсимволов!)
   - **Database User Privileges**: Read and write to any database
4. Нажмите **"Add User"**

### Шаг 2.4: Настройка доступа по IP
1. В левом меню: **Network Access**
2. Нажмите **"+ ADD IP ADDRESS"**
3. В поле **"Access List Entry"** введите: `0.0.0.0/0`
4. Нажмите **"Confirm"**

### Шаг 2.5: Получение строки подключения
1. В левом меню: **Database** → **Clusters**
2. На кластере **Cluster0** нажмите **"Connect"**
3. Выберите **"Drivers"**
4. Скопируйте строку подключения:
   ```
   mongodb+srv://aquauser:<db_password>@cluster0.xxxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. **Замените `<db_password>` на ваш пароль** (`Aqua123456`)

**Пример готовой строки:**
```
mongodb+srv://aquauser:Aqua123456@cluster0.lfnqs8m.mongodb.net/?retryWrites=true&w=majority
```

---

## 3. Запуск Backend

### Шаг 3.1: Откройте терминал в VS Code
1. Откройте папку проекта в VS Code
2. Откройте терминал: **Terminal → New Terminal** (или Ctrl+`)

### Шаг 3.2: Перейдите в папку backend
```powershell
cd backend
```

### Шаг 3.3: Создайте виртуальное окружение
```powershell
python -m venv venv
```

### Шаг 3.4: Активируйте виртуальное окружение
```powershell
venv\Scripts\activate
```
После этого в начале строки появится `(venv)`

### Шаг 3.5: Установите зависимости
```powershell
pip install -r requirements.txt
```

**⚠️ Если ошибка `emergentintegrations`:**
Откройте файл `requirements.txt` и удалите строку:
```
emergentintegrations==0.1.0
```
Затем повторите установку.

### Шаг 3.6: Установите dnspython (для MongoDB Atlas)
```powershell
pip install dnspython
```

### Шаг 3.7: Создайте файл .env
Создайте файл `backend/.env` с содержимым:
```
MONGO_URL=mongodb+srv://aquauser:Aqua123456@cluster0.xxxxxx.mongodb.net/?retryWrites=true&w=majority
DB_NAME=aquagacha
```

**⚠️ ВАЖНО:** Замените `cluster0.xxxxxx` на ваш адрес из MongoDB Atlas!

**Способ создания через Python:**
```powershell
python -c "open('.env', 'w', encoding='utf-8').write('MONGO_URL=mongodb+srv://aquauser:Aqua123456@cluster0.xxxxxx.mongodb.net/?retryWrites=true&w=majority\nDB_NAME=aquagacha\n')"
```

### Шаг 3.8: Запустите сервер
```powershell
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

**Успешный запуск выглядит так:**
```
INFO:     Uvicorn running on http://0.0.0.0:8001
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

---

## 4. Запуск Frontend

### Шаг 4.1: Откройте НОВЫЙ терминал
В VS Code: **Terminal → New Terminal**

### Шаг 4.2: Перейдите в папку frontend
```powershell
cd frontend
```

### Шаг 4.3: Установите yarn (если не установлен)
```powershell
npm install -g yarn
```

### Шаг 4.4: Установите зависимости
```powershell
yarn install
```

### Шаг 4.5: Создайте файл .env
Создайте файл `frontend/.env` с содержимым:
```
REACT_APP_BACKEND_URL=http://localhost:8001
```

**Способ создания через Python:**
```powershell
python -c "open('.env', 'w', encoding='utf-8').write('REACT_APP_BACKEND_URL=http://localhost:8001\n')"
```

### Шаг 4.6: Запустите фронтенд
```powershell
yarn start
```

Браузер автоматически откроется на http://localhost:3000

---

## 5. Проверка работы

### Проверка Backend (API)
Откройте в браузере: http://localhost:8001/docs

Должна открыться Swagger документация API.

### Проверка Frontend
Откройте в браузере: http://localhost:3000

Должна открыться страница входа/регистрации.

### Тест регистрации
1. Нажмите "Зарегистрироваться"
2. Введите email и пароль
3. Нажмите "Войти"
4. Должен открыться аквариум с рыбками

---

## 6. Частые проблемы и решения

### Проблема 1: `pip не распознано как команда`
**Причина:** Python не добавлен в PATH

**Решение:** 
- Переустановите Python с галочкой "Add Python to PATH"
- Или используйте полный путь: `python -m pip install ...`

---

### Проблема 2: `No matching distribution found for emergentintegrations`
**Причина:** Это внутренний пакет Emergent, не нужен локально

**Решение:** 
Удалите строку `emergentintegrations==0.1.0` из `requirements.txt`

---

### Проблема 3: `UnicodeDecodeError` при чтении .env
**Причина:** Файл .env создан в неправильной кодировке

**Решение:** 
Пересоздайте файл через Python:
```powershell
python -c "open('.env', 'w', encoding='utf-8').write('MONGO_URL=...\nDB_NAME=aquagacha\n')"
```

---

### Проблема 4: `ServerSelectionTimeoutError: localhost:27017`
**Причина:** MongoDB не запущена локально

**Решение:** 
Используйте MongoDB Atlas (облачную версию) — см. раздел 2

---

### Проблема 5: `bad auth : authentication failed`
**Причина:** Неправильный логин/пароль в строке подключения

**Решение:**
1. Проверьте, что пользователь создан в MongoDB Atlas (Database Access)
2. Проверьте, что пароль указан правильно (без `<` `>`)
3. Пароль не должен содержать спецсимволы (`@`, `#`, `!`, `$`)

**Если пароль содержит спецсимволы, замените их:**
| Символ | Замена |
|--------|--------|
| `@` | `%40` |
| `#` | `%23` |
| `!` | `%21` |
| `$` | `%24` |

---

### Проблема 6: `Request failed with status code 404` в браузере
**Причина:** Frontend не знает адрес backend

**Решение:**
Создайте файл `frontend/.env`:
```
REACT_APP_BACKEND_URL=http://localhost:8001
```
И перезапустите frontend (`yarn start`)

---

### Проблема 7: `CORS error` в консоли браузера
**Причина:** Backend не разрешает запросы с frontend

**Решение:** 
Backend уже настроен с CORS. Убедитесь, что:
- Backend запущен на порту 8001
- Frontend обращается к `http://localhost:8001`

---

### Проблема 8: Порт занят
**Причина:** Другое приложение использует порт

**Решение:**
Используйте другой порт:
```powershell
# Backend на порту 8002
uvicorn server:app --reload --host 0.0.0.0 --port 8002

# Не забудьте обновить frontend/.env:
REACT_APP_BACKEND_URL=http://localhost:8002
```

---

## 7. Структура проекта

```
Aquarium/
├── backend/
│   ├── server.py           # Главный файл сервера (FastAPI)
│   ├── requirements.txt    # Python зависимости
│   ├── .env                # Переменные окружения (создать!)
│   └── venv/               # Виртуальное окружение (создаётся)
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Aquarium2D.js       # 2D аквариум (Canvas)
│   │   │   ├── GachaSlotMachine.js # Анимация открытия кейсов
│   │   │   ├── GachaButton.js      # Кнопки управления
│   │   │   ├── Leaderboard.js      # Таблица лидеров
│   │   │   ├── FishSidebar.js      # Информация о рыбке
│   │   │   └── UserStats.js        # Статистика пользователя
│   │   ├── pages/
│   │   │   ├── AuthPage.js         # Страница входа/регистрации
│   │   │   ├── MainPage.js         # Главная страница
│   │   │   └── CollectionPage.js   # Страница коллекции
│   │   ├── App.js                  # Корневой компонент
│   │   └── index.css               # Глобальные стили
│   ├── package.json        # Node.js зависимости
│   ├── .env                # Переменные окружения (создать!)
│   └── node_modules/       # Зависимости (создаётся)
```

---

## 8. API Endpoints

### Аутентификация
| Метод | Endpoint | Описание |
|-------|----------|----------|
| POST | `/api/auth/register` | Регистрация пользователя |
| POST | `/api/auth/login` | Вход в систему |

### Пользователь
| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/user/me` | Информация о текущем пользователе |
| GET | `/api/user/stats` | Статистика пользователя |
| GET | `/api/user/collection` | Коллекция рыбок пользователя |

### Рыбки
| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/fish/all` | Все виды рыбок |
| GET | `/api/fish/aquarium` | Рыбки в аквариуме |
| GET | `/api/fish/{id}` | Информация о рыбке |

### Гача (Кейсы)
| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/gacha/status` | Количество доступных кейсов |
| POST | `/api/gacha/open` | Открыть кейс |

### Рейтинг
| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/leaderboard` | Таблица лидеров |

---

## Быстрый старт (TL;DR)

```powershell
# 1. Backend
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
pip install dnspython
# Создайте .env с MONGO_URL и DB_NAME
uvicorn server:app --reload --host 0.0.0.0 --port 8001

# 2. Frontend (в новом терминале)
cd frontend
npm install -g yarn
yarn install
# Создайте .env с REACT_APP_BACKEND_URL=http://localhost:8001
yarn start
```

---

## Контакты для вопросов

Если возникли проблемы, которых нет в этом документе:
1. Проверьте консоль браузера (F12 → Console)
2. Проверьте терминал backend на ошибки
3. Убедитесь, что оба сервера запущены

---

*Документ создан: Февраль 2024*
*Версия: 1.0*
