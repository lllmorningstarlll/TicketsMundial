const horariosPorEstadio = { //objeto
    usa: [
        { valor: "12-jun", texto: "12 de Junio - 18:00 hrs" },
        { valor: "15-jun", texto: "15 de Junio - 20:00 hrs" }
    ],
    ca: [
        { valor: "13-jun", texto: "13 de Junio - 17:00 hrs" },
        { valor: "18-jun", texto: "18 de Junio - 19:00 hrs" }
    ],
    mex: [
        { valor: "11-jun", texto: "11 de Junio - 12:00 hrs (Inauguración)" },
        { valor: "14-jun", texto: "14 de Junio - 16:00 hrs" }
    ]
};

const preciosEstadios = {
    usa: 150,
    ca: 120,
    mex: 100
};

const selectEstadio = document.getElementById('estadio');
const selectDiaHora = document.getElementById('diaHora');
const inputCantidad = document.getElementById('cantidad');
const btnComprar = document.getElementById('btnComprar');
const listaCompras = document.getElementById('listaCompras');
const spanTotalTickets = document.getElementById('totalTickets');
const btnVaciar = document.getElementById('btnVaciar');
const contenedorTotal = document.getElementById('contenedorTotal');
const spanPrecioTotal = document.getElementById('precioTotal');
const btnImprimir = document.getElementById('btnimprimir'); 

let carritoDeCompras = JSON.parse(localStorage.getItem('misTicketsMundial')) || [];
actualizarPantallaCarrito();

function doChange() {
const change = selectEstadio.addEventListener('change', function() {
    const estadioElegido = this.value;
    selectDiaHora.innerHTML = '<option value="" disabled selected>Seleccione fecha y hora...</option>';
    selectDiaHora.disabled = false;
    Funcion(estadioElegido);
});
};
    doChange();

    function Funcion(estadioElegido) {
    const horarios = horariosPorEstadio[estadioElegido];
    if (horarios) {
        horarios.forEach(function(horario) {
            const opcion = document.createElement('option');
            opcion.value = horario.valor;
            opcion.textContent = horario.texto;
            selectDiaHora.appendChild(opcion);
            return;
        });
    };
};
    

btnComprar.addEventListener('click', function() {
    if (selectEstadio.value === "" || selectDiaHora.value === "") {
        alert("Por favor, selecciona un estadio y una fecha primero.");
        return;
    }

    const cantidadElegida = parseInt(inputCantidad.value);//Explicar .valueasnumber
    if (cantidadElegida < 1) {
        alert("Debes comprar al menos 1 ticket.");
        return;
    }

    const codigoEstadio = selectEstadio.value;
    const nombreEstadio = selectEstadio.options[selectEstadio.selectedIndex].text;
    const textoFecha = selectDiaHora.options[selectDiaHora.selectedIndex].text;
    const precioUnitario = preciosEstadios[codigoEstadio];

    const nuevaCompra = {
        estadio: nombreEstadio,
        fecha: textoFecha,
        cantidad: cantidadElegida,
        precio: precioUnitario
    };

    carritoDeCompras.push(nuevaCompra);
    guardarYActualizar();
});

btnVaciar.addEventListener('click', function() {
    if (confirm("¿Estás seguro de que quieres eliminar TODOS tus tickets?")) {
        carritoDeCompras = [];
        guardarYActualizar();
    }
});

window.eliminarParcial = function(indice) {
    const inputEliminar = document.getElementById(`inputRestar-${indice}`);
    const cantidadARestar = parseInt(inputEliminar.value);

    if (isNaN(cantidadARestar) || cantidadARestar < 1) {
        alert("Por favor ingresa una cantidad válida para eliminar.");
        return;
    }

    const compraActual = carritoDeCompras[indice];

    if (cantidadARestar >= compraActual.cantidad) {
        carritoDeCompras.splice(indice, 1);
    } else {
        compraActual.cantidad -= cantidadARestar;
    }

    guardarYActualizar();
};

function guardarYActualizar() {
    localStorage.setItem('misTicketsMundial', JSON.stringify(carritoDeCompras));
    actualizarPantallaCarrito();
}

function actualizarPantallaCarrito() {
    listaCompras.innerHTML = '';
    let contadorTotalTickets = 0;
    let sumaPrecioTotal = 0;

    carritoDeCompras.forEach(function(compra, indice) {
        contadorTotalTickets += compra.cantidad;
        const subtotalFila = compra.cantidad * (compra.precio || 0);
        sumaPrecioTotal += subtotalFila;

        const li = document.createElement('li');
        li.innerHTML = `
            <div>
                <strong>${compra.cantidad}x</strong> ${compra.estadio} <br>
                <small>${compra.fecha}</small> <br>
                <span class="precio-item">Subtotal: $${subtotalFila} USD ($${compra.precio} c/u)</span>
            </div>
            <div class="controles-eliminar">
                <input type="number" id="inputRestar-${indice}" min="1" max="${compra.cantidad}" value="1">
                <button class="btn-eliminar" onclick="eliminarParcial(${indice})">Quitar</button>
            </div>
        `;
        listaCompras.appendChild(li);
    });

    spanTotalTickets.textContent = contadorTotalTickets;
    spanPrecioTotal.textContent = sumaPrecioTotal;

    if (carritoDeCompras.length > 0) {
        contenedorTotal.style.display = 'block';
        btnVaciar.style.display = 'block';
        btnImprimir.style.display = 'block';
    } else {
        contenedorTotal.style.display = 'none';
        btnVaciar.style.display = 'none';
        btnImprimir.style.display = 'none';
    }
} 

window.imprimirTickets = function() {
    if (carritoDeCompras.length === 0) return;

    const ticketsHTML = carritoDeCompras.map((compra, i) => `
        <div class="ticket">
            <div class="ticket-header">
                <h2> MUNDIAL 2026</h2>
                <p class="num">Ticket #${i + 1}</p>
            </div>
            <div class="ticket-body">
                <p><strong>Estadio:</strong> ${compra.estadio}</p>
                <p><strong>Fecha:</strong> ${compra.fecha}</p>
                <p><strong>Cantidad:</strong> ${compra.cantidad} ticket(s)</p>
                <p><strong>Precio unitario:</strong> $${compra.precio} USD</p>
                <p><strong>Subtotal:</strong> $${compra.cantidad * compra.precio} USD</p>
            </div>
            <div class="ticket-footer">✅ Presentar al ingresar</div>
        </div>
    `).join('');

    const ventana = window.open('', '_blank');
    ventana.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Mis Tickets</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 30px; background: #f0f0f0; }
                .ticket {
                    border: 2px dashed #333;
                    border-radius: 10px;
                    padding: 20px;
                    margin: 0 auto 25px;
                    max-width: 420px;
                    background: white;
                    page-break-inside: avoid;
                }
                .ticket-header {
                    background: #003087;
                    color: white;
                    text-align: center;
                    padding: 12px;
                    border-radius: 6px 6px 0 0;
                    margin: -20px -20px 15px;
                }
                .ticket-header h2 { margin: 0; font-size: 22px; }
                .num { margin: 4px 0 0; font-size: 12px; opacity: 0.75; }
                .ticket-body p { margin: 8px 0; font-size: 15px; }
                .ticket-footer {
                    border-top: 1px dashed #999;
                    margin-top: 15px;
                    padding-top: 10px;
                    text-align: center;
                    color: #555;
                    font-size: 13px;
                }
            </style>
        </head>
        <body>${ticketsHTML}</body>
        </html>
    `);
    ventana.document.close();
    ventana.print();
};