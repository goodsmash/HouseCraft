// Variables globales
let canvas, ctx;
let isDrawing = false;
let lastX, lastY;
let currentTool = 'pared';
let currentFloor = 0;
let floors = [];
let houseData = {
    superficie: 0,
    ancho: 0,
    largo: 0,
    pisos: 1,
    habitaciones: 3,
    banos: 2
};

// Constantes
const PIXELS_PER_METER = 20; // 20 píxeles por metro
const WALL_THICKNESS = 0.2; // 20 cm de grosor de pared

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Configurar el formulario
    document.getElementById('datos-iniciales').addEventListener('submit', function(e) {
        e.preventDefault();
        guardarDatosIniciales();
    });
    
    // Inicializar el canvas (aunque estará oculto inicialmente)
    initCanvas();
    
    // Configurar eventos del canvas
    setupCanvasEvents();
    
    // Configurar eventos de los inputs para cálculos en tiempo real
    document.getElementById('superficie-total').addEventListener('input', actualizarDimensiones);
    document.getElementById('ancho').addEventListener('input', actualizarSuperficie);
    document.getElementById('largo').addEventListener('input', actualizarSuperficie);
    document.getElementById('pisos').addEventListener('change', actualizarPisos);
});

// Función para guardar los datos iniciales del formulario
function guardarDatosIniciales() {
    houseData = {
        superficie: parseFloat(document.getElementById('superficie-total').value) || 0,
        ancho: parseFloat(document.getElementById('ancho').value) || 0,
        largo: parseFloat(document.getElementById('largo').value) || 0,
        pisos: parseInt(document.getElementById('pisos').value) || 1,
        habitaciones: parseInt(document.getElementById('habitaciones').value) || 3,
        banos: parseInt(document.getElementById('banos').value) || 2
    };
    
    // Validar que las dimensiones coincidan con la superficie
    const superficieCalculada = houseData.ancho * houseData.largo;
    const diferencia = Math.abs(superficieCalculada - houseData.superficie);
    
    if (diferencia > 1) { // Permitir un pequeño margen de error
        if (confirm(`Las dimensiones ingresadas (${houseData.ancho}m x ${houseData.largo}m = ${superficieCalculada}m²) no coinciden con la superficie total (${houseData.superficie}m²). ¿Deseas corregir?`)) {
            return; // No continuar si el usuario quiere corregir
        }
    }
    
    // Inicializar los pisos
    inicializarPisos();
    
    // Mostrar la sección de diseño
    document.getElementById('inicio').style.display = 'none';
    document.getElementById('seccion-diseno').style.display = 'block';
    
    // Actualizar la interfaz con los datos
    actualizarInterfaz();
}

// Función para inicializar los pisos
function inicializarPisos() {
    floors = [];
    const pisoTabs = document.getElementById('piso-tabs');
    pisoTabs.innerHTML = '';
    
    for (let i = 0; i < houseData.pisos; i++) {
        // Crear pestaña
        const li = document.createElement('li');
        li.className = 'nav-item';
        li.role = 'presentation';
        
        const button = document.createElement('button');
        button.className = `nav-link ${i === 0 ? 'active' : ''}`;
        button.id = `piso-${i}-tab`;
        button.setAttribute('data-bs-toggle', 'tab');
        button.setAttribute('data-bs-target', `#piso-${i}`);
        button.setAttribute('type', 'button');
        button.setAttribute('role', 'tab');
        button.textContent = i === 0 ? 'Planta Baja' : `Piso ${i + 1}`;
        button.addEventListener('click', () => cambiarPiso(i));
        
        li.appendChild(button);
        pisoTabs.appendChild(li);
        
        // Inicializar datos del piso
        floors.push({
            nombre: i === 0 ? 'Planta Baja' : `Piso ${i + 1}`,
            elementos: [],
            habitaciones: i === 0 ? Math.ceil(houseData.habitaciones / houseData.pisos) : 0,
            banos: i === 0 ? Math.ceil(houseData.banos / houseData.pisos) : 0
        });
    }
    
    // Asegurarse de que el primer piso esté seleccionado
    currentFloor = 0;
}

// Función para cambiar entre pisos
function cambiarPiso(numeroPiso) {
    currentFloor = numeroPiso;
    actualizarInterfaz();
    // Aquí podrías cargar los elementos del piso seleccionado
}

