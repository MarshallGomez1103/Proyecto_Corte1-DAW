// Esperamos a que el DOM se cargue, luego llamamos a cargarProductos(), agregamos eventos de carrito y eventos de descripción.
window.addEventListener("DOMContentLoaded", async () => {
    await cargarProductos();   // Espera a que carguen los productos
    agregarEventos();          // Después conecta los eventos dinámicos
    eventosDescripcion();      // Conecta los botones "+" de descripción
});


const API_SERVICIOS = "responsible-compassion-production.up.railway.app";


// Declaramos cargarProductos() como función asincrónica para poder usar await en el fetch.
async function cargarProductos() {
    try {
        // Seleccionamos el contenedor .container_citas donde se renderizarán los servicios.
        const container = document.querySelector(".container_citas");

        // Realizamos la solicitud HTTP a la URL de la API para obtener los servicios.
        const response = await fetch(API_SERVICIOS);

        // Log basic response info to help debug (status, ok)
        console.log(`Fetch ${API_SERVICIOS} -> status: ${response.status}, ok: ${response.ok}`);

        // If the API requires authentication, provide a clear on-page message and try a local fallback.
        if (!response.ok) {
            if (response.status === 401) {
                console.warn('API returned 401 Unauthorized — frontend fetch requires a token.');
                container.innerHTML = '<p>Servicio no disponible públicamente (401 Unauthorized). Para desarrollo, coloque un archivo de prueba en <code>js/mock_products.json</code> o configure el endpoint para acceso público.</p>';

                // Try to load a local mock JSON (developer convenience). This avoids exposing tokens in frontend.
                try {
                    const mockResp = await fetch('js/mock_products.json');
                    if (mockResp.ok) {
                        const mockJson = await mockResp.json();
                        // use the mock data if it's an array or in a data property
                        const mockData = Array.isArray(mockJson) ? mockJson : (mockJson.data || mockJson.items || []);
                        if (mockData && mockData.length) {
                            console.log('Loaded local mock_products.json for development.');
                            data = mockData;
                        }
                    } else {
                        console.info('No local mock_products.json found (or non-ok).');
                    }
                } catch (e) {
                    console.info('Failed to load local mock_products.json:', e);
                }
            } else {
                console.error('Fetch failed with status', response.status);
                container.innerHTML = `<p>Error cargando servicios (status ${response.status}). Revisa la consola.</p>`;
            }
        }

       // Convertimos la respuesta en un objeto JavaScript usando response.json()
const json = await response.json();

let data = [];
if (Array.isArray(json)) {
    data = json;
} else if (json && typeof json === 'object') {
    // Ajusta aquí según los nombres reales que devuelva tu API
    data = json.data || json.items || json.services || json.result || [];
}

// Para depurar: imprime la respuesta completa y los datos inferidos
console.log("Respuesta completa de la API:", json);
console.log("Productos recibidos (inferred):", data);


        // Limpiamos el contenedor antes de insertar las nuevas tarjetas para evitar duplicados.
        container.innerHTML = "";

        // If no data, show a friendly message instead of throwing an error.
        if (!data || !data.length) {
            console.warn('No products returned by API or empty array. Full response:', json);
            container.innerHTML = '<p>No hay servicios disponibles por el momento.</p>';
            return;
        }

        // Iteramos sobre cada objeto de data para construir la tarjeta de servicio con sus datos (imagen, título, precio, video...).
        data.forEach(prod => {
            const productoHTML = `
    <div class="citas" data-id="${prod.id}">
        <figure>
            <img src="${prod.imagen_url}" alt="${prod.titulo}">
        </figure>
        <div class="info_cita" data-id="${prod.id}">
            <div class="info">
                <h2 class="titulo">${prod.titulo}</h2>
                <button class="plus">+</button>
            </div>
            <p class="price" data-price="${prod.precio}">$${prod.precio}</p>
            <div class="container-info-products hidden-info">
                <div class="descripcion hidden-info">
                    <h3>Descripción:</h3>
                    <p class="descripcion">${prod.descripcion}</p>
                </div>
                ${prod.video_url ? `
                <div class="video">
                    <iframe width="100%" height="200" src="${prod.video_url}" frameborder="0" allowfullscreen></iframe>
                </div>` : ""}
            </div>
            <button class="boton btn-add-cart">Add to cart</button>
        </div>
    </div>
`;

            // Añadimos el HTML generado de cada servicio al contenedor de la página.
            container.innerHTML += productoHTML;
        });
        // Si ocurre algún error en la carga de productos (red, JSON), lo mostramos en consola y en la página.
    } catch (error) {
        console.error("Error cargando productos:", error);
        document.querySelector(".container_citas").innerHTML = "<p>Error al cargar los productos. Intenta más tarde.</p>";
    }
}

