from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import analyze, auth

app = FastAPI(title="AI Adaptive Onboarding Engine v2", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth")
app.include_router(analyze.router, prefix="/api")

@app.get("/")
def root():
    return {"message": "AI Adaptive Onboarding Engine v2", "status": "running"}
