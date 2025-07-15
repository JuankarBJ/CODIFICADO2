document.addEventListener('DOMContentLoaded', () => {

    let allInfraccionesData = [];
    let allGrandesAreas = {};
    let allSettings = {};
    let originalGroupedInfraccionesData = {}; // Nuevo: para almacenar el total de infracciones por grupo sin filtrar

    let currentFilters = {
        searchTerm: '',
        areaId: '',
        rango: '',
        ambito: ''
    };

    const ambitoColorsMap = {
        'Estatal': '#8B4513',
        'Autonómico': '#483D8B',
        'Local': '#20B2AA'
    };

    fetch('database.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`No se pudo cargar database.json: ${response.status} - ${response.statusText}. Verifica que el archivo exista y no tenga errores.`);
            }
            return response.json();
        })
        .then(data => {
            allInfraccionesData = data.normas.flatMap(norma =>
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

            // Nuevo: Agrupar la data original para obtener los totales por grupo
            originalGroupedInfraccionesData = allInfraccionesData.reduce((acc, infraccion) => {
                const normaGrisKey = `${infraccion.normagris_identificador.trim()} - ${infraccion.normagris_tematica.trim()}`;
                if (!acc[normaGrisKey]) {
                    acc[normaGrisKey] = {
                        totalInfracciones: 0 // Solo necesitamos el total
                    };
                }
                acc[normaGrisKey].totalInfracciones++;
                return acc;
            }, {});

            allGrandesAreas = data.grandesAreas;
            allSettings = data.settings;

            iniciarApp(allInfraccionesData, allSettings, allGrandesAreas);
        })
        .catch(error => {
            console.error('Error fatal al cargar los datos:', error);
            const mainContainer = document.querySelector('main');
            if (mainContainer) {
                mainContainer.innerHTML = `<p style="color: red; text-align: center;">${error.message}</p>`;
            } else {
                document.body.innerHTML = `<p style="color: red; text-align: center;">${error.message}</p>`;
            }
        });


    function iniciarApp(infraccionesData, settings, grandesAreas) {

        const searchInput = document.querySelector('.buscador');
        const groupedInfraccionesContainer = document.querySelector('.infracciones-agrupadas');
        const loadingMessage = document.querySelector('.loading-message');
        const areaFilterSelect = document.getElementById('area-filter');
        const rangoFilterSelect = document.getElementById('rango-filter');
        const ambitoFilterSelect = document.getElementById('ambito-filter');
        const activeFiltersContainer = document.querySelector('.active-filters-container');

        const sidebar = document.querySelector('.sidebar');
        const toggleSidebarBtn = document.getElementById('toggleSidebarBtn');
        const closeSidebarBtn = document.getElementById('closeSidebarBtn');
        const scrollTopBtn = document.getElementById('scrollTopBtn');
        const showSearchBtn = document.getElementById('showSearchBtn');


        if (loadingMessage) {
            loadingMessage.style.display = 'none';
        }

        const iconEmojiMap = {
            'building': '🏗️',
            'car': '🚗',
            'dog': '🐶',
            'handcuffs': '⛓️',
            'circus': '🎪'
        };


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
                option.style.setProperty('--area-color-option', areaInfo.color);

                areaFilterSelect.appendChild(option);
            }
        }
        populateAreaFilter();

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

        function populateAmbitoFilter() {
            if (ambitoFilterSelect) {
                ambitoFilterSelect.innerHTML = '<option value="">Todos los Ámbitos</option>';
                settings.ambitoOrder.forEach(ambito => {
                    const option = document.createElement('option');
                    option.value = ambito;
                    option.textContent = ambito;
                    option.classList.add('ambito-option');
                    option.style.setProperty('--ambito-color-option', `var(--color-ambito-${ambito.toLowerCase()})`);
                    ambitoFilterSelect.appendChild(option);
                });
            } else {
                console.error("Error: Elemento con ID 'ambito-filter' no encontrado. Asegúrate de que el ID sea correcto en el HTML y el script se carga al final del body o con DOMContentLoaded.");
            }
        }
        populateAmbitoFilter();


        function renderActiveFilters() {
            activeFiltersContainer.innerHTML = '';

            if (currentFilters.searchTerm) {
                const badge = document.createElement('span');
                badge.classList.add('filter-badge', 'text-filter-badge');
                badge.innerHTML = `Texto: "${currentFilters.searchTerm}" <button class="clear-filter-btn" data-filter-type="searchTerm">❌</button>`;
                activeFiltersContainer.appendChild(badge);
            }

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

            if (currentFilters.rango) {
                const badge = document.createElement('span');
                badge.classList.add('filter-badge', 'rango-filter-badge');
                badge.innerHTML = `Rango: "${currentFilters.rango}" <button class="clear-filter-btn" data-filter-type="rango">❌</button>`;
                activeFiltersContainer.appendChild(badge);
            }

            if (currentFilters.ambito) {
                const badge = document.createElement('span');
                badge.classList.add('filter-badge', 'ambito-filter-badge');
                badge.style.backgroundColor = ambitoColorsMap[currentFilters.ambito];
                badge.style.color = 'white';
                badge.innerHTML = `Ámbito: ${currentFilters.ambito} <button class="clear-filter-btn" data-filter-type="ambito">❌</button>`;
                activeFiltersContainer.appendChild(badge);
            }

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
                    applyFilters();
                });
            });
        }


        function createInfraccionElement(data) {
            const infraccionDiv = document.createElement('div');
            const tipoClase = data.tipo === 'grave' ? 'grave' : (data.tipo === 'media' ? 'media' : 'leve');
            const modeloSancionClase = data.modelo_sancion ? `modelo-${data.modelo_sancion}` : 'modelo-estandar';

            infraccionDiv.classList.add('infraccion', tipoClase, modeloSancionClase);

            let articuloAptoOpcHtml = '';
            let articuloAptoContent = `Art. <strong class="value">${data.articulo}</strong>`;
            if (data.apartado && data.apartado.trim() !== '') {
                articuloAptoContent += ` Apdo. <strong class="value">${data.apartado}</strong>`;
            }
            articuloAptoOpcHtml += `<span class="articulo-apartado-pill">${articuloAptoContent}</span>`;

            if (data.opc && data.opc.trim() !== '') {
                articuloAptoOpcHtml += `<span class="opcion-pill">Opc. <strong class="value">${data.opc}</strong></span>`;
            }
            
            const tagsHtml = data.tags && data.tags.length > 0 ? `<div class="infraccion-tags">${data.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>` : '';

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

            const descriptionRenderedHtml = marked.parse(data.descripcion || '');

            infraccionDiv.innerHTML = `
                <div class="infraccion-header">
                    <div class="circulo">${data.circulo}</div>
                    <div class="header-info">
                        <div class="norma-display">Norma: <strong>${data.norma}</strong></div>
                        <div class="art-apto-opc-group">
                            ${articuloAptoOpcHtml}
                        </div>
                    </div>
                </div>
                <div class="descripcion">${descriptionRenderedHtml}</div>
                ${importeContainerHtml}
                ${tagsHtml}
            `;
            return infraccionDiv;
        }

        function renderGroupedInfracciones(infraccionesToDisplay) {
            groupedInfraccionesContainer.innerHTML = '';

            // Agrupa las infracciones filtradas para la visualización
            const groupedData = infraccionesToDisplay.reduce((acc, infraccion) => {
                const normaGrisKey = `${infraccion.normagris_identificador.trim()} - ${infraccion.normagris_tematica.trim()}`;
                if (!acc[normaGrisKey]) {
                    acc[normaGrisKey] = {
                        rango: infraccion.rango,
                        ambito: infraccion.ambito,
                        areaId: infraccion.areaId,
                        infracciones: [] // Estas son las infracciones *filtradas* del grupo
                    };
                }
                acc[normaGrisKey].infracciones.push(infraccion);
                return acc;
            }, {});

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

            sortedNormaGrisKeys.forEach(normaGrisKey => {
                const groupInfo = groupedData[normaGrisKey]; // Contiene las infracciones *filtradas*
                const totalInfraccionesGrupoOriginal = originalGroupedInfraccionesData[normaGrisKey]?.totalInfracciones || 0; // Obtener total original
                const infraccionesVisiblesGrupo = groupInfo.infracciones.length; // Coincidencias filtradas

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
                const [identificador, tematica] = normaGrisKey.split(' - ');

                const ambitoTagHtml = groupInfo.ambito ?
                    `<span class="ambito-tag" style="background-color: ${ambitoColorsMap[groupInfo.ambito] || 'transparent'}; color: white;">${groupInfo.ambito}</span>` : '';

                const showSeparator = groupInfo.ambito && identificador;
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

                const areaInfo = grandesAreas[groupInfo.areaId];
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

                // Nuevo: El contador de infracciones
                const infraccionCounter = document.createElement('span');
                infraccionCounter.classList.add('infraccion-count');
                // Inicialmente, muestra el total filtrado / total original del grupo
                infraccionCounter.textContent = `${infraccionesVisiblesGrupo} / ${totalInfraccionesGrupoOriginal}`;
                // Guardar los totales en dataset para fácil acceso en filtrado interno
                infraccionCounter.dataset.filteredCount = infraccionesVisiblesGrupo;
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
                // Almacenar el contador de infracciones para que el filtro de gravedad interno lo actualice
                infractionsContent.dataset.counterTarget = normaGrisKey; 


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

                groupHeader.addEventListener('click', () => {
                    groupDiv.classList.toggle('open');
                    if (groupDiv.classList.contains('open')) {
                        // Recalcular scrollHeight dinámicamente
                        infractionsContent.style.maxHeight = `${infractionsContent.scrollHeight}px`;
                    } else {
                        infractionsContent.style.maxHeight = null;
                        // Al cerrar, resetear filtros de gravedad y mostrar todo el contenido del grupo
                        severityFilterBar.querySelectorAll('.severity-btn').forEach(b => b.classList.remove('active'));
                        infractionsContent.querySelectorAll('.infraccion').forEach(inf => inf.style.display = '');
                        // También resetear el contador visible al total actual del grupo si se cierra
                        infraccionCounter.textContent = `${infraccionesVisiblesGrupo} / ${totalInfraccionesGrupoOriginal}`;
                    }
                });

                severityFilterBar.querySelectorAll('.severity-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const clickedButton = e.currentTarget;
                        const severityToFilter = clickedButton.dataset.severity;
                        
                        let currentVisibleCount = 0;
                        // Si ya está activo, desactiva y muestra todo
                        if (clickedButton.classList.contains('active')) {
                            clickedButton.classList.remove('active');
                            infractionsContent.querySelectorAll('.infraccion').forEach(inf => {
                                inf.style.display = '';
                                currentVisibleCount++;
                            });
                        } else {
                            // Desactiva otros botones y activa el clicado
                            severityFilterBar.querySelectorAll('.severity-btn').forEach(b => b.classList.remove('active'));
                            clickedButton.classList.add('active');

                            // Filtra las infracciones por gravedad
                            infractionsContent.querySelectorAll('.infraccion').forEach(inf => {
                                if (inf.classList.contains(severityToFilter)) {
                                    inf.style.display = '';
                                    currentVisibleCount++;
                                } else {
                                    inf.style.display = 'none';
                                }
                            });
                        }
                        // Reajusta la altura del contenedor del grupo
                        infractionsContent.style.maxHeight = `${infractionsContent.scrollHeight}px`;
                        // Actualizar el contador del grupo
                        const currentGroupCounter = groupHeader.querySelector('.infraccion-count');
                        if (currentGroupCounter) {
                            const originalTotal = currentGroupCounter.dataset.totalCount; // Ya es el total original
                            currentGroupCounter.textContent = `${currentVisibleCount} / ${originalTotal}`;
                        }
                    });
                });

                groupedInfraccionesContainer.appendChild(groupDiv);
            });
        }

        function applyFilters() {
            currentFilters.searchTerm = searchInput.value.toLowerCase().trim();
            currentFilters.areaId = areaFilterSelect.value;
            currentFilters.rango = rangoFilterSelect.value;
            currentFilters.ambito = ambitoFilterSelect.value;

            renderActiveFilters();

            const filteredInfracciones = allInfraccionesData.filter(infraccion => {
                const matchesSearch = !currentFilters.searchTerm ||
                    infraccion.descripcion.toLowerCase().includes(currentFilters.searchTerm) ||
                    infraccion.norma.toLowerCase().includes(currentFilters.searchTerm) ||
                    infraccion.articulo.includes(currentFilters.searchTerm) ||
                    (infraccion.apartado && infraccion.apartado.toLowerCase().includes(currentFilters.searchTerm)) ||
                    (infraccion.opc && infraccion.opc.toLowerCase().includes(currentFilters.searchTerm)) ||
                    (infraccion.tags && infraccion.tags.some(tag => tag.toLowerCase().includes(currentFilters.searchTerm))) ||
                    infraccion.normagris_identificador.toLowerCase().includes(currentFilters.searchTerm) ||
                    infraccion.normagris_tematica.toLowerCase().includes(currentFilters.searchTerm);

                const matchesArea = !currentFilters.areaId || infraccion.areaId === currentFilters.areaId;
                const matchesRango = !currentFilters.rango || infraccion.rango === currentFilters.rango;
                const matchesAmbito = !currentFilters.ambito || infraccion.ambito === currentFilters.ambito;

                return matchesSearch && matchesArea && matchesRango && matchesAmbito;
            });

            renderGroupedInfracciones(filteredInfracciones);
            // Después de renderizar, todos los grupos se renderizan con las infracciones que pasan los filtros globales.
            // Los contadores ya se inicializan con X / Y.
            // Asegurarse de que al abrir/cerrar también se maneje el contador si se requiere.
        }

        applyFilters();

        searchInput.addEventListener('input', applyFilters);
        areaFilterSelect.addEventListener('change', applyFilters);
        rangoFilterSelect.addEventListener('change', applyFilters);
        ambitoFilterSelect.addEventListener('change', applyFilters);

        document.querySelectorAll('.clear-button').forEach(button => {
            button.addEventListener('click', (event) => {
                const inputToClear = document.querySelector(`.${event.target.dataset.filterTarget}`);
                if (inputToClear) {
                    inputToClear.value = '';
                    applyFilters();
                }
            });
        });

        const floatingActionButtonsContainer = document.querySelector('.floating-action-buttons');

        function updateFABVisibility() {
            if (sidebar.classList.contains('open')) {
                floatingActionButtonsContainer.style.display = 'none';
            } else {
                floatingActionButtonsContainer.style.display = 'flex';
            }
        }

        if (toggleSidebarBtn && sidebar) {
            toggleSidebarBtn.addEventListener('click', () => {
                sidebar.classList.toggle('open');
                updateFABVisibility();
            });
        }

        if (closeSidebarBtn && sidebar) {
            closeSidebarBtn.addEventListener('click', () => {
                sidebar.classList.remove('open');
                updateFABVisibility();
            });
        }

        if (scrollTopBtn) {
            window.addEventListener('scroll', () => {
                if (!sidebar.classList.contains('open')) {
                    const scrolledEnough = window.scrollY > window.innerHeight / 2;
                    scrollTopBtn.classList.toggle('hidden', !scrolledEnough);
                } else {
                    scrollTopBtn.classList.add('hidden');
                }
            });

            scrollTopBtn.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        if (showSearchBtn) {
            showSearchBtn.addEventListener('click', () => {
                console.log('Botón "Mostrar filtros y título" clicado. Su funcionalidad es opcional aquí.');
            });
        }

        updateFABVisibility();
    }
});