# XLang Foundation website

The site uses a Vue 3/Vite frontend and a FastAPI backend **executed by XLang3**. The backend serves the built frontend, publishes benchmark data, and can launch a separate XLang3 process for each playground run.

## Local setup on Windows

Build the XLang3 runtime and its native `pydantic_core._pydantic_core.x3pkg.dll` package first. The current XLang3 FastAPI compatibility target uses the dependency versions in [`tests/fastapi/requirements.txt`](https://github.com/CantorAI/xlang3/blob/main/tests/fastapi/requirements.txt).

```powershell
cd frontend
npm ci
npm run build
cd ..
C:\Python\Python314\python.exe -m pip install --target .deps -r D:\CantorAI\xlang3\tests\fastapi\requirements.txt
$env:PYTHONPATH = (Resolve-Path .deps).Path
$env:XLANG3_BIN = 'D:\CantorAI\xlang3\build\Release\xlang3.exe'
& $env:XLANG3_BIN backend\app.py
```

Open <http://127.0.0.1:9088>. Check <http://127.0.0.1:9088/api/health>: `implementation` must be `xlang3`.

Set `XLANG3_PLAYGROUND_ENABLED=1` before starting the server to enable playground runs on a **trusted local machine only**. Each request launches `$env:XLANG3_BIN` as a separate process with a three-second timeout. That process still has the host's filesystem and network access. For a public playground, put it on a separate host with OS/container isolation, resource limits, network restrictions, and request rate limits before enabling the flag. The main site runs without the playground.

The repository's old Azure Static Web Apps workflow deployed only static frontend files and has been replaced with frontend build CI. As checked on September 26, 2026, the live `xlangfoundation.org` domain is instead served as static files by nginx on an Azure Ubuntu VM. Its nginx configuration has no `/api` proxy or XLang3 site service; the SPA fallback returns `index.html` for unknown paths, including `/api/health`. Production deployment of this redesign needs an XLang3 runtime service bound to localhost, an nginx proxy for `/api` and `/data`, and a deployment process for the built frontend. No production deployment is configured in this repository yet.

## Benchmark evidence

`frontend/data/benchmark.json` contains raw timing samples, the runtime revision, CPython version, host, and method. It was generated from unchanged benchmark cases in the public [XLang3 repository](https://github.com/CantorAI/xlang3/tree/main/benchmarks/cases).

To refresh the data after a runtime change:

```powershell
C:\Python\Python314\python.exe tools\measure.py --xlang-repo D:\CantorAI\xlang3 --xlang-bin D:\CantorAI\xlang3\build\Release\xlang3.exe --python-bin C:\Python\Python314\python.exe
```

These are narrow microbenchmarks, measured as wall time including startup. They are not application performance results. The site shows XLang3 slower than CPython on the recorded run.

## Editorial rules

- Describe Python 3.14 compatibility as a target, not a completed claim.
- Show the executor boundary between ProgramIR and execution. Distinguish the working interpreter executor and embeddable runtime from the planned LLVM JIT/AOT executor. Update its status only after LLVM verification lands.
- Describe interpreter fast paths as implemented, but use measured results for comparative speed claims.
- Describe managed I/O as a design direction until capability control, tracing, and replay have implementation evidence.
- Treat the [managed I/O sandbox proposal](docs/managed-io-sandbox.md) as covering all outside access, including files, network, devices, processes, and tools. Do not imply the current playground already enforces it.
- Update benchmark data and method together; never type performance numbers into the page by hand.

The website code is MIT licensed as in [`LICENSE`](LICENSE). XLang3 itself is Apache 2.0 licensed.
