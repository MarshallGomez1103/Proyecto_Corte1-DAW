document.addEventListener("DOMContentLoaded", () => {
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
});
