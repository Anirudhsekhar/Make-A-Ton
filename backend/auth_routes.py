
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from firebase_admin import auth, firestore
from firebase_config import db

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

security = HTTPBearer()

BusinessType = Literal[
    "enterprise",
    "student",
    "small-business",
    "startup",
    "freelancer",
    "other"
]

ALLOWED_ROLES = {"admin", "customer", "internal_staff"}
ALLOWED_STATUSES = {"active", "inactive"}


class CustomerProfile(BaseModel):
    fullName: str = Field(min_length=2)
    businessType: BusinessType
    phoneNumber: str | None = None



def verify_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    try:
        decoded_token = auth.verify_id_token(
            credentials.credentials,
            check_revoked=True
        )

        return decoded_token

    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid, expired, or revoked authentication token"
        )



def require_role(*allowed_roles):
    def role_checker(user: dict = Depends(verify_user)):
        role = user.get("role")

        if role not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail="You do not have permission to access this resource"
            )

        return user

    return role_checker

@router.post("/profile")
def create_profile(
    profile: CustomerProfile,
    user: dict = Depends(verify_user)
):
    uid = user["uid"]
    user_ref = db.collection("users").document(uid)

    existing_user = user_ref.get()

    # Never overwrite an existing profile or its role
    if existing_user.exists:
        existing_data = existing_user.to_dict()

        if existing_data.get("status") == "inactive":
            raise HTTPException(status_code=403, detail="Account is inactive")

        return {
            "message": "Profile already exists",
            "profile": existing_data
        }

    # Prevent accounts with non-customer Custom Claims from
    # creating a customer profile
    claimed_role = user.get("role")
    if claimed_role and claimed_role != "customer":
        raise HTTPException(
            status_code=403,
            detail="Only customer accounts can use public registration"
        )

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
            **profile_data,
            "createdAt": None,
            "updatedAt": None
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

    profile = user_doc.to_dict()

    if profile.get("role") not in ALLOWED_ROLES:
        raise HTTPException(status_code=403, detail="Invalid account role")

    if profile.get("status") not in ALLOWED_STATUSES:
        raise HTTPException(status_code=403, detail="Invalid account status")

    if profile["status"] == "inactive":
        raise HTTPException(status_code=403, detail="Account is inactive")

    return profile