// Función para actualizar la interfaz con los datos actuales
function actualizarInterfaz() {
    // Actualizar especificaciones
    document.getElementById('especificacion-superficie').textContent = `${houseData.superficie} m²`;
    document.getElementById('especificacion-dimensiones').textContent = `${houseData.ancho}m x ${houseData.largo}m`;
    document.getElementById('especificacion-pisos').textContent = houseData.pisos;
    document.getElementById('especificacion-habitaciones').textContent = houseData.habitaciones;
    document.getElementById('especificacion-banos').textContent = houseData.banos;
    
    // Actualizar recomendaciones
    actualizarRecomendaciones();
    
    // Actualizar el título del plano actual
    document.querySelector('.card-header.bg-primary').textContent = floors[currentFloor].nombre;
}

// Función para actualizar las recomendaciones según los datos
function actualizarRecomendaciones() {
    const recomendaciones = [];
    const pisoActual = floors[currentFloor];
    
    // Recomendaciones basadas en el número de habitaciones y baños
    if (pisoActual.habitaciones > 0) {
        recomendaciones.push(`Este piso tiene ${pisoActual.habitaciones} habitación(es).`);
        
        // Tamaño recomendado de habitaciones
        const tamanoHabitacion = Math.min(20, Math.max(12, houseData.superficie / (houseData.habitaciones * 1.5)));
        recomendaciones.push(`Tamaño recomendado por habitación: ${tamanoHabitacion.toFixed(1)} m²`);
    }
    
    if (pisoActual.banos > 0) {
        recomendaciones.push(`Este piso tiene ${pisoActual.banos} baño(s).`);
        recomendaciones.push('Tamaño recomendado para baño: 4-6 m²');
    }
    
    // Recomendaciones generales
    if (houseData.pisos > 1) {
        recomendaciones.push('Considera la ubicación de las escaleras para una mejor distribución.');
    }
    
    if (houseData.superficie > 150) {
        recomendaciones.push('Para una casa de este tamaño, considera incluir áreas sociales amplias.');
    }
    
    // Mostrar recomendaciones
    const recomendacionesDiv = document.getElementById('recomendaciones');
    if (recomendaciones.length > 0) {
        recomendacionesDiv.innerHTML = '<ul class="mb-0">' + 
            recomendaciones.map(r => `<li>${r}</li>`).join('') + '</ul>';
    } else {
        recomendacionesDiv.innerHTML = '<p>Ingresa más datos para ver recomendaciones específicas.</p>';
    }
}

// Funciones para cálculos en tiempo real
function actualizarDimensiones() {
    const superficie = parseFloat(document.getElementById('superficie-total').value) || 0;
    const ancho = parseFloat(document.getElementById('ancho').value) || 0;
    
    if (superficie > 0 && ancho > 0) {
        const largoCalculado = (superficie / ancho).toFixed(1);
        document.getElementById('largo').value = largoCalculado;
    }
}

function actualizarSuperficie() {
    const ancho = parseFloat(document.getElementById('ancho').value) || 0;
    const largo = parseFloat(document.getElementById('largo').value) || 0;
    
    if (ancho > 0 && largo > 0) {
        const superficieCalculada = (ancho * largo).toFixed(1);
        document.getElementById('superficie-total').value = superficieCalculada;
    }
}

function actualizarPisos() {
    const numPisos = parseInt(document.getElementById('pisos').value) || 1;
    // Aquí podrías agregar lógica adicional si es necesario
}

// Función para volver a la pantalla de inicio
function volverAInicio() {
    if (confirm('¿Estás seguro de que quieres volver al inicio? Se perderán los cambios no guardados.')) {
        document.getElementById('seccion-diseno').style.display = 'none';
        document.getElementById('inicio').style.display = 'block';
        window.scrollTo(0, 0);
    }
}

// Función para seleccionar herramienta de dibujo
function seleccionarHerramienta(herramienta) {
    currentTool = herramienta;
    // Aquí podrías actualizar la interfaz para mostrar la herramienta seleccionada
    console.log(`Herramienta seleccionada: ${herramienta}`);
}

