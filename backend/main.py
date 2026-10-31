from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from auth_routes import router as auth_router

app = FastAPI(
    title="Brightloop API",
    description="Backend for Brightloop Subscription Management",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "Welcome to Brightloop Backend!",
        "status": "Running successfully"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}


app.include_router(auth_router)