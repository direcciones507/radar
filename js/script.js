let baseDatosRadar = [];
const categoriasFijas = ["Restaurantes", "Hoteles", "Bares", "Gasolineras", "Cajeros ATM", "Actividades turísticas"];

// 1. Inicializar Base de Datos de forma segura
async function inicializarRadar() {
  try {
    const response = await fetch('data/circuitos.json');
    if (!response.ok) {
      console.warn('Archivo de datos no encontrado de forma local.');
      baseDatosRadar = [];
      return;
    }
    baseDatosRadar = await response.json();
    renderizarDestacadosPais();
  } catch (error) {
    console.error("Aviso: Interfaz lista. Esperando datos del JSON local:", error.message);
    baseDatosRadar = [];
  }
}

// 2. Mostrar los destacados generales en la Portada
function renderizarDestacadosPais() {
  const contenedor = document.getElementById('contenedor-destacados');
  if(!contenedor || !baseDatosRadar || baseDatosRadar.length === 0) return;
  
  const destacados = baseDatosRadar.filter(item => item.destacado === true && item.tipo === 'comercio');
  contenedor.innerHTML = '';

  if(destacados.length === 0) {
    contenedor.innerHTML = '<p class="txt-vacio">Cargando próximos comercios recomendados...</p>';
    return;
  }

  destacados.forEach(item => {
    contenedor.innerHTML += `
      <div class="card-circuito pop-destacado">
        <span class="badge-card-cat">⭐ Destacado</span>
        <h2>${item.nombre}</h2>
        <p><strong>Zona:</strong> ${item.sector}, ${item.distrito}</p>
        <p class="desc-corta">${item.descripcion}</p>
        <a href="${item.enlace || '#'}" target="_blank" class="enlace-comercio">Ver Dirección Digital →</a>
      </div>
    `;
  });
}

// 3. Controlar el Botón Maestro Principal
function toggleMenuMaestro() {
  const contenido = document.getElementById('contenido-maestro-provincias');
  const icono = document.getElementById('icono-maestro');
  if(!contenido || !icono) return;

  if (contenido.classList.contains('active')) {
    contenido.classList.remove('active');
    icono.textContent = '+';
  } else {
    contenido.classList.add('active');
    icono.textContent = '-';
  }
}

