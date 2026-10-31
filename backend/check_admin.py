
import firebase_config
from firebase_admin import auth

uid = "lWRecDz2SZWF37vMoeBqIN99gqo2"

user = auth.get_user(uid)

print("Email:", user.email)
print("Custom Claims:", user.custom_claims)
