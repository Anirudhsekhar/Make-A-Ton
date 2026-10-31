
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from firebase_admin import auth, firestore
from firebase_config import db

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

security = HTTPBearer()


class CustomerProfile(BaseModel):
    fullName: str = Field(min_length=2)
    businessType: str = "other"
    phoneNumber: str | None = None


def verify_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    try:
        return auth.verify_id_token(credentials.credentials)
    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired authentication token"
        )


@router.post("/profile")
def create_profile(
    profile: CustomerProfile,
    user: dict = Depends(verify_user)
):
    uid = user["uid"]
    user_ref = db.collection("users").document(uid)

    # Check whether profile already exists
    existing_user = user_ref.get()

    if existing_user.exists:
        return {
            "message": "Profile already exists",
            "profile": existing_user.to_dict()
        }

    # Get authentication provider from Firebase token
    provider = user.get("firebase", {}).get(
        "sign_in_provider", "password"
    )

    profile_data = {
        "uid": uid,
        "fullName": profile.fullName.strip(),
        "email": user.get("email"),
        "businessType": profile.businessType,
        "phoneNumber": profile.phoneNumber,
        "photoURL": user.get("picture"),
        "role": "customer",
        "status": "active",
        "authProvider": provider,
        "createdAt": firestore.SERVER_TIMESTAMP,
        "updatedAt": firestore.SERVER_TIMESTAMP
    }

    user_ref.set(profile_data)

    return {
        "message": "Customer profile created successfully",
        "profile": {
            "uid": uid,
            "fullName": profile_data["fullName"],
            "email": profile_data["email"],
            "businessType": profile_data["businessType"],
            "phoneNumber": profile_data["phoneNumber"],
            "photoURL": profile_data["photoURL"],
            "role": "customer",
            "status": "active",
            "authProvider": provider
        }
    }


@router.get("/me")
def get_current_user(user: dict = Depends(verify_user)):
    user_ref = db.collection("users").document(user["uid"])
    user_doc = user_ref.get()

    if not user_doc.exists:
        raise HTTPException(
            status_code=404,
            detail="User profile not found"
        )

    return user_doc.to_dict()
