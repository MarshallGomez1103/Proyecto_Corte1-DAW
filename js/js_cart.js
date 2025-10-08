// Esperamos a que cargue el DOM para luego ejecutar toda la lógica de la página de pago.
document.addEventListener("DOMContentLoaded", () => {
    // Calculamos la zona horaria y la fecha actual en formato ISO local para definir la fecha mínima del input.
    const fechaInput = document.getElementById("fecha");
    const tzOff = (new Date()).getTimezoneOffset() * 60000;
    const todayLocalISO = new Date(Date.now() - tzOff).toISOString().slice(0, 10);
    fechaInput.min = todayLocalISO;

    // Si el usuario elige una fecha anterior a hoy, mostramos una alerta y reajustamos la fecha al mínimo.
    fechaInput.addEventListener("change", () => {
        if (fechaInput.value && fechaInput.value < todayLocalISO) {
            alert("⛔ La fecha no puede ser anterior a hoy.");
            fechaInput.value = todayLocalISO;
        }
    });


    // Cargamos el carrito almacenado en localStorage; si no existe, inicializamos con un arreglo vacío.
    const carrito = JSON.parse(localStorage.getItem("cart")) || [];
    const tabla = document.getElementById("tablaCarrito");
    const totalEl = document.getElementById("total");

    let total = 0;

    // Recorremos el arreglo carrito para crear una fila por producto, mostrar cantidad, precios y acumular el total.
    carrito.forEach(p => {
        const subtotal = p.price * p.quantity;
        total += subtotal;

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${p.title}</td>
            <td>${p.quantity}</td>
            <td>$${p.price.toLocaleString('es-CO')}</td>
            <td>$${subtotal.toLocaleString('es-CO')}</td>
        `;
        tabla.appendChild(row);
    });

    // Mostramos el total calculado en un elemento h3 con formato de moneda local.
    totalEl.textContent = "Total: $" + total.toLocaleString('es-CO');

    // Capturamos el formulario
    const form = document.getElementById("pedidoForm");

    // Al enviar el formulario, evitamos el comportamiento por defecto y ejecutamos la lógica asincrónica de envío.
    form.addEventListener("submit", async (e) => {
        e.preventDefault();


        // Obtenemos la fecha seleccionada del input tipo date en formato YYYY‑MM‑DD.
        const fechaElegida = document.getElementById("fecha").value; // "YYYY-MM-DD"

        // Validamos que el usuario haya elegido fecha y que no sea anterior a la mínima permitida; si no, mostramos alertas y detenemos el envío.
        if (!fechaElegida) { alert("⛔ Debes elegir la fecha de la cita."); return; }
        if (fechaElegida < todayLocalISO) { alert("⛔ La fecha no puede ser anterior a hoy."); return; }


        // Volvemos a leer el carrito almacenado en localStorage para asegurarnos de tener la versión más reciente.
        // Calculamos el total sumando precio x cantidad de cada ítem usando reduce().
        const carrito = JSON.parse(localStorage.getItem("cart")) || [];
        const total = carrito.reduce((acc, p) => acc + p.price * p.quantity, 0);

        // Construimos el objeto pedido con todos los datos que enviaremos: id único, datos de contacto, lista de ítems, total y fechas.
        const pedido = {
            orderId: Date.now(),
            nombre: document.getElementById('Nombre').value,
            telefono: document.getElementById('Celular').value,
            email: document.getElementById('Email').value,
            items: carrito,
            total: total,
            FechaISO: fechaElegida,
            // Formateamos la fecha de la cita en formato DD/MM/AAAA para tener un texto legible en la hoja.
            FechaTexto: (() => { const [y,m,d] = fechaElegida.split("-"); return `${d}/${m}/${y}`; })(),
            fecha: fechaElegida,

        };

        try {
            // Enviamos los datos del pedido al Apps Script mediante fetch() con metodo POST y modo no‑cors para evitar bloqueos de CORS.
            const response = await fetch("https://script.google.com/macros/s/AKfycbzt6oPae9ha6xsV19rqpio2mm-8tPRDxTAz5RyjSR1w1PMy9BcAGzmQsZ3X2P4npX_V/exec", {
                method: "POST",
                mode: "no-cors", // 🔹 Esto evita el error de conexión (CORS)
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(pedido)
            });

            // Si todo salió bien (aunque no recibamos respuesta por no-cors), notificamos al usuario, limpiamos el carrito y reseteamos el formulario.
            alert("✅ Pedido enviado con éxito");
            localStorage.removeItem("cart");
            form.reset();
        } catch (error) {
            // Si ocurre un error al enviar el pedido, mostramos el mensaje de error en consola y alertamos al usuario.
            console.error("Error:", error);
            alert("❌ Error al enviar el pedido. Intenta nuevamente.");
        }
    });
});