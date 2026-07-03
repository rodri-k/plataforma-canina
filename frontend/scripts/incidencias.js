// ============================================
// INCIDENCIAS - Registro y gestión
// ============================================

console.log('🔥 incidencias.js se está ejecutando');

let map;
let marker;
let selectedLat = null;
let selectedLng = null;

document.addEventListener('DOMContentLoaded', async () => {
    console.log('✅ DOM cargado - iniciando configuración');

    const token = obtenerToken();
    const usuario = obtenerUsuario();

    if (!token || !usuario) {
        console.log('⏳ No hay sesión, redirigiendo al login...');
        window.location.href = '../visitante/iniciar_sesion.html';
        return;
    }

    console.log('✅ Sesión válida - Usuario:', usuario.email);

    const nombreElement = document.getElementById('nombreUsuario');
    if (nombreElement) {
        nombreElement.textContent = `${usuario.nombre} ${usuario.apellido}`;
    }

    // Detectar qué página estamos
    const path = window.location.pathname;

    if (path.includes('registrar_incidencia.html')) {
        // Inicializar formulario de registro
        iniciarMapa();
        await cargarCategorias();
        await cargarBarrios();

        const imagenInput = document.getElementById('imagen');
        if (imagenInput) {
            imagenInput.addEventListener('change', previsualizarImagen);
        }

        const form = document.getElementById('incidenciaForm');
        if (form) {
            form.addEventListener('submit', guardarIncidencia);
        }
        console.log('✅ Configuración de registro completa');
    }

    if (path.includes('mis_incidencias.html')) {
        // Cargar listado de incidencias
        await cargarMisIncidencias();
        console.log('✅ Configuración de listado completa');
    }

    if (path.includes('detalle_incidencia.html')) {
        // Cargar detalle de incidencia
        await cargarDetalleIncidencia();
        console.log('✅ Configuración de detalle completa');
    }
});

// ============================================
// FUNCIONES PARA REGISTRAR INCIDENCIA
// ============================================

const iniciarMapa = () => {
    console.log('🗺️ Inicializando mapa...');
    const tarija = [-21.5355, -64.7295];

    try {
        const mapContainer = document.getElementById('map');
        if (!mapContainer) {
            console.error('❌ Elemento #map no encontrado');
            return;
        }

        map = L.map('map').setView(tarija, 14);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);

        console.log('✅ Mapa inicializado correctamente');

        const icono = L.icon({
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            shadowSize: [41, 41]
        });

        map.on('click', (e) => {
            const lat = e.latlng.lat;
            const lng = e.latlng.lng;

            if (marker) {
                map.removeLayer(marker);
            }

            marker = L.marker([lat, lng], { icon: icono }).addTo(map);

            selectedLat = lat;
            selectedLng = lng;
            document.getElementById('latitud').value = lat;
            document.getElementById('longitud').value = lng;

            document.getElementById('ubicacionInfo').innerHTML = `
                <i class="bi bi-check-circle-fill text-success me-1"></i>
                Ubicación seleccionada: <strong>${lat.toFixed(6)}, ${lng.toFixed(6)}</strong>
            `;

            document.querySelector('.card-footer').classList.add('bg-success', 'bg-opacity-10');
        });

    } catch (error) {
        console.error('❌ Error al inicializar mapa:', error);
        document.getElementById('ubicacionInfo').innerHTML = `
            <i class="bi bi-exclamation-triangle-fill text-danger me-1"></i>
            Error al cargar el mapa. Verifica tu conexión a Internet.
        `;
    }
};

const cargarCategorias = async () => {
    try {
        const resultado = await api.get('/incidencias/categorias');
        if (resultado.success) {
            const select = document.getElementById('categoria');
            if (!select) return;
            select.innerHTML = '<option value="">Selecciona una categoría...</option>';

            resultado.data.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.id_categoria;
                option.textContent = cat.nombre;
                select.appendChild(option);
            });
            console.log(`✅ ${resultado.data.length} categorías cargadas`);
        }
    } catch (error) {
        console.error('❌ Error al cargar categorías:', error);
    }
};

const cargarBarrios = async () => {
    try {
        const resultado = await api.get('/incidencias/barrios');
        if (resultado.success) {
            const select = document.getElementById('barrio');
            if (!select) return;
            select.innerHTML = '<option value="">Selecciona un barrio...</option>';

            resultado.data.forEach(barrio => {
                const option = document.createElement('option');
                option.value = barrio.id_barrio;
                option.textContent = barrio.nombre;
                select.appendChild(option);
            });
            console.log(`✅ ${resultado.data.length} barrios cargados`);
        }
    } catch (error) {
        console.error('❌ Error al cargar barrios:', error);
    }
};

