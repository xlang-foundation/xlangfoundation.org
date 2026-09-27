<script setup>
import { computed, nextTick, onUnmounted, ref, watch } from "vue";
import benchmark from "../data/benchmark.json";
import ArchitectureDiagram from "./ArchitectureDiagram.vue";

const repo = "https://github.com/CantorAI/xlang3";
const oldRepo = "https://github.com/xlang-foundation/xlang";
const tabs = [
  { path: "/", name: "Home", short: "Home", number: "01" },
  { path: "/architecture", name: "Architecture", short: "Arch", number: "02" },
  { path: "/try", name: "Try XLang3", short: "Try", number: "03" },
  { path: "/benchmarks", name: "Benchmarks", short: "Bench", number: "04" },
  { path: "/project", name: "Project", short: "Project", number: "05" },
];
const legacySections = {
  "#architecture": "/architecture",
  "#playground": "/try",
  "#benchmarks": "/benchmarks",
  "#progress": "/project#progress",
  "#history": "/project#history",
};
if (window.location.pathname === "/" && legacySections[window.location.hash]) {
  window.location.replace(legacySections[window.location.hash]);
}
const pagePath = ref(window.location.pathname);
const page = computed(
  () => tabs.find((tab) => tab.path === pagePath.value) || tabs[0],
);
const homePanel = ref("overview");
const architecturePanel = ref("diagram");
const projectPanel = ref(
  window.location.hash === "#history" ? "history" : "progress",
);
function selectPanel(group, value) {
  if (group === "home") homePanel.value = value;
  if (group === "architecture") architecturePanel.value = value;
  if (group === "project") projectPanel.value = value;
  nextTick(() => window.scrollTo(0, 0));
}
watch(
  page,
  (current) => {
    document.title = `${current.name} — XLang Foundation`;
  },
  { immediate: true },
);
function navigate(event, path) {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return;
  }
  event.preventDefault();
  if (window.location.pathname !== path) {
    window.history.pushState({}, "", path);
    pagePath.value = path;
  }
  nextTick(() => window.scrollTo(0, 0));
}
function onPopState() {
  pagePath.value = window.location.pathname;
}
window.addEventListener("popstate", onPopState);
onUnmounted(() => window.removeEventListener("popstate", onPopState));
const caseIndex = ref(0);
const selected = computed(() => benchmark.cases[caseIndex.value]);
const maxTime = computed(() =>
  Math.max(selected.value.cpython_ms, selected.value.xlang3_ms),
);
const width = (value) => `${Math.max(5, (value / maxTime.value) * 100)}%`;
const measured = new Date(benchmark.measured_at).toLocaleDateString("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});
const examples = [
  {
    name: "Hello, XLang3",
    code: 'def greet(name):\n    return "Hello, " + name + "!"\n\nprint(greet("XLang3"))',
  },
  {
    name: "Lists and loops",
    code: "values = [2, 3, 5, 7]\ntotal = 0\nfor value in values:\n    total = total + value\nprint(total)",
  },
  {
    name: "Functions",
    code: "def square(x):\n    return x * x\n\nfor number in range(1, 6):\n    print(square(number))",
  },
];
const exampleIndex = ref(0);
const code = ref(examples[0].code);
const output = ref("Run the example to see XLang3 output.");
const running = ref(false);
const playgroundStatus = ref("checking");
fetch("/api/playground/status")
  .then((r) => r.json())
  .then((data) => {
    playgroundStatus.value = data.enabled ? "ready" : "disabled";
  })
  .catch(() => {
    playgroundStatus.value = "unavailable";
  });
function chooseExample(index) {
  exampleIndex.value = index;
  code.value = examples[index].code;
  output.value = "Run the example to see XLang3 output.";
}
async function runCode() {
  if (running.value || playgroundStatus.value !== "ready") return;
  running.value = true;
  output.value = "Running in a separate XLang3 process…";
  try {
    const response = await fetch("/api/playground/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: code.value }),
    });
    const data = await response.json();
    output.value = data.output || data.detail || "(no output)";
  } catch {
    output.value = "The playground is unavailable. Try again later.";
  } finally {
    running.value = false;
  }
}
const progress = [
  [
    "01",
    "Python source compatibility",
    "In progress",
    "Python 3.14 syntax and real pure Python library source are the target. Each compatibility claim needs a passing fixture.",
    `${repo}/tree/main/agent/python314_compat`,
  ],
  [
    "02",
    "XLang3 runtime",
    "Foundation implemented",
    "ProgramIR and its interpreter run on the XLang3 value runtime. Shared and static runtime libraries support embedding; the CLI supports standalone use.",
    `${repo}/blob/main/doc/runtime-c-abi-spec.md`,
  ],
  [
    "03",
    "LLVM compiled executor",
    "Next verification milestone",
    "An optional LLVM JIT/AOT executor is planned over IR. Correctness, performance, and deployment claims await verification.",
    `${repo}/blob/main/doc/executor-spec.md`,
  ],
  [
    "04",
    "FastAPI on XLang3",
    "Active validation",
    "FastAPI and its dependencies run on the XLang3 VM in integration tests. Full upstream compatibility remains open.",
    `${repo}/blob/main/agent/python314_compat/tasks/fastapi.md`,
  ],
  [
    "05",
    "Managed I/O sandbox",
    "Design direction",
    "A proposed capability boundary for all outside access: files, network, devices, processes, and tools, with a durable journal, replay, and transaction support.",
    "https://github.com/xlang-foundation/xlangfoundation.org/blob/main/docs/managed-io-sandbox.md",
  ],
];
const progressIndex = ref(0);
const currentProgress = computed(() => progress[progressIndex.value]);
</script>

