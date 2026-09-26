"""Record a small, reproducible same-source XLang3/CPython comparison."""

import argparse
import json
import platform
import statistics
import subprocess
import time
from datetime import datetime, timezone
from pathlib import Path


CASES = ("scalar_arithmetic", "function_calls", "list_append", "range_for")


def command_output(command, source):
    started = time.perf_counter()
    result = subprocess.run([str(command), str(source)], capture_output=True, text=True)
    elapsed = (time.perf_counter() - started) * 1000
    if result.returncode:
        raise RuntimeError(f"{command} {source}: {result.stderr.strip()}")
    return elapsed, result.stdout.strip()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--xlang-repo", type=Path, required=True)
    parser.add_argument("--xlang-bin", type=Path, required=True)
    parser.add_argument("--python-bin", type=Path, required=True)
    parser.add_argument("--output", type=Path, default=Path("frontend/data/benchmark.json"))
    parser.add_argument("--repeats", type=int, default=5)
    args = parser.parse_args()
    revision = subprocess.check_output(["git", "-C", str(args.xlang_repo), "rev-parse", "HEAD"], text=True).strip()
    result = {
        "measured_at": datetime.now(timezone.utc).isoformat(),
        "host": platform.platform(),
        "machine": platform.processor() or platform.machine(),
        "xlang3_revision": revision,
        "cpython_version": subprocess.check_output([str(args.python_bin), "--version"], text=True).strip(),
        "method": f"Same unmodified .py source; 2 warmups and {args.repeats} measured runs per interpreter; median wall time in milliseconds including process startup; stdout must match.",
        "cases": [],
    }
    for name in CASES:
        source = args.xlang_repo / "benchmarks" / "cases" / f"{name}.py"
        measurements = {}
        for label, executable in (("cpython", args.python_bin), ("xlang3", args.xlang_bin)):
            for _ in range(2):
                command_output(executable, source)
            samples = [command_output(executable, source) for _ in range(args.repeats)]
            if len({output for _, output in samples}) != 1:
                raise RuntimeError(f"{name}: output changed between {label} runs")
            measurements[label] = {"samples_ms": [round(ms, 3) for ms, _ in samples], "output": samples[0][1]}
        if measurements["cpython"]["output"] != measurements["xlang3"]["output"]:
            raise RuntimeError(f"{name}: interpreters produced different output")
        py = statistics.median(measurements["cpython"]["samples_ms"])
        x3 = statistics.median(measurements["xlang3"]["samples_ms"])
        result["cases"].append({"name": name, "cpython_ms": py, "xlang3_ms": x3, "ratio": round(x3 / py, 2), "raw": measurements})
        print(f"{name}: CPython {py:.1f} ms, XLang3 {x3:.1f} ms ({x3 / py:.2f}x)", flush=True)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    with args.output.open("w", encoding="utf-8", newline="\n") as stream:
        stream.write(json.dumps(result, indent=2) + "\n")


if __name__ == "__main__":
    main()
