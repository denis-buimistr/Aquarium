from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from passlib.hash import bcrypt
import jwt
import random

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'

# ==================== MODELS ====================

class UserRegister(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    token: str
    user_id: str
    email: str

class Fish(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    species: str
    rarity: str  # common, rare, epic, legendary, mythical
    description: str
    habitat: str
    diet: str
    points: int
    color: str

class UserFishUnlock(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    fish_id: str
    unlocked_at: str

class GachaResult(BaseModel):
    model_config = ConfigDict(extra="ignore")
    fish: Fish
    is_new: bool
    total_points: int

class LeaderboardEntry(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: str
    total_points: int
    total_fish: int

class GachaStatus(BaseModel):
    cases_remaining: int
    next_reset: Optional[str]

class AquariumFish(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    species: str
    rarity: str
    color: str
    position: List[float]

# ==================== HELPER FUNCTIONS ====================

def create_token(user_id: str, email: str) -> str:
    payload = {
        'user_id': user_id,
        'email': email,
        'exp': datetime.now(timezone.utc) + timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ==================== FISH DATA INITIALIZATION ====================

FISH_DATA = [
    {"id": "1", "name": "Рыба-клоун", "species": "Amphiprioninae", "rarity": "common", "description": "Яркая оранжевая рыбка с белыми полосами, известная своим симбиозом с морскими анемонами.", "habitat": "Коралловые рифы Тихого океана", "diet": "Водоросли, планктон, мелкие ракообразные", "points": 10, "color": "#FF8C42"},
    {"id": "2", "name": "Голубой хирург", "species": "Paracanthurus hepatus", "rarity": "common", "description": "Синяя рыба с черным узором и желтым хвостом. Активная и дружелюбная.", "habitat": "Индо-Тихоокеанский регион", "diet": "Планктон и водоросли", "points": 10, "color": "#4A90E2"},
    {"id": "3", "name": "Желтая зебра", "species": "Zebrasoma flavescens", "rarity": "common", "description": "Ярко-желтая рыба с плоским телом. Популярна в аквариумах.", "habitat": "Гавайские острова", "diet": "Водоросли", "points": 10, "color": "#FFD700"},
    {"id": "4", "name": "Королевская грамма", "species": "Gramma loreto", "rarity": "common", "description": "Фиолетово-желтая рыбка, предпочитающая скрываться в пещерах.", "habitat": "Карибское море", "diet": "Мелкие ракообразные и планктон", "points": 10, "color": "#9B59B6"},
    {"id": "5", "name": "Мандаринка", "species": "Synchiropus splendidus", "rarity": "rare", "description": "Одна из самых красочных рыб с психоделическим узором синего, оранжевого и зеленого.", "habitat": "Тихий океан, коралловые рифы", "diet": "Копеподы и мелкие беспозвоночные", "points": 25, "color": "#00CED1"},
    {"id": "6", "name": "Огненный ангел", "species": "Centropyge loricula", "rarity": "rare", "description": "Ярко-красная с черными вертикальными полосами. Территориальная рыба.", "habitat": "Гавайи и Маршалловы острова", "diet": "Водоросли и детрит", "points": 25, "color": "#E74C3C"},
    {"id": "7", "name": "Синий неон", "species": "Paracheirodon innesi", "rarity": "rare", "description": "Маленькая рыбка с неоново-синей полосой вдоль тела.", "habitat": "Реки Амазонки", "diet": "Мелкие насекомые и планктон", "points": 25, "color": "#00BFFF"},
    {"id": "8", "name": "Дискус", "species": "Symphysodon", "rarity": "rare", "description": "Круглая плоская рыба с яркими узорами. Считается королевой аквариума.", "habitat": "Бассейн Амазонки", "diet": "Черви, ракообразные, растения", "points": 25, "color": "#FF6B9D"},
    {"id": "9", "name": "Императорский ангел", "species": "Pomacanthus imperator", "rarity": "epic", "description": "Величественная рыба с синими и желтыми горизонтальными полосами.", "habitat": "Индо-Тихоокеанские рифы", "diet": "Губки, оболочники, водоросли", "points": 50, "color": "#3498DB"},
    {"id": "10", "name": "Мавританский идол", "species": "Zanclus cornutus", "rarity": "epic", "description": "Элегантная рыба с длинным спинным плавником и черно-желто-белыми полосами.", "habitat": "Индо-Тихоокеанский регион", "diet": "Губки и мелкие беспозвоночные", "points": 50, "color": "#F4D03F"},
    {"id": "11", "name": "Рыба-ангел пламя", "species": "Centropyge loriculus", "rarity": "epic", "description": "Насыщенная красно-оранжевая окраска с черными отметинами.", "habitat": "Гавайские и Марианские острова", "diet": "Водоросли и детрит", "points": 50, "color": "#FF4500"},
    {"id": "12", "name": "Лисица ло", "species": "Siganus vulpinus", "rarity": "epic", "description": "Желтая рыба с необычной вытянутой мордой.", "habitat": "Западная часть Тихого океана", "diet": "Водоросли", "points": 50, "color": "#FFD700"},
    {"id": "13", "name": "Наполеон", "species": "Cheilinus undulatus", "rarity": "legendary", "description": "Массивная рыба с выступающим лбом. Может жить до 30 лет.", "habitat": "Коралловые рифы Индо-Тихоокеанского региона", "diet": "Моллюски, рыбы, морские ежи", "points": 100, "color": "#2ECC71"},
    {"id": "14", "name": "Рыба-единорог", "species": "Naso unicornis", "rarity": "legendary", "description": "Большая рыба с характерным рогом на лбу.", "habitat": "Индо-Тихоокеанские воды", "diet": "Бурые водоросли", "points": 100, "color": "#5DADE2"},
    {"id": "15", "name": "Скат-орляк", "species": "Aetobatus narinari", "rarity": "legendary", "description": "Грациозный скат с пятнистым узором, летающий под водой.", "habitat": "Тропические воды по всему миру", "diet": "Моллюски и ракообразные", "points": 100, "color": "#8E44AD"},
    {"id": "16", "name": "Рыба-камень", "species": "Synanceia verrucosa", "rarity": "mythical", "description": "Самая ядовитая рыба в мире. Мастер маскировки.", "habitat": "Индо-Тихоокеанские коралловые рифы", "diet": "Мелкая рыба и ракообразные", "points": 250, "color": "#7D3C98"},
    {"id": "17", "name": "Мурена дракон", "species": "Enchelycore pardalis", "rarity": "mythical", "description": "Редкая мурена с уникальным пятнистым узором и удлиненной челюстью.", "habitat": "Глубокие рифы Тихого океана", "diet": "Рыба и осьминоги", "points": 250, "color": "#C0392B"},
    {"id": "18", "name": "Опах", "species": "Lampris guttatus", "rarity": "mythical", "description": "Теплокровная рыба круглой формы с радужной окраской. Крайне редкая.", "habitat": "Открытый океан, глубокие воды", "diet": "Кальмары и мелкая рыба", "points": 250, "color": "#E74C3C"}
]

RARITY_WEIGHTS = {
    'common': 50,
    'rare': 30,
    'epic': 15,
    'legendary': 4,
    'mythical': 1
}

AQUARIUM_CACHE = {'fish': [], 'timestamp': None}

async def init_fish_data():
    count = await db.fish.count_documents({})
    if count == 0:
        await db.fish.insert_many(FISH_DATA)
        logging.info(f"Initialized {len(FISH_DATA)} fish")

def get_random_fish_by_rarity():
    weights = []
    fish_list = []
    for fish in FISH_DATA:
        fish_list.append(fish)
        weights.append(RARITY_WEIGHTS[fish['rarity']])
    
    return random.choices(fish_list, weights=weights, k=1)[0]

def get_aquarium_fish():
    now = datetime.now(timezone.utc)
    if AQUARIUM_CACHE['timestamp'] is None or (now - AQUARIUM_CACHE['timestamp']) > timedelta(minutes=30):
        selected_fish = random.sample(FISH_DATA, min(8, len(FISH_DATA)))
        AQUARIUM_CACHE['fish'] = [
            {
                'id': f['id'],
                'name': f['name'],
                'species': f['species'],
                'rarity': f['rarity'],
                'color': f['color'],
                'position': [
                    random.uniform(-8, 8),
                    random.uniform(-4, 4),
                    random.uniform(-3, 3)
                ]
            }
            for f in selected_fish
        ]
        AQUARIUM_CACHE['timestamp'] = now
        logging.info("Aquarium refreshed")
    return AQUARIUM_CACHE['fish']

# ==================== AUTH ENDPOINTS ====================

@api_router.post("/auth/register", response_model=Token)
async def register(user_data: UserRegister):
    existing = await db.users.find_one({'email': user_data.email}, {'_id': 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    password_hash = bcrypt.hash(user_data.password)
    
    user_doc = {
        'id': user_id,
        'email': user_data.email,
        'password_hash': password_hash,
        'created_at': datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    
    stats_doc = {
        'user_id': user_id,
        'total_points': 0,
        'total_fish': 0,
        'daily_cases_used': 0,
        'last_case_date': None
    }
    await db.user_stats.insert_one(stats_doc)
    
    token = create_token(user_id, user_data.email)
    return Token(token=token, user_id=user_id, email=user_data.email)

@api_router.post("/auth/login", response_model=Token)
async def login(user_data: UserLogin):
    user = await db.users.find_one({'email': user_data.email}, {'_id': 0})
    if not user or not bcrypt.verify(user_data.password, user['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_token(user['id'], user['email'])
    return Token(token=token, user_id=user['id'], email=user['email'])

# ==================== FISH ENDPOINTS ====================

@api_router.get("/fish/aquarium", response_model=List[AquariumFish])
async def get_aquarium(user: dict = Depends(verify_token)):
    fish = get_aquarium_fish()
    return fish

@api_router.get("/fish/all", response_model=List[Fish])
async def get_all_fish(user: dict = Depends(verify_token)):
    fish = await db.fish.find({}, {'_id': 0}).to_list(100)
    return fish

@api_router.get("/fish/{fish_id}", response_model=Fish)
async def get_fish_detail(fish_id: str, user: dict = Depends(verify_token)):
    fish = await db.fish.find_one({'id': fish_id}, {'_id': 0})
    if not fish:
        raise HTTPException(status_code=404, detail="Fish not found")
    return fish

# ==================== GACHA ENDPOINTS ====================

@api_router.get("/gacha/status", response_model=GachaStatus)
async def get_gacha_status(user: dict = Depends(verify_token)):
    stats = await db.user_stats.find_one({'user_id': user['user_id']}, {'_id': 0})
    if not stats:
        return GachaStatus(cases_remaining=1, next_reset=None)
    
    today = datetime.now(timezone.utc).date().isoformat()
    last_date = stats.get('last_case_date')
    
    if last_date != today:
        return GachaStatus(cases_remaining=1, next_reset=None)
    
    cases_used = stats.get('daily_cases_used', 0)
    remaining = max(0, 1 - cases_used)
    
    tomorrow = datetime.now(timezone.utc).date() + timedelta(days=1)
    next_reset = datetime.combine(tomorrow, datetime.min.time()).isoformat()
    
    return GachaStatus(cases_remaining=remaining, next_reset=next_reset)

@api_router.post("/gacha/open", response_model=GachaResult)
async def open_gacha(user: dict = Depends(verify_token)):
    user_id = user['user_id']
    stats = await db.user_stats.find_one({'user_id': user_id}, {'_id': 0})
    
    if not stats:
        stats = {
            'user_id': user_id,
            'total_points': 0,
            'total_fish': 0,
            'daily_cases_used': 0,
            'last_case_date': None
        }
        await db.user_stats.insert_one(stats)
    
    today = datetime.now(timezone.utc).date().isoformat()
    last_date = stats.get('last_case_date')
    
    if last_date == today and stats.get('daily_cases_used', 0) >= 1:
        raise HTTPException(status_code=400, detail="No cases remaining today")
    
    fish_data = get_random_fish_by_rarity()
    fish = Fish(**fish_data)
    
    existing_unlock = await db.user_fish.find_one({
        'user_id': user_id,
        'fish_id': fish.id
    }, {'_id': 0})
    
    is_new = existing_unlock is None
    
    if is_new:
        unlock_doc = {
            'user_id': user_id,
            'fish_id': fish.id,
            'unlocked_at': datetime.now(timezone.utc).isoformat()
        }
        await db.user_fish.insert_one(unlock_doc)
        
        new_points = stats.get('total_points', 0) + fish.points
        new_total = stats.get('total_fish', 0) + 1
        
        await db.user_stats.update_one(
            {'user_id': user_id},
            {'$set': {
                'total_points': new_points,
                'total_fish': new_total,
                'daily_cases_used': 1 if last_date != today else stats.get('daily_cases_used', 0) + 1,
                'last_case_date': today
            }}
        )
    else:
        if last_date != today:
            await db.user_stats.update_one(
                {'user_id': user_id},
                {'$set': {
                    'daily_cases_used': 1,
                    'last_case_date': today
                }}
            )
        else:
            await db.user_stats.update_one(
                {'user_id': user_id},
                {'$inc': {'daily_cases_used': 1}}
            )
    
    updated_stats = await db.user_stats.find_one({'user_id': user_id}, {'_id': 0})
    
    return GachaResult(
        fish=fish,
        is_new=is_new,
        total_points=updated_stats.get('total_points', 0)
    )

@api_router.post("/gacha/reset")
async def reset_gacha(user: dict = Depends(verify_token)):
    await db.user_stats.update_one(
        {'user_id': user['user_id']},
        {'$set': {'daily_cases_used': 0}}
    )
    return {'message': 'Cases reset successfully'}

# ==================== LEADERBOARD ENDPOINTS ====================

@api_router.get("/leaderboard", response_model=List[LeaderboardEntry])
async def get_leaderboard(user: dict = Depends(verify_token)):
    pipeline = [
        {
            '$lookup': {
                'from': 'users',
                'localField': 'user_id',
                'foreignField': 'id',
                'as': 'user_info'
            }
        },
        {'$unwind': '$user_info'},
        {
            '$project': {
                '_id': 0,
                'user_id': 1,
                'email': '$user_info.email',
                'total_points': 1,
                'total_fish': 1
            }
        },
        {'$sort': {'total_points': -1, 'total_fish': -1}},
        {'$limit': 20}
    ]
    
    leaderboard = await db.user_stats.aggregate(pipeline).to_list(20)
    return leaderboard

# ==================== USER ENDPOINTS ====================

@api_router.get("/user/collection", response_model=List[Fish])
async def get_user_collection(user: dict = Depends(verify_token)):
    unlocks = await db.user_fish.find({'user_id': user['user_id']}, {'_id': 0}).to_list(100)
    fish_ids = [u['fish_id'] for u in unlocks]
    
    fish = await db.fish.find({'id': {'$in': fish_ids}}, {'_id': 0}).to_list(100)
    return fish

@api_router.get("/user/stats")
async def get_user_stats(user: dict = Depends(verify_token)):
    stats = await db.user_stats.find_one({'user_id': user['user_id']}, {'_id': 0})
    if not stats:
        return {'total_points': 0, 'total_fish': 0}
    return {'total_points': stats.get('total_points', 0), 'total_fish': stats.get('total_fish', 0)}

# ==================== APP INITIALIZATION ====================

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup():
    await init_fish_data()
    logger.info("Application started")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
