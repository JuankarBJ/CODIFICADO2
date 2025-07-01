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
                    ambito: norma.ambito
                }))
            );
            
            // Una vez cargados y procesados los datos, iniciamos la aplicación
            iniciarApp(allInfracciones, data.settings);
        })
        .catch(error => {
            console.error('Error fatal al cargar los datos:', error);
            document.querySelector('main').innerHTML = `<p style="color: red; text-align: center;">${error.message}</p>`;
        });


    // --- 2. FUNCIÓN PRINCIPAL DE LA APP ---
    function iniciarApp(infraccionesData, settings) {
        
        // --- Selectores del DOM ---
        const searchInput = document.querySelector('.buscador');
        const filterNormagrisInput = document.querySelector('.filtro-normagris');
        const filterTagsInput = document.querySelector('.filtro-tags');
        const filterRangoSelect = document.querySelector('.filtro-rango');
        const filterAmbitoSelect = document.querySelector('.filtro-ambito');
        const datalistNormagrisOptions = document.getElementById('norma-gris-options');
        const datalistTagsOptions = document.getElementById('tags-options');
        const groupedInfraccionesContainer = document.querySelector('.infracciones-agrupadas');

        // --- Lógica de la aplicación ---

        function createInfraccionElement(data) {
            const infraccionDiv = document.createElement('div');
            infraccionDiv.classList.add('infraccion', data.tipo);

            const importeReducidoHtml = data.importe_reducido ? `<span class="importe-reducido">${data.importe_reducido}</span>` : '';
            const puntosHtml = data.puntos ? `<span class="puntos">${data.puntos}</span>` : '';
            const tagsHtml = data.tags && data.tags.length > 0 ? `<div class="infraccion-tags">${data.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>` : '';

            infraccionDiv.innerHTML = `
                <div class="cinta">
                    <div class="circulo">${data.circulo}</div>
                    <div>
                        <div class="norma">Norma: <strong>${data.norma}</strong> Art: <strong>${data.articulo}</strong> Aptdo: <strong>${data.apartado}</strong></div>
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

                const groupHeader = document.createElement('div');
                groupHeader.classList.add('infraccion-group-header');

                const [identificador, tematica] = normaGrisKey.split(' - ');
                const rangoHtml = groupInfo.rango ? `<span class="norma-propiedad rango">${groupInfo.rango}</span>` : '';
                const ambitoHtml = groupInfo.ambito ? `<span class="norma-propiedad ambito">${groupInfo.ambito}</span>` : '';

                groupHeader.innerHTML = `
                    <div class="norma-main-info">
                        <span class="icon">▶</span>
                        <span class="normagris-identificador">${identificador}</span>
                        <span class="normagris-tematica">${tematica}</span>
                    </div>
                    <div class="norma-properties">${rangoHtml}${ambitoHtml}</div>
                `;
                groupDiv.appendChild(groupHeader);

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
                    infractionsContent.appendChild(createInfraccionElement(infraccionData));
                });

                groupDiv.appendChild(infractionsContent);
                groupHeader.addEventListener('click', () => {
                    groupDiv.classList.toggle('open');
                    infractionsContent.style.maxHeight = groupDiv.classList.contains('open') ? `${infractionsContent.scrollHeight}px` : null;
                });
                groupedInfraccionesContainer.appendChild(groupDiv);
            });
        }
        
        function populateFilters() {
            // Norma
            const uniqueNormas = [...new Set(infraccionesData.map(d => `${d.normagris_identificador.trim()} - ${d.normagris_tematica.trim()}`))];
            datalistNormagrisOptions.innerHTML = uniqueNormas.sort().map(n => `<option value="${n}"></option>`).join('');

            // Tags
            const uniqueTags = [...new Set(infraccionesData.flatMap(d => d.tags || []))];
            datalistTagsOptions.innerHTML = uniqueTags.sort().map(t => `<option value="${t}"></option>`).join('');

            // Rango
            const uniqueRangos = [...new Set(infraccionesData.map(d => d.rango))];
            filterRangoSelect.innerHTML = '<option value="">🏛️ Rango</option>';
            uniqueRangos.sort((a, b) => settings.rangoOrder.indexOf(a) - settings.rangoOrder.indexOf(b)).forEach(r => {
                filterRangoSelect.innerHTML += `<option value="${r}">${r}</option>`;
            });

            // Ámbito
            const uniqueAmbitos = [...new Set(infraccionesData.map(d => d.ambito))];
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
                const matchesSearch = !searchTerm || Object.values(infraccion).some(val => String(val).toLowerCase().includes(searchTerm));
                
                return matchesSearch &&
                       (!selectedNormaGris || fullNormaGris.includes(selectedNormaGris)) &&
                       (!selectedTag || (infraccion.tags && infraccion.tags.some(tag => tag.toLowerCase().includes(selectedTag)))) &&
                       (!selectedRango || infraccion.rango === selectedRango) &&
                       (!selectedAmbito || infraccion.ambito === selectedAmbito);
            });
            renderGroupedInfracciones(filteredInfracciones);
        }

        // --- Inicialización y Event Listeners ---
        populateFilters();
        applyFilters();

        [searchInput, filterNormagrisInput, filterTagsInput].forEach(input => input.addEventListener('input', applyFilters));
        [filterRangoSelect, filterAmbitoSelect].forEach(select => select.addEventListener('change', applyFilters));
        
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

    // --- Lógica del UI (Header y botones flotantes) ---
    const header = document.querySelector('header');
    const showSearchBtn = document.getElementById('showSearchBtn');
    const toggleFiltersButton = document.getElementById('toggleFiltersBtn');
    const compactFiltersContainer = document.querySelector('.filter-row.compact');
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
        if (lastScrollY < window.scrollY && window.scrollY > 150) {
            header.classList.add('hidden');
            if (showSearchBtn) showSearchBtn.classList.remove('hidden');
        } else {
            header.classList.remove('hidden');
            if (showSearchBtn) showSearchBtn.classList.add('hidden');
        }
        lastScrollY = window.scrollY;
    });

    if (showSearchBtn) {
        showSearchBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }
    
    if (toggleFiltersButton && compactFiltersContainer) {
        toggleFiltersButton.addEventListener('click', () => {
            compactFiltersContainer.classList.toggle('open');
            compactFiltersContainer.style.maxHeight = compactFiltersContainer.classList.contains('open') ? `${compactFiltersContainer.scrollHeight}px` : null;
        });
    }
});