import urllib.request
import json

def test(url, method="GET", body=None):
    data = json.dumps(body).encode() if body else None
    headers = {"Content-Type": "application/json"} if data else {}
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    with urllib.request.urlopen(req) as res:
        result = json.loads(res.read())
        print(json.dumps(result, indent=2))

# Health check
print("=== HEALTH ===")
test("http://localhost:8001/health")

# Sentiment positive
print("\n=== SENTIMENT — positive ===")
test("http://localhost:8001/sentiment", "POST", {
    "text": "this product is amazing love it"
})

# Sentiment negative
print("\n=== SENTIMENT — negative ===")
test("http://localhost:8001/sentiment", "POST", {
    "text": "terrible quality broke after one day waste of money"
})

# Sentiment neutral
print("\n=== SENTIMENT — neutral ===")
test("http://localhost:8001/sentiment", "POST", {
    "text": "product is okay nothing special does the job"
})

# Test forecast with a fake product id
# Will return PRODUCT_NOT_FOUND which is the correct behaviour
print("\n=== FORECAST — unknown product ===")
try:
    test("http://localhost:8001/forecast/64b1234567890abcdef12345")
except Exception as e:
    print(f"Got error (expected): {e}")

# Test recommendations with a fake product id
# Will return empty list fallback — also correct
print("\n=== RECOMMENDATIONS — unknown product ===")
test("http://localhost:8001/recommend/64b1234567890abcdef12345")

# Add to test_api.py
print("\n=== NODE.JS PRODUCT WITH RECOMMENDATIONS ===")
test("http://localhost:8000/api/v1/products/YOUR_PRODUCT_SLUG_HERE")
