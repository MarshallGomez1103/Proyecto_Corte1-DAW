const bntCart = document.querySelector(".container-icon")
const containerCartProducts = document.querySelector(".container-cart-products")

bntCart.addEventListener("click", () => {
    containerCartProducts.classList.toggle("hidden-cart")
})