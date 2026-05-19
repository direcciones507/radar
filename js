let baseDatosRadar = [];
const categoriasFijas = ["Restaurantes", "Hoteles", "Bares", "Gasolineras", "Cajeros ATM", "Actividades turísticas"];

async function inicializarRadar() {
  try {
    const response = await fetch('datos/circuitos.json');
    if (!response.ok) throw new Error('Error al leer datos/circuitos.json');
    baseDatosRadar = await response.json();
    renderizarDestacadosPrincipales();
  } catch (error) {
    console.error("Error inicializando Radar:", error);
  }
}

function renderizarDestacadosPrincipales() {
  const contenedor = document.getElementById('contenedor-destacados');
  if(!contenedor) return;
  
  const destacados = baseDatosRadar.filter(item => item.destacado === true && item.tipo === 'comercio');
  contenedor.innerHTML = '';

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

function toggleProvincia(botonElemento) {
  const provinciaId = botonElemento.getAttribute('data-provincia'); 
  const todosLosContenidos = document.querySelectorAll('.accordion-content');
  
  todosLosContenidos.forEach(contenido => {
    const idEsperado = `sectores-${provinciaId.replace(/\s+/g, '')}`;
    
    if (contenido.id === idEsperado) {
      if (contenido.classList.contains('active')) {
        contenido.classList.remove('active');
        botonElemento.querySelector('.icon').textContent = '+';
      } else {
        contenido.classList.add('active');
        botonElemento.querySelector('.icon').textContent = '-';
        construirSectoresFijos(provinciaId, contenido);
      }
    } else {
      contenido.classList.remove('active');
      const tarjetaPadre = contenido.closest('.accordion-item');
      if(tarjetaPadre) {
        const icon = tarjetaPadre.querySelector('.icon');
        if(icon) icon.textContent = '+';
      }
    }
  });
}

function construirSectoresFijos(provinciaId, contenedorHTML) {
  let sectoresHtml = "";

  if (provinciaId === "Panama Oeste") {
    sectoresHtml = `
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
  } else if (provinciaId === "Cocle") {
    sectoresHtml = `
      <div class="distrito-bloque">
        <h4>📋 Distrito: Antón</h4>
        <div class="sectores-links-container">
          <button class="btn-sector-link" onclick="cargarSectorDetalle('Coclé', 'Antón', 'Río Hato')">📍 Río Hato</button>
          <button class="btn-sector-link" onclick="cargarSectorDetalle('Coclé', 'Antón', 'El Valle')">📍 El Valle de Antón</button>
        </div>
      </div>
    `;
  }
  contenedorHTML.innerHTML = sectoresHtml;
}

function cargarSectorDetalle(provincia, distrito, sector) {
  const vista = document.getElementById('vista-sector');
  const txtNombre = document.getElementById('dinamico-nombre-sector');
  const txtJerarquia = document.getElementById('dinamico-jerarquia');
  const bloqueCircuito = document.getElementById('bloque-circuito-turistico');
  const contenedorCategorias = document.getElementById('categorias-desplegables');

  if(!vista || !txtNombre || !txtJerarquia || !bloqueCircuito || !contenedorCategorias) return;

  txtNombre.textContent = `Explore el Sector de ${sector}`;
  txtJerarquia.textContent = `📍 Provincia de ${provincia} > Distrito de ${distrito}`;
  
  const circuitoData = baseDatosRadar.find(item => 
    item.tipo === "circuito_turistico" && 
    item.sector.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === sector.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  );

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

  contenedorCategorias.innerHTML = "";
  const itemsDelSector = baseDatosRadar.filter(item => 
    item.tipo === "comercio" &&
    item.sector.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === sector.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  );

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
  vista.scrollIntoView({ behavior: 'smooth' });
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
  const val = input.value.trim();
  if (val === "") { result.textContent = "Por favor escribe un término."; return; }
  result.textContent = `Buscando "${val}"...`;
}

document.addEventListener("DOMContentLoaded", inicializarRadar);
