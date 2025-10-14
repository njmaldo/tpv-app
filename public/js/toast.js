
/**
 * Muestra una notificación tipo toast.
 * @param {string} message - Texto del mensaje a mostrar
 * @param {"success" | "error"} [type="success"] - Tipo de toast
 */
function showToast(message, type = "success") {
  // Buscar contenedor o crearlo si no existe
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  // Crear el elemento del toast
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  // Forzar reflow para que las animaciones CSS se apliquen correctamente
  void toast.offsetWidth;

  // Agregar clase visible (por si usas animaciones CSS tipo fade/slide)
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300); // tiempo extra para fade-out
  }, 4000);
}

// Hacer la función accesible globalmente
window.showToast = showToast;
