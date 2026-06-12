"""
KalaKart AI Service — Load Test Suite
======================================
Sprint 2D · Phase 4 · Performance Validation

Tests all AI endpoints under 10 / 25 / 50 concurrent virtual users.

Usage:
    python load_test.py [--host http://localhost:8001] [--scenario all|light|medium|heavy]

Requirements (already in requirements.txt):
    httpx, asyncio (stdlib)

No production code is modified by this script.
"""

import asyncio
import time
import statistics
import argparse
import json
import sys
from dataclasses import dataclass, field
from typing import Callable, Awaitable
import httpx


# ── Configuration ─────────────────────────────────────────────────────────────

DEFAULT_HOST = "http://localhost:8001"

# Sample payloads ─ representative but not pathological
SENTIMENT_SHORT  = {"text": "great product love it highly recommend"}
SENTIMENT_MEDIUM = {"text": "The product quality is decent for the price paid. Packaging was good and delivery was on time. Would consider purchasing again if the price stays competitive."}

SENTIMENT_BATCH_10 = {
    "requests": [
        {"text": f"Review number {i}: product quality is acceptable", "review_id": str(i)}
        for i in range(10)
    ]
}

SENTIMENT_BATCH_50 = {
    "requests": [
        {"text": f"Review {i}: {'great product' if i % 3 == 0 else 'terrible quality' if i % 3 == 1 else 'average product nothing special'}", "review_id": str(i)}
        for i in range(50)
    ]
}

# Use a real ObjectId from the seeded catalog; falls back gracefully if not found
SAMPLE_PRODUCT_ID = "000000000000000000000001"

# Validation payloads — must be rejected with 422
PAYLOAD_TEXT_TOO_LONG = {"text": "x" * 2001}
PAYLOAD_BATCH_TOO_LARGE = {
    "requests": [{"text": f"review {i}"} for i in range(51)]
}


# ── Result tracking ────────────────────────────────────────────────────────────

@dataclass
class RequestResult:
    endpoint:   str
    status:     int
    latency_ms: float
    error:      str | None = None


@dataclass
class ScenarioResult:
    label:       str
    concurrency: int
    results:     list[RequestResult] = field(default_factory=list)

    @property
    def total(self) -> int:
        return len(self.results)

    @property
    def errors(self) -> int:
        return sum(1 for r in self.results if r.error or r.status >= 500)

    @property
    def error_rate(self) -> float:
        return self.errors / self.total * 100 if self.total else 0

    @property
    def latencies(self) -> list[float]:
        return [r.latency_ms for r in self.results if not r.error]

    def p50(self)  -> float: return _percentile(self.latencies, 50)
    def p95(self)  -> float: return _percentile(self.latencies, 95)
    def p99(self)  -> float: return _percentile(self.latencies, 99)
    def mean(self) -> float: return statistics.mean(self.latencies) if self.latencies else 0
    def max(self)  -> float: return max(self.latencies) if self.latencies else 0


def _percentile(data: list[float], pct: int) -> float:
    if not data:
        return 0.0
    sorted_data = sorted(data)
    k = (len(sorted_data) - 1) * pct / 100
    lo, hi = int(k), min(int(k) + 1, len(sorted_data) - 1)
    return sorted_data[lo] + (sorted_data[hi] - sorted_data[lo]) * (k - lo)


# ── HTTP helpers ───────────────────────────────────────────────────────────────

async def fire(
    client:   httpx.AsyncClient,
    endpoint: str,
    method:   str = "GET",
    body:     dict | None = None,
) -> RequestResult:
    t0 = time.perf_counter()
    try:
        if method == "POST":
            resp = await client.post(endpoint, json=body)
        else:
            resp = await client.get(endpoint)
        latency = (time.perf_counter() - t0) * 1000
        return RequestResult(endpoint=endpoint, status=resp.status_code, latency_ms=latency)
    except Exception as exc:
        latency = (time.perf_counter() - t0) * 1000
        return RequestResult(endpoint=endpoint, status=0, latency_ms=latency, error=str(exc))


