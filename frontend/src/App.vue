<script setup>
import { computed, ref } from "vue";
import benchmark from "../data/benchmark.json";

const repo = "https://github.com/CantorAI/xlang3";
const oldRepo = "https://github.com/xlang-foundation/xlang";
const menuOpen = ref(false);
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
    "Direct scalar values, reference-counted objects, semantic binding, ProgramIR, and a direct interpreter form the current core.",
    `${repo}/blob/main/doc/xlang3-implementation-spec.md`,
  ],
  [
    "03",
    "FastAPI on XLang3",
    "Active validation",
    "FastAPI and its dependencies run on the XLang3 VM in integration tests. Full upstream compatibility remains open.",
    `${repo}/blob/main/agent/python314_compat/tasks/fastapi.md`,
  ],
  [
    "04",
    "Managed I/O for agents",
    "Design direction",
    "A proposed runtime boundary for permissions, tracing, cancellation, and replay across files, network, devices, and tools.",
    `${repo}/blob/main/doc/rpc-device-spec.md`,
  ],
];
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
    <a class="brand" href="#top" aria-label="XLang Foundation home"
      ><span class="brand-mark">X<span>⌁</span></span
      ><span class="brand-words">XLANG<br /><small>FOUNDATION</small></span></a
    ><button
      class="menu-toggle"
      type="button"
      :aria-expanded="menuOpen"
      aria-controls="main-nav"
      @click="menuOpen = !menuOpen"
    >
      Menu {{ menuOpen ? "−" : "+" }}
    </button>
    <nav id="main-nav" :class="{ open: menuOpen }" aria-label="Main navigation">
      <a href="#why" @click="menuOpen = false">Why XLang3</a
      ><a href="#architecture" @click="menuOpen = false">Architecture</a
      ><a href="#playground" @click="menuOpen = false">Try it</a
      ><a href="#benchmarks" @click="menuOpen = false">Benchmarks</a
      ><a href="#progress" @click="menuOpen = false">Progress</a
      ><a href="#history" @click="menuOpen = false">History</a>
    </nav>
    <a class="top-github" :href="repo" target="_blank" rel="noopener"
      >View source ↗</a
    >
  </header>
  <main id="top">
    <section class="hero wrap">
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
          ><a class="button button-link" href="#playground"
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
    <section class="statement" id="why">
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
    <section class="pillars wrap">
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
        <h3>AI-aware I/O</h3>
        <p>
          Our design direction is managed I/O: explicit capabilities and
          observable effects for agent workflows across files, network, and
          devices.
        </p>
        <span class="pill">DESIGN DIRECTION</span>
      </article>
    </section>
    <section class="philosophy wrap" id="philosophy">
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
              <b>Managed effects.</b> Develop capability-aware, observable I/O
              for agents and devices as a future runtime layer.
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
    <section class="architecture" id="architecture">
      <div class="wrap architecture-grid">
        <div>
          <div class="section-kicker light">02 / UNDER THE HOOD</div>
          <h2>One language.<br /><span>Clear boundaries.</span></h2>
          <p>
            The direct interpreter is the working path. Optimized execution,
            GraphIR, JIT, and AOT are staged goals, with LLVM optional rather
            than a runtime requirement.
          </p>
          <a
            class="text-link light-link"
            :href="`${repo}/blob/main/doc/roadmap-phase0-phase3.md`"
            target="_blank"
            rel="noopener"
            >Read the technical roadmap ↗</a
          >
        </div>
        <div class="pipeline">
          <div class="pipeline-top">
            EXECUTION PIPELINE <span>XL3 / 2026</span>
          </div>
          <div
            v-for="(step, i) in [
              ['Python source', 'ordinary .py files'],
              ['Parser + AST', 'syntax structure'],
              ['Semantic binding', 'scopes and slots'],
              ['ProgramIR', 'executable meaning'],
              ['XLang3 runtime', 'values, objects, executor'],
            ]"
            :key="i"
            class="pipeline-step"
            :class="{ highlighted: i === 4 }"
          >
            <span>0{{ i + 1 }}</span
            ><b>{{ step[0] }}</b
            ><small>{{ step[1] }}</small>
          </div>
          <div class="pipeline-end">
            GRAPH IR + JIT / AOT <span>FUTURE, OPTIONAL</span>
          </div>
        </div>
      </div>
    </section>
    <section class="playground-section wrap" id="playground">
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
    <section class="benchmark-section" id="benchmarks">
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
    <section class="progress-section" id="progress">
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
        <div class="progress-list">
          <a
            v-for="item in progress"
            :key="item[0]"
            class="progress-item"
            :href="item[4]"
            target="_blank"
            rel="noopener"
            ><span class="progress-number">{{ item[0] }}</span>
            <div>
              <h3>{{ item[1] }}</h3>
              <p>{{ item[3] }}</p>
            </div>
            <span class="progress-state">{{ item[2] }}</span
            ><span class="progress-arrow">↗</span></a
          >
        </div>
      </div>
    </section>
    <section class="history-section wrap" id="history">
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
    <section class="agent-band">
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
    <section class="join wrap">
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
      <a class="brand" href="#top"
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
