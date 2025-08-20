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
// ==================== RENDERIZADO DEL CARRITO ====================

// Función para actualizar el HTML del carrito basado en el estado actual
const showHTML = () => {
    // Verifica si el carrito está vacío
    if (!allProducts.length) {
        // Si está vacío, muestra el mensaje "carrito vacío"
        cartEmpty.classList.remove('hidden');
        btnPagar.classList.add("hidden")
        // Oculta la sección de productos y el total
        rowProduct.classList.add('hidden');
        cartTotal.classList.add('hidden');

        rowProduct.innerHTML = '';

    } else {
        // Si hay productos, oculta el mensaje "carrito vacío"
        cartEmpty.classList.add('hidden');
        // Muestra la sección de productos y el total
        rowProduct.classList.remove('hidden');
        cartTotal.classList.remove('hidden');
        btnPagar.classList.remove("hidden");
        
    }

    // Limpia el contenido actual del carrito
    rowProduct.innerHTML = "";

    // Variables para calcular el total monetario y la cantidad de productos
    let total = 0;
    let totalOfProducts = 0;

    // Recorre todos los productos en el carrito
    allProducts.forEach(product => {
        // Crea un contenedor para cada producto
        const containerProduct = document.createElement("div")
        containerProduct.classList.add("cart-product")

        // Genera el HTML para el producto en el carrito
        containerProduct.innerHTML = `
            <div class="info-cart-product">
                <span class="cantidad-producto-carrito">${product.quantity}</span>
                <p class="titulo-producto-carrito">${product.title}</p>
                <span class="precio-producto-carrito">${product.priceText}</span>
            </div>
            <ion-icon name="close-outline" class="icon-close"></ion-icon>
        `

        // Añade el producto al contenedor del carrito
        rowProduct.append(containerProduct);

        // Actualiza el total monetario (precio × cantidad)
        total += product.quantity * product.price;

        // Actualiza el contador total de productos
        totalOfProducts = totalOfProducts + product.quantity;
    });

    // Actualiza el texto del total monetario con formato de moneda colombiana
    valorTotal.innerText = `$` + total.toLocaleString('es-CO');
    // Actualiza el contador de productos en el carrito
    countProducts.innerText = totalOfProducts;
}

// Inicializa la visualización del carrito al cargar la página
showHTML()




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

//LOCAL STORAGE PARA EL CARRITO

localStorage.setItem("cart", JSON.stringify(allProducts));
const carrito = JSON.parse(localStorage.getItem("cart")) || [];
showHTML();