async def blast(
    host:        str,
    label:       str,
    concurrency: int,
    task_fn:     Callable[[httpx.AsyncClient], Awaitable[RequestResult]],
    total:       int | None = None,
) -> ScenarioResult:
    """
    Fire `total` requests (default: concurrency * 3) using `concurrency`
    simultaneous virtual users through a shared connection pool.
    """
    n = total or (concurrency * 3)
    scenario = ScenarioResult(label=label, concurrency=concurrency)

    async with httpx.AsyncClient(base_url=host, timeout=30.0) as client:
        sem = asyncio.Semaphore(concurrency)

        async def bounded(i: int) -> RequestResult:
            async with sem:
                return await task_fn(client)

        tasks = [bounded(i) for i in range(n)]
        results = await asyncio.gather(*tasks, return_exceptions=True)

    for r in results:
        if isinstance(r, RequestResult):
            scenario.results.append(r)
        else:
            scenario.results.append(
                RequestResult(endpoint="?", status=0, latency_ms=0, error=str(r))
            )
    return scenario


# ── Endpoint task factories ────────────────────────────────────────────────────

def task_health(host: str):
    async def _t(client: httpx.AsyncClient) -> RequestResult:
        return await fire(client, "/health")
    return _t

def task_sentiment_single(host: str):
    async def _t(client: httpx.AsyncClient) -> RequestResult:
        return await fire(client, "/sentiment", "POST", SENTIMENT_MEDIUM)
    return _t

def task_sentiment_batch_10(host: str):
    async def _t(client: httpx.AsyncClient) -> RequestResult:
        return await fire(client, "/sentiment/batch", "POST", SENTIMENT_BATCH_10)
    return _t

def task_sentiment_batch_50(host: str):
    async def _t(client: httpx.AsyncClient) -> RequestResult:
        return await fire(client, "/sentiment/batch", "POST", SENTIMENT_BATCH_50)
    return _t

def task_forecast(host: str):
    async def _t(client: httpx.AsyncClient) -> RequestResult:
        return await fire(client, f"/forecast/{SAMPLE_PRODUCT_ID}")
    return _t

def task_forecast_at_risk(host: str):
    async def _t(client: httpx.AsyncClient) -> RequestResult:
        return await fire(client, "/forecast/at-risk?risk_level=high")
    return _t

def task_recommend(host: str):
    async def _t(client: httpx.AsyncClient) -> RequestResult:
        return await fire(client, f"/recommend/{SAMPLE_PRODUCT_ID}?limit=5")
    return _t

def task_mixed(host: str):
    """Simulates realistic mixed traffic: health checks + inference + recommendations."""
    import random
    tasks = [
        ("/health",               "GET",  None),
        ("/sentiment",            "POST", SENTIMENT_SHORT),
        ("/sentiment",            "POST", SENTIMENT_MEDIUM),
        ("/sentiment/batch",      "POST", SENTIMENT_BATCH_10),
        (f"/forecast/{SAMPLE_PRODUCT_ID}", "GET", None),
        (f"/recommend/{SAMPLE_PRODUCT_ID}", "GET", None),
    ]
    weights = [10, 25, 20, 20, 15, 10]  # health checks are frequent

    async def _t(client: httpx.AsyncClient) -> RequestResult:
        endpoint, method, body = random.choices(tasks, weights=weights, k=1)[0]
        return await fire(client, endpoint, method, body)
    return _t


# ── Validation tests ──────────────────────────────────────────────────────────

