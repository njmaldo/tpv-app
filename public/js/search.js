(function () {
  // Inicializa el filtrado para un input dado
  function initSearch(input) {
    const targetSelector = input.dataset.target;
    if (!targetSelector) {
      console.warn("Search: input sin data-target:", input);
      return;
    }

    const table = document.querySelector(targetSelector);
    const tbody = table ? table.querySelector("tbody") : null;

    if (!table || !tbody) {
      console.warn("Search: tabla o tbody no encontrado para", targetSelector);
      return;
    }

    let rows = Array.from(tbody.querySelectorAll("tr"));
    const normalize = (s) => (s || "").replace(/\s+/g, " ").trim().toLowerCase();

    const updateRows = () => {
      rows = Array.from(tbody.querySelectorAll("tr"));
    };

    // Observer para actualizar si cambian las filas
    const mo = new MutationObserver(() => updateRows());
    mo.observe(tbody, { childList: true });

    // Filtrado en tiempo real
    input.addEventListener("input", (e) => {
      const q = normalize(e.target.value);
      if (!q) {
        rows.forEach((r) => (r.style.display = ""));
        return;
      }
      rows.forEach((r) => {
        const text = normalize(r.textContent);
        r.style.display = text.includes(q) ? "" : "none";
      });
    });

    // Atajos rápidos: Ctrl/Cmd+K y "/"
    window.addEventListener("keydown", (ev) => {
      const active = document.activeElement;
      const typing =
        active &&
        (active.tagName === "INPUT" ||
          active.tagName === "TEXTAREA" ||
          active.isContentEditable);
      if (typing) return;

      const isMac = navigator.platform.toUpperCase().includes("MAC");

      if ((isMac ? ev.metaKey : ev.ctrlKey) && ev.key.toLowerCase() === "k") {
        ev.preventDefault();
        input.focus();
        input.select();
      }

      if (ev.key === "/") {
        ev.preventDefault();
        input.focus();
        input.select();
      }
    });

    console.log(`✅ Search inicializado para ${targetSelector}`);
  }

  // Inicializa todos los inputs con data-target
  function initAllSearchInputs() {
    document.querySelectorAll("input[data-target]").forEach(initSearch);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAllSearchInputs);
  } else {
    initAllSearchInputs();
  }
})();
