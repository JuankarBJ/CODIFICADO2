document.addEventListener('DOMContentLoaded', () => {
    const areasGridContainer = document.querySelector('.areas-grid');
    const loadingMessage = document.createElement('p');
    loadingMessage.textContent = 'Cargando áreas temáticas...';
    loadingMessage.style.textAlign = 'center';
    loadingMessage.style.color = 'var(--color-muted-text)';
    areasGridContainer.appendChild(loadingMessage); // Mostrar mensaje de carga

    // Cargar database.json para obtener grandesAreas
    fetch('database.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`No se pudo cargar database.json: ${response.status} - ${response.statusText}.`);
            }
            return response.json();
        })
        .then(data => {
            areasGridContainer.innerHTML = ''; // Limpiar mensaje de carga

            const grandesAreas = data.grandesAreas;
            
            // Mapeo de iconos para mostrar en las tarjetas de área
            const iconEmojiMap = {
                'building': '🏗️',
                'car': '🚗',
                'dog': '🐶',
                'handcuffs': '⛓️',
                'circus': '🎪'
                // Añade más mapeos si tienes otros iconos
            };

            for (const areaId in grandesAreas) {
                const areaInfo = grandesAreas[areaId];
                const areaCard = document.createElement('div');
                areaCard.classList.add('area-card');
                // Establecer el color de fondo de la tarjeta usando la variable CSS
                areaCard.style.setProperty('--area-card-color', areaInfo.color); 

                const iconHtml = areaInfo.icon && iconEmojiMap[areaInfo.icon] ? 
                                 `<span class="icon">${iconEmojiMap[areaInfo.icon]}</span>` : '';

                areaCard.innerHTML = `
                    ${iconHtml}
                    <span class="name">${areaInfo.nombre}</span>
                `;
                areaCard.dataset.areaId = areaId; // Guardar el ID del área en un data attribute

                // Al hacer clic, guardar el área en sessionStorage y navegar al buscador
                areaCard.addEventListener('click', () => {
                    sessionStorage.setItem('initialAreaFilter', areaId);
                    window.location.href = 'buscador.html';
                });

                areasGridContainer.appendChild(areaCard);
            }
        })
        .catch(error => {
            console.error('Error al cargar las áreas temáticas:', error);
            areasGridContainer.innerHTML = `<p style="color: red; text-align: center;">Error al cargar las áreas: ${error.message}</p>`;
        });
});