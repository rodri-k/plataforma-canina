// ============================================
// DASHBOARD CIUDADANO
// ============================================

let estadoChartInstance = null;

document.addEventListener('DOMContentLoaded', async () => {
    // Verificar autenticación
    const token = obtenerToken();
    const usuario = obtenerUsuario();

    if (!token || !usuario) {
        window.location.href = '../visitante/iniciar_sesion.html';
        return;
    }

    // Mostrar nombre del usuario
    document.getElementById('nombreUsuario').textContent = `${usuario.nombre} ${usuario.apellido}`;
    document.getElementById('nombreBienvenida').textContent = `${usuario.nombre} ${usuario.apellido}`;

    // Cargar datos del dashboard
    await cargarDashboard();
});

// ============================================
// CARGAR DASHBOARD
// ============================================
const cargarDashboard = async () => {
    try {
        const token = obtenerToken();
        const resultado = await api.get('/ciudadano/dashboard', token);

        if (resultado.success) {
            const data = resultado.data;

            // Actualizar estadísticas
            document.getElementById('totalIncidencias').textContent = data.total || 0;
            document.getElementById('pendientes').textContent = data.pendientes || 0;
            document.getElementById('enCurso').textContent = data.enCurso || 0;
            document.getElementById('cerradas').textContent = data.cerradas || 0;

            // Actualizar gráfico
            actualizarGrafico(data);

            // Actualizar últimas incidencias
            mostrarUltimasIncidencias(data.ultimasIncidencias || []);
        } else {
            console.error('Error al cargar dashboard:', resultado.message);
            mostrarAlerta('Error al cargar el dashboard', 'danger');
        }
    } catch (error) {
        console.error('Error en cargarDashboard:', error);
        mostrarAlerta('Error de conexión con el servidor', 'danger');
    }
};

// ============================================
// ACTUALIZAR GRÁFICO
// ============================================
const actualizarGrafico = (data) => {
    const ctx = document.getElementById('estadoChart').getContext('2d');

    // Destruir gráfico anterior si existe
    if (estadoChartInstance) {
        estadoChartInstance.destroy();
    }

    const estados = ['Pendientes', 'En Revisión', 'En Curso', 'Cerradas'];
    const colores = ['#F1C40F', '#3498DB', '#E67E22', '#2ECC71'];
    const valores = [
        data.pendientes || 0,
        data.enRevision || 0,
        data.enCurso || 0,
        data.cerradas || 0
    ];

    estadoChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: estados,
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
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                }
            },
            cutout: '60%'
        }
    });
};

// ============================================
// MOSTRAR ÚLTIMAS INCIDENCIAS
// ============================================
const mostrarUltimasIncidencias = (incidencias) => {
    const container = document.getElementById('ultimasIncidencias');

    if (!incidencias || incidencias.length === 0) {
        container.innerHTML = `
            <div class="text-center text-muted py-4">
                <i class="bi bi-inbox" style="font-size: 2rem;"></i>
                <p class="mt-2">No hay incidencias registradas</p>
            </div>
        `;
        return;
    }

    let html = '';
    incidencias.forEach(incidencia => {
        const estadoClass = getEstadoClass(incidencia.estado_nombre);
        const estadoColor = incidencia.estado_color || '#6c757d';

        html += `
            <div class="incidencia-item ${estadoClass} d-flex justify-content-between align-items-center">
                <div>
                    <div class="fw-bold">${incidencia.titulo || 'Sin título'}</div>
                    <small class="text-muted">
                        <i class="bi bi-tag me-1"></i>${incidencia.categoria_nombre || 'Sin categoría'}
                        <i class="bi bi-calendar3 ms-2 me-1"></i>${formatearFecha(incidencia.fecha_reporte)}
                    </small>
                </div>
                <span class="estado-badge" style="background: ${estadoColor}20; color: ${estadoColor}; border: 1px solid ${estadoColor}40;">
                    ${incidencia.estado_nombre || 'Sin estado'}
                </span>
            </div>
        `;
    });

    container.innerHTML = html;
};

// ============================================
// FUNCIONES AUXILIARES
// ============================================
const getEstadoClass = (estado) => {
    if (!estado) return '';
    const estadoLower = estado.toLowerCase();
    if (estadoLower.includes('pendiente')) return 'estado-pendiente';
    if (estadoLower.includes('revisión') || estadoLower.includes('revision')) return 'estado-en-revision';
    if (estadoLower.includes('curso')) return 'estado-en-curso';
    if (estadoLower.includes('cerrada')) return 'estado-cerrada';
    return '';
};

const formatearFecha = (fecha) => {
    if (!fecha) return 'Fecha no disponible';
    const d = new Date(fecha);
    return d.toLocaleDateString('es-BO', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
};

// const mostrarAlerta = (mensaje, tipo = 'info') => {
//     // Función simple para mostrar alertas en el dashboard
//     const alertContainer = document.createElement('div');
//     alertContainer.className = `alert alert-${tipo} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
//     alertContainer.style.zIndex = '9999';
//     alertContainer.style.minWidth = '300px';
//     alertContainer.innerHTML = `
//         ${mensaje}
//         <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
//     `;
//     document.body.appendChild(alertContainer);

//     setTimeout(() => {
//         alertContainer.classList.remove('show');
//         setTimeout(() => alertContainer.remove(), 300);
//     }, 5000);
// };