// ============================================
// OPERADOR MUNICIPAL - Gestion de incidencias
// ============================================

console.log('operador.js se esta ejecutando');

let mapDetalle = null;
let markerDetalle = null;

document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM cargado - iniciando configuracion de operador');

    const token = obtenerToken();
    const usuario = obtenerUsuario();

    if (!token || !usuario) {
        console.log('No hay sesion, redirigiendo al login...');
        window.location.href = '../visitante/iniciar_sesion.html';
        return;
    }

    if (usuario.tipo_usuario !== 'operador') {
        console.log('Acceso denegado. Redirigiendo...');
        window.location.href = '../ciudadano/dashboard_ciudadano.html';
        return;
    }

    console.log('Sesion valida - Operador:', usuario.email);

    const nombreElement = document.getElementById('nombreUsuario');
    if (nombreElement) {
        nombreElement.textContent = usuario.nombre + ' ' + usuario.apellido;
    }

    const path = window.location.pathname;

    if (path.includes('dashboard_operador.html')) {
        await cargarDashboardOperador();
        console.log('Dashboard del operador cargado');
    }

    if (path.includes('listado_incidencias.html')) {
        await cargarListadoIncidencias();
        await cargarFiltros();
        console.log('Listado de incidencias cargado');
    }

    if (path.includes('detalle_incidencia.html')) {
        await cargarDetalleIncidenciaOperador();
        console.log('Detalle de incidencia cargado');
    }

    if (path.includes('actualizar_estado.html')) {
        await cargarFormularioEstado();
        console.log('Formulario de estado cargado');
    }

    if (path.includes('registrar_accion_municipal.html')) {
        await cargarFormularioAccion();
        console.log('Formulario de accion cargado');
    }

    if (path.includes('dashboard_estadistico.html')) {
        await cargarEstadisticasCompletas();
        console.log('Dashboard estadistico cargado');
    }

    if (path.includes('mapa_operativo.html')) {
        await cargarMapaOperativo();
        console.log('Mapa operativo cargado');
    }

    if (path.includes('mapa_calor_operativo.html')) {
        await cargarMapaCalor();
        console.log('Mapa de calor cargado');
    }
});

// ============================================
// DASHBOARD DEL OPERADOR
// ============================================

const cargarDashboardOperador = async () => {
    try {
        console.log('Cargando dashboard del operador...');
        const token = obtenerToken();
        const resultado = await api.get('/operador/dashboard', token);

        if (resultado.success) {
            console.log('Dashboard cargado correctamente');
            mostrarDashboard(resultado.data);
        } else {
            console.error('Error al cargar dashboard:', resultado.message);
            mostrarError('Error al cargar el dashboard');
        }
    } catch (error) {
        console.error('Error al cargar dashboard:', error);
        mostrarError('Error de conexion con el servidor');
    }
};

const mostrarDashboard = (data) => {
    document.getElementById('totalIncidencias').textContent = data.generales?.total || 0;
    document.getElementById('pendientes').textContent = data.generales?.pendientes || 0;
    document.getElementById('enRevision').textContent = data.generales?.en_revision || 0;
    document.getElementById('enCurso').textContent = data.generales?.en_curso || 0;
    document.getElementById('cerradas').textContent = data.generales?.cerradas || 0;
    document.getElementById('criticas').textContent = data.generales?.criticas || 0;

    document.getElementById('totalUsuarios').textContent = data.totalUsuarios || 0;
    document.getElementById('totalCiudadanos').textContent = data.ciudadanos || 0;
    document.getElementById('totalOperadores').textContent = data.operadores || 0;

    if (data.porCategoria && data.porCategoria.length > 0) {
        mostrarGraficoCategorias(data.porCategoria);
    }

    if (data.porBarrio && data.porBarrio.length > 0) {
        mostrarGraficoBarrios(data.porBarrio);
    }
};

const mostrarGraficoCategorias = (datos) => {
    const ctx = document.getElementById('categoriasChart').getContext('2d');
    const labels = datos.map(d => d.categoria);
    const valores = datos.map(d => d.cantidad);
    const colores = datos.map(d => d.color || '#3498DB');

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Incidencias por categoria',
                data: valores,
                backgroundColor: colores.map(c => c + '80'),
                borderColor: colores,
                borderWidth: 2,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
};

const mostrarGraficoBarrios = (datos) => {
    const ctx = document.getElementById('barriosChart').getContext('2d');
    const labels = datos.slice(0, 8).map(d => d.barrio);
    const valores = datos.slice(0, 8).map(d => d.cantidad);

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: valores,
                backgroundColor: ['#3498DB', '#2ECC71', '#F39C12', '#E74C3C', '#9B59B6', '#1ABC9C', '#E67E22', '#95A5A6'],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        usePointStyle: true,
                        pointStyle: 'circle',
                        font: {
                            size: 11
                        }
                    }
                }
            },
            cutout: '55%'
        }
    });
};

// ============================================
// LISTADO DE INCIDENCIAS (OPERADOR)
// ============================================

