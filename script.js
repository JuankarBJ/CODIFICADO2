document.addEventListener('DOMContentLoaded', () => {

    // --- 1. CARGA DE DATOS DESDE JSON ---
    fetch('database.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('No se pudo cargar database.json. Verifica que el archivo exista y no tenga errores.');
            }
            return response.json();
        })
        .then(data => {
            // Aplanamos la estructura de las infracciones y añadimos propiedades de la norma padre
            const allInfracciones = data.normas.flatMap(norma =>
                norma.infracciones.map(infraccion => ({
                    ...infraccion,
                    normagris_identificador: norma.identificador,
                    normagris_tematica: norma.tematica,
                    rango: norma.rango,
                    ambito: norma.ambito,
                    areaId: norma.areaId,
                    modelo_sancion: norma.modelo_sancion
                }))
            );
            
            // Una vez cargados y procesados los datos, iniciamos la aplicación
            iniciarApp(allInfracciones, data.settings, data.grandesAreas);
        })
        .catch(error => {
            console.error('Error fatal al cargar los datos:', error);
            document.querySelector('main').innerHTML = `<p style="color: red; text-align: center;">${error.message}</p>`;
        });


    // --- 2. FUNCIÓN PRINCIPAL DE LA APP ---
    function iniciarApp(infraccionesData, settings, grandesAreas) {
        
        // --- Selectores del DOM ---
        const searchInput = document.querySelector('.buscador');
        const groupedInfraccionesContainer = document.querySelector('.infracciones-agrupadas');

        // --- Lógica de renderizado ---

        function createInfraccionElement(data) {
            const infraccionDiv = document.createElement('div');
            // Asigna la clase CSS según el tipo de infracción (grave, media, leve)
            const tipoClase = data.tipo === 'grave' ? 'grave' : (data.tipo === 'media' ? 'media' : 'leve');
            
            // Definimos la variable modeloSancionClase basada en el dato de la norma
            const modeloSancionClase = data.modelo_sancion ? `modelo-${data.modelo_sancion}` : 'modelo-desconocido';

            // Añadimos las clases al div de la infracción
            infraccionDiv.classList.add('infraccion', tipoClase, modeloSancionClase);

            // Determinamos si el apartado existe para formatear el Art. / Apdo.
            // Si data.apartado es una cadena vacía o null, solo mostrará el artículo.
            const apartadoHtml = data.apartado && data.apartado.trim() !== '' ? ` | Apdo. ${data.apartado}` : '';
            
            // Tags (aunque estén ocultos por CSS, se generan en el DOM)
            const tagsHtml = data.tags && data.tags.length > 0 ? `<div class="infraccion-tags">${data.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>` : '';

            // Generamos las filas de importe solo si los datos existen.
            let importeContentHtml = '';

            // Fila de Importe (siempre debe existir un importe para que exista la infracción)
            if (data.importe) {
                importeContentHtml += `
                    <div class="importe-row">
                        <span class="label">Importe:</span> 
                        <span class="importe" title="Importe completo">${data.importe}</span>
                    </div>
                `;
            }
            
            // Fila de Importe Reducido
            if (data.importe_reducido) {
                importeContentHtml += `
                    <div class="importe-row">
                        <span class="label">Reducida:</span> 
                        <span class="importe-reducido" title="Importe reducido">${data.importe_reducido}</span>
                    </div>
                `;
            }

            // Fila de Puntos
            if (data.puntos) {
                importeContentHtml += `
                    <div class="importe-row">
                        <span class="label">Puntos:</span> 
                        <span class="puntos" title="Puntos a detraer">${data.puntos}</span>
                    </div>
                `;
            }

            // Estructura interna de la tarjeta de infracción
            infraccionDiv.innerHTML = `
                <div class="infraccion-header">
                    <div class="circulo">${data.circulo}</div>
                    <div class="header-info">
                        <div class="articulo-apartado">Art. ${data.articulo}${apartadoHtml}</div>
                        <div class="norma">Norma: <strong>${data.norma}</strong></div>
                    </div>
                    <div class="importe-info">
                        ${importeContentHtml}
                    </div>
                </div>
                <div class="descripcion">${data.descripcion}</div>
                ${tagsHtml}
            `;
            return infraccionDiv;
        }

        function renderGroupedInfracciones(infraccionesToDisplay) {
            groupedInfraccionesContainer.innerHTML = '';
            
            // Agrupa las infracciones por identificador y temática de la norma
            const groupedData = infraccionesToDisplay.reduce((acc, infraccion) => {
                const normaGrisKey = `${infraccion.normagris_identificador.trim()} - ${infraccion.normagris_tematica.trim()}`;
                if (!acc[normaGrisKey]) {
                    acc[normaGrisKey] = { 
                        rango: infraccion.rango, 
                        ambito: infraccion.ambito, 
                        areaId: infraccion.areaId, 
                        infracciones: [] 
                    };
                }
                acc[normaGrisKey].infracciones.push(infraccion);
                return acc;
            }, {});

            // Ordena los grupos de infracciones por ámbito y rango
            const sortedNormaGrisKeys = Object.keys(groupedData).sort((keyA, keyB) => {
                const normaInfoA = groupedData[keyA];
                const normaInfoB = groupedData[keyB];
                
                const indexA_ambito = settings.ambitoOrder.indexOf(normaInfoA.ambito);
                const indexB_ambito = settings.ambitoOrder.indexOf(normaInfoB.ambito);
                if (indexA_ambito !== indexB_ambito) return indexA_ambito - indexB_ambito;
                
                const indexA_rango = settings.rangoOrder.indexOf(normaInfoA.rango);
                const indexB_rango = settings.rangoOrder.indexOf(normaInfoB.rango);
                return indexA_rango - indexB_rango;
            });

            // Renderiza cada grupo
            sortedNormaGrisKeys.forEach(normaGrisKey => {
                const groupInfo = groupedData[normaGrisKey];
                const groupDiv = document.createElement('div');
                groupDiv.classList.add('infraccion-group');

                // Creamos groupHeader antes de cualquier lógica que intente adjuntar elementos a él
                const groupHeader = document.createElement('div');
                groupHeader.classList.add('infraccion-group-header');

                // Añade la insignia de área y el icono grande si están disponibles
                const areaInfo = grandesAreas[groupInfo.areaId];
                if (areaInfo) {
                    // 1. Establecer la variable CSS --area-color en el grupo (para el icono grande)
                    groupDiv.style.setProperty('--area-color', areaInfo.color);

                    // 2. Crear la insignia de área (etiqueta superior izquierda)
                    const areaBadge = document.createElement('span');
                    areaBadge.className = 'area-badge';
                    areaBadge.textContent = areaInfo.nombre;

                    // APLICAMOS EL COLOR DE FONDO DIRECTAMENTE EN EL ELEMENTO para asegurar su visibilidad
                    areaBadge.style.backgroundColor = areaInfo.color; 
                    
                    // 3. Añadir el icono grande si existe
                    if (areaInfo.icon) {
                         const areaIconDiv = document.createElement('div');
                         areaIconDiv.className = `area-group-icon icon-${areaInfo.icon}`;
                         areaIconDiv.dataset.icon = areaInfo.icon; 
                         
                         groupHeader.appendChild(areaIconDiv); // Añade el icono grande al encabezado
                    }

                    // 4. Añadir la insignia al grupo
                    groupDiv.prepend(areaBadge);
                }
                
                // Finaliza la estructura del groupHeader (se ha movido groupHeader.appendChild(areaIconDiv) al bloque anterior)
                const [identificador, tematica] = normaGrisKey.split(' - ');
                
                // Reconstruimos el innerHTML de groupHeader, asegurando que el icono (si existe) no sea sobrescrito
                const currentHeaderContent = groupHeader.innerHTML; // Guarda el contenido (posiblemente el icono)
                groupHeader.innerHTML = `
                    <span class="icon">▶</span>
                    <div class="norma-main-info">
                        <span class="normagris-identificador">${identificador}</span>
                        <span class="normagris-tematica">${tematica || ''}</span>
                    </div>
                ` + currentHeaderContent; // Añade el contenido principal y mantiene el icono si se añadió.


                groupDiv.appendChild(groupHeader);

                // Barra de filtros de gravedad dentro del grupo
                const severityFilterBar = document.createElement('div');
                severityFilterBar.classList.add('severity-filter-bar');
                severityFilterBar.innerHTML = `
                    <button class="severity-btn grave" data-severity="grave" title="Filtrar por Muy Graves"></button>
                    <button class="severity-btn media" data-severity="media" title="Filtrar por Graves"></button>
                    <button class="severity-btn leve" data-severity="leve" title="Filtrar por Leves"></button>
                `;
                groupDiv.appendChild(severityFilterBar);

                const infractionsContent = document.createElement('div');
                infractionsContent.classList.add('infracciones-content');
                
                // Ordena las infracciones dentro del grupo por artículo y apartado
                groupInfo.infracciones.sort((a, b) => {
                    const artA = parseInt(a.articulo, 10);
                    const artB = parseInt(b.articulo, 10);
                    if (artA !== artB) return artA - artB;
                    const aptoNumA = parseInt(a.apartado, 10) || 0;
                    const aptoNumB = parseInt(b.apartado, 10) || 0;
                    return aptoNumA - aptoNumB;
                }).forEach(infraccionData => {
                    const infraccionElement = createInfraccionElement(infraccionData);
                    
                    // Lógica para desplegar tags al hacer clic en la infracción (eliminada)
                    infraccionElement.addEventListener('click', () => {
                        // La lógica del click ya no despliega las etiquetas
                    });
                    infractionsContent.appendChild(infraccionElement);
                });
                
                groupDiv.appendChild(infractionsContent);

                // Lógica para colapsar/expandir el grupo
                groupHeader.addEventListener('click', () => {
                    groupDiv.classList.toggle('open');
                    infractionsContent.style.maxHeight = groupDiv.classList.contains('open') ? `${infractionsContent.scrollHeight}px` : null;
                });
                
                // Lógica para filtrar por gravedad dentro del grupo
                severityFilterBar.querySelectorAll('.severity-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const clickedButton = e.currentTarget;
                        const severityToFilter = clickedButton.dataset.severity;
                        
                        if (clickedButton.classList.contains('active')) {
                            // Si ya está activo, desactiva y muestra todo
                            clickedButton.classList.remove('active');
                            infractionsContent.querySelectorAll('.infraccion').forEach(inf => inf.style.display = '');
                        } else {
                            // Desactiva otros botones y activa el clicado
                            severityFilterBar.querySelectorAll('.severity-btn').forEach(b => b.classList.remove('active'));
                            clickedButton.classList.add('active');

                            // Filtra las infracciones por gravedad
                            infractionsContent.querySelectorAll('.infraccion').forEach(inf => {
                                inf.style.display = inf.classList.contains(severityToFilter) ? '' : 'none';
                            });
                        }
                        // Reajusta la altura del contenedor del grupo
                        infractionsContent.style.maxHeight = `${infractionsContent.scrollHeight}px`;
                    });
                });

                groupedInfraccionesContainer.appendChild(groupDiv);
            });
        }
        
        function applyFilters() {
            // Solo utilizamos el searchTerm del input principal
            const searchTerm = searchInput.value.toLowerCase().trim();
            
            // Filtramos las infracciones solo por el término de búsqueda
            const filteredInfracciones = infraccionesData.filter(infraccion => {
                // Si no hay término de búsqueda, mostrar todas las infracciones
                if (!searchTerm) return true;

                // Búsqueda por descripción, norma, artículo, apartado y tags
                const matchesSearch = infraccion.descripcion.toLowerCase().includes(searchTerm) ||
                    infraccion.norma.toLowerCase().includes(searchTerm) ||
                    infraccion.articulo.includes(searchTerm) ||
                    (infraccion.apartado && infraccion.apartado.includes(searchTerm)) || 
                    (infraccion.tags && infraccion.tags.some(tag => tag.toLowerCase().includes(searchTerm)));

                return matchesSearch;
            });
            
            renderGroupedInfracciones(filteredInfracciones);
        }

        // Inicializamos la carga y el filtrado
        applyFilters();
        
        // Event listeners para el buscador principal y botón de limpiar
        searchInput.addEventListener('input', applyFilters);

        document.querySelectorAll('.clear-button').forEach(button => {
            button.addEventListener('click', (event) => {
                const inputToClear = document.querySelector(`.${event.target.dataset.filterTarget}`);
                if (inputToClear) {
                    inputToClear.value = '';
                    applyFilters();
                }
            });
        });
    }

    // --- 3. LÓGICA DE UI (BARRA LATERAL Y BOTONES FLOTANTES) ---
    const sidebar = document.querySelector('.sidebar');
    const toggleSidebarBtn = document.getElementById('toggleSidebarBtn');
    const closeSidebarBtn = document.getElementById('closeSidebarBtn');
    const scrollTopBtn = document.getElementById('scrollTopBtn');

    // Lógica para abrir/cerrar la barra lateral
    if (toggleSidebarBtn && sidebar) {
        toggleSidebarBtn.addEventListener('click', () => {
            sidebar.classList.add('open');
        });
    }

    if (closeSidebarBtn && sidebar) {
        closeSidebarBtn.addEventListener('click', () => {
            sidebar.classList.remove('open');
        });
    }

    // Lógica del botón de scroll to top
    if (scrollTopBtn) {
        window.addEventListener('scroll', () => {
            const scrolledEnough = window.scrollY > window.innerHeight / 2;
            scrollTopBtn.classList.toggle('hidden', !scrolledEnough);
        });

        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});