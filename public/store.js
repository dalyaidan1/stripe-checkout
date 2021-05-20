
if (document.readyState == 'loading') {
    document.addEventListener('DOMContentLoaded', ready)
} else {
    ready()
}

function ready() {
    const removeCartItemButtons = document.getElementsByClassName('btn-danger')
    for (let i = 0; i < removeCartItemButtons.length; i++) {
        const button = removeCartItemButtons[i]
        button.addEventListener('click', removeCartItem)
    }

    const quantityInputs = document.getElementsByClassName('cart-quantity-input')
    for (let i = 0; i < quantityInputs.length; i++) {
        const input = quantityInputs[i]
        input.addEventListener('change', quantityChanged)
    }

    const addToCartButtons = document.getElementsByClassName('shop-item-button')
    for (let i = 0; i < addToCartButtons.length; i++) {
        const button = addToCartButtons[i]
        button.addEventListener('click', addToCartClicked)
    }

    document.getElementsByClassName('btn-purchase')[0].addEventListener('click', purchaseClicked)
}
const stripe = Stripe(stripePublicKey)
// key: pid, value: quantity
const productSelections = {}

async function purchaseClicked() {
    let quantity = parseInt(document.getElementsByClassName("cart-quantity-input")[0].value)
    let product = document.getElementsByClassName("cart-item-title")[0].getAttribute("data-item-id")
    let pType = document.getElementsByClassName("cart-item-title")[0].getAttribute("data-item-type")
    console.log(product);
    fetch("/create-checkout-session", {
        method: "POST",
        headers: {
            "Content-Type" : "application/json",
        },
        body: JSON.stringify({
            productSelections: productSelections,
        }),
    })
    .then((response) => response.json())
    .then((session) => {
       stripe.redirectToCheckout({sessionId: session.id})
    })
    .catch((error) => {
        console.log(`Error: ${error}`)
    })
    updateCartTotal()
}


function removeCartItem(event) {
    const buttonClicked = event.target
    buttonClicked.parentElement.parentElement.remove()
    updateCartTotal()
}

function quantityChanged(event) {
    const input = event.target
    if (isNaN(input.value) || input.value <= 0) {
        input.value = 1
    }
    const productID = input.parentElement.parentElement.getElementsByClassName("cart-item-title")[0].getAttribute("data-item-id")
    productSelections[productID] = parseInt(input.value)
    updateCartTotal()
}

function addToCartClicked(event) {
    const button = event.target
    const shopItem = button.parentElement.parentElement
    const title = shopItem.getElementsByClassName('shop-item-title')[0].innerText
    const price = shopItem.getElementsByClassName('shop-item-price')[0].innerText
    const imageSrc = shopItem.getElementsByClassName('shop-item-image')[0].src
    const product = this.parentElement.parentElement.getAttribute("data-item-id")
    const pType = this.parentElement.parentElement.getAttribute("data-item-type")
    addItemToCart(title, price, imageSrc, product, pType)
    updateCartTotal()
}

function addItemToCart(title, price, imageSrc, product, pType) {
    let cartRow = document.createElement('div')
    cartRow.classList.add('cart-row')
    let cartItems = document.getElementsByClassName('cart-items')[0]
    let cartItemNames = cartItems.getElementsByClassName('cart-item-title')
    for (let i = 0; i < cartItemNames.length; i++) {
        if (cartItemNames[i].innerText == title) {
            alert('This item is already added to the cart')
            return
        }
    }
    let cartRowContents = `
        <div class="cart-item cart-column">
            <img class="cart-item-image" src="${imageSrc}" width="100" height="100">
            <span class="cart-item-title" data-item-id="${product}" data-item-type="${pType}">${title}</span>
        </div>
        <span class="cart-price cart-column">${price}</span>
        <div class="cart-quantity cart-column">
            <input class="cart-quantity-input" type="number" value="1">
            <button class="btn btn-danger" type="button">REMOVE</button>
        </div>`
    cartRow.innerHTML = cartRowContents
    cartItems.append(cartRow)
    productSelections[product] = 1
    console.log(productSelections)
    cartRow.getElementsByClassName('btn-danger')[0].addEventListener('click', removeCartItem)
    cartRow.getElementsByClassName('cart-quantity-input')[0].addEventListener('change', quantityChanged)
}

function updateCartTotal() {
    const cartItemContainer = document.getElementsByClassName('cart-items')[0]
    const cartRows = cartItemContainer.getElementsByClassName('cart-row')
    let total = 0
    for (let i = 0; i < cartRows.length; i++) {
        let cartRow = cartRows[i]
        const priceElement = cartRow.getElementsByClassName('cart-price')[0]
        const quantityElement = cartRow.getElementsByClassName('cart-quantity-input')[0]
        const price = parseFloat(priceElement.innerText.replace('$', ''))
        const quantity = quantityElement.value
        total = total + (price * quantity)
    }
    total = Math.round(total * 100) / 100
    document.getElementsByClassName('cart-total-price')[0].innerText = '$' + total
}