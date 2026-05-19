let baseDatosRadar = [];

// 1. Cargar la base de datos de circuitos.json
async function inicializarRadar() {
  try {
    const response = await fetch('data/circuitos.json');
    if (!response.ok) throw new Error('No se pudo leer circuitos.json');
    baseDatosRadar = await response.json();
    console.log("Base de datos territorial lista.");
  } catch (error) {
    console.error("Error al cargar la base de datos de Radar:", error);
  }
}

// 2. Manejo del Menú Retráctil (Acordeón de Provincias)
function toggleProvincia(provinciaSeleccionada) {
  const todosLosContenidos = document.querySelectorAll('.accordion-content');
  
  todosLosContenidos.forEach(contenido => {
    const idEsperado = `sectores-${provinciaSeleccionada}`;
    if (contenido.id === idEsperado) {
      if (contenido.classList.contains('active')) {
        contenido.classList.remove('active');
        contenido.previousElementSibling.querySelector('.icon').textContent = '+';
      } else {
        contenido.classList.add('active');
        contenido.previousElementSibling.querySelector('.icon').textContent = '-';
        construirArbolTerritorial(provinciaSeleccionada, contenido);
      }
    } else {
      // Efecto retráctil: cierra las otras provincias abiertas
      contenido.classList.remove('active');
      contenido.previousElementSibling.querySelector('.icon').textContent = '+';
    }
  });
}

// 3. Organizar y renderizar: Provincia -> Distrito -> Sectores
function construirArbolTerritorial(provincia, contenedorHTML) {
  // Filtrar los registros que pertenecen exclusivamente a esta provincia
  const datosProvincia = baseDatosRadar.filter(item => item.provincia === provincia);
  
  // Obtener los distritos únicos (Ej: Chame, San Carlos, Antón)
  const distritosUnicos = [...new Set(datosProvincia.map(item => item.distrito))];

  if (distritosUnicos.length === 0) {
    contenedorHTML.innerHTML = `<p style="padding: 10px; color: #64748b;">Próximamente datos para esta provincia.</p>`;
    return;
  }

  let htmlResultado = "";

  distritosUnicos.forEach(distrito => {
    // Para cada distrito, buscar sus sectores correspondientes
    const datosDistrito = datosProvincia.filter(item => item.distrito === distrito);
    const sectoresUnicos = [...new Set(datosDistrito.map(item => item.sector))];

    htmlResultado += `
      <div class="distrito-bloque">
        <h4>📋 Distrito: ${distrito}</h4>
        <div class="sectores-links-container">
    `;

    sectoresUnicos.forEach(sector => {
      htmlResultado += `
        <button class="btn-sector-link" onclick="filtrarPorZona('${provincia}', '${distrito}', '${sector}')">
          📍 ${sector}
        </button>
      `;
    });

    htmlResultado += `
        </div>
      </div>
    `;
  });

  contenedorHTML.innerHTML = htmlResultado;
}

// 4. Filtrar y mostrar las tarjetas de los comercios al presionar un Sector
function filtrarPorZona(provincia, distrito, sector) {
  const contenedorResultados = document.getElementById('circuitos');
  const tituloZona = document.getElementById('titulo-zona');

  const comerciosFiltrados = baseDatosRadar.filter(item => 
    item.provincia === provincia && 
    item.distrito === distrito && 
    item.sector === sector
  );

  tituloZona.textContent = `📍 Resultados en: ${sector} (${distrito})`;
  contenedorResultados.innerHTML = '';

  if (comerciosFiltrados.length === 0) {
    contenedorResultados.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #64748b;">No hay comercios registrados en esta zona.</p>`;
    return;
  }

  comerciosFiltrados.forEach(item => {
    contenedorResultados.innerHTML += `
      <div class="card-circuito">
        <span class="badge-card-cat">${item.categoria}</span>
        <h2>${item.nombre}</h2>
        <p><strong>Ubicación:</strong> ${item.sector}, ${item.distrito}, ${item.provincia}</p>
        <p style="margin: 12px 0; color: #475569;">${item.descripcion}</p>
        <a href="${item.enlace || '#'}" target="_blank" class="enlace-comercio">Ver Dirección Digital →</a>
      </div>
    `;
  });

  contenedorResultados.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// 5. Función simulada del buscador superior
function buscarRadar() {
  const input = document.getElementById("searchInput");
  const result = document.getElementById("searchResult");
  if (!input || !result) return;

  const busqueda = input.value.trim();
  if (busqueda === "") {
    result.style.color = "#ef4444";
    result.textContent = "Escribe una zona, negocio o categoría para buscar.";
    return;
  }

  result.style.color = "#0f766e";
  result.textContent = `Buscando en Radar: "${busqueda}"...`;

  setTimeout(() => {
    result.textContent = `Próximamente verás los mapas dinámicos para: "${busqueda}"`;
  }, 800);
}

document.addEventListener("DOMContentLoaded", () => {
  inicializarRadar();
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        buscarRadar();
      }
    });
  }
});
