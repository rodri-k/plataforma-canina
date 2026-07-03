// ============================================
// AUTENTICACIÓN - Registro y Login
// ============================================

// Obtener elementos del DOM cuando la página carga
document.addEventListener('DOMContentLoaded', () => {
    // Verificar si estamos en la página de registro
    const registroForm = document.getElementById('registroForm');
    if (registroForm) {
        registroForm.addEventListener('submit', handleRegistro);
    }

    // Verificar si estamos en la página de login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Verificar si hay sesión activa (para redirigir)
    verificarSesion();
});

// ============================================
// MANEJAR REGISTRO
// ============================================
const handleRegistro = async (event) => {
    event.preventDefault();

    const btn = document.getElementById('btnRegistrar');
    const alertContainer = document.getElementById('alertContainer');

    // Deshabilitar botón y mostrar estado de carga
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Registrando...';

    // Limpiar alertas anteriores
    alertContainer.innerHTML = '';

    // Obtener datos del formulario
    const nombre = document.getElementById('nombre').value.trim();
    const apellido = document.getElementById('apellido').value.trim();
    const email = document.getElementById('email').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const password = document.getElementById('password').value;

    // Validaciones básicas
    if (!nombre || !apellido || !email || !password) {
        mostrarAlerta('Todos los campos obligatorios deben estar llenos', 'danger');
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-person-plus me-2"></i>Registrarse';
        return;
    }

    if (password.length < 6) {
        mostrarAlerta('La contraseña debe tener al menos 6 caracteres', 'danger');
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-person-plus me-2"></i>Registrarse';
        return;
    }

    try {
        const data = { nombre, apellido, email, telefono, password };
        const resultado = await api.post('/auth/registrar', data);

        if (resultado.success) {
            mostrarAlerta('✅ Registro exitoso. Ahora puedes iniciar sesión.', 'success');

            // Limpiar formulario
            document.getElementById('registroForm').reset();

            // Redirigir al login después de 2 segundos
            setTimeout(() => {
                window.location.href = 'iniciar_sesion.html';
            }, 2000);
        } else {
            mostrarAlerta(resultado.message || 'Error al registrar usuario', 'danger');
        }
    } catch (error) {
        console.error('Error en registro:', error);
        mostrarAlerta('Error de conexión con el servidor', 'danger');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-person-plus me-2"></i>Registrarse';
    }
};

// ============================================
// MANEJAR LOGIN
// ============================================
const handleLogin = async (event) => {
    event.preventDefault();

    const btn = document.getElementById('btnLogin');
    const alertContainer = document.getElementById('alertContainer');

    // Deshabilitar botón y mostrar estado de carga
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Iniciando sesión...';

    // Limpiar alertas anteriores
    alertContainer.innerHTML = '';

    // Obtener datos del formulario
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    // Validaciones básicas
    if (!email || !password) {
        mostrarAlerta('Todos los campos son obligatorios', 'danger');
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-box-arrow-in-right me-2"></i>Iniciar Sesión';
        return;
    }

    try {
        const data = { email, password };
        const resultado = await api.post('/auth/login', data);

        if (resultado.success) {
            // Guardar token y datos del usuario
            localStorage.setItem('token', resultado.data.token);
            localStorage.setItem('usuario', JSON.stringify(resultado.data.usuario));

            mostrarAlerta('✅ Inicio de sesión exitoso', 'success');

            // Redirigir según el rol
            setTimeout(() => {
                const usuario = resultado.data.usuario;
                if (usuario.tipo_usuario === 'operador') {
                    window.location.href = '../operador_municipal/dashboard_operador.html';
                } else {
                    window.location.href = '../ciudadano/dashboard_ciudadano.html';
                }
            }, 1500);
        } else {
            mostrarAlerta(resultado.message || 'Error al iniciar sesión', 'danger');
        }
    } catch (error) {
        console.error('Error en login:', error);
        mostrarAlerta('Error de conexión con el servidor', 'danger');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-box-arrow-in-right me-2"></i>Iniciar Sesión';
    }
};

// ============================================
// MOSTRAR ALERTA
// ============================================
const mostrarAlerta = (mensaje, tipo = 'info') => {
    const alertContainer = document.getElementById('alertContainer');
    const alertClass = `alert alert-${tipo} alert-dismissible fade show`;

    const alertHTML = `
        <div class="${alertClass}" role="alert">
            ${mensaje}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;

    alertContainer.innerHTML = alertHTML;

    // Auto-cerrar después de 5 segundos
    setTimeout(() => {
        const alert = alertContainer.querySelector('.alert');
        if (alert) {
            alert.classList.remove('show');
            setTimeout(() => alertContainer.innerHTML = '', 300);
        }
    }, 5000);
};

// ============================================
// VERIFICAR SESIÓN ACTIVA
// ============================================
const verificarSesion = () => {
    const token = localStorage.getItem('token');
    const usuarioStr = localStorage.getItem('usuario');

    if (token && usuarioStr) {
        try {
            const usuario = JSON.parse(usuarioStr);
            // Si está en página de login o registro y tiene sesión, redirigir
            const currentPath = window.location.pathname;
            if (currentPath.includes('iniciar_sesion.html') || currentPath.includes('registrarse.html')) {
                if (usuario.tipo_usuario === 'operador') {
                    window.location.href = '../operador_municipal/dashboard_operador.html';
                } else {
                    window.location.href = '../ciudadano/dashboard_ciudadano.html';
                }
            }
        } catch (e) {
            console.error('Error al parsear usuario:', e);
        }
    }
};

// ============================================
// CERRAR SESIÓN (función global)
// ============================================
const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = '../../index.html';
};

// ============================================
// OBTENER TOKEN (función global)
// ============================================
const obtenerToken = () => {
    return localStorage.getItem('token');
};

// ============================================
// OBTENER USUARIO (función global)
// ============================================
const obtenerUsuario = () => {
    const usuarioStr = localStorage.getItem('usuario');
    if (usuarioStr) {
        try {
            return JSON.parse(usuarioStr);
        } catch (e) {
            return null;
        }
    }
    return null;
};