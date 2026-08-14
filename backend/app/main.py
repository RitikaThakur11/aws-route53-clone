from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from app.config import settings
from app.database import engine, Base, SessionLocal
from app.routers import auth_router, hosted_zones_router, dns_records_router
from app.services.zone_service import seed_initial_data_if_empty
from app.services.auth_service import get_or_create_mock_user

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables
    Base.metadata.create_all(bind=engine)
    
    # Initialize mock admin user and sample data if database is empty
    db = SessionLocal()
    try:
        get_or_create_mock_user(db)
        seed_initial_data_if_empty(db)
    finally:
        db.close()
        
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Production-grade AWS Route 53 Console Clone REST API",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for local development & cross-port Next.js
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom validation error handler for human-friendly messages
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    first_error = errors[0] if errors else {}
    msg = first_error.get("msg", "Validation error")
    loc = " -> ".join([str(l) for l in first_error.get("loc", [])])
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": f"{loc}: {msg}", "errors": errors}
    )

# Register Routers
app.include_router(auth_router, prefix=settings.API_PREFIX)
app.include_router(hosted_zones_router, prefix=settings.API_PREFIX)
app.include_router(dns_records_router, prefix=settings.API_PREFIX)

@app.get("/api/health", tags=["Health"])
def health_check():
    """Health check endpoint for API liveness."""
    return {
        "status": "healthy",
        "service": "AWS Route 53 Clone API",
        "version": settings.VERSION
    }

@app.get("/", tags=["Root"])
def root():
    return {
        "message": "AWS Route 53 API is operational",
        "docs_url": "/docs",
        "health_url": "/api/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
