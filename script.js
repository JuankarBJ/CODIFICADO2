document.addEventListener('DOMContentLoaded', () => {

    let allInfraccionesData = []; // Contendrá todas las infracciones cargadas del database.json
    let allGrandesAreas = {};
    let allSettings = {};
    let originalGroupedInfraccionesData = {}; // Para almacenar el total de infracciones por grupo sin filtrar

    let currentFilters = {
        searchTerm: '',
        areaId: '',
        rango: '',
        ambito: ''
    };

    // Mapeo de colores para los ámbitos (valores directos para asignación inline en JS)
    const ambitoColorsMap = { 
        'Estatal': '#8B4513',
        'Autonómico': '#483D8B',
        'Local': '#20B2AA'
    };

    // --- FASE 1: Cargar la base de datos completa ---
    fetch('database.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`No se pudo cargar database.json: ${response.status} - ${response.statusText}. Verifica que el archivo exista y no tenga errores.`);
            }
            return response.json();
        })
        .then(data => {
            // Aplanar la estructura de las normas y sus infracciones
            allInfraccionesData = data.normas.flatMap(norma =>
                norma.infracciones.map(infraccion => ({
                    ...infraccion,
                    normagris_identificador: norma.identificador,
                    normagris_tematica: norma.tematica,
                    rango: norma.rango,
                    ambito: norma.ambito,
                    areaId: norma.areaId,
                    modelo_sancion: norma.modelo_sancion,
                    // Asegurar que el campo 'norma' dentro de infracción también está presente
                    norma: infraccion.norma || norma.identificador // Prioriza 'norma' si existe en la infracción, sino usa identificador de la norma padre
                }))
            );

            // Agrupar la data original para obtener los totales por grupo (para el contador)
            originalGroupedInfraccionesData = allInfraccionesData.reduce((acc, infraccion) => {
                const normaGrisKey = `${infraccion.normagris_identificador.trim()} - ${infraccion.normagris_tematica.trim()}`;
                if (!acc[normaGrisKey]) {
                    acc[normaGrisKey] = {
                        totalInfracciones: 0
                    };
                }
                acc[normaGrisKey].totalInfracciones++;
                return acc;
            }, {});

            allGrandesAreas = data.grandesAreas;
            allSettings = data.settings;

            // Ocultar mensaje de carga una vez que los datos se han cargado y la app va a iniciar
            const loadingMessage = document.querySelector('.loading-message');
            if (loadingMessage) {
                loadingMessage.style.display = 'none';
            }

            // Iniciar la aplicación con todos los datos cargados
            iniciarApp(allInfraccionesData, allSettings, allGrandesAreas);
        })
        .catch(error => {
            console.error('Error fatal al cargar los datos:', error);
            const mainContainer = document.querySelector('main');
            if (mainContainer) {
                mainContainer.innerHTML = `<p style="color: red; text-align: center;">${error.message}<br>Asegúrate de que 'database.json' existe y está bien formateado.</p>`;
            } else {
                document.body.innerHTML = `<p style="color: red; text-align: center;">${error.message}</p>`;
            }
        });


    function iniciarApp(totalInfraccionesData, settings, grandesAreas) {

        // Selectores DOM
        const searchInput = document.querySelector('.buscador');
        const groupedInfraccionesContainer = document.querySelector('.infracciones-agrupadas');
        const areaFilterSelect = document.getElementById('area-filter');
        const rangoFilterSelect = document.getElementById('rango-filter');
        const ambitoFilterSelect = document.getElementById('ambito-filter');
        const activeFiltersContainer = document.querySelector('.active-filters-container');

        const sidebar = document.querySelector('.sidebar');
        const toggleSidebarBtn = document.getElementById('toggleSidebarBtn');
        const closeSidebarBtn = document.getElementById('closeSidebarBtn');
        const scrollTopBtn = document.getElementById('scrollTopBtn');
        const showSearchBtn = document.getElementById('showSearchBtn'); // Botón de búsqueda (actualmente sin función)


        // Mapeo de iconos para mostrar en las opciones de filtro (si aplica)
        const iconEmojiMap = {
            'building': '🏗️',
            'car': '🚗',
            'dog': '🐶',
            'handcuffs': '⛓️',
            'circus': '🎪'
        };


        // Rellenar el select de áreas
        function populateAreaFilter() {
            areaFilterSelect.innerHTML = '<option value="">Todas las Áreas</option>';
            for (const areaId in grandesAreas) {
                const areaInfo = grandesAreas[areaId];
                const option = document.createElement('option');
                option.value = areaId;

                let optionText = areaInfo.nombre;
                if (areaInfo.icon && iconEmojiMap[areaInfo.icon]) {
                    optionText = `${iconEmojiMap[areaInfo.icon]} ${areaInfo.nombre}`;
                }
                option.textContent = optionText;
                option.classList.add('area-option');
                // Pasar el color para el pseudo-elemento CSS
                option.style.setProperty('--area-color-option', areaInfo.color); 
                
                areaFilterSelect.appendChild(option);
            }
        }
        populateAreaFilter();

        // Rellenar el select de rangos
        function populateRangoFilter() {
            rangoFilterSelect.innerHTML = '<option value="">Todos los Rangos</option>';
            settings.rangoOrder.forEach(rango => {
                const option = document.createElement('option');
                option.value = rango;
                option.textContent = rango;
                rangoFilterSelect.appendChild(option);
            });
        }
        populateRangoFilter();

        // Rellenar el select de ámbitos
        function populateAmbitoFilter() {
            if (ambitoFilterSelect) { // Asegurarse de que el elemento existe
                ambitoFilterSelect.innerHTML = '<option value="">Todos los Ámbitos</option>';
                settings.ambitoOrder.forEach(ambito => {
                    const option = document.createElement('option');
                    option.value = ambito;
                    option.textContent = ambito;
                    option.classList.add('ambito-option');
                    // Pasar el color de la variable CSS para el pseudo-elemento
                    option.style.setProperty('--ambito-color-option', `var(--color-ambito-${ambito.toLowerCase()})`);
                    ambitoFilterSelect.appendChild(option);
                });
            } else {
                console.error("Error: Elemento con ID 'ambito-filter' no encontrado. Asegúrate de que el ID sea correcto en el HTML.");
            }
        }
        populateAmbitoFilter();


        // Renderizar los badges de filtros activos
        function renderActiveFilters() {
            activeFiltersContainer.innerHTML = ''; // Limpiar el contenedor de badges

            // Badge de búsqueda por texto
            if (currentFilters.searchTerm) {
                const badge = document.createElement('span');
                badge.classList.add('filter-badge', 'text-filter-badge');
                badge.innerHTML = `Texto: "${currentFilters.searchTerm}" <button class="clear-filter-btn" data-filter-type="searchTerm">❌</button>`;
                activeFiltersContainer.appendChild(badge);
            }

            // Badge de filtro por área
            if (currentFilters.areaId) {
                const areaInfo = grandesAreas[currentFilters.areaId];
                if (areaInfo) {
                    const badge = document.createElement('span');
                    badge.classList.add('filter-badge', 'area-filter-badge');
                    badge.style.setProperty('--area-color-active-filter', areaInfo.color);
                    let badgeText = areaInfo.nombre;
                    if (areaInfo.icon && iconEmojiMap[areaInfo.icon]) {
                        badgeText = `${iconEmojiMap[areaInfo.icon]} ${areaInfo.nombre}`;
                    }
                    badge.innerHTML = `Área: ${badgeText} <button class="clear-filter-btn" data-filter-type="areaId">❌</button>`;
                    activeFiltersContainer.appendChild(badge);
                }
            }

            // Badge de filtro por rango
            if (currentFilters.rango) {
                const badge = document.createElement('span');
                badge.classList.add('filter-badge', 'rango-filter-badge');
                badge.innerHTML = `Rango: "${currentFilters.rango}" <button class="clear-filter-btn" data-filter-type="rango">❌</button>`;
                activeFiltersContainer.appendChild(badge);
            }

            // Badge de filtro por ámbito
            if (currentFilters.ambito) {
                const badge = document.createElement('span');
                badge.classList.add('filter-badge', 'ambito-filter-badge');
                // Asigna el color de fondo usando el mapa de colores (valor HEX/RGB directo)
                badge.style.backgroundColor = ambitoColorsMap[currentFilters.ambito];
                badge.style.color = 'white'; // Asegura que el texto sea blanco para un buen contraste
                badge.innerHTML = `Ámbito: ${currentFilters.ambito} <button class="clear-filter-btn" data-filter-type="ambito">❌</button>`;
                activeFiltersContainer.appendChild(badge);
            }

            // Añadir listener a los botones de borrar filtro en los badges
            activeFiltersContainer.querySelectorAll('.clear-filter-btn').forEach(button => {
                button.addEventListener('click', (event) => {
                    const filterType = event.target.dataset.filterType;
                    if (filterType === 'searchTerm') {
                        searchInput.value = '';
                    } else if (filterType === 'areaId') {
                        areaFilterSelect.value = '';
                    } else if (filterType === 'rango') {
                        rangoFilterSelect.value = '';
                    } else if (filterType === 'ambito') {
                        ambitoFilterSelect.value = '';
                    }
                    applyFilters(); // Re-aplicar filtros después de limpiar uno
                });
            });
        }


        // Crea el elemento HTML para una infracción individual
        function createInfraccionElement(data) {
            const infraccionDiv = document.createElement('div');
            // Clases para el borde izquierdo y círculo de gravedad
            const tipoClase = data.tipo === 'grave' ? 'grave' : (data.tipo === 'media' ? 'media' : 'leve');
            // Clase para el modelo de sanción (ocultar/mostrar importes)
            const modeloSancionClase = data.modelo_sancion ? `modelo-${data.modelo_sancion}` : 'modelo-estandar';

            infraccionDiv.classList.add('infraccion', tipoClase, modeloSancionClase);

            // --- Construcción de las píldoras de Artículo, Apartado y Opción ---
            let artAptoOpcHtml = '';
            // Píldora de Artículo/Apartado
            let articuloAptoContent = `Art. <strong class="value">${data.articulo}</strong>`;
            if (data.apartado && data.apartado.trim() !== '') {
                articuloAptoContent += ` Apdo. <strong class="value">${data.apartado}</strong>`;
            }
            artAptoOpcHtml += `<span class="articulo-apartado-pill">${articuloAptoContent}</span>`;

            // Píldora de Opción
            if (data.opc && data.opc.trim() !== '') {
                artAptoOpcHtml += `<span class="opcion-pill">Opc. <strong class="value">${data.opc}</strong></span>`;
            }
            
            // Tags (ocultos por defecto con CSS, se pueden mostrar al expandir/clicar)
            const tagsHtml = data.tags && data.tags.length > 0 ? `<div class="infraccion-tags">${data.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>` : '';

            // Construcción de las filas de importes
            let importeRowsHtml = '';
            if (data.importe) {
                importeRowsHtml += `
                    <div class="importe-row importe-principal">
                        <span class="label">Importe:</span>
                        <span class="importe">${data.importe}</span>
                    </div>
                `;
            }
            if (data.importe_reducido) {
                importeRowsHtml += `
                    <div class="importe-row reducido">
                        <span class="label">Reducida:</span>
                        <span class="importe-reducido">${data.importe_reducido}</span>
                    </div>
                `;
            }
            if (data.puntos) {
                importeRowsHtml += `
                    <div class="importe-row puntos">
                        <span class="label">Puntos:</span>
                        <span class="puntos">${data.puntos}</span>
                    </div>
                `;
            }
            const importeContainerHtml = importeRowsHtml ? `<div class="importe-container">${importeRowsHtml}</div>` : '';

            // Renderizado de la descripción con Marked.js para Markdown
            const descriptionRenderedHtml = marked.parse(data.descripcion || '');

            // Estructura final de la tarjeta de infracción
            infraccionDiv.innerHTML = `
                <div class="infraccion-header">
                    <div class="circulo">${data.circulo}</div>
                    <div class="header-info">
                        <div class="norma-display">Norma: <strong>${data.norma}</strong></div>
                        <div class="art-apto-opc-group">
                            ${artAptoOpcHtml}
                        </div>
                    </div>
                </div>
                <div class="descripcion">${descriptionRenderedHtml}</div>
                ${importeContainerHtml}
                ${tagsHtml}
            `;
            return infraccionDiv;
        }

        // Renderiza los grupos de infracciones (ya filtradas globalmente)
        function renderGroupedInfracciones(infraccionesToDisplay) {
            groupedInfraccionesContainer.innerHTML = ''; // Limpiar el contenedor principal

            // Agrupa las infracciones filtradas por norma para la visualización
            const groupedData = infraccionesToDisplay.reduce((acc, infraccion) => {
                const normaGrisKey = `${infraccion.normagris_identificador.trim()} - ${infraccion.normagris_tematica.trim()}`;
                if (!acc[normaGrisKey]) {
                    acc[normaGrisKey] = {
                        infracciones: [] // Estas son las infracciones *filtradas globalmente* para este grupo
                    };
                }
                acc[normaGrisKey].infracciones.push(infraccion);
                return acc;
            }, {});

            // Ordena los grupos por ámbito y rango
            const sortedNormaGrisKeys = Object.keys(groupedData).sort((keyA, keyB) => {
                // Obtenemos un elemento de infracción de cada grupo para acceder a ambito y rango para ordenar
                const normaInfoA = groupedData[keyA].infracciones[0]; 
                const normaInfoB = groupedData[keyB].infracciones[0];

                const indexA_ambito = settings.ambitoOrder.indexOf(normaInfoA.ambito);
                const indexB_ambito = settings.ambitoOrder.indexOf(normaInfoB.ambito);
                if (indexA_ambito !== indexB_ambito) return indexA_ambito - indexB_ambito;

                const indexA_rango = settings.rangoOrder.indexOf(normaInfoA.rango);
                const indexB_rango = settings.rangoOrder.indexOf(normaInfoB.rango);
                return indexA_rango - indexB_rango;
            });

            // Renderiza cada grupo de infracciones
            sortedNormaGrisKeys.forEach(normaGrisKey => {
                const groupInfo = groupedData[normaGrisKey]; // Contiene las infracciones *filtradas globalmente*
                // Obtener total original sin filtrar para el contador del grupo
                const totalInfraccionesGrupoOriginal = originalGroupedInfraccionesData[normaGrisKey]?.totalInfracciones || 0; 
                const infraccionesVisiblesGlobalmenteEnGrupo = groupInfo.infracciones.length; // Coincidencias tras filtros globales

                const groupDiv = document.createElement('div');
                groupDiv.classList.add('infraccion-group');

                const groupHeader = document.createElement('div');
                groupHeader.classList.add('infraccion-group-header');

                const expandIcon = document.createElement('span');
                expandIcon.classList.add('icon');
                expandIcon.textContent = '▶';
                groupHeader.appendChild(expandIcon);

                const normaMainInfo = document.createElement('div');
                normaMainInfo.classList.add('norma-main-info');
                // Acceder a las propiedades de la norma a través de la primera infracción del grupo
                const refInfraccion = groupInfo.infracciones[0]; 
                const identificador = refInfraccion.normagris_identificador;
                const tematica = refInfraccion.normagris_tematica;
                const ambito = refInfraccion.ambito;
                const areaId = refInfraccion.areaId;


                const ambitoTagHtml = ambito ?
                    `<span class="ambito-tag" style="background-color: ${ambitoColorsMap[ambito] || 'transparent'}; color: white;">${ambito}</span>` : '';

                const showSeparator = ambito && identificador;
                const separatorHtml = showSeparator ? '<span class="separator">|</span>' : '';

                normaMainInfo.innerHTML = `
                    <span class="normagris-tematica">${tematica || ''}</span>
                    <div class="identificador-and-ambito">
                        ${ambitoTagHtml}
                        ${separatorHtml}
                        <span class="normagris-identificador">${identificador}</span>
                    </div>
                `;
                groupHeader.appendChild(normaMainInfo);

                const areaInfo = grandesAreas[areaId]; // Usar areaId de la refInfraccion
                if (areaInfo) {
                    groupDiv.style.setProperty('--area-color', areaInfo.color);

                    const areaBadge = document.createElement('span');
                    areaBadge.className = 'area-badge';
                    areaBadge.textContent = areaInfo.nombre;
                    areaBadge.style.backgroundColor = areaInfo.color;
                    groupDiv.prepend(areaBadge);

                    if (areaInfo.icon) {
                        const areaIconDiv = document.createElement('div');
                        areaIconDiv.className = `area-group-icon icon-${areaInfo.icon}`;
                        areaIconDiv.dataset.icon = areaInfo.icon;
                        groupHeader.appendChild(areaIconDiv);
                    }
                }

                // El contador de infracciones del grupo
                const infraccionCounter = document.createElement('span');
                infraccionCounter.classList.add('infraccion-count');
                infraccionCounter.textContent = `${infraccionesVisiblesGlobalmenteEnGrupo} / ${totalInfraccionesGrupoOriginal}`;
                infraccionCounter.dataset.totalCount = totalInfraccionesGrupoOriginal; 
                groupHeader.appendChild(infraccionCounter);


                groupDiv.appendChild(groupHeader);

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
                
                // Renderizar todas las infracciones que pasaron el filtro global para este grupo
                groupInfo.infracciones.sort((a, b) => {
                    const artA = parseInt(a.articulo, 10);
                    const artB = parseInt(b.articulo, 10);
                    if (artA !== artB) return artA - artB;
                    const aptoNumA = parseInt(a.apartado, 10) || 0;
                    const aptoNumB = parseInt(b.apartado, 10) || 0;
                    const opcA = a.opc || '';
                    const opcB = b.opc || '';
                    return aptoNumA - aptoNumB || opcA.localeCompare(opcB);
                }).forEach(infraccionData => {
                    const infraccionElement = createInfraccionElement(infraccionData);
                    infractionsContent.appendChild(infraccionElement);
                });

                groupDiv.appendChild(infractionsContent);

                // Lógica para colapsar/expandir el grupo
                groupHeader.addEventListener('click', () => {
                    groupDiv.classList.toggle('open');
                    if (groupDiv.classList.contains('open')) {
                        infractionsContent.style.maxHeight = `${infractionsContent.scrollHeight}px`;
                    } else {
                        infractionsContent.style.maxHeight = null;
                        // Al cerrar, resetear filtros de gravedad y mostrar todo el contenido del grupo
                        severityFilterBar.querySelectorAll('.severity-btn').forEach(b => b.classList.remove('active'));
                        infractionsContent.querySelectorAll('.infraccion').forEach(inf => inf.style.display = '');
                        // También resetear el contador visible a las coincidencias globales del grupo
                        infraccionCounter.textContent = `${infraccionesVisiblesGlobalmenteEnGrupo} / ${totalInfraccionesGrupoOriginal}`;
                    }
                });

                // Función para configurar el filtro de gravedad de un grupo
                function setupSeverityFilter(severityBar, infractionsContainer, counterElement) {
                    severityBar.querySelectorAll('.severity-btn').forEach(btn => {
                        btn.addEventListener('click', (e) => { 
                            e.stopPropagation(); 
                            const clickedButton = e.currentTarget;
                            const severityToFilter = clickedButton.dataset.severity;
                            
                            let currentVisibleCount = 0;
                            
                            // Si ya está activo, desactiva y muestra todas las infracciones visibles por filtro global
                            if (clickedButton.classList.contains('active')) {
                                clickedButton.classList.remove('active');
                                // Contamos las que ya estaban visibles antes de este filtro de gravedad
                                infractionsContainer.querySelectorAll('.infraccion').forEach(inf => {
                                    inf.style.display = ''; 
                                    currentVisibleCount++;
                                });
                            } else {
                                // Desactiva otros botones y activa el clicado
                                severityBar.querySelectorAll('.severity-btn').forEach(b => b.classList.remove('active'));
                                clickedButton.classList.add('active');

                                // Filtra las infracciones por gravedad
                                infractionsContainer.querySelectorAll('.infraccion').forEach(inf => {
                                    if (inf.classList.contains(severityToFilter)) {
                                        inf.style.display = '';
                                        currentVisibleCount++;
                                    } else {
                                        inf.style.display = 'none';
                                    }
                                });
                            }
                            // Reajusta la altura del contenedor del grupo después de filtrar/mostrar
                            infractionsContainer.style.maxHeight = `${infractionsContent.scrollHeight}px`;
                            
                            // Actualizar el contador del grupo
                            if (counterElement) {
                                const originalTotal = counterElement.dataset.totalCount;
                                counterElement.textContent = `${currentVisibleCount} / ${originalTotal}`;
                            }
                        });
                    });
                }
                setupSeverityFilter(severityFilterBar, infractionsContent, infraccionCounter);


                groupedInfraccionesContainer.appendChild(groupDiv);
            });
        }

        // Función principal para aplicar todos los filtros y renderizar
        function applyFilters() {
            // Actualizar el estado de los filtros
            currentFilters.searchTerm = searchInput.value.toLowerCase().trim();
            currentFilters.areaId = areaFilterSelect.value;
            currentFilters.rango = rangoFilterSelect.value;
            currentFilters.ambito = ambitoFilterSelect.value;

            renderActiveFilters(); // Muestra los badges de filtros activos

            // Filtrar sobre el array completo de infracciones (totalInfraccionesData)
            const filteredInfracciones = totalInfraccionesData.filter(infraccion => {
                // Búsqueda por texto en múltiples campos
                const matchesSearch = !currentFilters.searchTerm ||
                    infraccion.descripcion.toLowerCase().includes(currentFilters.searchTerm) ||
                    infraccion.norma.toLowerCase().includes(currentFilters.searchTerm) ||
                    infraccion.articulo.includes(currentFilters.searchTerm) ||
                    (infraccion.apartado && infraccion.apartado.toLowerCase().includes(currentFilters.searchTerm)) ||
                    (infraccion.opc && infraccion.opc.toLowerCase().includes(currentFilters.searchTerm)) ||
                    (infraccion.tags && infraccion.tags.some(tag => tag.toLowerCase().includes(currentFilters.searchTerm))) ||
                    infraccion.normagris_identificador.toLowerCase().includes(currentFilters.searchTerm) ||
                    infraccion.normagris_tematica.toLowerCase().includes(currentFilters.searchTerm);

                // Filtros de selección
                const matchesArea = !currentFilters.areaId || infraccion.areaId === currentFilters.areaId;
                const matchesRango = !currentFilters.rango || infraccion.rango === currentFilters.rango;
                const matchesAmbito = !currentFilters.ambito || infraccion.ambito === currentFilters.ambito;

                return matchesSearch && matchesArea && matchesRango && matchesAmbito;
            });

            // Renderizar las infracciones que han pasado todos los filtros globales
            renderGroupedInfracciones(filteredInfracciones);
        }

        // Inicializar filtros al cargar la página
        // Comprobar si hay un filtro de área inicial de la página de inicio (desde sessionStorage)
        const initialAreaFilter = sessionStorage.getItem('initialAreaFilter');
        if (initialAreaFilter) {
            currentFilters.areaId = initialAreaFilter; // Establecer el filtro actual
            areaFilterSelect.value = initialAreaFilter; // Seleccionar la opción en el dropdown
            sessionStorage.removeItem('initialAreaFilter'); // Limpiar para que no se aplique de nuevo en futuras cargas
        }
        applyFilters(); 

        // Event Listeners para los elementos de filtro
        searchInput.addEventListener('input', applyFilters);
        areaFilterSelect.addEventListener('change', applyFilters);
        rangoFilterSelect.addEventListener('change', applyFilters);
        ambitoFilterSelect.addEventListener('change', applyFilters);

        // Listener para el botón de limpiar el campo de búsqueda principal
        document.querySelectorAll('.clear-button').forEach(button => {
            button.addEventListener('click', (event) => {
                const inputToClear = document.querySelector(`.${event.target.dataset.filterTarget}`);
                if (inputToClear) {
                    inputToClear.value = '';
                    applyFilters();
                }
            });
        });

        // Lógica de la barra lateral (sidebar) y botones flotantes (FABs)
        const floatingActionButtonsContainer = document.querySelector('.floating-action-buttons');

        // Controla la visibilidad de los FABs (ocultos si sidebar abierto, visibles si cerrado)
        function updateFABVisibility() {
            if (sidebar.classList.contains('open')) {
                floatingActionButtonsContainer.style.display = 'none';
            } else {
                floatingActionButtonsContainer.style.display = 'flex';
            }
        }

        // Toggle para abrir/cerrar sidebar
        if (toggleSidebarBtn && sidebar) {
            toggleSidebarBtn.addEventListener('click', () => {
                sidebar.classList.toggle('open');
                updateFABVisibility();
            });
        }

        // Botón de cerrar sidebar (dentro del sidebar)
        if (closeSidebarBtn && sidebar) {
            closeSidebarBtn.addEventListener('click', () => {
                sidebar.classList.remove('open');
                updateFABVisibility();
            });
        }

        // Lógica para el botón de scroll to top
        if (scrollTopBtn) {
            window.addEventListener('scroll', () => {
                // Solo mostrar si el sidebar NO está abierto
                if (!sidebar.classList.contains('open')) {
                    const scrolledEnough = window.scrollY > window.innerHeight / 2;
                    scrollTopBtn.classList.toggle('hidden', !scrolledEnough);
                } else {
                    scrollTopBtn.classList.add('hidden'); // Ocultar si el sidebar está abierto
                }
            });

            scrollTopBtn.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        // Botón showSearchBtn (actualmente sin funcionalidad activa)
        if (showSearchBtn) {
            showSearchBtn.addEventListener('click', () => {
                console.log('Botón "Mostrar filtros y título" clicado. Su funcionalidad es opcional aquí.');
            });
        }

        // Asegurarse de que los FABs estén visibles al cargar la página si el sidebar no está abierto
        updateFABVisibility();
    }
});