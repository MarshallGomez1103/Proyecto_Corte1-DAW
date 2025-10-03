
//URLS de la Api de google sheets
const API_SERVICIOS= "https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLj2lDd3cH4rg4fUaTdJ8K1-UXmcCdWxnJ5SzGck3YQTt3Qutu2iN85_ypSxsurkYrNCV69q7okRautRMz_17GAXJAtKbvlG3tM-rqppeV9q__6LNlSYWkTWj44BuuwnNOxbKTLiSfKZEZPYWQi5GyGsG9N0lcTfTrXZa2QoY0VB0J-n4Me__NpLKUFvLNj8U3Y5tVipCuHDdWq6OLfQWi8oNuHrNeR1oHf6klX0xPY6eLtmj389XLTueiV8vrlEWt5Qqj2fmU21VEmTdIyoH5BAnWAQ5Q&lib=M8ZCrH4fQfZ8NkbbbtWtNwRC7RMnafDNM";

// Selección del contenedor en tu index.html donde quieres mostrar productos
const container = document.querySelector(".container_citas");

async function cargarProductos() {
    try {
        const response = await fetch(API_SERCIVIOS);
        const json = await response.json();

        // Ahora accedemos a json.data, porque ahí vienen los productos
        const data = json.data;

        console.log("Productos recibidos:", data); // Para verificar

        // Limpiar el contenedor antes de renderizar
        container.innerHTML = "";

        // Iterar sobre cada producto
        data.forEach(prod => {
            const productoHTML = `
                <div class="citas">
                    <figure>
                        <img src="${prod.imagen_url}" alt="${prod.titulo}">
                    </figure>
                    <div class="info_cita">
                        <div class="info">
                            <h2 class="titulo">${prod.titulo}</h2>
                            <button class="plus">+</button>
                        </div>
                        <p class="price" data-price="${prod.precio}">$${prod.precio}</p>
                        <div class="container-info-products hidden-info">
                            <div class="descripcion hidden-info">
                                <h3>Descripción:</h3>
                                <p class="Descripcion">${prod.descripción}</p>
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
            container.innerHTML += productoHTML;
        });
    } catch (error) {
        console.error("Error cargando productos:", error);
        container.innerHTML = "<p>Error al cargar los productos. Intenta más tarde.</p>";
    }
}

// Llama la función cuando cargue la página
cargarProductos();

// Selección de elementos del DOM para el carrito flotante
const bntCart = document.querySelector(".container-icon")
const containerCartProducts = document.querySelector(".container-cart-products")

// Event listener para mostrar/ocultar el carrito al hacer clic en el icono
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
productsList.addEventListener("click", e => {
    // Verifica si el elemento clickeado tiene la clase 'btn-add-cart'
    if(e.target.classList.contains("btn-add-cart")){
        // Obtiene el elemento padre (el contenedor del producto)
        const product = e.target.parentElement
        const priceEl = product.querySelector(".price");

        // Crea un objeto con la información del producto seleccionado
        const infoProduct = {
            quantity: 1,                                           // Cantidad inicial: 1
            title: product.querySelector("h2").textContent,        // Título del producto
            price: Number(priceEl.dataset.price),                  // Precio como número para cálculos
            priceText: priceEl.textContent                         // Precio formateado para mostrar
        }

        // Verifica si el producto ya existe en el carrito
        const exist = allProducts.some(product => product.title === infoProduct.title)

        if (exist){
            // Si el producto ya existe, aumenta su cantidad en 1
            const products = allProducts.map(product =>{
                if(product.title === infoProduct.title){
                    product.quantity++;  // Incrementa la cantidad
                    return product
                } else {
                    return product       // Mantiene otros productos sin cambios
                }
            })
            // Actualiza el array de productos con las nuevas cantidades
            allProducts = [...products]

        } else {
            // Si el producto no existe en el carrito, lo agrega
            allProducts = [...allProducts, infoProduct] // Usa operador spread para combinar arrays

        }

        // Actualiza la visualización HTML del carrito
        showHTML()
    }

});


// ==================== ELIMINAR PRODUCTOS DEL CARRITO ====================

// Event listener para los botones de eliminar dentro del carrito
rowProduct.addEventListener('click', (e) => {
    // Verifica si el elemento clickeado es el icono de cerrar
    if (e.target.classList.contains('icon-close')) {
        // Encuentra el contenedor del producto a eliminar
        const productEl = e.target.closest('.cart-product');
        // Obtiene el título del producto
        const title = productEl.querySelector('.titulo-producto-carrito').textContent;

        // Busca el índice del producto en el array
        const i = allProducts.findIndex(p => p.title === title);
        if (i !== -1) {
            if (allProducts[i].quantity > 1) {
                // Si hay más de una unidad, reduce la cantidad en 1
                allProducts[i].quantity -= 1;
            } else {
                // Si solo queda una unidad, elimina el producto completamente
                allProducts.splice(i, 1);
            }
        }
        // Actualiza la visualización HTML del carrito
        showHTML();
    }
});

const btnPagar  =  document.querySelector(".btn-pagar");

// ==================== RENDERIZADO DEL CARRITO ====================//
// función para mostrar los productos en la pagina del carrito con su total //
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

    // 🔥 Guardar en localStorage cada vez que cambia
    localStorage.setItem("cart", JSON.stringify(allProducts));
}

//Aqui esta lo de la informacion de cada cita

// Seleccionar todos los elementos con clase "titulo"
const botones = document.querySelectorAll(".plus");

// Añadir event listener a cada título
botones.forEach(plus => {

    plus.addEventListener("click", () => {
        //console.log(true);

        // Buscar el contenedor de información más cercano al título
        // Subimos al padre (info_cita) y luego al siguiente hermano (container-info-products)
        const infoContainer = plus.closest(".citas").querySelector(".container-info-products");

        // Alternar la clase hidden-info para mostrar/ocultar
        if (infoContainer && infoContainer.classList.contains("container-info-products")) {
            infoContainer.classList.toggle("hidden-info");
        }
    });
});

//EL BOTON DE PAGAR 

bnt-pagar.addEventListener("click", () => {
    containerCartProducts.classList.toggle("hidden-cart")
})