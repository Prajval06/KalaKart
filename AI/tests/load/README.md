# Sprint 2D — Load Testing

## Prerequisites

The AI service must be running locally before executing any tests:

```bash
# From KalaKart/AI/
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

No additional packages required — `httpx` is already in `requirements.txt`.

---

## Test Files

| File | Purpose |
|---|---|
| `smoke_test.py` | Validates all endpoints return correct status codes. Always run first. |
| `load_test.py` | Concurrent load test across all AI endpoints under 10/25/50 VU. |

---

## Execution

### Step 1 — Smoke test (mandatory gate)

```bash
cd KalaKart/AI
python tests/load/smoke_test.py
# or against a remote host:
python tests/load/smoke_test.py --host http://ai-service.example.com
```

If any smoke test fails, **do not proceed to load testing**. Fix the endpoint first.

---

### Step 2 — Load test

```bash
# Run all scenarios (10 / 25 / 50 VU)
python tests/load/load_test.py

# Run a single scenario
python tests/load/load_test.py --scenario light   # 10 VU
python tests/load/load_test.py --scenario medium  # 25 VU
python tests/load/load_test.py --scenario heavy   # 50 VU

# Against a non-local target
python tests/load/load_test.py --host http://ai-service.example.com --scenario all
```

Results are written to `load_test_results.json` in the working directory.

---

## Success Criteria

| Endpoint | P95 Threshold | Error Rate |
|---|---|---|
| `GET /health` | ≤ 100 ms | 0% |
| `GET /ready` | ≤ 100 ms | 0% |
| `POST /sentiment` | ≤ 800 ms | ≤ 1% |
| `POST /sentiment/batch` | ≤ 5 000 ms | ≤ 1% |
| `GET /forecast/{id}` | ≤ 1 500 ms | ≤ 2% |
| `GET /forecast/at-risk` | ≤ 1 500 ms | ≤ 2% |
| `GET /recommend/{id}` | ≤ 500 ms | ≤ 2% |
| Mixed traffic | ≤ 2 000 ms | ≤ 2% |

### Critical Pass Condition

> `/health` P95 must remain **≤ 100 ms** even while 50 concurrent inference requests are in flight.

This proves `asyncio.to_thread` migration (Sprint 2B) is working correctly and the event loop is not blocked.

---

## Failure Thresholds

| Threshold Breach | Likely Root Cause |
|---|---|
| `/health` P95 > 100 ms during inference | Event loop is still blocked — `asyncio.to_thread` not applied everywhere |
| `/sentiment` P95 > 800 ms at 10 VU | Thread pool exhausted or model not loaded (lazy-loading on first request) |
| `/sentiment/batch` errors > 1% | Validation gate regression or memory pressure |
| `/forecast/at-risk` timeout | Full-table scan on large product catalog — add DB index on `is_active` |
| Error rate spike at 50 VU | Connection pool exhaustion on MongoDB driver |

---

## Bottlenecks Expected

### 1. `/sentiment/batch` at 50 items × 50 VU
Each batch runs 50 sequential `asyncio.to_thread` calls within one request. At 50 VU this is 2 500 thread dispatches simultaneously. The Python `ThreadPoolExecutor` defaults to `min(32, cpu_count + 4)` threads. This will queue behind the pool.

**Acceptable**: P95 will be high but errors should remain <1% since threads eventually complete.  
**Unacceptable**: Error rate >1% or total timeouts.

### 2. `/forecast/at-risk` sequential scan
`get_all_at_risk` fetches up to 500 products and runs `forecast_product` on each sequentially. At high VU this becomes a long-running DB query chain.

**Mitigation** (Sprint 3): add background job to pre-compute at-risk list periodically.

### 3. Cold start on first `/sentiment` request
If the model was not loaded at startup (very fast cold restart), the first request triggers `asyncio.to_thread(_train_sync)`. This adds ~2–5s to the first response. Subsequent requests are fast.

**Mitigation**: Sprint 2C startup readiness already ensures the model is loaded before `_service_ready = True`.

### 4. Thread pool pressure at 50 VU
`asyncio.to_thread` uses the default executor. Under sustained 50 VU inference load the pool saturates and queuing adds latency.

**Mitigation** (Sprint 3): configure a dedicated `ThreadPoolExecutor` with a larger pool size for ML inference.
