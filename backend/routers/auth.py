from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
import hashlib, json, os, base64

router = APIRouter()
USERS_FILE = "users.json"


def load_users():
    if os.path.exists(USERS_FILE):
        with open(USERS_FILE) as f:
            return json.load(f)
    return {}


def save_users(users):
    with open(USERS_FILE, "w") as f:
        json.dump(users, f, indent=2)


def hash_pw(pw: str) -> str:
    return hashlib.sha256(pw.encode()).hexdigest()


def make_token(email: str) -> str:
    payload = f"{email}:{datetime.utcnow().isoformat()}"
    return base64.urlsafe_b64encode(payload.encode()).decode()


class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


@router.post("/register")
def register(req: RegisterRequest):
    users = load_users()
    if req.email in users:
        raise HTTPException(status_code=400, detail="Email already registered")
    users[req.email] = {
        "name": req.name,
        "email": req.email,
        "password": hash_pw(req.password),
        "created_at": datetime.utcnow().isoformat(),
    }
    save_users(users)
    return {"token": make_token(req.email), "user": {"name": req.name, "email": req.email}}


@router.post("/login")
def login(req: LoginRequest):
    users = load_users()
    user = users.get(req.email)
    if not user or user["password"] != hash_pw(req.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {
        "token": make_token(req.email),
        "user": {"name": user["name"], "email": req.email},
    }
