document.addEventListener("DOMContentLoaded", () => {
    const fechaInput = document.getElementById("fecha");
    const tzOff = (new Date()).getTimezoneOffset() * 60000;
    const todayLocalISO = new Date(Date.now() - tzOff).toISOString().slice(0, 10);
    fechaInput.min = todayLocalISO;

    fechaInput.addEventListener("change", () => {
        if (fechaInput.value && fechaInput.value < todayLocalISO) {
            alert("⛔ La fecha no puede ser anterior a hoy.");
            fechaInput.value = todayLocalISO;
        }
    });



    const carrito = JSON.parse(localStorage.getItem("cart")) || [];
    const tabla = document.getElementById("tablaCarrito");
    const totalEl = document.getElementById("total");

    let total = 0;

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

    totalEl.textContent = "Total: $" + total.toLocaleString('es-CO');

    // Capturamos el formulario
    const form = document.getElementById("pedidoForm");
    form.addEventListener("submit", async (e) => {
        e.preventDefault();


        const fechaElegida = document.getElementById("fecha").value; // "YYYY-MM-DD"
        if (!fechaElegida) { alert("⛔ Debes elegir la fecha de la cita."); return; }
        if (fechaElegida < todayLocalISO) { alert("⛔ La fecha no puede ser anterior a hoy."); return; }


        // Datos del carrito
        const carrito = JSON.parse(localStorage.getItem("cart")) || [];
        const total = carrito.reduce((acc, p) => acc + p.price * p.quantity, 0);

        // Creamos el pedido
        const pedido = {
            orderId: Date.now(),
            nombre: document.getElementById('Nombre').value,
            telefono: document.getElementById('Celular').value,
            email: document.getElementById('Email').value,
            items: carrito,
            total: total,
            FechaISO: fechaElegida,
            FechaTexto: (() => { const [y,m,d] = fechaElegida.split("-"); return `${d}/${m}/${y}`; })(),
            fecha: fechaElegida,

        };

        try {
            const response = await fetch("https://script.google.com/macros/s/AKfycbzt6oPae9ha6xsV19rqpio2mm-8tPRDxTAz5RyjSR1w1PMy9BcAGzmQsZ3X2P4npX_V/exec", {
                method: "POST",
                mode: "no-cors", // 🔹 Esto evita el error de conexión (CORS)
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(pedido)
            });

            // Como no-cors no devuelve respuesta legible, solo notificamos éxito
            alert("✅ Pedido enviado con éxito");
            localStorage.removeItem("cart");
            form.reset();
        } catch (error) {
            console.error("Error:", error);
            alert("❌ Error al enviar el pedido. Intenta nuevamente.");
        }
    });
});