async def run_validation_tests(host: str) -> bool:
    """
    Verify that validation rules are enforced before running load tests.
    Returns True if all pass, False if any fail.
    """
    print("\n── Validation Gate Tests ──────────────────────────────────────────")
    all_pass = True

    async with httpx.AsyncClient(base_url=host, timeout=10.0) as client:
        # text too long → must be 422
        r = await client.post("/sentiment", json=PAYLOAD_TEXT_TOO_LONG)
        ok = r.status_code == 422
        print(f"  [{'✅' if ok else '❌'}] text >2000 chars → {r.status_code} (expected 422)")
        all_pass = all_pass and ok

        # empty text → must be 422
        r = await client.post("/sentiment", json={"text": ""})
        ok = r.status_code == 422
        print(f"  [{'✅' if ok else '❌'}] empty text → {r.status_code} (expected 422)")
        all_pass = all_pass and ok

        # batch >50 items → must be 422
        r = await client.post("/sentiment/batch", json=PAYLOAD_BATCH_TOO_LARGE)
        ok = r.status_code == 422
        print(f"  [{'✅' if ok else '❌'}] batch >50 items → {r.status_code} (expected 422)")
        all_pass = all_pass and ok

        # health up → must be 200
        r = await client.get("/health")
        ok = r.status_code == 200
        print(f"  [{'✅' if ok else '❌'}] /health → {r.status_code} (expected 200)")
        all_pass = all_pass and ok

        # readiness up → must be 200
        r = await client.get("/ready")
        ok = r.status_code == 200
        print(f"  [{'✅' if ok else '❌'}] /ready → {r.status_code} (expected 200)")
        all_pass = all_pass and ok

    return all_pass


# ── Reporting ─────────────────────────────────────────────────────────────────

THRESHOLDS = {
    "/health":           {"p95_ms": 100,  "error_pct": 0},
    "/ready":            {"p95_ms": 100,  "error_pct": 0},
    "/sentiment":        {"p95_ms": 800,  "error_pct": 1},
    "/sentiment/batch":  {"p95_ms": 5000, "error_pct": 1},
    "/forecast/*":       {"p95_ms": 1500, "error_pct": 2},
    "/recommend/*":      {"p95_ms": 500,  "error_pct": 2},
    "mixed":             {"p95_ms": 2000, "error_pct": 2},
}

def _threshold_for(label: str) -> dict:
    for key in THRESHOLDS:
        if key in label:
            return THRESHOLDS[key]
    return {"p95_ms": 2000, "error_pct": 5}


def print_scenario(sr: ScenarioResult):
    t = _threshold_for(sr.label)
    p95_pass  = sr.p95() <= t["p95_ms"]
    err_pass  = sr.error_rate <= t["error_pct"]
    overall   = "✅ PASS" if (p95_pass and err_pass) else "❌ FAIL"

    print(f"\n  ┌─ {sr.label} — {sr.concurrency} VU ─────────────────────────")
    print(f"  │  Requests:    {sr.total}")
    print(f"  │  Errors:      {sr.errors} ({sr.error_rate:.1f}%)   [threshold ≤ {t['error_pct']}%] {'✅' if err_pass else '❌'}")
    print(f"  │  Mean:        {sr.mean():.0f} ms")
    print(f"  │  P50:         {sr.p50():.0f} ms")
    print(f"  │  P95:         {sr.p95():.0f} ms   [threshold ≤ {t['p95_ms']} ms] {'✅' if p95_pass else '❌'}")
    print(f"  │  P99:         {sr.p99():.0f} ms")
    print(f"  │  Max:         {sr.max():.0f} ms")
    print(f"  └─ {overall}")


def print_health_isolation(health_sr: ScenarioResult, inference_sr: ScenarioResult):
    """
    Key Sprint 2B proof: /health must remain fast even during concurrent inference.
    """
    print(f"\n  ── Health Isolation Check ────────────────────────────────────")
    ok = health_sr.p95() <= 100
    print(f"  /health P95 during {inference_sr.label}: {health_sr.p95():.0f} ms [threshold ≤ 100 ms] {'✅' if ok else '❌'}")
    print(f"  Inference P95 in parallel:                {inference_sr.p95():.0f} ms")
    if ok:
        print("  ✅ Event loop is NOT blocked — asyncio.to_thread is working correctly")
    else:
        print("  ❌ Event loop IS blocked — asyncio.to_thread migration may be incomplete")


def save_results(all_scenarios: list[ScenarioResult], path: str = "load_test_results.json"):
    out = []
    for sr in all_scenarios:
        out.append({
            "label":       sr.label,
            "concurrency": sr.concurrency,
            "total":       sr.total,
            "errors":      sr.errors,
            "error_rate":  round(sr.error_rate, 2),
            "mean_ms":     round(sr.mean(), 1),
            "p50_ms":      round(sr.p50(), 1),
            "p95_ms":      round(sr.p95(), 1),
            "p99_ms":      round(sr.p99(), 1),
            "max_ms":      round(sr.max(), 1),
        })
    with open(path, "w") as f:
        json.dump(out, f, indent=2)
    print(f"\n  Results saved to {path}")