const previsualizarImagen = (e) => {
    const file = e.target.files[0];
    const previewDiv = document.getElementById('previewImagen');
    const previewImg = document.getElementById('previewImg');

    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            previewDiv.style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else {
        previewDiv.style.display = 'none';
        previewImg.src = '';
    }
};

const guardarIncidencia = async (e) => {
    e.preventDefault();

    const btn = document.getElementById('btnGuardar');
    const alertContainer = document.getElementById('alertContainer');

    // Validar ubicación
    if (!selectedLat || !selectedLng) {
        mostrarAlerta('Por favor, selecciona una ubicación en el mapa.', 'danger');
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Guardando...';

    alertContainer.innerHTML = '';

    // Obtener valores del formulario
    const id_categoria = document.getElementById('categoria').value;
    const descripcion = document.getElementById('descripcion').value.trim();
    const cantidad_perros = document.getElementById('cantidad_perros').value || 1;
    const id_barrio = document.getElementById('barrio').value;
    const referencia = document.getElementById('referencia').value.trim();
    const imagen = document.getElementById('imagen').files[0];

    // Validaciones
    if (!id_categoria) {
        mostrarAlerta('Por favor, selecciona una categoría.', 'danger');
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-save me-2"></i>Guardar Incidencia';
        return;
    }

    if (!descripcion || descripcion.length < 10) {
        mostrarAlerta('La descripción debe tener al menos 10 caracteres.', 'danger');
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-save me-2"></i>Guardar Incidencia';
        return;
    }

    try {
        const token = obtenerToken();
        const formData = new FormData();
        formData.append('id_categoria', id_categoria);
        formData.append('descripcion', descripcion);
        formData.append('latitud', selectedLat);
        formData.append('longitud', selectedLng);
        formData.append('cantidad_perros', cantidad_perros);
        if (id_barrio) formData.append('id_barrio', id_barrio);
        if (referencia) formData.append('referencia', referencia);
        if (imagen) formData.append('imagen', imagen);

        console.log('📤 Enviando incidencia:', {
            id_categoria,
            descripcion,
            lat: selectedLat,
            lng: selectedLng,
            cantidad_perros,
            id_barrio,
            referencia,
            tiene_imagen: !!imagen
        });

        const resultado = await api.postFormData('/ciudadano/incidencias', formData, token);
        console.log('📥 Respuesta completa:', resultado);

        if (resultado.success) {
            mostrarAlerta('✅ Incidencia registrada exitosamente.', 'success');

            document.getElementById('incidenciaForm').reset();
            document.getElementById('previewImagen').style.display = 'none';
            document.getElementById('latitud').value = '';
            document.getElementById('longitud').value = '';

            if (marker) {
                map.removeLayer(marker);
                marker = null;
            }
            selectedLat = null;
            selectedLng = null;
            document.getElementById('ubicacionInfo').innerHTML = `
                <i class="bi bi-info-circle me-1"></i>
                Haz clic en el mapa para seleccionar la ubicación
            `;
            document.querySelector('.card-footer').classList.remove('bg-success', 'bg-opacity-10');

            setTimeout(() => {
                window.location.href = 'mis_incidencias.html';
            }, 2000);
        } else {
            // Mostrar error detallado
            console.log('❌ Error en la respuesta:', resultado);
            if (resultado.errors) {
                const errores = resultado.errors.map(e => `${e.campo}: ${e.mensaje}`).join(', ');
                mostrarAlerta(`Error: ${errores}`, 'danger');
            } else if (resultado.message) {
                mostrarAlerta(resultado.message, 'danger');
            } else {
                mostrarAlerta('Error al registrar incidencia. Revisa la consola.', 'danger');
            }
        }
    } catch (error) {
        console.error('❌ Error al guardar incidencia:', error);
        mostrarAlerta('Error de conexión con el servidor', 'danger');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-save me-2"></i>Guardar Incidencia';
    }
};

// ============================================
// FUNCIONES PARA "MIS INCIDENCIAS"
// ============================================

const cargarMisIncidencias = async () => {
    try {
        console.log('📂 Cargando mis incidencias...');
        const token = obtenerToken();
        const resultado = await api.get('/ciudadano/incidencias', token);

        if (resultado.success) {
            console.log(`✅ ${resultado.data.length} incidencias encontradas`);
            mostrarListadoIncidencias(resultado.data);
        } else {
            console.error('❌ Error al cargar incidencias:', resultado.message);
            document.getElementById('listaIncidencias').innerHTML = `
                <div class="text-center text-danger py-4">
                    <i class="bi bi-exclamation-triangle-fill" style="font-size: 2rem;"></i>
                    <p class="mt-2">Error al cargar las incidencias</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('❌ Error al cargar incidencias:', error);
        document.getElementById('listaIncidencias').innerHTML = `
            <div class="text-center text-danger py-4">
                <i class="bi bi-exclamation-triangle-fill" style="font-size: 2rem;"></i>
                <p class="mt-2">Error de conexión con el servidor</p>
            </div>
        `;
    }
};

const mostrarListadoIncidencias = (incidencias) => {
    const container = document.getElementById('listaIncidencias');
    const contador = document.getElementById('contadorIncidencias');

    if (contador) {
        contador.textContent = `${incidencias.length} incidencia${incidencias.length !== 1 ? 's' : ''} encontrada${incidencias.length !== 1 ? 's' : ''}`;
    }

    if (!incidencias || incidencias.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-inbox" style="font-size: 4rem; color: #ccc;"></i>
                <h5 class="mt-3 text-muted">No tienes incidencias registradas</h5>
                <a href="registrar_incidencia.html" class="btn btn-success mt-3">
                    <i class="bi bi-plus-circle me-2"></i>Registrar tu primera incidencia
                </a>
            </div>
        `;
        return;
    }

    let html = '';
    incidencias.forEach(inc => {
        const estadoClass = getEstadoClase(inc.estado_nombre);
        const estadoColor = inc.estado_color || '#6c757d';
        const fecha = formatearFecha(inc.fecha_reporte);

        html += `
            <div class="incidencia-card ${estadoClass}">
                <div class="row align-items-center">
                    <div class="col-md-7">
                        <div class="d-flex align-items-start gap-3">
                            <div class="incidencia-icon" style="background: ${estadoColor}20; color: ${estadoColor};">
                                <i class="bi bi-file-earmark-text"></i>
                            </div>
                            <div>
                                <h6 class="mb-1">${inc.categoria_nombre || 'Sin categoría'}</h6>
                                <p class="mb-1 text-muted small">${inc.descripcion ? inc.descripcion.substring(0, 100) + (inc.descripcion.length > 100 ? '...' : '') : 'Sin descripción'}</p>
                                <small class="text-muted">
                                    <i class="bi bi-calendar3 me-1"></i>${fecha}
                                    ${inc.barrio_nombre ? `<i class="bi bi-geo-alt ms-2 me-1"></i>${inc.barrio_nombre}` : ''}
                                </small>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <span class="estado-badge" style="background: ${estadoColor}20; color: ${estadoColor}; border: 1px solid ${estadoColor}40;">
                            ${inc.estado_nombre || 'Sin estado'}
                        </span>
                    </div>
                    <div class="col-md-2 text-end">
                        <a href="detalle_incidencia.html?id=${inc.id_incidencia}" class="btn btn-sm btn-outline-primary">
                            <i class="bi bi-eye me-1"></i>Ver
                        </a>
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
};

// ============================================
// FUNCIONES PARA DETALLE DE INCIDENCIA
// ============================================

const cargarDetalleIncidencia = async () => {
    try {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');

        if (!id) {
            console.error('❌ No se proporcionó ID de incidencia');
            mostrarErrorDetalle('No se especificó qué incidencia ver.');
            return;
        }

        console.log(`📂 Cargando detalle de incidencia ID: ${id}`);
        const token = obtenerToken();
        const resultado = await api.get(`/ciudadano/incidencias/${id}`, token);

        if (resultado.success) {
            console.log('✅ Detalle cargado correctamente');
            mostrarDetalleIncidencia(resultado.data);
        } else {
            console.error('❌ Error al cargar detalle:', resultado.message);
            mostrarErrorDetalle(resultado.message || 'Error al cargar el detalle de la incidencia');
        }
    } catch (error) {
        console.error('❌ Error al cargar detalle:', error);
        mostrarErrorDetalle('Error de conexión con el servidor');
    }
};

const mostrarDetalleIncidencia = (incidencia) => {
    document.title = `Detalle - ${incidencia.categoria_nombre || 'Incidencia'}`;

    document.getElementById('detalleCategoria').textContent = incidencia.categoria_nombre || 'Sin categoría';
    document.getElementById('detalleCategoria').style.color = incidencia.categoria_color || '#6c757d';
    document.getElementById('detalleDescripcion').textContent = incidencia.descripcion || 'Sin descripción';
    document.getElementById('detalleFecha').textContent = formatearFecha(incidencia.fecha_reporte);
    document.getElementById('detalleCodigo').textContent = incidencia.codigo_denuncia || 'Sin código';
    document.getElementById('detalleCantidad').textContent = incidencia.cantidad_perros || 1;
    document.getElementById('detalleBarrio').textContent = incidencia.barrio_nombre || 'No especificado';
    document.getElementById('detalleReferencia').textContent = incidencia.referencia || 'No especificada';
    document.getElementById('detallePrioridad').textContent = incidencia.prioridad || 'media';

    const estadoColor = incidencia.estado_color || '#6c757d';
    const estadoBadge = document.getElementById('detalleEstado');
    estadoBadge.textContent = incidencia.estado_nombre || 'Sin estado';
    estadoBadge.style.background = `${estadoColor}20`;
    estadoBadge.style.color = estadoColor;
    estadoBadge.style.border = `1px solid ${estadoColor}40`;

    const imgContainer = document.getElementById('detalleImagen');
    if (incidencia.imagen_url) {
        imgContainer.innerHTML = `
            <img src="${incidencia.imagen_url}" class="img-fluid rounded" alt="Evidencia">
        `;
    } else {
        imgContainer.innerHTML = `
            <div class="text-center text-muted py-4">
                <i class="bi bi-image" style="font-size: 3rem;"></i>
                <p class="mt-2">No hay imagen disponible</p>
            </div>
        `;
    }

    if (incidencia.latitud && incidencia.longitud) {
        setTimeout(() => {
            iniciarMapaDetalle(parseFloat(incidencia.latitud), parseFloat(incidencia.longitud));
        }, 300);
    } else {
        document.getElementById('mapaDetalle').innerHTML = `
            <div class="text-center text-muted py-4">
                <i class="bi bi-geo-alt" style="font-size: 2rem;"></i>
                <p class="mt-2">No hay ubicación registrada</p>
            </div>
        `;
    }

    if (incidencia.acciones && incidencia.acciones.length > 0) {
        mostrarAcciones(incidencia.acciones);
    } else {
        document.getElementById('listaAcciones').innerHTML = `
            <div class="text-center text-muted py-3">
                <i class="bi bi-clock-history" style="font-size: 1.5rem;"></i>
                <p class="mt-1 mb-0">No hay acciones registradas aún</p>
            </div>
        `;
    }
};

const mostrarErrorDetalle = (mensaje) => {
    document.getElementById('detalleContenido').innerHTML = `
        <div class="text-center text-danger py-5">
            <i class="bi bi-exclamation-triangle-fill" style="font-size: 3rem;"></i>
            <h5 class="mt-3">${mensaje}</h5>
            <a href="mis_incidencias.html" class="btn btn-primary mt-3">
                <i class="bi bi-arrow-left me-2"></i>Volver a mis incidencias
            </a>
        </div>
    `;
};

const iniciarMapaDetalle = (lat, lng) => {
    try {
        const mapContainer = document.getElementById('mapaDetalle');
        if (!mapContainer) return;

        const mapDetalle = L.map('mapaDetalle').setView([lat, lng], 16);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(mapDetalle);

        const icono = L.icon({
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            shadowSize: [41, 41]
        });

        L.marker([lat, lng], { icon: icono })
            .addTo(mapDetalle)
            .bindPopup('Ubicación de la incidencia')
            .openPopup();

        console.log('✅ Mapa de detalle inicializado');
    } catch (error) {
        console.error('❌ Error al inicializar mapa de detalle:', error);
    }
};

const mostrarAcciones = (acciones) => {
    const container = document.getElementById('listaAcciones');
    let html = '';

    acciones.forEach(acc => {
        const fecha = formatearFecha(acc.fecha_accion);
        html += `
            <div class="accion-item">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <span class="badge bg-info me-2">${acc.tipo_accion || 'Acción'}</span>
                        <small class="text-muted">${fecha}</small>
                        <p class="mt-2 mb-1">${acc.descripcion || 'Sin descripción'}</p>
                        ${acc.observaciones ? `<small class="text-muted">Observaciones: ${acc.observaciones}</small>` : ''}
                    </div>
                    <small class="text-muted">${acc.operador_nombre || 'Municipio'}</small>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
};

// ============================================
// FUNCIONES AUXILIARES
// ============================================

const getEstadoClase = (estado) => {
    if (!estado) return '';
    const e = estado.toLowerCase();
    if (e.includes('pendiente')) return 'estado-pendiente';
    if (e.includes('revisión') || e.includes('revision')) return 'estado-revision';
    if (e.includes('curso')) return 'estado-curso';
    if (e.includes('cerrada')) return 'estado-cerrada';
    return '';
};

const formatearFecha = (fecha) => {
    if (!fecha) return 'Fecha no disponible';
    const d = new Date(fecha);
    return d.toLocaleDateString('es-BO', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};