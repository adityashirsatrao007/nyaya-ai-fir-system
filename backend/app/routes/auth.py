import os
import uuid
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
from psycopg2.pool import SimpleConnectionPool
from psycopg2.extras import RealDictCursor
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from jose import JWTError, jwt
import bcrypt

load_dotenv()
router = APIRouter()

DATABASE_URL = os.getenv('DATABASE_URL')
SECRET_KEY = os.getenv('SECRET_KEY')
if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY environment variable is not set. Set it in Render Dashboard → Environment Variables.")
ALGORITHM = 'HS256'
ACCESS_TOKEN_EXPIRE_MINUTES = 60

db_pool = None
try:
    if DATABASE_URL:
        db_pool = SimpleConnectionPool(1, 10, DATABASE_URL)
except Exception as e:
    print("Error initializing connection pool:", e)


def get_db_connection():
    if db_pool:
        return db_pool.getconn()
    raise Exception("Database connection pool not initialized")


def release_db_connection(conn):
    if db_pool and conn:
        db_pool.putconn(conn)


def init_db():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100),
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255),
            role VARCHAR(50) DEFAULT 'user',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS cases (
            id SERIAL PRIMARY KEY,
            user_email VARCHAR(255) REFERENCES users(email),
            case_id VARCHAR(50) UNIQUE NOT NULL,
            case_data JSONB NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    ''')
    conn.commit()
    cur.close()
    conn.close()


try:
    init_db()
except Exception as e:
    print("Error initializing database:", e)


class UserSignup(BaseModel):
    name: str
    email: str
    password: str


class UserSignin(BaseModel):
    email: str
    password: str


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire, "iat": datetime.now(timezone.utc), "jti": str(uuid.uuid4())})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None


@router.post("/register")
def register(user: UserSignup):
    conn = get_db_connection()
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT id FROM users WHERE email = %s", (user.email,))
        if cur.fetchone():
            raise HTTPException(status_code=400, detail="Email already registered")

        hashed_pw = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        cur.execute(
            "INSERT INTO users (name, email, password_hash, role) VALUES (%s, %s, %s, %s) RETURNING id, name, email, role",
            (user.name, user.email, hashed_pw, 'user'),
        )
        new_user = cur.fetchone()
        conn.commit()
        cur.close()

        jwt_token = create_access_token({"sub": str(new_user["id"]), "role": new_user["role"]})
        return {
            "success": True,
            "access_token": jwt_token,
            "token_type": "bearer",
            "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            "user": new_user,
        }
    except Exception as e:
        conn.rollback()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        release_db_connection(conn)


@router.post("/login")
def login(user: UserSignin):
    conn = get_db_connection()
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(
            "SELECT id, name, email, password_hash, role FROM users WHERE email = %s",
            (user.email,),
        )
        db_user = cur.fetchone()
        cur.close()

        if not db_user:
            raise HTTPException(status_code=400, detail="Invalid email or password")

        if not bcrypt.checkpw(user.password.encode('utf-8'), db_user["password_hash"].encode('utf-8')):
            raise HTTPException(status_code=400, detail="Invalid email or password")

        user_data = {
            "id": db_user["id"],
            "name": db_user["name"],
            "email": db_user["email"],
            "role": db_user["role"],
        }
        jwt_token = create_access_token({"sub": str(db_user["id"]), "role": db_user["role"]})
        return {
            "success": True,
            "access_token": jwt_token,
            "token_type": "bearer",
            "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            "user": user_data,
        }
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        release_db_connection(conn)


@router.get("/me")
def get_me(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = auth_header.split(" ")[1]
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    conn = get_db_connection()
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(
            "SELECT id, name, email, role FROM users WHERE id = %s",
            (int(payload["sub"]),),
        )
        db_user = cur.fetchone()
        cur.close()
        if not db_user:
            raise HTTPException(status_code=404, detail="User not found")
        return {"success": True, "user": db_user}
    finally:
        release_db_connection(conn)
