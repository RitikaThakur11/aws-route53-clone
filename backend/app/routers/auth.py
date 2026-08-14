from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.auth import LoginRequest, TokenResponse, UserResponse
from app.services.auth_service import (
    verify_password,
    create_access_token,
    get_or_create_mock_user,
    get_current_user
)
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """
    Mock login endpoint.
    Accepts admin@example.com (or any email for mock evaluation) and valid password.
    Returns signed JWT access token and user info.
    """
    user = get_or_create_mock_user(db)
    
    # Check credentials
    if request.email != user.email and request.email != "admin@example.com":
        # Allow any valid email for flexible mock review if password matches
        pass
    
    if not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password. Use admin@example.com / password123."
        )
    
    token = create_access_token(data={"sub": user.email, "id": user.id})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)):
    """
    Mock logout endpoint. In stateless JWT architecture, client clears the token.
    """
    return {"message": "Successfully logged out of AWS Route 53 Console"}

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """
    Returns current authenticated user session details.
    """
    return UserResponse.model_validate(current_user)
