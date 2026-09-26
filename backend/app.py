"""XLang Foundation site. Run this file with the XLang3 executable."""

import os
import subprocess
import sys
import tempfile
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field


ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / "frontend" / "dist"
DATA = ROOT / "frontend" / "data" / "benchmark.json"
XLANG3_BIN = os.environ.get("XLANG3_BIN", sys.executable)
PLAYGROUND_ENABLED = os.environ.get("XLANG3_PLAYGROUND_ENABLED") == "1"

app = FastAPI(title="XLang Foundation", version="0.1.0")


class RunRequest(BaseModel):
    code: str = Field(min_length=1, max_length=4000)


@app.get("/api/health")
async def health():
    return {"status": "ok", "implementation": sys.implementation.name, "playground_enabled": PLAYGROUND_ENABLED}


@app.get("/api/playground/status")
async def playground_status():
    return {"enabled": PLAYGROUND_ENABLED}


@app.post("/api/playground/run")
def playground_run(payload: RunRequest):
    if not PLAYGROUND_ENABLED:
        raise HTTPException(status_code=503, detail="The playground is not configured on this host.")
    if "\x00" in payload.code:
        raise HTTPException(status_code=400, detail="Source contains an invalid character.")
    # A fresh runtime process for each request. Enable this only on a dedicated,
    # externally sandboxed execution host; subprocess isolation alone is insufficient.
    with tempfile.TemporaryDirectory(prefix="xlang3-play-") as directory:
        source = Path(directory) / "main.py"
        source.write_text(payload.code, encoding="utf-8")
        try:
            result = subprocess.run(
                [XLANG3_BIN, str(source)],
                cwd=directory,
                capture_output=True,
                text=True,
                timeout=3,
                check=False,
            )
        except subprocess.TimeoutExpired:
            return {"output": "Execution stopped after 3 seconds.", "exit_code": 124}
    output = (result.stdout + result.stderr)[:12000]
    return {"output": output or "(no output)", "exit_code": result.returncode}


@app.get("/data/benchmark.json", include_in_schema=False)
async def benchmark_data():
    return FileResponse(DATA, media_type="application/json")


@app.get("/", include_in_schema=False)
async def index():
    return FileResponse(DIST / "index.html")


@app.get("/favicon.svg", include_in_schema=False)
async def favicon():
    return FileResponse(DIST / "favicon.svg", media_type="image/svg+xml")


if DIST.exists():
    app.mount("/assets", StaticFiles(directory=DIST / "assets"), name="assets")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host=os.environ.get("XLANG3_SITE_HOST", "127.0.0.1"), port=int(os.environ.get("XLANG3_SITE_PORT", "9088")))
