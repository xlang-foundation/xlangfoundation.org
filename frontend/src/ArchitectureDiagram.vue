<template>
  <div
    class="architecture-diagram"
    tabindex="0"
    aria-label="Scrollable XLang3 architecture diagram"
  >
    <svg
      viewBox="0 0 940 730"
      role="img"
      aria-labelledby="architecture-title architecture-description"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title id="architecture-title">
        XLang3 source to execution architecture
      </title>
      <desc id="architecture-description">
        Python source passes through parsing and semantic binding to ProgramIR.
        ProgramIR crosses an executor interface. The available interpreter
        executor runs IR directly. A planned optional LLVM JIT or AOT executor
        will compile IR. Both executors use the XLang3 runtime, which can run as
        a standalone command-line program or be embedded in another application.
        A proposed managed I/O sandbox would mediate effects with capability
        checks, a durable journal, replay, and transaction support.
      </desc>
      <defs>
        <pattern
          id="arch-grid"
          width="24"
          height="24"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 24 0 L 0 0 0 24"
            fill="none"
            stroke="#314a5b"
            stroke-width="0.6"
          />
        </pattern>
        <marker
          id="arch-arrow"
          markerWidth="7"
          markerHeight="7"
          refX="5.5"
          refY="3.5"
          orient="auto"
        >
          <path
            d="M 0 0 L 7 3.5 L 0 7"
            fill="none"
            stroke="#a8cf8c"
            stroke-width="1.3"
          />
        </marker>
        <marker
          id="arch-arrow-muted"
          markerWidth="7"
          markerHeight="7"
          refX="5.5"
          refY="3.5"
          orient="auto"
        >
          <path
            d="M 0 0 L 7 3.5 L 0 7"
            fill="none"
            stroke="#8da6b4"
            stroke-width="1.3"
          />
        </marker>
      </defs>

      <rect width="940" height="730" fill="#1d3246" />
      <rect width="940" height="730" fill="url(#arch-grid)" />
      <text x="28" y="34" class="arch-meta">
        XLANG3 / EXECUTION ARCHITECTURE
      </text>
      <text x="912" y="34" class="arch-meta arch-right">SOURCE → RUNTIME</text>

      <path
        class="arch-line"
        d="M 190 101 H 243"
        marker-end="url(#arch-arrow)"
      />
      <path
        class="arch-line"
        d="M 407 101 H 460"
        marker-end="url(#arch-arrow)"
      />
      <path
        class="arch-line"
        d="M 624 101 H 677"
        marker-end="url(#arch-arrow)"
      />

      <g class="arch-box">
        <rect x="28" y="62" width="162" height="78" rx="3" />
        <text x="46" y="91" class="arch-label">PYTHON SOURCE</text>
        <text x="46" y="118" class="arch-detail">ordinary .py files</text>
      </g>
      <g class="arch-box">
        <rect x="244" y="62" width="163" height="78" rx="3" />
        <text x="262" y="91" class="arch-label">PARSER + AST</text>
        <text x="262" y="118" class="arch-detail">syntax structure</text>
      </g>
      <g class="arch-box">
        <rect x="461" y="62" width="163" height="78" rx="3" />
        <text x="479" y="91" class="arch-label">SEMANTIC BINDING</text>
        <text x="479" y="118" class="arch-detail">scopes and slots</text>
      </g>
      <g class="arch-box arch-ir">
        <rect x="678" y="62" width="234" height="78" rx="3" />
        <text x="696" y="91" class="arch-label">PROGRAM IR</text>
        <text x="696" y="118" class="arch-detail">
          one executable representation
        </text>
      </g>

      <path
        class="arch-line"
        d="M 795 140 V 192 H 603"
        marker-end="url(#arch-arrow)"
      />
      <g class="arch-interface">
        <rect x="337" y="165" width="262" height="54" rx="3" />
        <text x="357" y="188" class="arch-label">EXECUTOR INTERFACE</text>
        <text x="357" y="207" class="arch-detail">consumes ProgramIR</text>
      </g>
      <path
        class="arch-line"
        d="M 468 219 V 240 H 246 V 257"
        marker-end="url(#arch-arrow)"
      />
      <path
        class="arch-line arch-line-muted"
        d="M 468 219 V 240 H 695 V 257"
        marker-end="url(#arch-arrow-muted)"
      />

      <g class="arch-executor arch-active">
        <rect x="28" y="260" width="435" height="132" rx="3" />
        <rect
          x="45"
          y="278"
          width="112"
          height="22"
          rx="11"
          class="arch-tag-bg"
        />
        <text x="101" y="293" class="arch-tag" text-anchor="middle">
          AVAILABLE NOW
        </text>
        <text x="48" y="334" class="arch-heading">Interpreter executor</text>
        <text x="48" y="366" class="arch-detail">
          Scalar, local-slot, call, and cache fast paths
        </text>
      </g>
      <g class="arch-executor arch-upcoming">
        <rect x="478" y="260" width="434" height="132" rx="3" />
        <rect
          x="495"
          y="278"
          width="165"
          height="22"
          rx="11"
          class="arch-tag-bg"
        />
        <text x="577" y="293" class="arch-tag" text-anchor="middle">
          NEXT TO VERIFY
        </text>
        <text x="498" y="334" class="arch-heading">LLVM executor</text>
        <text x="498" y="366" class="arch-detail">
          Optional JIT / AOT compilation; results pending
        </text>
      </g>

      <path
        class="arch-line"
        d="M 246 392 V 427 H 469 V 441"
        marker-end="url(#arch-arrow)"
      />
      <path class="arch-line arch-line-muted" d="M 695 392 V 427 H 471" />
      <g class="arch-runtime">
        <rect x="260" y="445" width="420" height="73" rx="3" />
        <text x="280" y="476" class="arch-label">XLANG3 RUNTIME</text>
        <text x="280" y="502" class="arch-detail">
          X::Value objects + compiler-neutral C ABI
        </text>
      </g>
      <path
        class="arch-line"
        d="M 470 518 V 541 H 246 V 552"
        marker-end="url(#arch-arrow)"
      />
      <path
        class="arch-line arch-line-muted"
        d="M 470 518 V 541 H 695 V 552"
        marker-end="url(#arch-arrow-muted)"
      />
      <g class="arch-deployment">
        <rect x="28" y="556" width="435" height="126" rx="3" />
        <text x="48" y="581" class="arch-meta">AVAILABLE DEPLOYMENT</text>
        <text x="48" y="620" class="arch-heading">Standalone or embedded</text>
        <text x="48" y="650" class="arch-detail">
          CLI · shared library · static library
        </text>
      </g>
      <g class="arch-io">
        <rect x="478" y="556" width="434" height="126" rx="3" />
        <text x="498" y="581" class="arch-meta">DESIGN DIRECTION</text>
        <text x="498" y="620" class="arch-heading">Managed I/O sandbox</text>
        <text x="498" y="646" class="arch-detail">
          Files · network · devices · processes · tools
        </text>
        <text x="498" y="665" class="arch-detail arch-detail-small">
          Capabilities · durable log · replay · transactions
        </text>
      </g>
      <text x="470" y="710" class="arch-footer" text-anchor="middle">
        EXECUTORS RUN IR; EFFECTS CROSS A MANAGED BOUNDARY
      </text>
    </svg>
  </div>