const cargarListadoIncidencias = async () => {
    try {
        console.log('Cargando listado de incidencias...');
        const token = obtenerToken();

        const params = new URLSearchParams(window.location.search);
        let url = '/operador/incidencias?';
        if (params.get('estado')) url += 'estado=' + params.get('estado') + '&';
        if (params.get('categoria')) url += 'categoria=' + params.get('categoria') + '&';
        if (params.get('barrio')) url += 'barrio=' + params.get('barrio') + '&';
        if (params.get('prioridad')) url += 'prioridad=' + params.get('prioridad') + '&';

        const resultado = await api.get(url, token);

        if (resultado.success) {
            console.log(resultado.data.length + ' incidencias encontradas');
            mostrarListadoIncidenciasOperador(resultado.data);
            actualizarContador(resultado.data.length);
        } else {
            console.error('Error al cargar incidencias:', resultado.message);
            mostrarError('Error al cargar las incidencias');
        }
    } catch (error) {
        console.error('Error al cargar incidencias:', error);
        mostrarError('Error de conexion con el servidor');
    }
};

const mostrarListadoIncidenciasOperador = (incidencias) => {
    const container = document.getElementById('listaIncidencias');

    if (!incidencias || incidencias.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <h5 class="mt-3 text-muted">No hay incidencias registradas</h5>
            </div>
        `;
        return;
    }

    let html = '';
    incidencias.forEach(inc => {
        const estadoColor = inc.estado_color || '#6c757d';
        const prioridadColor = getPrioridadColor(inc.prioridad);
        const fecha = formatearFecha(inc.fecha_reporte);

        html += `
            <div class="incidencia-card">
                <div class="row align-items-center">
                    <div class="col-md-6">
                        <div class="d-flex align-items-start gap-3">
                            <div class="incidencia-icon" style="background: ${estadoColor}20; color: ${estadoColor};">
                                <i class="bi bi-file-earmark-text"></i>
                            </div>
                            <div>
                                <div class="d-flex align-items-center gap-2">
                                    <h6 class="mb-1">${inc.categoria_nombre || 'Sin categoria'}</h6>
                                    <span class="badge" style="background: ${prioridadColor}; color: white; font-size: 0.7rem;">
                                        ${inc.prioridad || 'media'}
                                    </span>
                                </div>
                                <p class="mb-1 text-muted small">${inc.descripcion ? inc.descripcion.substring(0, 80) + (inc.descripcion.length > 80 ? '...' : '') : 'Sin descripcion'}</p>
                                <small class="text-muted">
                                    ${fecha}
                                    ${inc.barrio_nombre ? ' - ' + inc.barrio_nombre : ''}
                                    ${inc.nombre_completo ? ' - ' + inc.nombre_completo : ''}
                                </small>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <span class="estado-badge" style="background: ${estadoColor}20; color: ${estadoColor}; border: 1px solid ${estadoColor}40;">
                            ${inc.estado_nombre || 'Sin estado'}
                        </span>
                    </div>
                    <div class="col-md-3 text-end">
                        <a href="detalle_incidencia.html?id=${inc.id_incidencia}" class="btn btn-sm btn-outline-primary">
                            Ver
                        </a>
                        <a href="actualizar_estado.html?id=${inc.id_incidencia}" class="btn btn-sm btn-outline-warning">
                            Gestionar
                        </a>
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
};

const cargarFiltros = async () => {
    try {
        const categoriasResult = await api.get('/incidencias/categorias');
        if (categoriasResult.success) {
            const select = document.getElementById('filtroCategoria');
            categoriasResult.data.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.id_categoria;
                option.textContent = cat.nombre;
                select.appendChild(option);
            });
        }

        const barriosResult = await api.get('/incidencias/barrios');
        if (barriosResult.success) {
            const select = document.getElementById('filtroBarrio');
            barriosResult.data.forEach(barrio => {
                const option = document.createElement('option');
                option.value = barrio.id_barrio;
                option.textContent = barrio.nombre;
                select.appendChild(option);
            });
        }

        const estadosResult = await api.get('/incidencias/estados');
        if (estadosResult.success) {
            const select = document.getElementById('filtroEstado');
            estadosResult.data.forEach(estado => {
                const option = document.createElement('option');
                option.value = estado.id_estado;
                option.textContent = estado.nombre;
                select.appendChild(option);
            });
        }

        document.getElementById('btnFiltrar').addEventListener('click', aplicarFiltros);
        document.getElementById('btnLimpiarFiltros').addEventListener('click', limpiarFiltros);
    } catch (error) {
        console.error('Error al cargar filtros:', error);
    }
};

const aplicarFiltros = () => {
    const estado = document.getElementById('filtroEstado').value;
    const categoria = document.getElementById('filtroCategoria').value;
    const barrio = document.getElementById('filtroBarrio').value;
    const prioridad = document.getElementById('filtroPrioridad').value;

    let url = 'listado_incidencias.html?';
    if (estado) url += 'estado=' + estado + '&';
    if (categoria) url += 'categoria=' + categoria + '&';
    if (barrio) url += 'barrio=' + barrio + '&';
    if (prioridad) url += 'prioridad=' + prioridad + '&';
    window.location.href = url;
};

