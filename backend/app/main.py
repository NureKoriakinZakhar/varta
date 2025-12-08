from fastapi import FastAPI
from app.routers import auth_router, army_units_router, soldiers_router, hospitals_router, headquarters_router

app = FastAPI(title="VARTA", version="1.0")

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