// Seleccionamos en el DOM los elementos relacionados con el carrito flotante: icono y contenedor.
const bntCart = document.querySelector(".container-icon")
const containerCartProducts = document.querySelector(".container-cart-products")

// Al hacer clic en el icono del carrito, alternamos la visibilidad del panel flotante con toggle().
bntCart.addEventListener("click", () => {
    containerCartProducts.classList.toggle("hidden-cart")
})

// ==================== ELEMENTOS DEL CARRITO ====================

// Elementos DOM para la estructura del carrito
const cartInfo = document.querySelector(".cart-product")
const rowProduct = document.querySelector(".row-product")

// Contenedor principal de todos los productos disponibles en la tienda
const productsList = document.querySelector(".container_citas")

// Variables principales del carrito
// ---------------------------------
// Array que almacena todos los productos añadidos al carrito
// Cada producto es un objeto con: quantity, title, price, priceText
let allProducts = []

// Elemento que muestra el valor total de la compra
const valorTotal = document.querySelector(".total-pagar")

// Contador que muestra el número total de productos en el carrito
const countProducts = document.querySelector("#contador-productos")

// Elementos para mostrar estados del carrito (vacío o con productos)
const cartEmpty = document.querySelector('.cart-empty');    // Mensaje de carrito vacío
const cartTotal = document.querySelector('.cart-total');    // Sección que muestra el total


// ==================== AGREGAR PRODUCTOS AL CARRITO ====================

// Event listener para los botones "Agregar al carrito" en la lista de productos

// Función que se ejecutará después de cargar los productos y enlaza los eventos para añadir al carrito.
function agregarEventos(){
    productsList.addEventListener("click", e => {
        if(e.target.classList.contains("btn-add-cart")){
            const product = e.target.closest(".info_cita");
            const priceEl = product.querySelector(".price");

            const infoProduct = {
                id: product.dataset.id, // ID único
                quantity: 1,
                title: product.querySelector("h2").textContent,
                price: Number(priceEl.dataset.price),
                priceText: priceEl.textContent
            };

            const exist = allProducts.some(p => p.id === infoProduct.id);

            if (exist){
                allProducts = allProducts.map(p =>{
                    if(p.id === infoProduct.id){
                        p.quantity++;
                    }
                    return p;
                });
            } else {
                allProducts.push(infoProduct);
            }

            showHTML();
        }
    });
}




// ==================== ELIMINAR PRODUCTOS DEL CARRITO ====================

// Delegamos en rowProduct el evento de clic para manejar la eliminación de productos del carrito.
// ==================== ELIMINAR PRODUCTOS DEL CARRITO ====================

// Delegamos en rowProduct el evento de clic para manejar la eliminación de productos del carrito.
rowProduct.addEventListener('click', (e) => {
    if (e.target.classList.contains('icon-close')) {
        // Encuentra el contenedor del producto a eliminar
        const productEl = e.target.closest('.cart-product');
        // Obtiene el ID único del producto desde el atributo data-id
        const id = productEl.dataset.id;

        // Buscamos en allProducts el índice del producto con el mismo ID
        const i = allProducts.findIndex(p => p.id === id);
        if (i !== -1) {
            if (allProducts[i].quantity > 1) {
                allProducts[i].quantity -= 1;
            } else {
                allProducts.splice(i, 1);
            }
        }
        showHTML();
    }
});


