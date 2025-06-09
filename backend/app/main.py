from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, questions, upload
from app.database import init_db

app = FastAPI(title="Q&A Loader API", version="1.0.0")

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # Including Vite's default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api", tags=["auth"])
app.include_router(questions.router, prefix="/api", tags=["questions"])
app.include_router(upload.router, prefix="/api", tags=["upload"])

@app.on_event("startup")
async def startup_event():
    await init_db()

@app.get("/")
def read_root():
    return {"message": "Q&A Loader API is running"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "Q&A Loader Backend"}