from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth_router, army_units_router, soldiers_router, hospitals_router, headquarters_router

app = FastAPI(title="VARTA", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Аутентифікація
app.include_router(auth_router.router)

# Soldiers
app.include_router(soldiers_router.router)

# Army Units
app.include_router(army_units_router.router)

# Hospitals
app.include_router(hospitals_router.router)

# Headquarters
app.include_router(headquarters_router.router)