const btnPagar  =  document.querySelector(".btn-pagar");

// ==================== RENDERIZADO DEL CARRITO ====================//
// Función que renderiza el contenido del carrito flotante y actualiza totales y visibilidad según haya productos o no.

const showHTML = () => {
    if (!allProducts.length) {
        cartEmpty.classList.remove('hidden');
        btnPagar.classList.add("hidden");
        rowProduct.classList.add('hidden');
        cartTotal.classList.add('hidden');
        rowProduct.innerHTML = '';
    } else {
        cartEmpty.classList.add('hidden');
        rowProduct.classList.remove('hidden');
        cartTotal.classList.remove('hidden');
        btnPagar.classList.remove("hidden");
    }

    rowProduct.innerHTML = "";
    let total = 0;
    let totalOfProducts = 0;

    allProducts.forEach(product => {
        const containerProduct = document.createElement("div");
        containerProduct.classList.add("cart-product");
        // Guardamos el ID en data-id para poder eliminarlo después
        containerProduct.dataset.id = product.id;
        containerProduct.innerHTML = `
            <div class="info-cart-product">
                <span class="cantidad-producto-carrito">${product.quantity}</span>
                <p class="titulo-producto-carrito">${product.title}</p>
                <span class="precio-producto-carrito">$${product.price.toLocaleString('es-CO')}</span>
            </div>
            <ion-icon name="close-outline" class="icon-close"></ion-icon>
        `;
        rowProduct.append(containerProduct);
        total += product.quantity * product.price;
        totalOfProducts += product.quantity;
    });

    valorTotal.innerText = `$${total.toLocaleString('es-CO')}`;
    countProducts.innerText = totalOfProducts;

    localStorage.setItem("cart", JSON.stringify(allProducts));
};


//Aqui esta lo de la informacion de cada cita

// Función que registra un evento global para desplegar/ocultar la información detallada de cada servicio.
function eventosDescripcion(){
    document.addEventListener("click", (e) => {
        if(e.target.classList.contains("plus")){
            const infoContainer = e.target.closest(".citas").querySelector(".container-info-products");
            if (infoContainer) {

                // Muestra u oculta el contenedor de descripción al pulsar el botón “+”.
                infoContainer.classList.toggle("hidden-info");
            }
        }
    });
}

// BOTÓN QUE ABRE EL MODAL
const btnOpenLogin = document.querySelector('.login_user');

// MODAL DE LOGIN
const loginModal = document.getElementById('loginModal');

// BOTÓN DE CERRAR
const btnCloseLogin = document.getElementById('btnClose');

// ABRIR MODAL AL HACER CLIC EN EL ÍCONO
btnOpenLogin.addEventListener('click', () => {
    loginModal.classList.remove('hidden');
});

// CERRAR MODAL AL HACER CLIC EN "Cancelar"
btnCloseLogin.addEventListener('click', () => {
    loginModal.classList.add('hidden');
});

// BOTÓN QUE ABRE EL MODAL DE REGISTRO
const btnOpenRegister = document.querySelector('.register_user');

// MODAL DE REGISTRO
const registerModal = document.getElementById('registerModal');

// BOTÓN QUE CIERRA EL MODAL
const btnCloseRegister = document.getElementById('btnCloseRegister');

// ABRIR MODAL DE REGISTRO
btnOpenRegister.addEventListener('click', () => {
    registerModal.classList.remove('hidden');
});

// CERRAR MODAL DE REGISTRO
btnCloseRegister.addEventListener('click', () => {
    registerModal.classList.add('hidden');
});