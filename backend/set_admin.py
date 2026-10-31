
import firebase_config
from firebase_admin import auth, firestore

uid = "lWRecDz2SZWF37vMoeBqIN99gqo2"

# Verify Firebase account
user = auth.get_user(uid)

# Assign trusted Firebase Custom Claim
auth.set_custom_user_claims(uid, {"role": "admin"})

# Update Firestore profile
db = firebase_config.db

db.collection("users").document(uid).set({
    "uid": uid,
    "role": "admin",
    "status": "active",
    "updatedAt": firestore.SERVER_TIMESTAMP
}, merge=True)

print("Firebase Custom Claim: admin")
print("Firestore role: admin")
print("Admin setup completed successfully!")
