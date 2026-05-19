let baseDatosRadar = [];
const categoriasFijas = ["Restaurantes", "Hoteles", "Bares", "Gasolineras", "Cajeros ATM", "Actividades turísticas"];

// 1. Inicializar Base de Datos de forma segura
async function inicializarRadar() {
  try {
    const response = await fetch('data/circuitos.json');
    if (!response.ok) {
      console.warn('Archivo circuitos.json no encontrado. Usando modo simulación.');
      baseDatosRadar = [];
      return;
    }
    baseDatosRadar = await response.json();
    console.log("Base de datos territorial vinculada correctamente.");
    renderizarDestacadosPais();
  } catch (error) {
    console.error("Aviso: Interfaz gráfica lista. Esperando datos JSON:", error.message);
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

// 3. Controlar el Botón Maestro Único "EXPLORAR TERRITORIO"
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

// 4. Controlar y construir las Provincias por dentro de forma limpia
function toggleProvinciaDinamica(provinciaKey, botonElemento) {
  const contenedorSectores = document.getElementById(`sub-sectores-${provinciaKey}`);
  const subIcono = botonElemento.querySelector('.sub-icon-prov');
  if(!contenedorSectores || !subIcono) return;

  if (contenedorSectores.classList.contains('active')) {
    contenedorSectores.classList.remove('active');
    subIcono.textContent = '+';
    contenedorSectores.innerHTML = '';
  } else {
    // Cerrar otros bloques abiertos para mantener orden
    document.querySelectorAll('.sectores-internos-menu').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.sub-icon-prov').forEach(el => el.textContent = '+');

    contenedorSectores.classList.add('active');
    subIcono.textContent = '-';

    // Inyectar distritos y sectores ordenados
    if (provinciaKey === "PanamaOeste") {
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
            <button class="btn-sector-link" onclick="cargarSectorDetalle('Panamá Oeste', 'San Carlos', 'San Carlos')">📍 San Carlos Centro</button>
          </div>
        </div>
      `;
    } else if (provinciaKey === "Cocle") {
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
  }
}

// 5. Cargar detalles del sector (Circuito + Recomendados Locales + Categorías)
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
  
  // A. Extraer circuito turístico de la base de datos
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
    bloqueCircuito.innerHTML = `<p style="color: #64748b; font-style: italic;">✨ Circuito Turístico de la comunidad consolidándose próximamente.</p>`;
  }

  // B. Obtener comercios de este sector
  const itemsDelSector = baseDatosRadar.filter(item => 
    item.tipo === "comercio" &&
    item.sector.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === sector.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  );

  // C. Inyectar los Destacados Recomendados de esta Zona Específica
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

  // D. Clasificar el resto por las 6 categorías fijas ordenadas
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

// 6. Controlar subcategorías de negocios
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

// 7. Buscador por Texto Inteligente
function buscarRadar() {
  const input = document.getElementById("searchInput");
  const result = document.getElementById("searchResult");
  if (!input || !result) return;
  
  const val = input.value.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (val === "") { 
    result.textContent = "Por favor escribe una zona o categoría."; 
    return; 
  }

  result.style.color = "#0f766e";
  result.textContent = `Buscando coincidencias para "${input.value}"...`;

  setTimeout(() => {
    if(val.includes("valle") || val.includes("anton")) {
      result.textContent = "📍 ¡Sector detectado! Cargando El Valle de Antón...";
      cargarSectorDetalle('Coclé', 'Antón', 'El Valle');
    } else if(val.includes("coronado")) {
      result.textContent = "📍 ¡Sector detectado! Cargando Coronado...";
      cargarSectorDetalle('Panamá Oeste', 'Chame', 'Coronado');
    } else if(val.includes("hato") || val.includes("rio")) {
      result.textContent = "📍 ¡Sector detectado! Cargando Río Hato...";
      cargarSectorDetalle('Coclé', 'Antón', 'Río Hato');
    } else {
      result.textContent = `Próximamente resultados interactivos en vivo para: "${input.value}"`;
    }
  }, 600);
}

document.addEventListener("DOMContentLoaded", inicializarRadar);
