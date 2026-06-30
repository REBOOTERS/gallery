let mermaidInitialized = false;
let mermaidRenderCounter = 0;

async function renderMermaidDiagrams() {
  if (!window.mermaid) return;

  // Convert fenced blocks rendered as <pre class="mermaid"><code>...</code></pre>
  // into <div class="mermaid">...</div> so Mermaid can parse them reliably.
  document.querySelectorAll("pre.mermaid").forEach((pre) => {
    const code = pre.querySelector("code");
    const source = code ? code.textContent : pre.textContent;
    const container = document.createElement("div");
    container.className = "mermaid";
    container.textContent = source || "";
    pre.replaceWith(container);
  });

  if (!mermaidInitialized) {
    window.mermaid.initialize({
      startOnLoad: false,
      theme: "default",
      securityLevel: "loose",
    });
    mermaidInitialized = true;
  }

  const diagrams = document.querySelectorAll(".mermaid:not([data-mermaid-rendered='true'])");
  for (const diagram of diagrams) {
    const source = diagram.textContent || "";
    const id = `mermaid-diagram-${Date.now()}-${mermaidRenderCounter++}`;
    try {
      const result = await window.mermaid.render(id, source);
      diagram.innerHTML = result.svg;
      diagram.dataset.mermaidRendered = "true";
      if (typeof result.bindFunctions === "function") {
        result.bindFunctions(diagram);
      }
    } catch (error) {
      // Keep page usable when one chart has syntax issues.
      const pre = document.createElement("pre");
      const code = document.createElement("code");
      code.className = "language-mermaid";
      code.textContent = source;
      pre.appendChild(code);
      diagram.replaceWith(pre);
      // eslint-disable-next-line no-console
      console.warn("Mermaid render failed; fallback to code block.", error);
    }
  }
}

if (window.document$ && typeof window.document$.subscribe === "function") {
  window.document$.subscribe(renderMermaidDiagrams);
} else {
  window.addEventListener("DOMContentLoaded", renderMermaidDiagrams);
}
