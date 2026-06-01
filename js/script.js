const API_RADAR = "https://script.google.com/macros/s/AKfycby5TsFEPQd6sGVfj_IPKaVqesh--bujnSrHIIY_C9bhRLaSsRIBBm96XgJlEtsq7jf6/exec";

let provinciasRadar = [];
let categoriasRadar = [];
let negociosRadar = [];
let circuitosRadar = [];
let eventosRadar = [];
let anunciosRadar = [];
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
    .replace(/Ã±/g, "n")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function textoSeguro(texto) {
  return String(texto || "")
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/"/g, "&quot;")
    .replace(/\n/g, " ");
}

function obtenerCampo(item, campos, respaldo = "") {
  if (!item) return respaldo;
  for (const campo of campos) {
    if (item[campo] !== undefined && item[campo] !== null && String(item[campo]).trim() !== "") {
      return item[campo];
    }
  }
  return respaldo;
}

function obtenerSector(item) {
  return obtenerCampo(item, ["sector", "sector_nombre", "nombre_sector", "sector_radar", "zona", "zona_radar", "corregimiento", "corregimiento_sector"], "");
}

function obtenerProvincia(item) {
  return obtenerCampo(item, ["provincia", "provincia_nombre", "nombre_provincia"], "");
}

function obtenerDistrito(item) {
  return obtenerCampo(item, ["distrito", "distrito_nombre", "nombre_distrito"], "");
}

function obtenerNombreNegocio(item) {
  return obtenerCampo(item, ["nombre", "nombre_negocio", "negocio", "comercio", "empresa", "nombre_empresa", "nombre_comercial", "razon_social"], "Comercio");
}

function obtenerCategoriaNegocio(item) {
  return obtenerCampo(item, ["categoria", "categoria_radar", "categoria_nombre", "tipo_categoria", "categorias_de_empresas", "categoria_de_empresa", "categorias_empresas", "categoria_empresa", "rubro", "tipo_negocio"], "Otros");
}

function obtenerDescripcionNegocio(item) {
  return obtenerCampo(item, ["descripcion", "descripcion_negocio", "detalle", "resumen", "nota"], "");
}

function obtenerDireccionNegocio(item) {
  return obtenerCampo(item, ["direccion", "direccion_fisica", "ubicacion", "referencia", "direccion_completa", "sector", "sector_nombre"], "");
}

function obtenerTelefonoNegocio(item) {
  return obtenerCampo(item, ["telefono", "tel", "celular", "numero", "numero_contacto"], "");
}

function obtenerEnlaceNegocio(item) {
  return obtenerCampo(item, ["url_ubicacion", "google_maps", "google", "maps", "waze", "enlace", "url_negocio", "website", "web", "sitio_web", "direccion_digital"], "");
}

function enlaceValido(enlace) {
  const valor = String(enlace || "").trim().toLowerCase();
  if (!valor) return false;
  if (valor === "#" || valor === "na" || valor === "n/a") return false;
  if (valor.includes("sin ubicacion") || valor.includes("sin ubicaciÃ³n")) return false;
  return valor.startsWith("http");
}

function esPremium(item) {
  const valor = normalizar(obtenerCampo(item, ["plan_comercial", "estado_radar", "premium", "destacado", "destacado_radar"], ""));
  return ["premium", "premium pro", "pro", "1"].includes(valor) || valor.includes("premium");
}

function esDestacado(item) {
  if (esPremium(item)) return false;
  const valor = normalizar(obtenerCampo(item, ["destacado", "destacado_radar", "recomendado", "visible_destacado"], ""));
  return ["true", "si", "sÃ­", "1", "destacado", "recomendado"].includes(valor);
}

function estadoValido(item) {
  const estado = normalizar(obtenerCampo(item, ["estado_radar", "estado", "estado_publicacion", "estado_anuncio", "publicacion", "status"], ""));
  if (!estado) return true;
  return ["aprobado", "activo", "premium", "premium pro", "destacado", "publicado", "visible"].includes(estado);
}

