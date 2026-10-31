from datetime import datetime, timezone
from typing import Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from firebase_admin import auth, firestore

from firebase_config import db
from auth_routes import verify_user


router = APIRouter(prefix="/api/admin", tags=["Admin Staff"])

StaffRole = Literal["sales_rep", "finance_lead"]


class CreateStaffRequest(BaseModel):
    fullName: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8)
    role: StaffRole
    phoneNumber: Optional[str] = None


@router.post("/staff", status_code=status.HTTP_201_CREATED)
def create_staff(
    data: CreateStaffRequest,
    current_user: dict = Depends(verify_user),
):
    # Only an authenticated admin can create staff.
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=403,
            detail="Only admins can create staff accounts.",
        )

    new_user = None

    try:
        # Create the Firebase Authentication account.
        new_user = auth.create_user(
            email=data.email,
            password=data.password,
            display_name=data.fullName,
        )

        # Assign the trusted Firebase Custom Claim.
        auth.set_custom_user_claims(
            new_user.uid,
            {"role": data.role},
        )

        # Create the corresponding Firestore profile.
        now = firestore.SERVER_TIMESTAMP

        db.collection("users").document(new_user.uid).set({
            "uid": new_user.uid,
            "fullName": data.fullName,
            "email": data.email,
            "businessType": None,
            "phoneNumber": data.phoneNumber,
            "photoURL": None,
            "role": data.role,
            "status": "active",
            "authProvider": "password",
            "createdAt": now,
            "updatedAt": now,
        })

        return {
            "message": "Staff account created successfully.",
            "uid": new_user.uid,
            "email": data.email,
            "role": data.role,
        }

    except auth.EmailAlreadyExistsError:
        raise HTTPException(
            status_code=409,
            detail="An account with this email already exists.",
        )

    except Exception as error:
        # Avoid leaving an Auth account without its profile.
        if new_user:
            try:
                auth.delete_user(new_user.uid)
            except Exception:
                pass

        print("Staff creation error:", str(error))
        raise HTTPException(
            status_code=500,
            detail="Could not create staff account.",
        )