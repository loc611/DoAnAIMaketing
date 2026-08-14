import React, { createContext, useContext, useState } from 'react';

const CheckoutContext = createContext();

export const useCheckout = () => useContext(CheckoutContext);

/**
 * CheckoutProvider wraps the app and provides a global checkout modal.
 * Usage: call openCheckout(items) where items is an array of cart-item-shaped objects.
 */
export const CheckoutProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [checkoutItems, setCheckoutItems] = useState([]);

  const openCheckout = (items) => {
    setCheckoutItems(items);
    setIsOpen(true);
  };

  const closeCheckout = () => {
    setIsOpen(false);
    setCheckoutItems([]);
  };

  return (
    <CheckoutContext.Provider value={{ isOpen, checkoutItems, openCheckout, closeCheckout }}>
      {children}
    </CheckoutContext.Provider>
  );
};
