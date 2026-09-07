from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routers import auth, reports, dashboard, cases, samples
from app.database import engine, Base

# Create all tables in the database
Base.metadata.create_all(bind=engine)

app = FastAPI(title="PashuShield MVP")

# Configure CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(reports.router)
app.include_router(dashboard.router)
app.include_router(cases.router)
app.include_router(samples.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to PashuShield MVP API"}
