function buscarRadar() {
  const input = document.getElementById("searchInput");
  const result = document.getElementById("searchResult");

  const busqueda = input.value.trim().toLowerCase();

  if (busqueda === "") {
    result.textContent = "Escribe una zona, negocio o categoría para buscar en Radar.";
    return;
  }

  result.textContent = `Buscando en Radar: "${input.value}"`;

  // Por ahora esto es una búsqueda simulada.
  // Después aquí conectamos las páginas reales por provincia, distrito, sector y categoría.

  setTimeout(() => {
    result.textContent = `Próximamente verás resultados para: "${input.value}"`;
  }, 700);
}

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");

  if (searchInput) {
    searchInput.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        buscarRadar();
      }
    });
  }
});