const limpiarFiltros = () => {
    window.location.href = 'listado_incidencias.html';
};

const actualizarContador = (total) => {
    const contador = document.getElementById('contadorIncidencias');
    if (contador) {
        contador.textContent = total + ' incidencia' + (total !== 1 ? 's' : '') + ' encontrada' + (total !== 1 ? 's' : '');
    }
};

// ============================================
// DETALLE DE INCIDENCIA (OPERADOR)
// ============================================

const cargarDetalleIncidenciaOperador = async () => {
    try {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');

        if (!id) {
            mostrarError('No se especifico que incidencia ver.');
            return;
        }

        console.log('Cargando detalle de incidencia ID:', id);
        const token = obtenerToken();
        const resultado = await api.get('/operador/incidencias/' + id, token);

        if (resultado.success) {
            console.log('Detalle cargado correctamente');
            mostrarDetalleIncidenciaOperador(resultado.data);
        } else {
            console.error('Error al cargar detalle:', resultado.message);
            mostrarError(resultado.message || 'Error al cargar el detalle');
        }
    } catch (error) {
        console.error('Error al cargar detalle:', error);
        mostrarError('Error de conexion con el servidor');
    }
};

const mostrarDetalleIncidenciaOperador = (data) => {
    const incidencia = data.incidencia;
    const acciones = data.acciones || [];

    document.title = 'Detalle - ' + (incidencia.categoria_nombre || 'Incidencia');

    document.getElementById('detalleCategoria').textContent = incidencia.categoria_nombre || 'Sin categoria';
    document.getElementById('detalleCategoria').style.color = incidencia.categoria_color || '#6c757d';
    document.getElementById('detalleDescripcion').textContent = incidencia.descripcion || 'Sin descripcion';
    document.getElementById('detalleFecha').textContent = formatearFecha(incidencia.fecha_reporte);
    document.getElementById('detalleCodigo').textContent = incidencia.codigo_denuncia || 'Sin codigo';
    document.getElementById('detalleCantidad').textContent = incidencia.cantidad_perros || 1;
    document.getElementById('detalleBarrio').textContent = incidencia.barrio_nombre || 'No especificado';
    document.getElementById('detalleReferencia').textContent = incidencia.referencia || 'No especificada';

    // document.getElementById('detalleCiudadano').textContent = incidencia.nombre_completo || 'Anonimo';
    // document.getElementById('detalleEmail').textContent = incidencia.email || 'No disponible';
    // document.getElementById('detalleTelefono').textContent = incidencia.telefono || 'No disponible';

    const prioridadColor = getPrioridadColor(incidencia.prioridad);
    const prioridadBadge = document.getElementById('detallePrioridad');
    prioridadBadge.textContent = incidencia.prioridad || 'media';
    prioridadBadge.style.background = prioridadColor;
    prioridadBadge.style.color = 'white';

    const estadoColor = incidencia.estado_color || '#6c757d';
    const estadoBadge = document.getElementById('detalleEstado');
    estadoBadge.textContent = incidencia.estado_nombre || 'Sin estado';
    estadoBadge.style.background = estadoColor + '20';
    estadoBadge.style.color = estadoColor;
    estadoBadge.style.border = '1px solid ' + estadoColor + '40';

    const imgContainer = document.getElementById('detalleImagen');
    if (incidencia.imagen_url) {
        imgContainer.innerHTML = '<img src="' + incidencia.imagen_url + '" class="img-fluid rounded" alt="Evidencia">';
    } else {
        imgContainer.innerHTML = '<div class="text-center text-muted py-4"><p class="mt-2">No hay imagen disponible</p></div>';
    }

    if (incidencia.latitud && incidencia.longitud) {
        setTimeout(() => {
            iniciarMapaDetalleOperador(parseFloat(incidencia.latitud), parseFloat(incidencia.longitud));
        }, 300);
    } else {
        document.getElementById('mapaDetalle').innerHTML = '<div class="text-center text-muted py-4"><p class="mt-2">No hay ubicacion registrada</p></div>';
    }

    if (acciones.length > 0) {
        mostrarAccionesOperador(acciones);
    } else {
        document.getElementById('listaAcciones').innerHTML = '<div class="text-center text-muted py-3"><p class="mt-1 mb-0">No hay acciones registradas aun</p></div>';
    }

    document.getElementById('btnCambiarEstado').href = 'actualizar_estado.html?id=' + incidencia.id_incidencia;
    document.getElementById('btnRegistrarAccion').href = 'registrar_accion_municipal.html?id=' + incidencia.id_incidencia;
};

