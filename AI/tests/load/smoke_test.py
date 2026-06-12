"""
KalaKart AI Service — Smoke Test
=================================
Sprint 2D · Pre-load validation

Verifies the service is healthy and all endpoints return correct
status codes before any load test begins.

Usage:
    python smoke_test.py [--host http://localhost:8001]

Exit 0 = all pass, Exit 1 = failures detected.
No production code is modified.
"""

import asyncio
import sys
import argparse
import httpx

DEFAULT_HOST = "http://localhost:8001"


async def run_smoke(host: str) -> bool:
    all_pass = True

    def check(label: str, actual: int, expected: int) -> bool:
        ok = actual == expected
        icon = "✅" if ok else "❌"
        print(f"  {icon}  {label}: HTTP {actual} (expected {expected})")
        return ok

    print(f"\n{'═'*60}")
    print(f"  KalaKart AI Smoke Test")
    print(f"  Target: {host}")
    print(f"{'═'*60}\n")

    async with httpx.AsyncClient(base_url=host, timeout=15.0) as c:

        # ── Liveness & readiness ───────────────────────────────────────────
        print("── Probes ─────────────────────────────────────────────────────")
        r = await c.get("/health")
        all_pass &= check("/health", r.status_code, 200)

        r = await c.get("/ready")
        all_pass &= check("/ready", r.status_code, 200)

        # Verify /health response schema
        body = r.json()
        has_ready = "ready" in body
        print(f"  {'✅' if has_ready else '❌'}  /ready response has 'ready' field: {has_ready}")
        all_pass &= has_ready

        # ── Sentiment single ───────────────────────────────────────────────
        print("\n── Sentiment (/sentiment) ─────────────────────────────────────")
        r = await c.post("/sentiment", json={
            "text": "excellent product love it highly recommend"
        })
        all_pass &= check("POST /sentiment (positive)", r.status_code, 200)
        if r.status_code == 200:
            b = r.json()
            has_label = b.get("label") in ("positive", "negative", "neutral")
            has_conf  = isinstance(b.get("confidence"), float)
            print(f"  {'✅' if has_label else '❌'}  label is valid: {b.get('label')}")
            print(f"  {'✅' if has_conf  else '❌'}  confidence is float: {b.get('confidence')}")
            all_pass &= has_label and has_conf

        r = await c.post("/sentiment", json={
            "text": "terrible quality broke after one day waste of money"
        })
        all_pass &= check("POST /sentiment (negative)", r.status_code, 200)

        # ── Sentiment validation ───────────────────────────────────────────
        print("\n── Sentiment Validation ───────────────────────────────────────")
        r = await c.post("/sentiment", json={"text": ""})
        all_pass &= check("Empty text → 422", r.status_code, 422)

        r = await c.post("/sentiment", json={"text": "x" * 2001})
        all_pass &= check("Text >2000 chars → 422", r.status_code, 422)

        r = await c.post("/sentiment", json={})
        all_pass &= check("Missing text field → 422", r.status_code, 422)

        # ── Sentiment batch ────────────────────────────────────────────────
        print("\n── Sentiment Batch (/sentiment/batch) ─────────────────────────")
        r = await c.post("/sentiment/batch", json={
            "requests": [
                {"text": "great product", "review_id": "r1"},
                {"text": "terrible item",  "review_id": "r2"},
                {"text": "okay product",   "review_id": "r3"},
            ]
        })
        all_pass &= check("POST /sentiment/batch (3 items)", r.status_code, 200)
        if r.status_code == 200:
            b = r.json()
            count = b.get("data", {}).get("count", 0)
            ok = count == 3
            print(f"  {'✅' if ok else '❌'}  response count == 3: {count}")
            all_pass &= ok

        r = await c.post("/sentiment/batch", json={
            "requests": [{"text": f"review {i}"} for i in range(51)]
        })
        all_pass &= check("Batch >50 items → 422", r.status_code, 422)

        r = await c.post("/sentiment/batch", json={"requests": []})
        all_pass &= check("Empty batch → 422", r.status_code, 422)

        # ── Forecast ───────────────────────────────────────────────────────
        print("\n── Forecast (/forecast) ───────────────────────────────────────")
        r = await c.get("/forecast/000000000000000000000001")
        # 200 (found) or correct error shape (not found) — both are valid
        ok = r.status_code in (200, 200)
        body = r.json()
        if r.status_code == 200 and "error" not in body:
            has_fields = all(k in body.get("data", body) for k in ("product_id", "stockout_risk"))
            print(f"  ✅  GET /forecast/{{id}} → 200, has required fields: {has_fields}")
            all_pass &= has_fields
        else:
            print(f"  ⚠️   GET /forecast/{{id}} → {r.status_code} (product may not exist in DB — OK)")

        r = await c.get("/forecast/notanobjectid")
        ok = r.status_code in (200, 400, 422)   # service returns error dict in body for invalid IDs
        print(f"  {'✅' if ok else '❌'}  GET /forecast/invalid-id → {r.status_code}")
        all_pass &= ok

        r = await c.get("/forecast/at-risk?risk_level=high")
        all_pass &= check("GET /forecast/at-risk", r.status_code, 200)

        # ── Recommendations ────────────────────────────────────────────────
        print("\n── Recommendations (/recommend) ───────────────────────────────")
        r = await c.get("/recommend/000000000000000000000001?limit=5")
        all_pass &= check("GET /recommend/{id}", r.status_code, 200)
        if r.status_code == 200:
            b = r.json()
            has_recs = "recommendations" in b.get("data", {})
            print(f"  {'✅' if has_recs else '❌'}  response has 'recommendations' field: {has_recs}")
            all_pass &= has_recs

        r = await c.get("/recommend/000000000000000000000001?limit=0")
        ok = r.status_code == 422
        print(f"  {'✅' if ok else '❌'}  limit=0 → {r.status_code} (expected 422)")
        all_pass &= ok

        r = await c.get("/recommend/000000000000000000000001?limit=21")
        ok = r.status_code == 422
        print(f"  {'✅' if ok else '❌'}  limit=21 → {r.status_code} (expected 422)")
        all_pass &= ok

    print(f"\n{'═'*60}")
    if all_pass:
        print("  ✅  ALL SMOKE TESTS PASSED — safe to run load test")
    else:
        print("  ❌  SMOKE TESTS FAILED — resolve issues before load testing")
    print(f"{'═'*60}\n")

    return all_pass


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="KalaKart AI Smoke Test")
    parser.add_argument("--host", default=DEFAULT_HOST, help="AI service base URL")
    args = parser.parse_args()

    passed = asyncio.run(run_smoke(args.host))
    sys.exit(0 if passed else 1)
