import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [productList, setProductList] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const storedProductListString = await AsyncStorage.getItem(
        '@goMarketPlace:productList',
      );

      if (!storedProductListString) return Promise.reject();

      setProductList(JSON.parse(storedProductListString));
      return Promise.resolve();
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const newProductList = [
        ...productList,
        {
          ...product,
          quantity: 1,
        },
      ];
      setProductList(newProductList);

      await AsyncStorage.setItem(
        '@goMarketPlace:productList',
        JSON.stringify(newProductList),
      );
    },
    [productList],
  );

  const increment = useCallback(
    async id => {
      const newProductList = productList.map(product => {
        if (product.id === id) {
          return {
            ...product,
            quantity: product.quantity + 1,
          };
        }
        return product;
      });
      setProductList(newProductList);

      await AsyncStorage.setItem(
        '@goMarketPlace:productList',
        JSON.stringify(newProductList),
      );
    },
    [productList],
  );

  const decrement = useCallback(
    async id => {
      const newProductList = productList.map(product => {
        if (product.id === id) {
          return {
            ...product,
            quantity: product.quantity - 1,
          };
        }
        return product;
      });
      setProductList(newProductList);

      await AsyncStorage.setItem(
        '@goMarketPlace:productList',
        JSON.stringify(newProductList),
      );
    },
    [productList],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products: productList }),
    [productList, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
