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
            // Preparamos los datos para que sean compatibles con el resto del script
            const allInfracciones = data.normas.flatMap(norma =>
                norma.infracciones.map(infraccion => ({
                    ...infraccion,
                    normagris_identificador: norma.identificador,
                    normagris_tematica: norma.tematica,
                    rango: norma.rango,
                    ambito: norma.ambito,
                    areaId: norma.areaId // Pasamos el areaId a cada infracción
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
        const filterNormagrisInput = document.querySelector('.filtro-normagris');
        const filterTagsInput = document.querySelector('.filtro-tags');
        const filterRangoSelect = document.querySelector('.filtro-rango');
        const filterAmbitoSelect = document.querySelector('.filtro-ambito');
        const datalistNormagrisOptions = document.getElementById('norma-gris-options');
        const datalistTagsOptions = document.getElementById('tags-options');
        const groupedInfraccionesContainer = document.querySelector('.infracciones-agrupadas');
        const toggleFiltersButton = document.getElementById('toggleFiltersBtn');
        const compactFiltersContainer = document.querySelector('.filter-row.compact');

        // --- Lógica de renderizado ---

        function createInfraccionElement(data) {
            const infraccionDiv = document.createElement('div');
            const tipoClase = data.tipo === 'grave' ? 'grave' : (data.tipo === 'media' ? 'media' : 'leve');
            infraccionDiv.classList.add('infraccion', tipoClase);

            const importeReducidoHtml = data.importe_reducido ? `<span class="importe-reducido">${data.importe_reducido}</span>` : '';
            const puntosHtml = data.puntos ? `<span class="puntos">${data.puntos}</span>` : '';
            const tagsHtml = data.tags && data.tags.length > 0 ? `<div class="infraccion-tags">${data.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>` : '';

            infraccionDiv.innerHTML = `
                <div class="cinta">
                    <div class="circulo">${data.circulo}</div>
                    <div>
                        <div class="articulo-apartado">Art. ${data.articulo} | Apdo. ${data.apartado}</div>
                        <div class="norma">Norma: <strong>${data.norma}</strong></div>
                        <div class="importe-info">
                            <span class="importe">${data.importe}</span>
                            ${importeReducidoHtml}
                            ${puntosHtml}
                        </div>
                    </div>
                </div>
                <div class="descripcion">${data.descripcion}</div>
                ${tagsHtml}
            `;
            return infraccionDiv;
        }

        function renderGroupedInfracciones(infraccionesToDisplay) {
            groupedInfraccionesContainer.innerHTML = '';
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
                const groupInfo = groupedData[normaGrisKey];
                const groupDiv = document.createElement('div');
                groupDiv.classList.add('infraccion-group');

                const areaInfo = grandesAreas[groupInfo.areaId];
                if (areaInfo) {
                    groupDiv.style.setProperty('--area-color', areaInfo.color);
                    const areaBadge = document.createElement('span');
                    areaBadge.className = 'area-badge';
                    areaBadge.textContent = areaInfo.nombre;
                    groupDiv.prepend(areaBadge);
                }
                
                const groupHeader = document.createElement('div');
                groupHeader.classList.add('infraccion-group-header');
                const [identificador, tematica] = normaGrisKey.split(' - ');
                groupHeader.innerHTML = `
                    <span class="icon">▶</span>
                    <div class="norma-main-info">
                        <span class="normagris-identificador">${identificador}</span>
                        <span class="normagris-tematica">${tematica || ''}</span>
                    </div>
                `;
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
                
                groupInfo.infracciones.sort((a, b) => {
                    const artA = parseInt(a.articulo, 10);
                    const artB = parseInt(b.articulo, 10);
                    if (artA !== artB) return artA - artB;
                    const aptoNumA = parseInt(a.apartado, 10) || 0;
                    const aptoNumB = parseInt(b.apartado, 10) || 0;
                    return aptoNumA - aptoNumB;
                }).forEach(infraccionData => {
                    const infraccionElement = createInfraccionElement(infraccionData);
                    infraccionElement.addEventListener('click', () => {
                        infraccionElement.classList.toggle('tags-visible');
                        const tagsContainer = infraccionElement.querySelector('.infraccion-tags');
                        if (tagsContainer) {
                             if (infraccionElement.classList.contains('tags-visible')) {
                                tagsContainer.style.maxHeight = tagsContainer.scrollHeight + 'px';
                             } else {
                                tagsContainer.style.maxHeight = null;
                             }
                             if (groupDiv.classList.contains('open')) {
                                infractionsContent.style.maxHeight = infractionsContent.scrollHeight + 'px';
                             }
                        }
                    });
                    infractionsContent.appendChild(infraccionElement);
                });
                
                groupDiv.appendChild(infractionsContent);

                groupHeader.addEventListener('click', () => {
                    groupDiv.classList.toggle('open');
                    infractionsContent.style.maxHeight = groupDiv.classList.contains('open') ? `${infractionsContent.scrollHeight}px` : null;
                });
                
                severityFilterBar.querySelectorAll('.severity-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const clickedButton = e.currentTarget;
                        const severityToFilter = clickedButton.dataset.severity;
                        if (clickedButton.classList.contains('active')) {
                            clickedButton.classList.remove('active');
                            infractionsContent.querySelectorAll('.infraccion').forEach(inf => inf.style.display = '');
                        } else {
                            severityFilterBar.querySelectorAll('.severity-btn').forEach(b => b.classList.remove('active'));
                            clickedButton.classList.add('active');
                            infractionsContent.querySelectorAll('.infraccion').forEach(inf => {
                                inf.style.display = inf.classList.contains(severityToFilter) ? '' : 'none';
                            });
                        }
                        infractionsContent.style.maxHeight = `${infractionsContent.scrollHeight}px`;
                    });
                });

                groupedInfraccionesContainer.appendChild(groupDiv);
            });
        }
        
        function populateFilters() {
            const uniqueNormas = [...new Set(infraccionesData.map(d => `${d.normagris_identificador.trim()} - ${d.normagris_tematica.trim()}`))];
            datalistNormagrisOptions.innerHTML = uniqueNormas.sort().map(n => `<option value="${n}"></option>`).join('');
            const uniqueTags = [...new Set(infraccionesData.flatMap(d => d.tags || []))];
            datalistTagsOptions.innerHTML = uniqueTags.sort().map(t => `<option value="${t}"></option>`).join('');
            const uniqueRangos = [...new Set(infraccionesData.map(d => d.rango).filter(Boolean))];
            filterRangoSelect.innerHTML = '<option value="">🏛️ Rango</option>';
            uniqueRangos.sort((a, b) => settings.rangoOrder.indexOf(a) - settings.rangoOrder.indexOf(b)).forEach(r => {
                filterRangoSelect.innerHTML += `<option value="${r}">${r}</option>`;
            });
            const uniqueAmbitos = [...new Set(infraccionesData.map(d => d.ambito).filter(Boolean))];
            filterAmbitoSelect.innerHTML = '<option value="">🌍 Ámbito</option>';
            uniqueAmbitos.sort((a, b) => settings.ambitoOrder.indexOf(a) - settings.ambitoOrder.indexOf(b)).forEach(a => {
                filterAmbitoSelect.innerHTML += `<option value="${a}">${a}</option>`;
            });
        }

        function applyFilters() {
            const searchTerm = searchInput.value.toLowerCase().trim();
            const selectedNormaGris = filterNormagrisInput.value.toLowerCase().trim();
            const selectedTag = filterTagsInput.value.toLowerCase().trim();
            const selectedRango = filterRangoSelect.value.trim();
            const selectedAmbito = filterAmbitoSelect.value.trim();
            const filteredInfracciones = infraccionesData.filter(infraccion => {
                const fullNormaGris = `${infraccion.normagris_identificador.trim()} - ${infraccion.normagris_tematica.trim()}`.toLowerCase();
                const matchesSearch = !searchTerm || 
                    infraccion.descripcion.toLowerCase().includes(searchTerm) ||
                    infraccion.norma.toLowerCase().includes(searchTerm) ||
                    infraccion.articulo.includes(searchTerm) ||
                    infraccion.apartado.includes(searchTerm) ||
                    (infraccion.tags && infraccion.tags.some(tag => tag.toLowerCase().includes(searchTerm)));
                return matchesSearch &&
                       (!selectedNormaGris || fullNormaGris.includes(selectedNormaGris)) &&
                       (!selectedTag || (infraccion.tags && infraccion.tags.some(tag => tag.toLowerCase().includes(selectedTag)))) &&
                       (!selectedRango || infraccion.rango === selectedRango) &&
                       (!selectedAmbito || infraccion.ambito === selectedAmbito);
            });
            renderGroupedInfracciones(filteredInfracciones);
        }

        populateFilters();
        applyFilters();
        [searchInput, filterNormagrisInput, filterTagsInput].forEach(input => input.addEventListener('input', applyFilters));
        [filterRangoSelect, filterAmbitoSelect].forEach(select => select.addEventListener('change', applyFilters));
        document.querySelectorAll('.clear-button').forEach(button => {
            button.addEventListener('click', (event) => {
                const inputToClear = document.querySelector(`.${event.target.dataset.filterTarget}`);
                if (inputToClear) {
                    inputToClear.value = '';
                    if (inputToClear.tagName === 'SELECT') inputToClear.selectedIndex = 0;
                    applyFilters();
                }
            });
        });
        toggleFiltersButton.addEventListener('click', () => {
             compactFiltersContainer.classList.toggle('open');
             compactFiltersContainer.style.maxHeight = compactFiltersContainer.classList.contains('open') ? `${compactFiltersContainer.scrollHeight}px` : null;
        });
    }

    // --- 3. LÓGICA DE UI (HEADER Y BOTONES FLOTANTES) ---
    const collapsibleHeader = document.querySelector('.collapsible-header');
    const showSearchBtn = document.getElementById('showSearchBtn');
    const scrollTopBtn = document.getElementById('scrollTopBtn');

    showSearchBtn.addEventListener('click', () => {
        collapsibleHeader.classList.toggle('open');
        collapsibleHeader.style.maxHeight = collapsibleHeader.classList.contains('open') ? `${collapsibleHeader.scrollHeight}px` : null;
    });
    window.addEventListener('scroll', () => {
        const scrolledEnough = window.scrollY > window.innerHeight / 2;
        scrollTopBtn.classList.toggle('hidden', !scrolledEnough);
    });
    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});