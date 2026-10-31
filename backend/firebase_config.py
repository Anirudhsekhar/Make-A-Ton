import firebase_admin
from firebase_admin import credentials, auth, firestore

cred = credentials.Certificate(
    "secrets/firebase-service-account.json"
)

firebase_admin.initialize_app(cred)

db = firestore.client()

print("Brightloop Firebase connected successfully!")