let provinciasRadar = [];
let categoriasRadar = [];
let negociosRadar = [];
let circuitosRadar = [];
let baseDatosRadar = [];

function normalizar(texto) {
  return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function slugify(texto) {
  return normalizar(texto)
    .replace(/ñ/g, "n")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function cargarJSON(rutas) {
  for (const ruta of rutas) {
    try {
      const response = await fetch(ruta);
      if (response.ok) return await response.json();
    } catch (error) {
      console.warn("No se pudo cargar:", ruta);
    }
  }
  return [];
}

async function inicializarRadar() {
  
  provinciasRadar = await cargarJSON(["data/provincias.json", "data/provincias"]);
  categoriasRadar = await cargarJSON(["data/categorias.json", "data/categorias"]);
  negociosRadar = await cargarJSON(["data/negocios.json", "data/negocios"]);
  circuitosRadar = await cargarJSON(["data/circuitos.json"]);

  baseDatosRadar = [
    ...circuitosRadar,
    ...negociosRadar.map(n => ({
      ...n,
      tipo: "comercio"
    }))
  ];

  renderizarMenuProvincias();
  renderizarDestacadosPais();
}

function tieneContenidoTerritorial(item) {
  const sectorNorm = normalizar(item.sector);

  const tieneNegocio = negociosRadar.some(n =>
    normalizar(n.sector) === sectorNorm &&
    (
      n.estado_radar === undefined ||
    ["aprobado", "premium", "premium pro"].includes(
      normalizar(n.estado_radar)
    )
  )
  );

  const tieneCircuito = circuitosRadar.some(c =>
    normalizar(c.sector) === sectorNorm
  );

  return true;
}

function agruparProvinciasActivas() {
  const visibles = provinciasRadar.filter(tieneContenidoTerritorial);
  const mapa = {};

  visibles.forEach(item => {
    const provincia = item.provincia || "Sin provincia";
    const distrito = item.distrito || "Sin distrito";

    if (!mapa[provincia]) mapa[provincia] = {};
    if (!mapa[provincia][distrito]) mapa[provincia][distrito] = [];

    mapa[provincia][distrito].push(item);
  });

  return mapa;
}

function renderizarMenuProvincias() {
  const contenedor = document.getElementById("contenido-maestro-provincias");
  if (!contenedor) return;
  console.log("Renderizando provincias:", provinciasRadar.length);

  const mapa = agruparProvinciasActivas();
  // contenedor.innerHTML = "";

  Object.keys(mapa).sort().forEach(provincia => {
    const key = String(provincia || "").trim();

    contenedor.innerHTML += `
      <div class="provincia-bloque-menu">
        <button class="btn-provincia-select" onclick="toggleProvinciaDinamica('${key}', this)">
          <span class="header-title-wrapper">
            <svg class="icon-svg" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            </svg>
            <span>${provincia}</span>
          </span>
          <span class="sub-icon-prov">+</span>
        </button>
        <div class="sectores-internos-menu" id="sub-sectores-${key}"></div>
      </div>
    `;
  });
}

function toggleMenuMaestro() {
  const contenido = document.getElementById("contenido-maestro-provincias");
  const icono = document.getElementById("icono-maestro");
  if (!contenido || !icono) return;

  contenido.classList.toggle("active");
  icono.textContent = contenido.classList.contains("active") ? "-" : "+";
}

function toggleProvinciaDinamica(provinciaKey, botonElemento) {
  const contenedorSectores = document.getElementById(`sub-sectores-${provinciaKey}`);
  const subIcono = botonElemento.querySelector(".sub-icon-prov");
  if (!contenedorSectores || !subIcono) return;

  if (contenedorSectores.classList.contains("active")) {
    contenedorSectores.classList.remove("active");
    subIcono.textContent = "+";
    contenedorSectores.innerHTML = "";
    return;
  }

  document.querySelectorAll(".sectores-internos-menu").forEach(el => {
    el.classList.remove("active");
    el.innerHTML = "";
  });

  document.querySelectorAll(".sub-icon-prov").forEach(el => {
    el.textContent = "+";
  });

  contenedorSectores.classList.add("active");
  subIcono.textContent = "-";

  const provinciaReal = Object.keys(agruparProvinciasActivas()).find(
  p => p === provinciaKey
  );

  if (!provinciaReal) return;

  const distritos = agruparProvinciasActivas()[provinciaReal];

  Object.keys(distritos).sort().forEach(distrito => {
    const sectoresHTML = distritos[distrito]
      .sort((a, b) => a.sector.localeCompare(b.sector))
      .map(item => `
        <button class="btn-sector-link"
          onclick="cargarSectorDetalle('${item.provincia}', '${item.distrito}', '${item.sector}')">
          📍 ${item.sector}
        </button>
      `).join("");

    contenedorSectores.innerHTML += `
      <div class="distrito-bloque">
        <h4>📋 Distrito: ${distrito}</h4>
        <div class="sectores-links-container">
          ${sectoresHTML}
        </div>
      </div>
    `;
  });
}

function renderizarDestacadosPais() {
  const contenedor = document.getElementById("contenedor-destacados");
  if (!contenedor) return;

  const destacados = negociosRadar.filter(item =>
    item.destacado === true &&
    (item.estado_radar === undefined || normalizar(item.estado_radar) === "aprobado")
  );

  contenedor.innerHTML = "";

  if (destacados.length === 0) {
    contenedor.innerHTML = '<p class="txt-vacio">Cargando próximos comercios recomendados...</p>';
    return;
  }

  destacados.forEach(item => {
    contenedor.innerHTML += `
      <div class="card-circuito pop-destacado">
        <span class="badge-card-cat">⭐ Destacado</span>
        <h2>${item.nombre}</h2>
        <p><strong>Zona:</strong> ${item.sector}, ${item.distrito}</p>
        <p class="desc-corta">${item.descripcion || ""}</p>
        <a href="${item.enlace || item.google_maps || "#"}" target="_blank" class="enlace-comercio">
          Ver Dirección Digital →
        </a>
      </div>
    `;
  });
}

function obtenerNombreCategoria(idCategoria) {
  const cat = categoriasRadar.find(c =>
    normalizar(c.id) === normalizar(idCategoria) ||
    normalizar(c.nombre) === normalizar(idCategoria)
  );

  return cat ? `${cat.icono || "📂"} ${cat.nombre}` : `📂 ${idCategoria}`;
}

function obtenerCategoriasParaSector(sector) {
  const sectorNorm = normalizar(sector);

  const territorial = provinciasRadar.find(p => normalizar(p.sector) === sectorNorm);

  if (territorial && Array.isArray(territorial.categorias) && territorial.categorias.length > 0) {
    return territorial.categorias;
  }

  return categoriasRadar.map(c => c.id);
}

function cargarSectorDetalle(provincia, distrito, sector) {
  const vista = document.getElementById("vista-sector");
  const txtNombre = document.getElementById("dinamico-nombre-sector");
  const txtJerarquia = document.getElementById("dinamico-jerarquia");
  const bloqueCircuito = document.getElementById("bloque-circuito-turistico");
  const contenedorCategorias = document.getElementById("categorias-desplegables");
  const bloqueDestacadosZona = document.getElementById("zona-destacados-container");
  const contenedorDestacadosZona = document.getElementById("contenedor-destacados-zona");

  if (!vista || !txtNombre || !txtJerarquia || !bloqueCircuito || !contenedorCategorias) return;

  txtNombre.textContent = `Explora el sector de ${sector}`;
  txtJerarquia.textContent = `📍 Provincia de ${provincia} > Distrito de ${distrito}`;

  const sectorNorm = normalizar(sector);

  const circuitoData = circuitosRadar.find(item =>
    normalizar(item.sector) === sectorNorm
  );

  if (circuitoData) {
    bloqueCircuito.innerHTML = `
      <div class="circuito-header-info">
        <span class="badge-circuito-tag">🎒 Circuito Turístico Oficial</span>
        <span class="duracion-tag">⏱️ ${circuitoData.duracion || "Variable"}</span>
      </div>
      <h3>${circuitoData.nombre}</h3>
      <p>${circuitoData.descripcion || ""}</p>
      <a href="${circuitoData.enlace_mapa || "#"}" target="_blank" class="btn-mapa-circuito">
        🗺️ Ver Ruta Digital del Circuito
      </a>
    `;
    bloqueCircuito.style.display = "block";
  } else {
    bloqueCircuito.innerHTML = `
      <p style="color:#64748b;font-style:italic;">
        ✨ Circuito turístico de la comunidad consolidándose próximamente.
      </p>
    `;
    bloqueCircuito.style.display = "block";
  }

  const itemsDelSector = negociosRadar.filter(item =>
    normalizar(item.sector) === sectorNorm &&
    (item.estado_radar === undefined || normalizar(item.estado_radar) === "aprobado")
  );

  const destacadosDeLaZona = itemsDelSector.filter(comercio => comercio.destacado === true);

  if (destacadosDeLaZona.length > 0 && bloqueDestacadosZona && contenedorDestacadosZona) {
    contenedorDestacadosZona.innerHTML = "";

    destacadosDeLaZona.forEach(comercio => {
      contenedorDestacadosZona.innerHTML += `
        <div class="card-circuito pop-destacado" style="background:#faf5ff;border-color:#a855f7 !important;">
          <span class="badge-card-cat" style="background:rgba(168,85,247,0.1);color:#a855f7;">
            ⭐ Recomendado Local
          </span>
          <h2>${comercio.nombre}</h2>
          <p>${comercio.descripcion || ""}</p>
          <a href="${comercio.enlace || comercio.google_maps || "#"}" target="_blank" class="enlace-comercio" style="color:#a855f7;">
            Ver Dirección Digital →
          </a>
        </div>
      `;
    });

    bloqueDestacadosZona.style.display = "block";
  } else if (bloqueDestacadosZona) {
    bloqueDestacadosZona.style.display = "none";
  }

  contenedorCategorias.innerHTML = "";

  const categoriasSector = obtenerCategoriasParaSector(sector);

  categoriasSector.forEach((catId, index) => {
    const comerciosDeEstaCat = itemsDelSector.filter(item =>
      normalizar(item.categoria) === normalizar(catId) ||
      normalizar(item.categoria) === normalizar(obtenerNombreCategoria(catId).replace(/^[^\wáéíóúÁÉÍÓÚñÑ]+/, ""))
    );

    const conteo = comerciosDeEstaCat.length;
    const nombreCategoria = obtenerNombreCategoria(catId);

    contenedorCategorias.innerHTML += `
      <div class="sub-accordion-item">
        <button class="sub-accordion-header" onclick="toggleSubCategoria(${index})">
          <span>${nombreCategoria} (${conteo})</span>
          <span class="sub-icon">+</span>
        </button>

        <div class="sub-accordion-content" id="sub-cat-${index}">
          <div class="grid-tarjetas padding-intern-cards">
            ${conteo === 0 ? '<p class="txt-vacio">Próximamente más comercios afiliados en este sector.</p>' : ""}

            ${comerciosDeEstaCat.map(comercio => `
              <div class="card-circuito">
                <h2>${comercio.nombre}</h2>
                <p>${comercio.descripcion || ""}</p>
                <p><strong>Dirección:</strong> ${comercio.direccion || comercio.sector || ""}</p>

                ${comercio.telefono ? `<p><strong>Tel:</strong> ${comercio.telefono}</p>` : ""}

                ${comercio.url_ubicacion || comercio.google_maps || comercio.waze ? `
                <a href="${comercio.url_ubicacion || comercio.google_maps || comercio.waze}" target="_blank" class="enlace-comercio">
              📍 Ver ubicación →
               </a>
               ` : `
               <span class="enlace-comercio ubicacion-no-disponible">
              📍 Ubicación Premium
               </span>
               `}

                <a href="${comercio.enlace || comercio.google_maps || "#"}" target="_blank" class="enlace-comercio">
                  Ver ubicación →
                </a>
              </div>
            `).join("")}
          </div>
        </div>
      </div>
    `;
  });

  vista.style.display = "block";
  vista.scrollIntoView({ behavior: "smooth", block: "start" });
}

function toggleSubCategoria(index) {
  const todosLosSubContenidos = document.querySelectorAll(".sub-accordion-content");

  todosLosSubContenidos.forEach(content => {
    const icono = content.previousElementSibling.querySelector(".sub-icon");

    if (content.id === `sub-cat-${index}`) {
      content.classList.toggle("open");
      icono.textContent = content.classList.contains("open") ? "-" : "+";
    } else {
      content.classList.remove("open");
      icono.textContent = "+";
    }
  });
}

function buscarRadar() {
  const input = document.getElementById("searchInput");
  const result = document.getElementById("searchResult");
  if (!input || !result) return;

  const val = normalizar(input.value);

  if (val === "") {
    result.textContent = "Por favor escribe un término.";
    return;
  }

  result.style.color = "#0f766e";
  result.textContent = `Buscando coincidencias para "${input.value}"...`;

  const sectorEncontrado = provinciasRadar.find(item =>
    normalizar(item.sector).includes(val) ||
    normalizar(item.distrito).includes(val) ||
    normalizar(item.provincia).includes(val)
  );

  const negocioEncontrado = negociosRadar.find(item =>
    normalizar(item.nombre).includes(val) ||
    normalizar(item.categoria).includes(val) ||
    normalizar(item.sector).includes(val)
  );

  setTimeout(() => {
    if (sectorEncontrado) {
      result.textContent = `📍 Sector detectado: ${sectorEncontrado.sector}`;
      cargarSectorDetalle(
        sectorEncontrado.provincia,
        sectorEncontrado.distrito,
        sectorEncontrado.sector
      );
    } else if (negocioEncontrado) {
      result.textContent = `📍 Negocio detectado en ${negocioEncontrado.sector}`;
      cargarSectorDetalle(
        negocioEncontrado.provincia,
        negocioEncontrado.distrito,
        negocioEncontrado.sector
      );
    } else {
      result.textContent = `Próximamente resultados en vivo para: "${input.value}"`;
    }
  }, 500);
}

document.addEventListener("DOMContentLoaded", inicializarRadar);

window.toggleMenuMaestro = toggleMenuMaestro;
window.toggleProvinciaDinamica = toggleProvinciaDinamica;
window.cargarSectorDetalle = cargarSectorDetalle;
window.toggleSubCategoria = toggleSubCategoria;
window.buscarRadar = buscarRadar;