const iniciarMapaDetalleOperador = (lat, lng) => {
    try {
        const mapContainer = document.getElementById('mapaDetalle');
        if (!mapContainer) return;

        if (mapDetalle) {
            mapDetalle.remove();
        }

        mapDetalle = L.map('mapaDetalle').setView([lat, lng], 16);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: 'OpenStreetMap'
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
            .bindPopup('Ubicacion de la incidencia')
            .openPopup();

        console.log('Mapa de detalle inicializado');
    } catch (error) {
        console.error('Error al inicializar mapa de detalle:', error);
    }
};

const mostrarAccionesOperador = (acciones) => {
    const container = document.getElementById('listaAcciones');
    let html = '';

    acciones.forEach(acc => {
        const fecha = formatearFecha(acc.fecha_accion);
        html += `
            <div class="accion-item">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <span class="badge bg-info me-2">${acc.tipo_accion || 'Accion'}</span>
                        <small class="text-muted">${fecha}</small>
                        <p class="mt-2 mb-1">${acc.descripcion || 'Sin descripcion'}</p>
                    </div>
                    <small class="text-muted">${acc.operador_nombre || 'Municipio'}</small>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
};

// ============================================
// FORMULARIO DE ACTUALIZACION DE ESTADO
// ============================================

const cargarFormularioEstado = async () => {
    try {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');

        if (!id) {
            mostrarError('No se especifico que incidencia gestionar.');
            return;
        }

        document.getElementById('incidenciaId').value = id;

        const estadosResult = await api.get('/incidencias/estados');
        if (estadosResult.success) {
            const select = document.getElementById('id_estado');
            estadosResult.data.forEach(estado => {
                const option = document.createElement('option');
                option.value = estado.id_estado;
                option.textContent = estado.nombre;
                select.appendChild(option);
            });
        }

        const prioridades = ['baja', 'media', 'alta', 'critica'];
        const selectPrioridad = document.getElementById('prioridad');
        prioridades.forEach(p => {
            const option = document.createElement('option');
            option.value = p;
            option.textContent = p.charAt(0).toUpperCase() + p.slice(1);
            selectPrioridad.appendChild(option);
        });

        const token = obtenerToken();
        const resultado = await api.get('/operador/incidencias/' + id, token);
        if (resultado.success) {
            const incidencia = resultado.data.incidencia;
            document.getElementById('infoIncidencia').innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h6>${incidencia.categoria_nombre || 'Sin categoria'}</h6>
                        <small class="text-muted">${incidencia.descripcion ? incidencia.descripcion.substring(0, 100) + '...' : 'Sin descripcion'}</small>
                    </div>
                    <span class="badge" style="background: ${incidencia.estado_color || '#6c757d'}20; color: ${incidencia.estado_color || '#6c757d'};">
                        ${incidencia.estado_nombre || 'Sin estado'}
                    </span>
                </div>
            `;
        }

        document.getElementById('estadoForm').addEventListener('submit', guardarCambioEstado);
    } catch (error) {
        console.error('Error al cargar formulario:', error);
        mostrarError('Error al cargar el formulario');
    }
};

const guardarCambioEstado = async (e) => {
    e.preventDefault();

    const btn = document.getElementById('btnGuardar');
    const alertContainer = document.getElementById('alertContainer');

    btn.disabled = true;
    btn.innerHTML = 'Guardando...';
    alertContainer.innerHTML = '';

    const id = document.getElementById('incidenciaId').value;
    const id_estado = document.getElementById('id_estado').value;
    const prioridad = document.getElementById('prioridad').value;
    const observaciones = document.getElementById('observaciones').value.trim();

    if (!id_estado) {
        mostrarAlerta('Por favor, selecciona un estado.', 'danger');
        btn.disabled = false;
        btn.innerHTML = 'Guardar Cambios';
        return;
    }

    try {
        const token = obtenerToken();

        const estadoResult = await api.put('/operador/incidencias/' + id + '/estado',
            { id_estado: parseInt(id_estado), observaciones: observaciones },
            token
        );

        if (!estadoResult.success) {
            mostrarAlerta(estadoResult.message || 'Error al cambiar estado', 'danger');
            btn.disabled = false;
            btn.innerHTML = 'Guardar Cambios';
            return;
        }

        const prioridadResult = await api.put('/operador/incidencias/' + id + '/prioridad',
            { prioridad: prioridad },
            token
        );

        if (prioridadResult.success) {
            mostrarAlerta('Estado y prioridad actualizados exitosamente.', 'success');
            setTimeout(() => {
                window.location.href = 'detalle_incidencia.html?id=' + id;
            }, 1500);
        } else {
            mostrarAlerta('Estado actualizado. Error al actualizar prioridad.', 'warning');
            setTimeout(() => {
                window.location.href = 'detalle_incidencia.html?id=' + id;
            }, 1500);
        }
    } catch (error) {
        console.error('Error al guardar:', error);
        mostrarAlerta('Error de conexion con el servidor', 'danger');
    } finally {
        btn.disabled = false;
        btn.innerHTML = 'Guardar Cambios';
    }
};

// ============================================
// REGISTRAR ACCION MUNICIPAL
// ============================================

