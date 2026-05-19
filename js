function buscarRadar() {
  const input = document.getElementById("searchInput");
  const result = document.getElementById("searchResult");

  if (!input || !result) return;

  const busqueda = input.value.trim();

  if (busqueda === "") {
    result.style.color = "#ef4444"; // Color de alerta/error sutil
    result.textContent = "Escribe una zona, negocio o categoría para buscar en Radar.";
    return;
  }

  result.style.color = "#0f766e"; // Color principal correcto
  result.textContent = `Buscando en Radar: "${busqueda}"...`;

  // Simulación de respuesta asíncrona optimizada
  setTimeout(() => {
    result.textContent = `Próximamente verás los comercios y mapas disponibles para: "${busqueda}"`;
  }, 800);
}

// Escuchar evento Enter en el input de manera limpia
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");

  if (searchInput) {
    searchInput.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault(); // Evita recargas inesperadas de página
        buscarRadar();
      }
    });
  }
});