// Inicializar el canvas
function initCanvas() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    
    // Ajustar el tamaño del canvas al contenedor
    function resizeCanvas() {
        const container = document.getElementById('plano');
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
        
        // Estilos del lápiz
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    }
    
    // Ajustar el tamaño inicial y al redimensionar la ventana
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
}

// Configurar eventos del canvas
function setupCanvasEvents() {
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    // Soporte táctil para dispositivos móviles
    canvas.addEventListener('touchstart', handleTouchStart, false);
    canvas.addEventListener('touchmove', handleTouchMove, false);
    canvas.addEventListener('touchend', stopDrawing, false);
}

// Función para manejar el inicio del dibujo
function startDrawing(e) {
    isDrawing = true;
    [lastX, lastY] = getMousePos(canvas, e);
    
    // Iniciar un nuevo trazo
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
}

// Función para dibujar
function draw(e) {
    if (!isDrawing) return;
    
    const [x, y] = getMousePos(canvas, e);
    
    // Dibujar una línea desde la última posición hasta la actual
    ctx.lineTo(x, y);
    ctx.stroke();
    
    // Actualizar la última posición
    lastX = x;
    lastY = y;
}

// Función para detener el dibujo
function stopDrawing() {
    isDrawing = false;
    ctx.closePath();
}

// Función para manejar el inicio del toque táctil
function handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
}

// Función para manejar el movimiento táctil
function handleTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
}

// Función para obtener la posición del ratón en el canvas
function getMousePos(canvas, evt) {
    const rect = canvas.getBoundingClientRect();
    let x, y;
    
    if (evt.touches) {
        // Para eventos táctiles
        x = evt.touches[0].clientX - rect.left;
        y = evt.touches[0].clientY - rect.top;
    } else {
        // Para eventos de ratón
        x = evt.clientX - rect.left;
        y = evt.clientY - rect.top;
    }
    
    // Convertir píxeles a metros para mostrar en la interfaz
    const metrosX = (x / PIXELS_PER_METER).toFixed(2);
    const metrosY = (y / PIXELS_PER_METER).toFixed(2);
    
    return { x, y, metrosX, metrosY };
}

// Función para limpiar el plano
function limpiarPlano() {
    if (confirm('¿Estás seguro de que quieres limpiar el plano actual? Se perderán todos los elementos dibujados.')) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // También podrías limpiar los elementos guardados para este piso
        if (floors[currentFloor]) {
            floors[currentFloor].elementos = [];
        }
        actualizarElementosPlano();
    }
}

// Función para actualizar la lista de elementos del plano
function actualizarElementosPlano() {
    const contenedor = document.getElementById('elementos-plano');
    const pisoActual = floors[currentFloor];
    
    if (!pisoActual || pisoActual.elementos.length === 0) {
        contenedor.innerHTML = '<p class="text-muted">Dibuja elementos en el plano para verlos aquí.</p>';
        return;
    }
    
    let html = '<div class="list-group">';
    pisoActual.elementos.forEach((elemento, index) => {
        html += `
            <div class="list-group-item p-2">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <i class="${obtenerIconoElemento(elemento.tipo)}"></i>
                        <span class="ms-2">${elemento.tipo.charAt(0).toUpperCase() + elemento.tipo.slice(1)} ${index + 1}</span>
                    </div>
                    <div>
                        <button class="btn btn-sm btn-outline-danger" onclick="eliminarElemento(${index})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="small text-muted">
                    Tamaño: ${elemento.ancho.toFixed(2)}m x ${elemento.alto.toFixed(2)}m
                </div>
            </div>
        `;
    });
    html += '</div>';
    
    contenedor.innerHTML = html;
}

// Función auxiliar para obtener el ícono según el tipo de elemento
function obtenerIconoElemento(tipo) {
    const iconos = {
        'pared': 'bi bi-pencil',
        'puerta': 'bi bi-door-open',
        'ventana': 'bi bi-border-all',
        'habitacion': 'bi bi-house-door',
        'banio': 'bi bi-droplet',
        'cocina': 'bi bi-egg-fried',
        'sala': 'bi bi-tv',
        'comedor': 'bi bi-cup-straw'
    };
    
    return iconos[tipo] || 'bi bi-square';
}