const cargarFormularioAccion = async () => {
    try {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');

        if (!id) {
            mostrarError('No se especifico que incidencia gestionar.');
            return;
        }

        document.getElementById('incidenciaId').value = id;

        const token = obtenerToken();
        const resultado = await api.get('/operador/incidencias/' + id, token);

        if (resultado.success) {
            const incidencia = resultado.data.incidencia;
            document.getElementById('infoIncidencia').innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h6>${incidencia.categoria_nombre || 'Sin categoria'}</h6>
                        <small class="text-muted">${incidencia.descripcion ? incidencia.descripcion.substring(0, 100) + '...' : 'Sin descripcion'}</small>
                    </div>
                    <span class="badge" style="background: ${incidencia.estado_color || '#6c757d'}20; color: ${incidencia.estado_color || '#6c757d'};">
                        ${incidencia.estado_nombre || 'Sin estado'}
                    </span>
                </div>
            `;
        }

        const evidenciaInput = document.getElementById('evidencia');
        if (evidenciaInput) {
            evidenciaInput.addEventListener('change', previsualizarEvidencia);
        }

        document.getElementById('accionForm').addEventListener('submit', guardarAccionMunicipal);
    } catch (error) {
        console.error('Error al cargar formulario:', error);
        mostrarError('Error al cargar el formulario');
    }
};

const previsualizarEvidencia = (e) => {
    const file = e.target.files[0];
    const previewDiv = document.getElementById('previewEvidencia');
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

const guardarAccionMunicipal = async (e) => {
    e.preventDefault();

    const btn = document.getElementById('btnGuardar');
    const alertContainer = document.getElementById('alertContainer');

    btn.disabled = true;
    btn.innerHTML = 'Guardando...';
    alertContainer.innerHTML = '';

    const id_incidencia = document.getElementById('incidenciaId').value;
    const tipo_accion = document.getElementById('tipo_accion').value;
    const descripcion = document.getElementById('descripcion').value.trim();
    const evidencia = document.getElementById('evidencia').files[0];

    if (!tipo_accion) {
        mostrarAlerta('Por favor, selecciona un tipo de accion.', 'danger');
        btn.disabled = false;
        btn.innerHTML = 'Registrar Accion';
        return;
    }

    if (!descripcion || descripcion.length < 5) {
        mostrarAlerta('La descripcion debe tener al menos 5 caracteres.', 'danger');
        btn.disabled = false;
        btn.innerHTML = 'Registrar Accion';
        return;
    }

    try {
        const token = obtenerToken();
        const formData = new FormData();
        formData.append('id_incidencia', id_incidencia);
        formData.append('tipo_accion', tipo_accion);
        formData.append('descripcion', descripcion);
        if (evidencia) formData.append('evidencia', evidencia);

        const resultado = await api.postFormData('/operador/acciones', formData, token);

        if (resultado.success) {
            mostrarAlerta('Accion registrada exitosamente.', 'success');
            setTimeout(() => {
                window.location.href = 'detalle_incidencia.html?id=' + id_incidencia;
            }, 1500);
        } else {
            mostrarAlerta(resultado.message || 'Error al registrar accion', 'danger');
        }
    } catch (error) {
        console.error('Error al guardar accion:', error);
        mostrarAlerta('Error de conexion con el servidor', 'danger');
    } finally {
        btn.disabled = false;
        btn.innerHTML = 'Registrar Accion';
    }
};

// ============================================
// DASHBOARD ESTADISTICO
// ============================================

const cargarEstadisticasCompletas = async () => {
    try {
        console.log('Cargando estadisticas completas...');
        const token = obtenerToken();
        const resultado = await api.get('/operador/estadisticas/completas', token);

        if (resultado.success) {
            console.log('Estadisticas cargadas correctamente');
            mostrarEstadisticas(resultado.data);
        } else {
            console.error('Error al cargar estadisticas:', resultado.message);
            mostrarError('Error al cargar las estadisticas');
        }
    } catch (error) {
        console.error('Error al cargar estadisticas:', error);
        mostrarError('Error de conexion con el servidor');
    }
};

const mostrarEstadisticas = (data) => {
    document.getElementById('totalIncidencias').textContent = data.generales?.total || 0;
    document.getElementById('pendientes').textContent = data.generales?.pendientes || 0;
    document.getElementById('cerradas').textContent = data.generales?.cerradas || 0;

    const horas = Math.round(data.tiempoPromedioRespuesta || 0);
    document.getElementById('tiempoPromedio').textContent = horas + 'h';

    if (data.porEstado && data.porEstado.length > 0) {
        mostrarGraficoEstados(data.porEstado);
    }

    if (data.porPrioridad && data.porPrioridad.length > 0) {
        mostrarGraficoPrioridad(data.porPrioridad);
    }

    if (data.porCategoria && data.porCategoria.length > 0) {
        mostrarGraficoCategoriasEstadisticas(data.porCategoria);
    }

    if (data.porBarrio && data.porBarrio.length > 0) {
        mostrarGraficoBarriosEstadisticas(data.porBarrio);
    }

    if (data.tendenciaMensual && data.tendenciaMensual.length > 0) {
        mostrarGraficoTendencia(data.tendenciaMensual);
    }
};

const mostrarGraficoEstados = (datos) => {
    const ctx = document.getElementById('estadosChart').getContext('2d');
    const labels = datos.map(d => d.estado);
    const valores = datos.map(d => d.cantidad);
    const colores = datos.map(d => d.color || '#6c757d');

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: valores,
                backgroundColor: colores,
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                }
            },
            cutout: '60%'
        }
    });
};

const mostrarGraficoPrioridad = (datos) => {
    const ctx = document.getElementById('prioridadChart').getContext('2d');
    const coloresPrioridad = {
        'critica': '#E74C3C',
        'alta': '#E67E22',
        'media': '#F39C12',
        'baja': '#2ECC71'
    };
    const labels = datos.map(d => d.prioridad || 'Sin prioridad');
    const valores = datos.map(d => d.cantidad);
    const colores = datos.map(d => coloresPrioridad[d.prioridad] || '#6c757d');

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Incidencias por prioridad',
                data: valores,
                backgroundColor: colores.map(c => c + '80'),
                borderColor: colores,
                borderWidth: 2,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
};

const mostrarGraficoCategoriasEstadisticas = (datos) => {
    const ctx = document.getElementById('categoriasChart').getContext('2d');
    const labels = datos.map(d => d.categoria);
    const valores = datos.map(d => d.cantidad);
    const colores = datos.map(d => d.color || '#3498DB');

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Incidencias por categoria',
                data: valores,
                backgroundColor: colores.map(c => c + '80'),
                borderColor: colores,
                borderWidth: 2,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
};

const mostrarGraficoBarriosEstadisticas = (datos) => {
    const ctx = document.getElementById('barriosChart').getContext('2d');
    const datosTop = datos.slice(0, 8);
    const labels = datosTop.map(d => d.barrio);
    const valores = datosTop.map(d => d.cantidad);
    const colores = ['#3498DB', '#2ECC71', '#F39C12', '#E74C3C', '#9B59B6', '#1ABC9C', '#E67E22', '#95A5A6'];

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: valores,
                backgroundColor: colores.slice(0, datosTop.length),
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 10,
                        usePointStyle: true,
                        pointStyle: 'circle',
                        font: {
                            size: 10
                        }
                    }
                }
            },
            cutout: '55%'
        }
    });
};

const mostrarGraficoTendencia = (datos) => {
    const ctx = document.getElementById('tendenciaChart').getContext('2d');
    const labels = datos.map(d => {
        const partes = d.mes.split('-');
        return partes[1] + '/' + partes[0];
    });
    const valores = datos.map(d => d.cantidad);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Incidencias por mes',
                data: valores,
                borderColor: '#3498DB',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#3498DB',
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
};

// ============================================
// MAPA OPERATIVO
// ============================================

let mapaOperativo = null;
let marcadoresCapas = [];
let marcadoresGrupo = null;

const cargarMapaOperativo = async () => {
    try {
        console.log('Cargando mapa operativo...');
        const token = obtenerToken();
        const resultado = await api.get('/operador/incidencias', token);

        if (resultado.success) {
            console.log(resultado.data.length + ' incidencias cargadas para el mapa');
            inicializarMapaOperativo(resultado.data);
            cargarFiltrosMapa();
        } else {
            console.error('Error al cargar incidencias para el mapa:', resultado.message);
            mostrarError('Error al cargar las incidencias para el mapa');
        }
    } catch (error) {
        console.error('Error al cargar mapa operativo:', error);
        mostrarError('Error de conexion con el servidor');
    }
};

const inicializarMapaOperativo = (incidencias) => {
    const tarija = [-21.5355, -64.7295];

    mapaOperativo = L.map('mapaOperativo').setView(tarija, 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'OpenStreetMap'
    }).addTo(mapaOperativo);

    marcadoresGrupo = L.layerGroup().addTo(mapaOperativo);

    mostrarMarcadoresEnMapa(incidencias);

    mapaOperativo.invalidateSize();

    console.log('Mapa operativo inicializado correctamente');
};

const mostrarMarcadoresEnMapa = (incidencias) => {
    if (marcadoresGrupo) {
        marcadoresGrupo.clearLayers();
    }

    if (!incidencias || incidencias.length === 0) {
        L.popup()
            .setLatLng([-21.5355, -64.7295])
            .setContent('No hay incidencias para mostrar en el mapa')
            .openOn(mapaOperativo);
        return;
    }

    incidencias.forEach(inc => {
        if (!inc.latitud || !inc.longitud) return;

        const color = inc.estado_color || '#6c757d';
        const marcador = crearMarcador(inc, color);
        marcador.addTo(marcadoresGrupo);
    });
};

const crearMarcador = (incidencia, color) => {
    const iconoPersonalizado = L.divIcon({
        html: '<div style="background-color: ' + color + '; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>',
        className: '',
        iconSize: [16, 16],
        iconAnchor: [8, 8]
    });

    const marcador = L.marker([incidencia.latitud, incidencia.longitud], {
        icon: iconoPersonalizado
    });

    const fecha = formatearFecha(incidencia.fecha_reporte);
    const estado = incidencia.estado_nombre || 'Sin estado';
    const prioridad = incidencia.prioridad || 'media';

    marcador.bindPopup(`
        <div style="min-width: 200px;">
            <h6 style="margin-bottom: 8px; font-weight: 600;">${incidencia.categoria_nombre || 'Sin categoria'}</h6>
            <p style="margin-bottom: 4px; font-size: 0.85rem;">${incidencia.descripcion ? incidencia.descripcion.substring(0, 80) + (incidencia.descripcion.length > 80 ? '...' : '') : 'Sin descripcion'}</p>
            <hr style="margin: 6px 0;">
            <div style="display: flex; justify-content: space-between; font-size: 0.8rem;">
                <span><strong>Estado:</strong> ${estado}</span>
                <span><strong>Prioridad:</strong> ${prioridad}</span>
            </div>
            <div style="font-size: 0.75rem; color: #6c757d; margin-top: 4px;">
                ${fecha}
                ${incidencia.barrio_nombre ? ' - ' + incidencia.barrio_nombre : ''}
            </div>
            <hr style="margin: 6px 0;">
            <a href="detalle_incidencia.html?id=${incidencia.id_incidencia}" style="font-size: 0.85rem;">Ver detalle</a>
        </div>
    `);

    return marcador;
};

const cargarFiltrosMapa = async () => {
    try {
        const categoriasResult = await api.get('/incidencias/categorias');
        if (categoriasResult.success) {
            const select = document.getElementById('filtroCategoriaMapa');
            categoriasResult.data.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.id_categoria;
                option.textContent = cat.nombre;
                select.appendChild(option);
            });
        }

        document.getElementById('btnAplicarFiltrosMapa').addEventListener('click', aplicarFiltrosMapa);
        document.getElementById('btnLimpiarFiltrosMapa').addEventListener('click', limpiarFiltrosMapa);
    } catch (error) {
        console.error('Error al cargar filtros del mapa:', error);
    }
};

const aplicarFiltrosMapa = async () => {
    const estado = document.getElementById('filtroEstadoMapa').value;
    const categoria = document.getElementById('filtroCategoriaMapa').value;
    const prioridad = document.getElementById('filtroPrioridadMapa').value;

    let url = '/operador/incidencias?';
    if (estado) url += 'estado=' + estado + '&';
    if (categoria) url += 'categoria=' + categoria + '&';
    if (prioridad) url += 'prioridad=' + prioridad + '&';

    try {
        const token = obtenerToken();
        const resultado = await api.get(url, token);
        if (resultado.success) {
            mostrarMarcadoresEnMapa(resultado.data);
        }
    } catch (error) {
        console.error('Error al aplicar filtros:', error);
    }
};

const limpiarFiltrosMapa = () => {
    document.getElementById('filtroEstadoMapa').value = '';
    document.getElementById('filtroCategoriaMapa').value = '';
    document.getElementById('filtroPrioridadMapa').value = '';

    aplicarFiltrosMapa();
};

// ============================================
// MAPA DE CALOR
// ============================================

let mapaCalor = null;
let capaCalor = null;

const cargarMapaCalor = async () => {
    try {
        console.log('Cargando mapa de calor...');
        const token = obtenerToken();
        const resultado = await api.get('/operador/mapa-calor', token);

        if (resultado.success) {
            console.log(resultado.data.length + ' puntos cargados para el mapa de calor');
            inicializarMapaCalor(resultado.data);
            cargarFiltrosCalor();
            actualizarZonasCriticas(resultado.data);
        } else {
            console.error('Error al cargar datos para mapa de calor:', resultado.message);
            mostrarError('Error al cargar los datos para el mapa de calor');
        }
    } catch (error) {
        console.error('Error al cargar mapa de calor:', error);
        mostrarError('Error de conexion con el servidor');
    }
};

const inicializarMapaCalor = (datos) => {
    const tarija = [-21.5355, -64.7295];

    mapaCalor = L.map('mapaCalor').setView(tarija, 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'OpenStreetMap'
    }).addTo(mapaCalor);

    mostrarCapaCalor(datos);

    mapaCalor.invalidateSize();

    console.log('Mapa de calor inicializado correctamente');
};

const mostrarCapaCalor = (datos) => {
    if (capaCalor) {
        mapaCalor.removeLayer(capaCalor);
    }

    if (!datos || datos.length === 0) {
        L.popup()
            .setLatLng([-21.5355, -64.7295])
            .setContent('No hay datos para generar el mapa de calor')
            .openOn(mapaCalor);
        return;
    }

    const puntos = datos.map(item => {
        const lat = parseFloat(item.latitud);
        const lng = parseFloat(item.longitud);

        if (isNaN(lat) || isNaN(lng)) return null;

        let intensidad = 1.0;

        if (item.prioridad === 'critica') intensidad = 1.5;
        else if (item.prioridad === 'alta') intensidad = 1.2;
        else if (item.prioridad === 'media') intensidad = 1.0;
        else if (item.prioridad === 'baja') intensidad = 0.8;

        return [lat, lng, intensidad];
    }).filter(p => p !== null);

    if (puntos.length === 0) {
        L.popup()
            .setLatLng([-21.5355, -64.7295])
            .setContent('No hay datos validos para el mapa de calor')
            .openOn(mapaCalor);
        return;
    }

    capaCalor = L.heatLayer(puntos, {
        radius: 25,
        blur: 15,
        maxZoom: 17,
        minOpacity: 0.3,
        gradient: {
            0.0: '#4444ff',
            0.25: '#44cc44',
            0.5: '#ffcc00',
            0.75: '#ff8800',
            1.0: '#ff0000'
        }
    });

    capaCalor.addTo(mapaCalor);

    console.log('Capa de calor generada con ' + puntos.length + ' puntos');
};

const cargarFiltrosCalor = async () => {
    try {
        const categoriasResult = await api.get('/incidencias/categorias');
        if (categoriasResult.success) {
            const select = document.getElementById('filtroCategoriaCalor');
            categoriasResult.data.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.id_categoria;
                option.textContent = cat.nombre;
                select.appendChild(option);
            });
        }

        document.getElementById('btnAplicarFiltrosCalor').addEventListener('click', aplicarFiltrosCalor);
        document.getElementById('btnLimpiarFiltrosCalor').addEventListener('click', limpiarFiltrosCalor);
    } catch (error) {
        console.error('Error al cargar filtros del mapa de calor:', error);
    }
};

const aplicarFiltrosCalor = async () => {
    const estado = document.getElementById('filtroEstadoCalor').value;
    const categoria = document.getElementById('filtroCategoriaCalor').value;
    const prioridad = document.getElementById('filtroPrioridadCalor').value;

    let url = '/operador/incidencias?';
    if (estado) url += 'estado=' + estado + '&';
    if (categoria) url += 'categoria=' + categoria + '&';
    if (prioridad) url += 'prioridad=' + prioridad + '&';

    try {
        const token = obtenerToken();
        const resultado = await api.get(url, token);
        if (resultado.success) {
            mostrarCapaCalor(resultado.data);
            actualizarZonasCriticas(resultado.data);
        }
    } catch (error) {
        console.error('Error al aplicar filtros:', error);
    }
};

const limpiarFiltrosCalor = () => {
    document.getElementById('filtroEstadoCalor').value = '';
    document.getElementById('filtroCategoriaCalor').value = '';
    document.getElementById('filtroPrioridadCalor').value = '';

    aplicarFiltrosCalor();
};

const actualizarZonasCriticas = (datos) => {
    const container = document.getElementById('zonasCriticas');

    if (!datos || datos.length === 0) {
        container.innerHTML = '<p class="text-muted small">No hay datos disponibles</p>';
        return;
    }

    const agrupado = {};
    datos.forEach(item => {
        if (!item.barrio_nombre) return;
        if (!agrupado[item.barrio_nombre]) {
            agrupado[item.barrio_nombre] = 0;
        }
        agrupado[item.barrio_nombre]++;
    });

    const ordenado = Object.entries(agrupado)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    if (ordenado.length === 0) {
        container.innerHTML = '<p class="text-muted small">No hay zonas criticas identificadas</p>';
        return;
    }

    let html = '';
    ordenado.forEach(([barrio, cantidad]) => {
        const nivel = cantidad >= 10 ? 'Alta' : cantidad >= 5 ? 'Media' : 'Baja';
        const color = cantidad >= 10 ? '#E74C3C' : cantidad >= 5 ? '#E67E22' : '#F39C12';
        html += `
            <div class="d-flex justify-content-between align-items-center mb-1">
                <span class="small">${barrio}</span>
                <span class="badge" style="background: ${color}; color: white;">${cantidad} - ${nivel}</span>
            </div>
        `;
    });

    container.innerHTML = html;
};
// ============================================
// FUNCIONES AUXILIARES
// ============================================

const getPrioridadColor = (prioridad) => {
    const colores = {
        'baja': '#2ECC71',
        'media': '#F39C12',
        'alta': '#E67E22',
        'critica': '#E74C3C'
    };
    return colores[prioridad] || '#6c757d';
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

const mostrarError = (mensaje) => {
    const container = document.getElementById('contenidoPrincipal');
    if (container) {
        container.innerHTML = `
            <div class="text-center text-danger py-5">
                <h5 class="mt-3">${mensaje}</h5>
                <a href="dashboard_operador.html" class="btn btn-primary mt-3">
                    Volver al dashboard
                </a>
            </div>
        `;
    }
};

// NOTA: La funcion mostrarAlerta esta en autenticacion.js
// No es necesario declararla aqui