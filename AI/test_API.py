import urllib.request
import json

def test(url, method="GET", body=None):
    data = json.dumps(body).encode() if body else None
    headers = {"Content-Type": "application/json"} if data else {}
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as res:
            result = json.loads(res.read())
            print(json.dumps(result, indent=2))
    except urllib.error.HTTPError as e:
        body = json.loads(e.read())
        print(json.dumps(body, indent=2))

# ── ML SERVICE ────────────────────────────────────────
print("=== HEALTH — ML SERVICE ===")
test("http://localhost:8001/health")

print("\n=== SENTIMENT — positive ===")
test("http://localhost:8001/sentiment", "POST", {
    "text": "this product is amazing love it absolutely fantastic"
})

print("\n=== SENTIMENT — negative ===")
test("http://localhost:8001/sentiment", "POST", {
    "text": "terrible quality broke after one day total waste of money"
})

# ── NODE.JS BACKEND ───────────────────────────────────
print("\n=== PRODUCTS LIST ===")
test("http://localhost:8000/api/v1/products")

print("\n=== SINGLE PRODUCT + RECOMMENDATIONS ===")
test("http://localhost:8000/api/v1/products/wireless-headphones")

print("\n=== CATEGORIES ===")
test("http://localhost:8000/api/v1/categories")

# ── AUTH FLOW ─────────────────────────────────────────
print("\n=== REGISTER ===")
test("http://localhost:8000/api/v1/auth/register", "POST", {
    "email":     "testuser@kalakart.com",
    "password":  "password123",
    "full_name": "Test User"
})

print("\n=== LOGIN ===")
test("http://localhost:8000/api/v1/auth/login", "POST", {
    "email":    "testuser@kalakart.com",
    "password": "password123"
})

print("\n=== LOGIN — wrong password (must return INVALID_CREDENTIALS) ===")
test("http://localhost:8000/api/v1/auth/login", "POST", {
    "email":    "testuser@kalakart.com",
    "password": "wrongpassword"
})

print("\n=== FORECAST — wireless headphones ===")
test("http://localhost:8001/forecast/69bf913978b2098c590eba72")

ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OWJmOTFjZjJjZWY4MTU5ZWRlYTc0ZmUiLCJyb2xlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NzQxNjIzODMsImV4cCI6MTc3NDE2NDE4M30.8HkeeaX_wG15uRT7GP04d7nVaNmnYKbU60e30Hwfq3U"

def test_auth(url, method="GET", body=None):
    data = json.dumps(body).encode() if body else None
    headers = {
        "Content-Type":  "application/json",
        "Authorization": f"Bearer {ACCESS_TOKEN}"
    }
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as res:
            result = json.loads(res.read())
            print(json.dumps(result, indent=2))
    except urllib.error.HTTPError as e:
        body = json.loads(e.read())
        print(json.dumps(body, indent=2))

print("\n=== GET CART (empty) ===")
test_auth("http://localhost:8000/api/v1/cart")

print("\n=== ADD TO CART ===")
test_auth("http://localhost:8000/api/v1/cart/items", "POST", {
    "product_id": "69bf913978b2098c590eba72",
    "quantity":   2
})

print("\n=== GET CART (with item) ===")
test_auth("http://localhost:8000/api/v1/cart")

print("\n=== GET MY PROFILE ===")
test_auth("http://localhost:8000/api/v1/users/me")

print("\n=== NO TOKEN — must return UNAUTHORIZED ===")
test("http://localhost:8000/api/v1/cart")

print("\n=== VALIDATION — missing fields on register ===")
test("http://localhost:8000/api/v1/auth/register", "POST", {
    "email": "bademail"
})

print("\n=== VALIDATION — quantity 0 on add to cart ===")
test_auth("http://localhost:8000/api/v1/cart/items", "POST", {
    "product_id": "69bf913978b2098c590eba72",
    "quantity":   0
})

print("\n=== VALIDATION — invalid product_id format ===")
test_auth("http://localhost:8000/api/v1/cart/items", "POST", {
    "product_id": "notanid",
    "quantity":   1
})