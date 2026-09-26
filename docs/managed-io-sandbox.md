# Managed I/O sandbox — design proposal

Status: proposal for XLang3, **not an implemented security boundary**. This document defines the intended behavior behind the website's architecture diagram.

## Purpose

All access outside the running program crosses one managed effect boundary: files, databases, network, devices, subprocesses, interprocess communication, and agent tools. Environment variables, clock reads, and entropy sources also enter through this boundary when deterministic replay is required. The same rule applies whether code runs through the IR interpreter or a future compiled executor, and whether XLang3 is embedded or launched as a standalone program.

```text
ProgramIR → executor → XLang3 runtime → managed effect gateway
                                      ├─ capability policy
                                      ├─ durable effect journal
                                      └─ file / database / network / device / process / tool adapters
```

The gateway should make outside effects explicit, authorized, observable, and recoverable. Python source syntax should not need to change. Standard-library and native entry points must eventually route through the gateway; a wrapper around only agent tool calls would leave ordinary file or socket access unmanaged.

## Effect plan and capability

An effect request has a stable run ID and step ID, operation, target, arguments, capability reference, and optional idempotency key. Examples include `file.read`, `file.write`, `db.query`, `http.request`, `device.call`, `process.spawn`, and `tool.invoke`. A plan is the durable ordered record of requested effects and their dependencies, not an assumption that every action can be rolled back.

Capabilities are scoped grants. The policy checks the operation, canonical target, lifetime, and budget before dispatch. Examples: a directory subtree and read/write mode; allowed network hosts and ports; a device or method set; an executable allowlist; or a tool identity with a bounded call count. The runtime should give code no ambient access outside those grants.

## Durable journal and replay

Before executing an effect, record its identity and policy decision durably. Record the outcome or a reference to durable result data afterward. A journal entry should include `run_id`, `step_id`, operation, target, input digest or redacted input, capability, status, result digest/reference, and commit token when applicable. Secrets should not be copied into logs by default.

Recovery reads the journal to decide whether an effect is pending, committed, or needs reconciliation. Replay supplies a recorded result to the program and does **not** repeat the outside effect. It should detect divergence when the program requests a different operation or input at the same step. Time, randomness, and other nondeterministic inputs need the same treatment if exact replay is a goal.

## Transactions and their limits

For resources XLang3 owns, an adapter can stage changes and commit atomically where the underlying store supports it, such as a database transaction or file replacement on a suitable filesystem. Multiple independent external services cannot be promised a universal atomic transaction. For those calls, use idempotency keys, outcome reconciliation, and explicit compensation when the service supports them. The API must expose partial completion instead of pretending an entire plan rolled back.

## Sandbox enforcement

The managed gateway is a runtime contract; it is not sufficient security isolation by itself. A public execution host also needs OS/container restrictions for filesystem access, network egress, process creation, native extension loading, and resource use. Enforcement must account for symlinks, path normalization, DNS changes, inherited handles, and native modules that might bypass the gateway.

The website's current local playground starts a separate XLang3 process but **does not implement this sandbox**. Its public endpoint stays disabled until an isolated host and policy enforcement exist.

## Verification gates

1. Fixture coverage for every supported file, network, device, process, and tool adapter.
2. Policy-escape tests through Python standard-library calls and native packages.
3. Crash recovery at each journal state transition.
4. Replay that matches recorded outputs without issuing external effects.
5. Transaction tests for supported local resources, plus documented partial-failure behavior for remote services.

These gates distinguish the proposed capability from the currently implemented runtime and FastAPI integration.