</template>

<style scoped>
.architecture-diagram {
  overflow-x: auto;
  border: 1px solid #496075;
  background: #1d3246;
  box-shadow: 18px 18px 0 #112035;
}
svg {
  display: block;
  width: 100%;
  min-width: 760px;
  height: auto;
}
.arch-meta,
.arch-label,
.arch-detail,
.arch-tag,
.arch-deploy,
.arch-footer {
  font-family: "DM Mono", monospace;
}
.arch-meta {
  fill: #a9b7b9;
  font-size: 10px;
  letter-spacing: 1.1px;
}
.arch-right {
  text-anchor: end;
}
.arch-line {
  fill: none;
  stroke: #a8cf8c;
  stroke-width: 1.6;
}
.arch-line-muted {
  stroke: #8da6b4;
  stroke-dasharray: 5 4;
}
.arch-box rect {
  fill: #233c4e;
  stroke: #63867c;
}
.arch-ir rect,
.arch-interface rect,
.arch-runtime rect {
  fill: #335344;
  stroke: #bce993;
}
.arch-label {
  fill: #f3f7ed;
  font-size: 14px;
  font-weight: 700;
}
.arch-detail {
  fill: #b8c9c6;
  font-size: 11px;
}
.arch-detail-small {
  font-size: 10px;
}
.arch-executor > rect:first-child {
  fill: #233c4e;
  stroke: #8cb87d;
}
.arch-upcoming > rect:first-child {
  stroke: #718b9a;
  stroke-dasharray: 6 4;
}
.arch-tag-bg {
  fill: #bce993;
  stroke: none;
}
.arch-upcoming .arch-tag-bg {
  fill: #9fb9c2;
}
.arch-tag {
  fill: #1b3344;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.7px;
}
.arch-heading {
  fill: #f4f8f1;
  font-family: "Space Grotesk", sans-serif;
  font-size: 25px;
  font-weight: 700;
}
.arch-runtime rect {
  fill: #31543f;
  stroke: #bce993;
}
.arch-deploy,
.arch-footer {
  fill: #d4e9d0;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 1px;
}
.arch-deployment rect {
  fill: #233c4e;
  stroke: #8cb87d;
}
.arch-io rect {
  fill: #233c4e;
  stroke: #718b9a;
  stroke-dasharray: 6 4;
}
.arch-footer {
  font-size: 10px;
  fill: #a9b7b9;
}
@media (max-width: 800px) {
  svg {
    width: 760px;
  }
}
</style>
