let cart = []

const addToCart = (product) => {
  const existingItem = cart.find(
    item => item.id === product.id
  )

  if (existingItem) {
    existingItem.quantity += 1
  } else {
    cart.push({
      ...product,
      quantity: 1
    })
  }
}

const removeFromCart = (productId) => {
  cart = cart.filter(
    item => item.id !== productId
  )
}

const getTotalPrice = () => {
  return cart.reduce(
    (total, item) =>
      total + item.price * item.quantity,
    0
  )
}

const getCart = () => {
  return cart
}

module.exports = {
  addToCart,
  removeFromCart,
  getTotalPrice,
  getCart
}