// Función para eliminar un elemento del plano
function eliminarElemento(indice) {
    if (floors[currentFloor] && floors[currentFloor].elementos[indice]) {
        floors[currentFloor].elementos.splice(indice, 1);
        // Redibujar el plano sin el elemento eliminado
        redibujarPlano();
        actualizarElementosPlano();
    }
}

// Función para redibujar todos los elementos del plano
function redibujarPlano() {
    // Limpiar el canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar cada elemento guardado
    if (floors[currentFloor]) {
        floors[currentFloor].elementos.forEach(elemento => {
            dibujarElemento(elemento);
        });
    }
}

// Función para dibujar un elemento en el canvas
function dibujarElemento(elemento) {
    const { x, y, ancho, alto, tipo } = elemento;
    
    // Configurar el estilo según el tipo de elemento
    switch(tipo) {
        case 'pared':
            ctx.strokeStyle = '#2c3e50';
            ctx.lineWidth = WALL_THICKNESS * PIXELS_PER_METER;
            break;
        case 'puerta':
            ctx.strokeStyle = '#27ae60';
            ctx.lineWidth = 2;
            break;
        case 'ventana':
            ctx.strokeStyle = '#3498db';
            ctx.lineWidth = 1;
            // Dibujar líneas discontinuas para ventanas
            ctx.setLineDash([5, 3]);
            break;
        default:
            ctx.strokeStyle = '#7f8c8d';
            ctx.lineWidth = 2;
    }
    
    // Dibujar el elemento
    ctx.beginPath();
    ctx.rect(x, y, ancho, alto);
    ctx.stroke();
    
    // Restaurar el estilo de línea
    ctx.setLineDash([]);
}

// Función para mostrar información de los módulos
function mostrarInfo(modulo) {
    const infoDiv = document.getElementById('info-modulo');
    let contenido = '';
    
    switch(modulo) {
        case 'estructuras':
            contenido = `
                <h4>Estructuras Arquitectónicas</h4>
                <p>Las estructuras son el esqueleto de los edificios. Algunos tipos comunes incluyen:</p>
                <ul>
                    <li><strong>Estructuras de acero:</strong> Ligeras y resistentes, ideales para edificios altos.</li>
                    <li><strong>Estructuras de hormigón:</strong> Versátiles y duraderas, muy comunes en construcción.</li>
                    <li><strong>Estructuras de madera:</strong> Tradicionales y cálidas, ideales para viviendas.</li>
                </ul>
                <p>Una buena estructura debe ser estable, resistente y adecuada para el uso del edificio.</p>
            `;
            break;
            
        case 'materiales':
            contenido = `
                <h4>Materiales de Construcción</h4>
                <p>Los materiales determinan la apariencia, durabilidad y eficiencia de un edificio:</p>
                <ul>
                    <li><strong>Concreto:</strong> Resistente y versátil, para cimientos y estructuras.</li>
                    <li><strong>Vidrio:</strong> Permite la entrada de luz natural, ideal para fachadas y ventanas.</li>
                    <li><strong>Madera:</strong> Material cálido y renovable, perfecto para interiores y estructuras ligeras.</li>
                    <li><strong>Acero:</strong> Alta resistencia, usado en estructuras y elementos decorativos.</li>
                </ul>
            `;
            break;
            
        case 'diseno':
            contenido = `
                <h4>Conceptos Básicos de Diseño</h4>
                <p>El diseño arquitectónico combina estética y funcionalidad:</p>
                <ul>
                    <li><strong>Espacio:</strong> La materia prima de la arquitectura, debe organizarse de manera lógica.</li>
                    <li><strong>Luz:</strong> Juega un papel crucial en la atmósfera de un espacio.</li>
                    <li><strong>Circulación:</strong> Cómo las personas se mueven a través del espacio.</li>
                    <li><strong>Escala humana:</strong> Los espacios deben diseñarse pensando en las personas que los usarán.</li>
                </ul>
                <p>Recuerda que la buena arquitectura mejora la calidad de vida de las personas.</p>
            `;
            break;
            
        default:
            contenido = '<p>Selecciona un concepto para ver más información.</p>';
    }
    
    infoDiv.innerHTML = contenido;
    
    // Desplazamiento suave hasta la sección de información
    document.getElementById('herramientas').scrollIntoView({ behavior: 'smooth' });
}

// Inicializar el primer módulo
mostrarInfo('estructuras');