<template>
  <div class="announcement">
    <span class="live-dot"></span> Open development · XLang3 is in active
    compatibility work
    <a :href="`${repo}/commits/main/`" target="_blank" rel="noopener"
      >Follow commits ↗</a
    >
  </div>
  <header class="topbar wrap">
    <a
      class="brand"
      href="/"
      aria-label="XLang Foundation home"
      @click="navigate($event, '/')"
      ><span class="brand-mark">X<span>⌁</span></span
      ><span class="brand-words">XLANG<br /><small>FOUNDATION</small></span></a
    >
    <nav class="desktop-tabs" aria-label="Main pages">
      <a
        v-for="tab in tabs"
        :key="tab.path"
        :href="tab.path"
        :class="{ active: page.path === tab.path }"
        :aria-current="page.path === tab.path ? 'page' : undefined"
        @click="navigate($event, tab.path)"
        >{{ tab.name }}</a
      >
    </nav>
    <a class="top-github" :href="repo" target="_blank" rel="noopener"
      >View source ↗</a
    >
  </header>
  <nav class="mobile-tabs" aria-label="Main pages">
    <a
      v-for="tab in tabs"
      :key="tab.path"
      :href="tab.path"
      :class="{ active: page.path === tab.path }"
      :aria-current="page.path === tab.path ? 'page' : undefined"
      @click="navigate($event, tab.path)"
      ><span>{{ tab.number }}</span
      >{{ tab.short }}</a
    >
  </nav>
  <main id="top">
    <nav
      v-if="page.path === '/'"
      class="in-page-tabs wrap home-page-tabs"
      aria-label="Home sections"
    >
      <button
        type="button"
        :class="{ active: homePanel === 'overview' }"
        :aria-current="homePanel === 'overview' ? 'true' : undefined"
        @click="selectPanel('home', 'overview')"
      >
        Overview
      </button>
      <button
        type="button"
        :class="{ active: homePanel === 'idea' }"
        :aria-current="homePanel === 'idea' ? 'true' : undefined"
        @click="selectPanel('home', 'idea')"
      >
        Why XLang3
      </button>
      <button
        type="button"
        :class="{ active: homePanel === 'philosophy' }"
        :aria-current="homePanel === 'philosophy' ? 'true' : undefined"
        @click="selectPanel('home', 'philosophy')"
      >
        Philosophy
      </button>
    </nav>
    <section
      v-if="page.path === '/' && homePanel === 'overview'"
      class="hero wrap"
    >
      <div class="hero-copy">
        <div class="eyebrow">
          <span></span> AN OPEN-SOURCE LANGUAGE PROJECT, REDESIGNED
        </div>
        <h1>
          Python syntax.<br /><em>A new runtime.</em><br />Built in the open.
        </h1>
        <p>
          XLang3 is a fresh runtime for familiar Python code, shaped for the
          next generation of AI applications. We publish the architecture,
          unfinished work, and numbers along the way.
        </p>
        <div class="hero-actions">
          <a
            class="button button-dark"
            :href="repo"
            target="_blank"
            rel="noopener"
            >Explore XLang3 on GitHub <span>↗</span></a
          ><a
            class="button button-link"
            href="/try"
            @click="navigate($event, '/try')"
            >Try XLang3 <span>↓</span></a
          >
        </div>
        <div class="hero-foot">
          <span><b>Python 3.14</b> compatibility target</span
          ><span><b>Apache 2.0</b> runtime license</span
          ><span><b>Public</b> development</span>
        </div>
      </div>
      <div class="hero-visual" aria-label="XLang3 architecture illustration">
        <div class="visual-head">
          <span>XLANG3 / RUNTIME MAP</span><span>001—003</span>
        </div>
        <div class="orbit orbit-one"></div>
        <div class="orbit orbit-two"></div>
        <div class="visual-center">
          <div class="visual-x">X<span>3</span></div>
          <div class="visual-sub">DESIGNED FOR<br />WHAT'S NEXT</div>
        </div>
        <div class="visual-node node-a">PYTHON SOURCE <span>↘</span></div>
        <div class="visual-node node-b">SEMANTIC IR <span>→</span></div>
        <div class="visual-node node-c">VALUE RUNTIME <span>↗</span></div>
        <div class="visual-base">
          SOURCE → PARSER → AST → SEMA → IR → EXECUTOR
        </div>
      </div>
    </section>
    <section
      v-if="page.path === '/' && homePanel === 'idea'"
      class="statement"
      id="why"
    >
      <div class="wrap statement-grid">
        <div class="section-kicker">01 / THE IDEA</div>
        <div>
          <h2>
            Keep the language familiar.<br /><span>Rethink what runs it.</span>
          </h2>
          <p>
            XLang3 aims to run ordinary Python syntax and pure Python libraries
            while retaining XLang's own value and object model. It is a new
            implementation, not a CPython fork. The goal is compatibility where
            developers need it and room for a different execution architecture
            underneath.
          </p>
          <a
            class="text-link"
            :href="`${repo}/blob/main/README.md`"
            target="_blank"
            rel="noopener"
            >Read the project overview ↗</a
          >
        </div>
      </div>
    </section>
    <section
      v-if="page.path === '/' && homePanel === 'idea'"
      class="pillars wrap"
    >
      <article>
        <div class="pillar-index">01 <span>↗</span></div>
        <h3>Familiar Python</h3>
        <p>
          Python 3.14 is the syntax and library target. Real CPython
          <code>Lib/*.py</code> source is the test, rather than native clones of
          each library.
        </p>
        <span class="pill">TARGET · IN PROGRESS</span>
      </article>
      <article>
        <div class="pillar-index">02 <span>↗</span></div>
        <h3>A distinct runtime</h3>
        <p>
          Direct scalar values, XLang objects, reference counting, and a C ABI
          sit behind the syntax. Parsing, binding, IR, and execution each have a
          clear role.
        </p>
        <span class="pill">FOUNDATION IMPLEMENTED</span>
      </article>
      <article>
        <div class="pillar-index">03 <span>↗</span></div>
        <h3>Managed outside access</h3>
        <p>
          The proposed I/O sandbox mediates every outside effect: files,
          network, devices, processes, and tools. Capability checks, a durable
          record, replay, and transactions are the design goals.
        </p>
        <span class="pill">DESIGN DIRECTION</span>
      </article>
    </section>
    <section
      v-if="page.path === '/' && homePanel === 'philosophy'"
      class="philosophy wrap"
      id="philosophy"
    >
      <div class="section-kicker">THE XLANG3 PHILOSOPHY</div>
      <div class="philosophy-grid">
        <h2>
          Compatible at the surface.<br /><span>Independent at the core.</span>
        </h2>
        <div>
          <p>
            Write familiar Python. Let XLang3 own the runtime beneath it. Keep
            effects visible, make execution paths explicit, and measure claims
            against working software.
          </p>
          <ul>
            <li>
              <b>Source compatibility first.</b> Run real Python code and
              library source; report unsupported behavior precisely.
            </li>
            <li>
              <b>Runtime ownership.</b> Use XLang values and objects instead of
              relying on CPython internals.
            </li>
            <li>
              <b>Composable execution.</b> Separate parsing, semantic binding,
              IR, and executors so optimization can evolve without changing the
              language.
            </li>
            <li>
              <b>Managed effects.</b> Route every outside access through a
              capability-aware boundary with durable records as a future runtime
              layer.
            </li>
          </ul>
          <a
            class="text-link"
            :href="`${repo}/blob/main/doc/xlang3-implementation-spec.md`"
            target="_blank"
            rel="noopener"
            >Read the implementation principles ↗</a
          >
        </div>
      </div>
    </section>
    <section
      v-if="page.path === '/architecture'"
      class="architecture"
      id="architecture"
    >
      <div class="wrap">
        <div class="architecture-intro">
          <div>
            <div class="section-kicker light">02 / UNDER THE HOOD</div>
            <h2>Interpret now.<br /><span>Compile when ready.</span></h2>
          </div>
          <p>
            Python source lowers to ProgramIR. Executors consume IR: the
            interpreter executor runs it today, while an optional LLVM compiled
            executor is the next verification milestone. Both use the XLang3
            runtime.
          </p>
        </div>
        <nav class="in-page-tabs" aria-label="Architecture sections">
          <button
            type="button"
            :class="{ active: architecturePanel === 'diagram' }"
            :aria-current="architecturePanel === 'diagram' ? 'true' : undefined"
            @click="selectPanel('architecture', 'diagram')"
          >
            Runtime map
          </button>
          <button
            type="button"
            :class="{ active: architecturePanel === 'executors' }"
            :aria-current="
              architecturePanel === 'executors' ? 'true' : undefined
            "
            @click="selectPanel('architecture', 'executors')"
          >
            Executors
          </button>
          <button
            type="button"
            :class="{ active: architecturePanel === 'io' }"
            :aria-current="architecturePanel === 'io' ? 'true' : undefined"
            @click="selectPanel('architecture', 'io')"
          >
            Managed I/O
          </button>
        </nav>
        <div v-if="architecturePanel === 'diagram'" class="in-page-panel">
          <ArchitectureDiagram />
          <p class="diagram-hint">
            Scroll horizontally to explore the diagram.
          </p>
        </div>
        <div
          v-if="architecturePanel === 'executors'"
          class="architecture-benefits in-page-panel"
        >
          <div>
            <span>01 / NO COMPILER REQUIRED</span>
            <h3>Interpreter executor.</h3>
            <p>
              The interpreter already has scalar, local-slot, call, and cache
              fast paths. It works without LLVM; current measured
              microbenchmarks remain slower than CPython.
            </p>
            <a
              class="text-link light-link"
              href="/benchmarks"
              @click="navigate($event, '/benchmarks')"
              >See the measured results ↗</a
            >
          </div>
          <div>
            <span>02 / OPTIONAL COMPILATION</span>
            <h3>Compiled executor.</h3>
            <p>
              JIT and ahead-of-time compilation are planned as optional
              executors over IR. We will measure the compiled path after it
              passes correctness verification.
            </p>
            <a
              class="text-link light-link"
              :href="`${repo}/blob/main/doc/executor-spec.md`"
              target="_blank"
              rel="noopener"
              >Read the executor design ↗</a
            >
          </div>
          <div>
            <span>03 / TWO WAYS TO DEPLOY</span>
            <h3>Embed or run standalone.</h3>
            <p>
              Use the XLang3 command-line executable, or integrate the runtime
              through its shared or static library and compiler-neutral C ABI.
            </p>
            <a
              class="text-link light-link"
              :href="`${repo}/blob/main/doc/runtime-c-abi-spec.md`"
              target="_blank"
              rel="noopener"
              >Read the runtime ABI ↗</a
            >
          </div>
        </div>
        <div
          v-if="architecturePanel === 'io'"
          class="managed-io-panel in-page-panel"
        >
          <div>
            <span>PROPOSED / MANAGED I/O SANDBOX</span>
            <h3>Every effect crosses a boundary.</h3>
            <p>
              File access, network calls, devices, subprocesses, and external
              tools would require scoped capabilities. The sandbox would record
              each requested effect and result durably, enabling review and
              replay without silently repeating an outside action.
            </p>
          </div>
          <div>
            <ol>
              <li>
                <b>Authorize</b> the operation against an explicit capability.
              </li>
              <li>
                <b>Record</b> intent, outcome, and checkpoints in a durable
                journal.
              </li>
              <li>
                <b>Commit or replay</b> supported local transactions; use
                idempotency or compensation for external services.
              </li>
            </ol>
            <a
              class="text-link light-link"
              href="https://github.com/xlang-foundation/xlangfoundation.org/blob/main/docs/managed-io-sandbox.md"
              target="_blank"
              rel="noopener"
              >Read the managed I/O proposal ↗</a
            >
          </div>
        </div>
      </div>
    </section>
    <section
      v-if="page.path === '/try'"
      class="playground-section wrap"
      id="playground"
    >
      <div class="section-heading">
        <div>
          <div class="section-kicker">03 / EXPERIENCE THE RUNTIME</div>
          <h2>Try XLang3.</h2>
          <p>
            Each run starts a separate XLang3 process. Try a small Python
            program and see its real output.
          </p>
        </div>
        <span class="status-pill" :class="playgroundStatus">{{
          playgroundStatus === "ready"
            ? "● Playground ready"
            : playgroundStatus === "checking"
              ? "Checking playground"
              : "Playground offline"
        }}</span>
      </div>
      <div class="playground-card">
        <div class="playground-toolbar">
          <div class="window-dots"><i></i><i></i><i></i></div>
          <span>PLAYGROUND / MAIN.PY</span
          ><select
            aria-label="Choose an example"
            :value="exampleIndex"
            @change="chooseExample(Number($event.target.value))"
          >
            <option
              v-for="(item, index) in examples"
              :key="item.name"
              :value="index"
            >
              {{ item.name }}
            </option>
          </select>
        </div>
        <div class="playground-grid">
          <div class="editor">
            <label for="source-code">PYTHON SOURCE</label
            ><textarea
              id="source-code"
              v-model="code"
              spellcheck="false"
              aria-label="Python code"
            ></textarea>
          </div>
          <div class="console">
            <div class="console-title">OUTPUT <span>XLang3 process</span></div>
            <pre>{{ output }}</pre>
          </div>
        </div>
        <div class="playground-bottom">
          <span>Small examples only · 3 second timeout · output capped</span
          ><button
            type="button"
            :disabled="running || playgroundStatus !== 'ready'"
            @click="runCode"
          >
            {{ running ? "Running…" : "Run code →" }}
          </button>
        </div>
      </div>
      <p class="playground-caption">
        The public playground requires an isolated execution host. This site's
        backend exposes it only when that host is configured.
      </p>
    </section>
    <section
      v-if="page.path === '/benchmarks'"
      class="benchmark-section"
      id="benchmarks"
    >
      <div class="wrap">
        <div class="section-heading">
          <div>
            <div class="section-kicker">04 / MEASURED, NOT MARKETED</div>
            <h2>Performance in the open.</h2>
            <p>
              Real measurements from the same unmodified Python source on both
              interpreters. Today, XLang3 is slower on these four
              microbenchmarks. This is a baseline for improvement.
            </p>
          </div>
          <a
            class="text-link"
            href="/data/benchmark.json"
            target="_blank"
            rel="noopener"
            >Download raw samples ↗</a
          >
        </div>
        <div class="benchmark-card">
          <div
            class="benchmark-tabs"
            role="tablist"
            aria-label="Benchmark cases"
          >
            <button
              v-for="(item, index) in benchmark.cases"
              :key="item.name"
              type="button"
              role="tab"
              :aria-selected="caseIndex === index"
              :class="{ active: caseIndex === index }"
              @click="caseIndex = index"
            >
              {{ item.name.replaceAll("_", " ") }}
            </button>
          </div>
          <div class="benchmark-body">
            <div class="benchmark-title">
              <div>
                <span class="data-label">SELECTED CASE</span>
                <h3>{{ selected.name.replaceAll("_", " ") }}</h3>
              </div>
              <a
                :href="`${repo}/blob/main/benchmarks/cases/${selected.name}.py`"
                target="_blank"
                rel="noopener"
                >View source ↗</a
              >
            </div>
            <div class="bar-row">
              <div class="bar-label">
                <span>CPython</span
                ><strong>{{ selected.cpython_ms.toFixed(1) }} ms</strong>
              </div>
              <div class="bar-track">
                <div
                  class="bar bar-python"
                  :style="{ width: width(selected.cpython_ms) }"
                ></div>
              </div>
            </div>
            <div class="bar-row">
              <div class="bar-label">
                <span>XLang3</span
                ><strong>{{ selected.xlang3_ms.toFixed(1) }} ms</strong>
              </div>
              <div class="bar-track">
                <div
                  class="bar bar-xlang"
                  :style="{ width: width(selected.xlang3_ms) }"
                ></div>
              </div>
            </div>
            <div class="benchmark-note">
              <b>{{ selected.ratio.toFixed(2) }}×</b> XLang3 / CPython elapsed
              time <span>Lower is better</span>
            </div>
          </div>
          <div class="benchmark-meta">
            Measured {{ measured }} UTC · {{ benchmark.cpython_version }} ·
            {{ benchmark.method }}
            <a
              :href="`${repo}/commit/${benchmark.xlang3_revision}`"
              target="_blank"
              rel="noopener"
              >Runtime revision {{ benchmark.xlang3_revision.slice(0, 7) }} ↗</a
            ><span>Host: {{ benchmark.host }}</span>
          </div>
        </div>
        <p class="benchmark-caveat">
          These narrow VM microbenchmarks do not represent whole applications.
          The broader
          <a
            :href="`${repo}/tree/main/benchmarks/pyperformance`"
            target="_blank"
            rel="noopener"
            >pyperformance track</a
          >
          has no supported cases yet.
        </p>
      </div>
    </section>
    <nav
      v-if="page.path === '/project'"
      class="in-page-tabs wrap project-page-tabs"
      aria-label="Project sections"
    >
      <button
        type="button"
        :class="{ active: projectPanel === 'progress' }"
        :aria-current="projectPanel === 'progress' ? 'true' : undefined"
        @click="selectPanel('project', 'progress')"
      >
        Progress
      </button>
      <button
        type="button"
        :class="{ active: projectPanel === 'history' }"
        :aria-current="projectPanel === 'history' ? 'true' : undefined"
        @click="selectPanel('project', 'history')"
      >
        History
      </button>
      <button
        type="button"
        :class="{ active: projectPanel === 'workflow' }"
        :aria-current="projectPanel === 'workflow' ? 'true' : undefined"
        @click="selectPanel('project', 'workflow')"
      >
        How we build
      </button>
      <button
        type="button"
        :class="{ active: projectPanel === 'contribute' }"
        :aria-current="projectPanel === 'contribute' ? 'true' : undefined"
        @click="selectPanel('project', 'contribute')"
      >
        Contribute
      </button>
    </nav>
    <section
      v-if="page.path === '/project' && projectPanel === 'progress'"
      class="progress-section"
      id="progress"
    >
      <div class="wrap">
        <div class="section-heading">
          <div>
            <div class="section-kicker">05 / WORK IN PUBLIC</div>
            <h2>Where the project stands.</h2>
            <p>
              Progress is a set of verified capabilities and open gaps, rather
              than a percentage toward a promise.
            </p>
          </div>
          <a
            class="text-link"
            :href="`${repo}/tree/main/agent/python314_compat/tasks`"
            target="_blank"
            rel="noopener"
            >Browse the work log ↗</a
          >
        </div>
        <div class="progress-browser">
          <div class="progress-picker" aria-label="Project milestones">
            <button
              v-for="(item, index) in progress"
              :key="item[0]"
              type="button"
              :class="{ active: progressIndex === index }"
              :aria-current="progressIndex === index ? 'true' : undefined"
              @click="progressIndex = index"
            >
              <span>{{ item[0] }}</span
              >{{ item[1] }}
            </button>
          </div>
          <article class="progress-detail">
            <span class="progress-number"
              >MILESTONE {{ currentProgress[0] }} / 05</span
            >
            <h3>{{ currentProgress[1] }}</h3>
            <span class="progress-state">{{ currentProgress[2] }}</span>
            <p>{{ currentProgress[3] }}</p>
            <a :href="currentProgress[4]" target="_blank" rel="noopener"
              >Read the evidence ↗</a
            >
          </article>
        </div>
      </div>
    </section>
    <section
      v-if="page.path === '/project' && projectPanel === 'history'"
      class="history-section wrap"
      id="history"
    >
      <div class="history-intro">
        <div class="section-kicker">06 / HOW WE GOT HERE</div>
        <h2>From XLang<br /><span>to XLang3.</span></h2>
        <p>
          The redesign keeps the original project's interest in dynamic,
          distributed computing and gives Python compatibility and runtime
          architecture a more explicit foundation.
        </p>
      </div>
      <div class="history-line">
        <article>
          <span class="history-dot"></span><small>THE ORIGINAL PROJECT</small>
          <h3>XLang</h3>
          <p>
            A dynamic language project for AI, IoT, and distributed
            applications. Its universal value and object ideas carry forward.
          </p>
          <a :href="oldRepo" target="_blank" rel="noopener"
            >Original repository ↗</a
          >
        </article>
        <article>
          <span class="history-dot"></span><small>THE REDESIGN · 2026</small>
          <h3>XLang3</h3>
          <p>
            A Python-compatible frontend, semantic model, IR pipeline, and
            independent runtime in a new codebase.
          </p>
          <a :href="repo" target="_blank" rel="noopener">XLang3 repository ↗</a>
        </article>
        <article>
          <span class="history-dot"></span><small>THE DIRECTION</small>
          <h3>Agent-native systems</h3>
          <p>
            Managed I/O and optional optimized executors are design work ahead.
            We will publish evidence as capabilities land.
          </p>
          <a
            :href="`${repo}/blob/main/doc/rpc-device-spec.md`"
            target="_blank"
            rel="noopener"
            >Device and RPC design ↗</a
          >
        </article>
      </div>
    </section>
    <section
      v-if="page.path === '/project' && projectPanel === 'workflow'"
      class="agent-band"
    >
      <div class="wrap agent-grid">
        <div>
          <div class="section-kicker light">
            AN EXPERIMENT IN HOW SOFTWARE IS MADE
          </div>
          <h2>Agent-authored.<br />Human-directed.</h2>
        </div>
        <div>
          <p>
            XLang3 follows an agentic coding workflow: people set goals and
            review evidence; coding agents generate the implementation, with no
            manually written implementation lines. Source, tests, and work
            history are public so contributors can inspect the result.
          </p>
          <a
            class="button button-outline"
            :href="`${repo}/commits/main/`"
            target="_blank"
            rel="noopener"
            >See the commit history ↗</a
          >
        </div>
      </div>
    </section>
    <section
      v-if="page.path === '/project' && projectPanel === 'contribute'"
      class="join wrap"
    >
      <div>
        <div class="section-kicker">07 / BUILD WITH US</div>
        <h2>Open source means<br /><span>open questions, too.</span></h2>
        <p>
          Read the code, inspect the benchmark method, reproduce a result, or
          help close a compatibility gap. The project is young enough for
          contributions to shape it.
        </p>
      </div>
      <div class="join-links">
        <a :href="repo" target="_blank" rel="noopener"
          ><span>01</span> XLang3 repository <b>↗</b></a
        ><a :href="`${repo}/issues`" target="_blank" rel="noopener"
          ><span>02</span> Issues <b>↗</b></a
        ><a :href="`${repo}/tree/main/doc`" target="_blank" rel="noopener"
          ><span>03</span> Architecture documents <b>↗</b></a
        ><a href="/data/benchmark.json" target="_blank" rel="noopener"
          ><span>04</span> Benchmark evidence <b>↗</b></a
        >
      </div>
    </section>
  </main>
  <footer>
    <div class="wrap footer-inner">
      <a class="brand" href="/" @click="navigate($event, '/')"
        ><span class="brand-mark">X<span>⌁</span></span
        ><span class="brand-words"
          >XLANG<br /><small>FOUNDATION</small></span
        ></a
      >
      <p>
        Vue frontend · FastAPI served by XLang3.<br />Open source, measured, and
        in progress.
      </p>
      <div>
        <a :href="repo" target="_blank" rel="noopener">GitHub ↗</a
        ><a href="#top">Back to top ↑</a>
      </div>
    </div>
  </footer>
</template>