// 4. Desplegar bloques internos de Provincias con la estructura territorial completa
function toggleProvinciaDinamica(provinciaKey, botonElemento) {
  const contenedorSectores = document.getElementById(`sub-sectores-${provinciaKey}`);
  const subIcono = botonElemento.querySelector('.sub-icon-prov');
  if(!contenedorSectores || !subIcono) return;

  if (contenedorSectores.classList.contains('active')) {
    contenedorSectores.classList.remove('active');
    subIcono.textContent = '+';
    contenedorSectores.innerHTML = '';
  } else {
    // Limpieza de pestañas
    document.querySelectorAll('.sectores-internos-menu').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.sub-icon-prov').forEach(el => el.textContent = '+');

    contenedorSectores.classList.add('active');
    subIcono.textContent = '-';

    // RENDERIZADO DE LA ARQUITECTURA TERRITORIAL DE PANAMÁ
    if (provinciaKey === "Panama") {
      contenedorSectores.innerHTML = `
        <div class="distrito-bloque">
          <h4>📋 Distrito: Panamá</h4>
          <div class="sectores-links-container">
            <button class="btn-sector-link" onclick="cargarSectorDetalle('Panamá', 'Panamá', 'Casco Antiguo')">📍 Casco Antiguo</button>
          </div>
        </div>
      `;
    } 
    else if (provinciaKey === "PanamaOeste") {
      contenedorSectores.innerHTML = `
        <div class="distrito-bloque">
          <h4>📋 Distrito: Chame</h4>
          <div class="sectores-links-container">
            <button class="btn-sector-link" onclick="cargarSectorDetalle('Panamá Oeste', 'Chame', 'Chame')">📍 Chame Cabecera</button>
            <button class="btn-sector-link" onclick="cargarSectorDetalle('Panamá Oeste', 'Chame', 'Coronado')">📍 Coronado</button>
          </div>
        </div>
        <div class="distrito-bloque">
          <h4>📋 Distrito: San Carlos</h4>
          <div class="sectores-links-container">
            <button class="btn-sector-link" onclick="cargarSectorDetalle('Panamá Oeste', 'San Carlos', 'San Carlos Centro')">📍 San Carlos Centro</button>
          </div>
        </div>
      `;
    } 
    else if (provinciaKey === "Cocle") {
      contenedorSectores.innerHTML = `
        <div class="distrito-bloque">
          <h4>📋 Distrito: Antón</h4>
          <div class="sectores-links-container">
            <button class="btn-sector-link" onclick="cargarSectorDetalle('Coclé', 'Antón', 'Río Hato')">📍 Río Hato</button>
            <button class="btn-sector-link" onclick="cargarSectorDetalle('Coclé', 'Antón', 'El Valle')">📍 El Valle de Antón</button>
          </div>
        </div>
      `;
    } 
    else if (provinciaKey === "Colon") {
      contenedorSectores.innerHTML = `
        <div class="distrito-bloque">
          <h4>📋 Distrito: Colón</h4>
          <div class="sectores-links-container">
            <button class="btn-sector-link" onclick="cargarSectorDetalle('Colón', 'Colón', 'Colón Centro')">📍 Colón Centro</button>
          </div>
        </div>
        <div class="distrito-bloque">
          <h4>📋 Distrito: Portobelo (Costa Arriba)</h4>
          <div class="sectores-links-container">
            <button class="btn-sector-link" onclick="cargarSectorDetalle('Colón', 'Portobelo', 'María Chiquita')">📍 María Chiquita</button>
            <button class="btn-sector-link" onclick="cargarSectorDetalle('Colón', 'Portobelo', 'Portobelo Centro')">📍 Portobelo Centro</button>
          </div>
        </div>
        <div class="distrito-bloque">
          <h4>📋 Distrito: Chagres (Costa Abajo)</h4>
          <div class="sectores-links-container">
            <button class="btn-sector-link" onclick="cargarSectorDetalle('Colón', 'Chagres', 'Costa Abajo')">📍 Sectores Costa Abajo</button>
          </div>
        </div>
      `;
    } 
    else if (provinciaKey === "GunaYala") {
      contenedorSectores.innerHTML = `
        <div class="distrito-bloque">
          <h4>📋 Comarca: Guna Yala</h4>
          <div class="sectores-links-container">
            <button class="btn-sector-link" onclick="cargarSectorDetalle('Guna Yala', 'Guna Yala', 'San Blas')">📍 San Blas (Islas)</button>
          </div>
        </div>
      `;
    } 
    else if (provinciaKey === "BocasDelToro") {
      contenedorSectores.innerHTML = `
        <div class="distrito-bloque">
          <h4>📋 Distrito: Bocas del Toro</h4>
          <div class="sectores-links-container">
            <button class="btn-sector-link" onclick="cargarSectorDetalle('Bocas del Toro', 'Bocas del Toro', 'Isla Colón')">📍 Isla Colón Centro</button>
            <button class="btn-sector-link" onclick="cargarSectorDetalle('Bocas del Toro', 'Bocas del Toro', 'Isla Carenero')">📍 Isla Carenero</button>
            <button class="btn-sector-link" onclick="cargarSectorDetalle('Bocas del Toro', 'Bocas del Toro', 'Isla Bastimentos')">📍 Isla Bastimentos</button>
          </div>
        </div>
      `;
    } 
    else if (provinciaKey === "Chiriqui") {
      contenedorSectores.innerHTML = `
        <div class="distrito-bloque">
          <h4>📋 Distrito: Boquete</h4>
          <div class="sectores-links-container">
            <button class="btn-sector-link" onclick="cargarSectorDetalle('Chiriquí', 'Boquete', 'Boquete')">📍 Boquete Pueblo</button>
          </div>
        </div>
        <div class="distrito-bloque">
          <h4>📋 Distrito: Tierras Altas</h4>
          <div class="sectores-links-container">
            <button class="btn-sector-link" onclick="cargarSectorDetalle('Chiriquí', 'Tierras Altas', 'Cerro Punta')">📍 Cerro Punta</button>
            <button class="btn-sector-link" onclick="cargarSectorDetalle('Chiriquí', 'Tierras Altas', 'Volcán')">📍 Volcán Centro</button>
          </div>
        </div>
        <div class="distrito-bloque">
          <h4>📋 Distrito: David</h4>
          <div class="sectores-links-container">
            <button class="btn-sector-link" onclick="cargarSectorDetalle('Chiriquí', 'David', 'David Centro')">📍 David Centro</button>
          </div>
        </div>
      `;
    } 
    else if (provinciaKey === "Veraguas") {
      contenedorSectores.innerHTML = `
        <div class="distrito-bloque">
          <h4>📋 Distrito: Mariato</h4>
          <div class="sectores-links-container">
            <button class="btn-sector-link" onclick="cargarSectorDetalle('Veraguas', 'Mariato', 'Mariato Centro')">📍 Mariato Centro</button>
            <button class="btn-sector-link" onclick="cargarSectorDetalle('Veraguas', 'Mariato', 'Torio')">📍 Torio</button>
          </div>
        </div>
        <div class="distrito-bloque">
          <h4>📋 Distrito: Soná</h4>
          <div class="sectores-links-container">
            <button class="btn-sector-link" onclick="cargarSectorDetalle('Veraguas', 'Soná', 'Santa Catalina')">📍 Santa Catalina</button>
            <button class="btn-sector-link" onclick="cargarSectorDetalle('Veraguas', 'Soná', 'Soná Centro')">📍 Soná Centro</button>
          </div>
        </div>
      `;
    } 
    else if (provinciaKey === "LosSantos") {
      contenedorSectores.innerHTML = `
        <div class="distrito-bloque">
          <h4>📋 Distrito: Pedasí</h4>
          <div class="sectores-links-container">
            <button class="btn-sector-link" onclick="cargarSectorDetalle('Los Santos', 'Pedasí', 'Pedasí Centro')">📍 Pedasí Centro</button>
            <button class="btn-sector-link" onclick="cargarSectorDetalle('Los Santos', 'Pedasí', 'Playa Venao')">📍 Playa Venao</button>
          </div>
        </div>
        <div class="distrito-bloque">
          <h4>📋 Distrito: Tonosí</h4>
          <div class="sectores-links-container">
            <button class="btn-sector-link" onclick="cargarSectorDetalle('Los Santos', 'Tonosí', 'Cambutal')">📍 Cambutal</button>
          </div>
        </div>
        <div class="distrito-bloque">
          <h4>📋 Distrito: Las Tablas</h4>
          <div class="sectores-links-container">
            <button class="btn-sector-link" onclick="cargarSectorDetalle('Los Santos', 'Las Tablas', 'Las Tablas Centro')">📍 Las Tablas Centro</button>
          </div>
        </div>
      `;
    } 
    else if (provinciaKey === "Herrera") {
      contenedorSectores.innerHTML = `
        <div class="distrito-bloque">
          <h4>📋 Distrito: Chitré</h4>
          <div class="sectores-links-container">
            <button class="btn-sector-link" onclick="cargarSectorDetalle('Herrera', 'Chitré', 'Chitré Centro')">📍 Chitré Centro</button>
          </div>
        </div>
      `;
    }
  }
}

