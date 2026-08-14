import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const initializedRef = useRef(false);

  // Lấy giờ hàng từ backend khi load trang
  useEffect(() => {
    const fetchCart = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await fetch(`\${import.meta.env.VITE_API_URL}/api/cart`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            if (data.items) {
              setCart(data.items);
              localStorage.setItem('cart', JSON.stringify(data.items));
            }
          }
        } catch (error) {
          console.error('Error fetching cart:', error);
        }
      }
      initializedRef.current = true;
    };
    fetchCart();
  }, []);

  // Đồng bộ giờ hàng lên backend mỗi khi cart thay đổi
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
    
    if (initializedRef.current) {
      const token = localStorage.getItem('token');
      if (token) {
        fetch(`\${import.meta.env.VITE_API_URL}/api/cart`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify({ items: cart })
        }).catch(err => console.error('Error syncing cart:', err));
      }
    }
  }, [cart]);

  const addToCart = (product) => {
    setCart(prevCart => {
      // Check if product with exact same specs already exists
      const existingItemIndex = prevCart.findIndex(
        item => item.id === product.id && 
                item.color === product.color && 
                item.storage === product.storage
      );

      if (existingItemIndex >= 0) {
        // Update quantity immutably
        const newCart = [...prevCart];
        const existingItem = newCart[existingItemIndex];
        newCart[existingItemIndex] = { ...existingItem, quantity: existingItem.quantity + product.quantity };
        return newCart;
      }
      // Add new item
      return [...prevCart, product];
    });
  };

  const removeFromCart = (indexToRemove) => {
    setCart(prevCart => prevCart.filter((_, index) => index !== indexToRemove));
  };

  const updateQuantity = (index, delta) => {
    setCart(prevCart => {
      const newCart = [...prevCart];
      const currentItem = newCart[index];
      const newQuantity = currentItem.quantity + delta;
      if (newQuantity > 0) {
        newCart[index] = { ...currentItem, quantity: newQuantity };
      }
      return newCart;
    });
  };

  const clearCart = () => setCart([]);
  
  const toggleCart = () => setIsCartOpen(!isCartOpen);
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  // Tính tổng số lượng item
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  
  // Tính tổng tiền
  const totalPrice = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      isCartOpen,
      toggleCart,
      openCart,
      closeCart,
      totalItems,
      totalPrice
    }}>
      {children}
    </CartContext.Provider>
  );
};