# ── Main runner ───────────────────────────────────────────────────────────────

SCENARIOS_CONFIG = {
    "light":  [10],
    "medium": [25],
    "heavy":  [50],
    "all":    [10, 25, 50],
}

async def run(host: str, scenario: str):
    concurrency_levels = SCENARIOS_CONFIG.get(scenario, [10, 25, 50])
    all_results: list[ScenarioResult] = []

    print(f"\n{'═'*65}")
    print(f"  KalaKart AI Service — Load Test  ({scenario.upper()})")
    print(f"  Target: {host}")
    print(f"{'═'*65}")

    # ── Gate: validate before hammering ──────────────────────────────────────
    ok = await run_validation_tests(host)
    if not ok:
        print("\n❌ Validation gate failed — fix validation errors before load testing")
        sys.exit(1)

    for vu in concurrency_levels:
        print(f"\n{'─'*65}")
        print(f"  Concurrency: {vu} Virtual Users")
        print(f"{'─'*65}")

        # 1. Health endpoint alone
        sr = await blast(host, "/health", vu, task_health(host))
        print_scenario(sr)
        all_results.append(sr)

        # 2. Sentiment single
        sr = await blast(host, "/sentiment", vu, task_sentiment_single(host))
        print_scenario(sr)
        all_results.append(sr)

        # 3. Sentiment batch 10
        sr = await blast(host, "/sentiment/batch (10 items)", vu, task_sentiment_batch_10(host))
        print_scenario(sr)
        all_results.append(sr)

        # 4. Sentiment batch 50 (max allowed)
        sr = await blast(host, "/sentiment/batch (50 items)", vu, task_sentiment_batch_50(host))
        print_scenario(sr)
        all_results.append(sr)

        # 5. Forecast single product
        sr = await blast(host, "/forecast/*", vu, task_forecast(host))
        print_scenario(sr)
        all_results.append(sr)

        # 6. Forecast at-risk scan (expensive — fewer total requests)
        sr = await blast(host, "/forecast/at-risk", vu, task_forecast_at_risk(host), total=vu)
        print_scenario(sr)
        all_results.append(sr)

        # 7. Recommendations
        sr = await blast(host, "/recommend/*", vu, task_recommend(host))
        print_scenario(sr)
        all_results.append(sr)

        # 8. Mixed traffic + concurrent health isolation check
        print(f"\n  Running mixed traffic + health isolation at {vu} VU...")
        inference_sr, health_sr = await asyncio.gather(
            blast(host, "mixed", vu, task_mixed(host), total=vu * 5),
            blast(host, "/health (parallel)", vu // 2 or 1, task_health(host), total=vu * 2),
        )
        print_scenario(inference_sr)
        all_results.append(inference_sr)
        print_health_isolation(health_sr, inference_sr)
        all_results.append(health_sr)

    save_results(all_results)

    # ── Final summary ─────────────────────────────────────────────────────────
    failures = [sr for sr in all_results if sr.error_rate > _threshold_for(sr.label)["error_pct"]
                or (sr.latencies and sr.p95() > _threshold_for(sr.label)["p95_ms"])]
    print(f"\n{'═'*65}")
    if failures:
        print(f"  ❌ LOAD TEST COMPLETE — {len(failures)} scenario(s) FAILED thresholds")
        for sr in failures:
            print(f"     • {sr.label} @ {sr.concurrency} VU")
    else:
        print("  ✅ LOAD TEST COMPLETE — all scenarios within thresholds")
    print(f"{'═'*65}\n")

    return len(failures) == 0


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="KalaKart AI Service Load Test")
    parser.add_argument("--host",     default=DEFAULT_HOST, help="AI service base URL")
    parser.add_argument("--scenario", default="all",
                        choices=["all", "light", "medium", "heavy"],
                        help="Concurrency scenario to run")
    args = parser.parse_args()

    passed = asyncio.run(run(args.host, args.scenario))
    sys.exit(0 if passed else 1)