function sectoresCoinciden(a, b) {
  const sa = normalizar(a);
  const sb = normalizar(b);

  if (!sa || !sb) return false;
  if (sa === sb) return true;

  const slugA = slugify(sa);
  const slugB = slugify(sb);

  if (slugA === slugB) return true;
  if (slugA.includes(slugB) && slugB.length >= 5) return true;
  if (slugB.includes(slugA) && slugA.length >= 5) return true;

  return false;
}

function obtenerImagenCategoria(item) {
  const imagenPropia = obtenerCampo(item, ["imagen_url", "imagen", "imagen_principal", "foto", "foto_url", "logo"], "");
  if (String(imagenPropia).trim().startsWith("http")) return imagenPropia;

  const categoria = normalizar(obtenerCategoriaNegocio(item));
  const nombre = normalizar(obtenerNombreNegocio(item));
  const texto = `${categoria} ${nombre}`;

  const imagenes = [
    { claves: ["hotel", "hostal", "hospedaje", "apartamento", "resort", "alojamiento", "suite", "villa"], url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80" },
    { claves: ["restaurante", "comida", "gourmet", "fonda", "cafe", "cafeteria", "bar", "pizza", "marisco", "asado"], url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80" },
    { claves: ["farmacia", "medicina", "salud", "clinica", "doctor", "laboratorio"], url: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=900&q=80" },
    { claves: ["taller", "mecanica", "auto", "repuesto", "llanta", "motor"], url: "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=900&q=80" },
    { claves: ["supermercado", "mini super", "minisuper", "abarroteria", "tienda", "mercado"], url: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80" },
    { claves: ["ferreteria", "construccion", "herramienta"], url: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=900&q=80" },
    { claves: ["playa", "tour", "turismo", "circuito", "actividad", "experiencia"], url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80" },
    { claves: ["salon", "belleza", "barber", "barberia", "spa", "estetica"], url: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=900&q=80" },
    { claves: ["gimnasio", "gym", "fitness", "deporte"], url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=80" },
    { claves: ["veterinaria", "mascota", "pet"], url: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=900&q=80" }
  ];

  const encontrada = imagenes.find(grupo => grupo.claves.some(clave => texto.includes(clave)));
  return encontrada ? encontrada.url : "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80";
}

function crearHTMLTarjeta(item, etiqueta = "") {
  const nombre = obtenerNombreNegocio(item);
  const categoria = obtenerCategoriaNegocio(item);
  const descripcion = obtenerDescripcionNegocio(item);
  const sector = obtenerSector(item);
  const distrito = obtenerDistrito(item);
  const direccion = obtenerDireccionNegocio(item);
  const telefono = obtenerTelefonoNegocio(item);
  const enlace = obtenerEnlaceNegocio(item);
  const imagen = obtenerImagenCategoria(item);

  const premium = esPremium(item);
  const destacado = esDestacado(item);

  let claseTarjeta = "card-circuito";
  if (premium) claseTarjeta += " premium";
  if (destacado) claseTarjeta += " destacado";

  const textoBadge = etiqueta || (premium ? "Premium" : destacado ? "Destacado" : categoria);

  const boton = enlaceValido(enlace)
    ? `<a href="${enlace}" target="_blank" rel="noopener" class="enlace-comercio">Ver ubicacion Radar</a>`
    : `<span class="enlace-comercio ubicacion-no-disponible">Ubicacion no disponible</span>`;

  return `
    <article class="${claseTarjeta}">
      <img src="${imagen}" alt="${nombre}" class="card-img-placeholder" loading="lazy">
      <span class="badge-card-cat">${textoBadge}</span>

      <div class="card-contenido-interno">
        <h2>${nombre}</h2>
        ${descripcion ? `<p class="desc-corta">${descripcion}</p>` : `<p class="desc-corta">Perfil oficial dentro de la plataforma territorial de Radar 507.</p>`}

        <div class="card-dato"><strong>Categoria:</strong> ${categoria}</div>
        ${sector ? `<div class="card-dato"><strong>Zona:</strong> ${sector}${distrito ? `, ${distrito}` : ""}</div>` : ""}
        ${direccion && direccion !== sector ? `<div class="card-dato"><strong>Direccion:</strong> ${direccion}</div>` : ""}
        ${telefono ? `<div class="card-dato"><strong>Tel:</strong> ${telefono}</div>` : ""}
      </div>

      ${boton}
    </article>
  `;
}

async function inicializarRadar() {
  try {
    const respuesta = await fetch(API_RADAR);
    const json = await respuesta.json();
    const data = json.data || {};

    provinciasRadar = data.sectores || data.provincias || [];
    categoriasRadar = data.categorias || [];
    negociosRadar = data.negocios || [];
    circuitosRadar = data.circuitos || [];
    eventosRadar = data.eventos || [];
    anunciosRadar = data.anuncios || [];

    baseDatosRadar = [
      ...circuitosRadar,
      ...negociosRadar.map(n => ({ ...n, tipo: "comercio" }))
    ];

    renderizarMenuProvincias();
    renderizarDestacadosPais();

  } catch (error) {
    console.error("Error cargando Radar:", error);
  }
}

function tieneContenidoTerritorial(item) {
  const sector = obtenerSector(item);

  const tieneNegocio = negociosRadar.some(n =>
    sectoresCoinciden(obtenerSector(n), sector) && estadoValido(n)
  );

  const tieneCircuito = circuitosRadar.some(c =>
    sectoresCoinciden(obtenerSector(c), sector)
  );

  return tieneNegocio || tieneCircuito;
}

function agruparProvinciasActivas() {
  const visibles = provinciasRadar.filter(tieneContenidoTerritorial);
  const mapa = {};

  visibles.forEach(item => {
    const provincia = obtenerProvincia(item) || "Sin provincia";
    const distrito = obtenerDistrito(item) || "Sin distrito";

    if (!mapa[provincia]) mapa[provincia] = {};
    if (!mapa[provincia][distrito]) mapa[provincia][distrito] = [];

    mapa[provincia][distrito].push(item);
  });

  return mapa;
}

function renderizarMenuProvincias() {
  const contenedor = document.getElementById("contenido-maestro-provincias");
  if (!contenedor) return;

  const mapa = agruparProvinciasActivas();
  contenedor.innerHTML = "";

  if (Object.keys(mapa).length === 0) {
    contenedor.innerHTML = '<p class="txt-vacio">No hay sectores con negocios activos todavia.</p>';
    return;
  }

  Object.keys(mapa).sort().forEach(provincia => {
    const key = slugify(provincia);

    contenedor.innerHTML += `
      <div class="provincia-bloque-menu">
        <button class="btn-provincia-select" type="button" onclick="toggleProvinciaDinamica('${key}', this)">
          <span class="header-title-wrapper">
            <svg class="icon-svg" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"></path>
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

  const mapa = agruparProvinciasActivas();
  const provinciaReal = Object.keys(mapa).find(p => slugify(p) === provinciaKey);
  if (!provinciaReal) return;

  const distritos = mapa[provinciaReal];

  Object.keys(distritos).sort().forEach(distrito => {
    const sectoresHTML = distritos[distrito]
      .sort((a, b) => String(obtenerSector(a)).localeCompare(String(obtenerSector(b))))
      .map(item => {
        const sectorNombre = obtenerSector(item);
        const provinciaNombre = obtenerProvincia(item);
        const distritoNombre = obtenerDistrito(item);

        return `
          <button class="btn-sector-link" type="button"
            onclick="cargarSectorDetalle('${textoSeguro(provinciaNombre)}', '${textoSeguro(distritoNombre)}', '${textoSeguro(sectorNombre)}')">
            ${sectorNombre}
          </button>
        `;
      })
      .join("");

    contenedorSectores.innerHTML += `
      <div class="distrito-bloque">
        <h4>Distrito: ${distrito}</h4>
        <div class="sectores-links-container">${sectoresHTML}</div>
      </div>
    `;
  });
}

function renderizarDestacadosPais() {
  const contenedor = document.getElementById("contenedor-destacados");
  if (!contenedor) return;

  const destacados = negociosRadar
    .filter(item => estadoValido(item) && (esDestacado(item) || esPremium(item)))
    .slice(0, 9);

  if (destacados.length === 0) {
    contenedor.innerHTML = '<p class="txt-vacio">Cargando proximos comercios recomendados...</p>';
    return;
  }

  contenedor.innerHTML = destacados
    .map(item => crearHTMLTarjeta(item, esPremium(item) ? "Premium" : "Destacado"))
    .join("");
}

function obtenerNombreCategoria(idCategoria) {
  const cat = categoriasRadar.find(c =>
    normalizar(c.id) === normalizar(idCategoria) ||
    normalizar(c.nombre) === normalizar(idCategoria)
  );

  return cat ? `${cat.nombre}` : `${idCategoria}`;
}

function limpiarNombreCategoria(catId) {
  return obtenerNombreCategoria(catId)
    .replace(/^[^\wÃ¡Ã©Ã­Ã³ÃºÃÃ‰ÃÃ“ÃšÃ±Ã‘]+/, "")
    .trim();
}

function categoriaCoincide(item, catId) {
  const categoriaNegocio = obtenerCategoriaNegocio(item);
  const nombreCat = limpiarNombreCategoria(catId);

  return (
    normalizar(categoriaNegocio) === normalizar(catId) ||
    normalizar(categoriaNegocio) === normalizar(nombreCat)
  );
}

function obtenerCategoriasParaSector(sector) {
  const territorial = provinciasRadar.find(p => sectoresCoinciden(obtenerSector(p), sector));

  if (territorial && Array.isArray(territorial.categorias) && territorial.categorias.length > 0) {
    return territorial.categorias;
  }

  return categoriasRadar.map(c => c.id || c.nombre).filter(Boolean);
}

function cargarSectorDetalle(provincia, distrito, sector) {
  const vista = document.getElementById("vista-sector");
  const txtNombre = document.getElementById("dinamico-nombre-sector");
  const txtJerarquia = document.getElementById("dinamico-jerarquia");
  const bloqueCircuito = document.getElementById("bloque-circuito-turistico");
  const contenedorCategorias = document.getElementById("categorias-desplegables");
  const bloqueDestacadosZona = document.getElementById("zona-destacados-container");
  const contenedorDestacadosZona = document.getElementById("contenedor-destacados-zona");
  const territorio = document.getElementById("territorio");
  const destacados = document.getElementById("destacados");

  if (!vista || !txtNombre || !txtJerarquia || !bloqueCircuito || !contenedorCategorias) return;

  if (territorio) territorio.style.display = "none";
  if (destacados) destacados.style.display = "none";

  txtNombre.textContent = `Explora el sector de ${sector}`;
  txtJerarquia.textContent = `Provincia de ${provincia} > Distrito de ${distrito}`;

  const circuitoData = circuitosRadar.find(item => sectoresCoinciden(obtenerSector(item), sector));

  if (circuitoData) {
    const enlaceCircuito = circuitoData.enlace_mapa || "#";
    bloqueCircuito.innerHTML = `
      <div class="circuito-header-info">
        <span class="badge-circuito-tag">Circuito turistico oficial</span>
        <span class="duracion-tag">${circuitoData.duracion || "Variable"}</span>
      </div>
      <h3>${circuitoData.nombre || "Circuito turistico"}</h3>
      <p>${circuitoData.descripcion || ""}</p>
      ${enlaceValido(enlaceCircuito) ? `<a href="${enlaceCircuito}" target="_blank" rel="noopener" class="enlace-comercio">Ver ruta digital del circuito</a>` : ""}
    `;
  } else {
    bloqueCircuito.innerHTML = `
      <p style="color:#64748b;font-style:italic;">
        Circuito turistico de la comunidad consolidandose proximamente.
      </p>
    `;
  }

  bloqueCircuito.style.display = "block";

  const itemsDelSector = negociosRadar.filter(item =>
    sectoresCoinciden(obtenerSector(item), sector) && estadoValido(item)
  );

  const destacadosDeLaZona = itemsDelSector.filter(item => esDestacado(item) || esPremium(item));

  if (destacadosDeLaZona.length > 0 && bloqueDestacadosZona && contenedorDestacadosZona) {
    contenedorDestacadosZona.innerHTML = destacadosDeLaZona
      .map(comercio => crearHTMLTarjeta(comercio, esPremium(comercio) ? "Premium local" : "Recomendado local"))
      .join("");

    bloqueDestacadosZona.style.display = "block";
  } else if (bloqueDestacadosZona) {
    bloqueDestacadosZona.style.display = "none";
  }

  contenedorCategorias.innerHTML = "";

  const categoriasSector = obtenerCategoriasParaSector(sector);
  const categoriasConNegocios = categoriasSector.filter(catId =>
    itemsDelSector.some(item => categoriaCoincide(item, catId))
  );

  if (itemsDelSector.length === 0) {
    contenedorCategorias.innerHTML = `
      <p class="txt-vacio">Proximamente mas comercios afiliados en este sector.</p>
    `;
  }

  if (itemsDelSector.length > 0 && categoriasConNegocios.length === 0) {
    contenedorCategorias.innerHTML = renderizarListaComercios("🏪 Negocios disponibles", itemsDelSector, 0);
  }

  categoriasConNegocios.forEach((catId, index) => {
    const comerciosDeEstaCat = itemsDelSector.filter(item => categoriaCoincide(item, catId));

    contenedorCategorias.innerHTML += renderizarListaComercios(
      `${obtenerNombreCategoria(catId)} (${comerciosDeEstaCat.length})`,
      comerciosDeEstaCat,
      index
    );
  });

  vista.style.display = "block";
  vista.scrollIntoView({ behavior: "smooth", block: "start" });
}

function cerrarVistaSector() {
  const vista = document.getElementById("vista-sector");
  const territorio = document.getElementById("territorio");
  const destacados = document.getElementById("destacados");

  if (vista) vista.style.display = "none";
  if (territorio) territorio.style.display = "block";
  if (destacados) destacados.style.display = "block";

  if (territorio) territorio.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderizarListaComercios(titulo, comercios, index) {
  return `
    <div class="sub-accordion-item">
      <button class="sub-accordion-header" type="button" onclick="toggleSubCategoria(${index})">
        <span>${titulo}</span>
        <span class="sub-icon">+</span>
      </button>

      <div class="sub-accordion-content" id="sub-cat-${index}">
        <div class="grid-tarjetas padding-intern-cards">
          ${comercios.map(comercio => crearHTMLTarjeta(comercio)).join("")}
        </div>
      </div>
    </div>
  `;
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
    result.textContent = "Por favor escribe un termino.";
    return;
  }

  result.style.color = "#0f766e";
  result.textContent = `Buscando coincidencias para "${input.value}"...`;

  const sectorEncontrado = provinciasRadar.find(item =>
    normalizar(obtenerSector(item)).includes(val) ||
    normalizar(obtenerDistrito(item)).includes(val) ||
    normalizar(obtenerProvincia(item)).includes(val)
  );

  const negocioEncontrado = negociosRadar.find(item =>
    normalizar(obtenerNombreNegocio(item)).includes(val) ||
    normalizar(obtenerCategoriaNegocio(item)).includes(val) ||
    normalizar(obtenerSector(item)).includes(val)
  );

  setTimeout(() => {
    if (sectorEncontrado) {
      result.textContent = `Sector detectado: ${obtenerSector(sectorEncontrado)}`;
      cargarSectorDetalle(
        obtenerProvincia(sectorEncontrado),
        obtenerDistrito(sectorEncontrado),
        obtenerSector(sectorEncontrado)
      );
    } else if (negocioEncontrado) {
      result.textContent = `Negocio detectado en ${obtenerSector(negocioEncontrado)}`;
      cargarSectorDetalle(
        obtenerProvincia(negocioEncontrado),
        obtenerDistrito(negocioEncontrado),
        obtenerSector(negocioEncontrado)
      );
    } else {
      result.textContent = `Proximamente resultados en vivo para: "${input.value}"`;
    }
  }, 350);
}

document.addEventListener("DOMContentLoaded", inicializarRadar);

window.toggleMenuMaestro = toggleMenuMaestro;
window.toggleProvinciaDinamica = toggleProvinciaDinamica;
window.cargarSectorDetalle = cargarSectorDetalle;
window.cerrarVistaSector = cerrarVistaSector;
window.toggleSubCategoria = toggleSubCategoria;
window.buscarRadar = buscarRadar;
