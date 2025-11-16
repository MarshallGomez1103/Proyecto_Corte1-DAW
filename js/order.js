// js/order.js
async function enviarPedido(nombre, email, telefono, carrito) {
    const token = sessionStorage.getItem("token");
    const items = carrito.map(item => ({
        productId: item.id, quantity:
        item.quantity
    }));
    const body = {name: nombre, email: email, phone: telefono, items};
    const resp = await fetch(`${API_BASE}/api/orders`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(body)
    });
    if (!resp.ok) throw new Error("No se pudo registrar el pedido");
    return resp.json();
}