// 5. Cargar detalles del sector seleccionado (Circuito + Recomendados Locales + Categorías)
function cargarSectorDetalle(provincia, distrito, sector) {
  const vista = document.getElementById('vista-sector');
  const txtNombre = document.getElementById('dinamico-nombre-sector');
  const txtJerarquia = document.getElementById('dinamico-jerarquia');
  const bloqueCircuito = document.getElementById('bloque-circuito-turistico');
  const contenedorCategorias = document.getElementById('categorias-desplegables');
  
  const bloqueDestacadosZona = document.getElementById('zona-destacados-container');
  const contenedorDestacadosZona = document.getElementById('contenedor-destacados-zona');

  if(!vista || !txtNombre || !txtJerarquia || !bloqueCircuito || !contenedorCategorias) return;

  txtNombre.textContent = `Explore el Sector de ${sector}`;
  txtJerarquia.textContent = `📍 Provincia de ${provincia} > Distrito de ${distrito}`;
  
  let circuitoData = null;
  if(baseDatosRadar && baseDatosRadar.length > 0) {
    circuitoData = baseDatosRadar.find(item => 
      item.tipo === "circuito_turistico" && 
      item.sector.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === sector.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    );
  }

  if (circuitoData) {
    bloqueCircuito.innerHTML = `
      <div class="circuito-header-info">
        <span class="badge-circuito-tag">🎒 Circuito Turístico Oficial</span>
        <span class="duracion-tag">⏱️ ${circuitoData.duracion || 'Variable'}</span>
      </div>
      <h3>${circuitoData.nombre}</h3>
      <p>${circuitoData.descripcion}</p>
      <a href="${circuitoData.enlace_mapa || '#'}" target="_blank" class="btn-mapa-circuito">🗺️ Ver Ruta Digital del Circuito</a>
    `;
    bloqueCircuito.style.display = "block";
  } else {
    // Renderizado condicional comercial implícito si no hay datos de circuitos estructurados
    bloqueCircuito.innerHTML = `<p style="color: #64748b; font-style: italic;">✨ Circuito Turístico de la comunidad consolidándose próximamente.</p>`;
  }

  const itemsDelSector = baseDatosRadar.filter(item => 
    item.tipo === "comercio" &&
    item.sector.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === sector.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  );

  const destacadosDeLaZona = itemsDelSector.filter(comercio => comercio.destacado === true);
  
  if (destacadosDeLaZona.length > 0 && bloqueDestacadosZona && contenedorDestacadosZona) {
    contenedorDestacadosZona.innerHTML = '';
    destacadosDeLaZona.forEach(comercio => {
      contenedorDestacadosZona.innerHTML += `
        <div class="card-circuito pop-destacado" style="background: #faf5ff; border-color: #a855f7 !important;">
          <span class="badge-card-cat" style="background:rgba(168,85,247,0.1); color:#a855f7;">⭐ Recomendado Local</span>
          <h2>${comercio.nombre}</h2>
          <p>${comercio.descripcion}</p>
          <a href="${comercio.enlace || '#'}" target="_blank" class="enlace-comercio" style="color:#a855f7;">Ver Dirección Digital →</a>
        </div>
      `;
    });
    bloqueDestacadosZona.style.display = "block";
  } else if (bloqueDestacadosZona) {
    bloqueDestacadosZona.style.display = "none";
  }

  contenedorCategorias.innerHTML = "";
  categoriasFijas.forEach((cat, index) => {
    const comerciosDeEstaCat = itemsDelSector.filter(item => item.categoria === cat);
    const conteo = comerciosDeEstaCat.length;

    contenedorCategorias.innerHTML += `
      <div class="sub-accordion-item">
        <button class="sub-accordion-header" onclick="toggleSubCategoria(${index})">
          <span>📂 ${cat} (${conteo})</span>
          <span class="sub-icon">+</span>
        </button>
        <div class="sub-accordion-content" id="sub-cat-${index}">
          <div class="grid-tarjetas padding-intern-cards">
            ${conteo === 0 ? '<p class="txt-vacio">Próximamente más comercios afiliados en este sector.</p>' : ''}
            ${comerciosDeEstaCat.map(comercio => `
              <div class="card-circuito">
                <h2>${comercio.nombre}</h2>
                <p>${comercio.descripcion}</p>
                <a href="${comercio.enlace || '#'}" target="_blank" class="enlace-comercio">Ver Ubicación QR →</a>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  });

  vista.style.display = "block";
  vista.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function toggleSubCategoria(index) {
  const todosLosSubContenidos = document.querySelectorAll('.sub-accordion-content');
  todosLosSubContenidos.forEach(content => {
    if (content.id === `sub-cat-${index}`) {
      if (content.classList.contains('open')) {
        content.classList.remove('open');
        content.previousElementSibling.querySelector('.sub-icon').textContent = '+';
      } else {
        content.classList.add('open');
        content.previousElementSibling.querySelector('.sub-icon').textContent = '-';
      }
    } else {
      content.classList.remove('open');
      content.previousElementSibling.querySelector('.sub-icon').textContent = '+';
    }
  });
}

function buscarRadar() {
  const input = document.getElementById("searchInput");
  const result = document.getElementById("searchResult");
  if (!input || !result) return;
  
  const val = input.value.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (val === "") { result.textContent = "Por favor escribe un término."; return; }

  result.style.color = "#0f766e";
  result.textContent = `Buscando coincidencias para "${input.value}"...`;

  setTimeout(() => {
    if(val.includes("valle") || val.includes("anton")) {
      result.textContent = "📍 ¡Sector detectado! Cargando El Valle de Antón...";
      cargarSectorDetalle('Coclé', 'Antón', 'El Valle');
    } else if(val.includes("coronado")) {
      result.textContent = "📍 ¡Sector detectado! Cargando Coronado...";
      cargarSectorDetalle('Panamá Oeste', 'Chame', 'Coronado');
    } else if(val.includes("casco") || val.includes("antiguo")) {
      result.textContent = "📍 ¡Sector detectado! Cargando Casco Antiguo...";
      cargarSectorDetalle('Panamá', 'Panamá', 'Casco Antiguo');
    } else if(val.includes("pedasi")) {
      result.textContent = "📍 ¡Sector detectado! Cargando Pedasí...";
      cargarSectorDetalle('Los Santos', 'Pedasí', 'Pedasí Centro');
    } else if(val.includes("venao")) {
      result.textContent = "📍 ¡Sector detectado! Cargando Playa Venao...";
      cargarSectorDetalle('Los Santos', 'Pedasí', 'Playa Venao');
    } else if(val.includes("catalina")) {
      result.textContent = "📍 ¡Sector detectado! Cargando Santa Catalina...";
      cargarSectorDetalle('Veraguas', 'Soná', 'Santa Catalina');
    } else if(val.includes("boquete")) {
      result.textContent = "📍 ¡Sector detectado! Cargando Boquete...";
      cargarSectorDetalle('Chiriquí', 'Boquete', 'Boquete');
    } else {
      result.textContent = `Próximamente resultados en vivo para: "${input.value}"`;
    }
  }, 600);
}

document.addEventListener("DOMContentLoaded", inicializarRadar);
