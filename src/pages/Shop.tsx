import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, Filter, Plus, Minus, ShoppingCart } from 'lucide-react';
import { Card, CardHeader, Button, Input, Badge } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  compare_price?: number;
  image_url?: string;
  category: string;
  in_stock: boolean;
  variants?: ProductVariant[];
}

interface ProductVariant {
  id: string;
  name: string;
  price_adjustment: number;
}

interface CartItem {
  product: Product;
  variant?: ProductVariant;
  quantity: number;
}

export const Shop: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const categories = [...new Set(products.map((p) => p.category))];

  const filteredProducts = products.filter((p) => {
    const matchesCategory = !selectedCategory || p.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (product: Product, variant?: ProductVariant) => {
    setCart((prev) => {
      const existing = prev.find(
        (item) =>
          item.product.id === product.id && item.variant?.id === variant?.id
      );
      if (existing) {
        return prev.map((item) =>
          item === existing
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, variant, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string, variantId?: string) => {
    setCart((prev) =>
      prev.filter(
        (item) =>
          !(item.product.id === productId && item.variant?.id === variantId)
      )
    );
  };

  const updateQuantity = (productId: string, variantId: string | undefined, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId && item.variant?.id === variantId) {
          const newQuantity = Math.max(0, item.quantity + delta);
          return { ...item, quantity: newQuantity };
        }
        return item;
      }).filter((item) => item.quantity > 0)
    );
  };

  const cartTotal = cart.reduce(
    (sum, item) =>
      sum +
      (item.product.price + (item.variant?.price_adjustment || 0)) *
        item.quantity,
    0
  );

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Shop</h1>
          <p className="text-zinc-400 mt-1">Premium wellness products</p>
        </div>
        <Button variant="secondary" onClick={() => setIsCartOpen(true)}>
          <ShoppingCart className="w-4 h-4 mr-2" />
          Cart ({cartCount})
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search products..."
          className="pl-10"
        />
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={cn(
            'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
            !selectedCategory
              ? 'bg-amber-500 text-zinc-950'
              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
          )}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium transition-colors capitalize',
              selectedCategory === cat
                ? 'bg-amber-500 text-zinc-950'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((product) => (
          <Card
            key={product.id}
            hover
            onClick={() => setSelectedProduct(product)}
            className="cursor-pointer"
          >
            <div className="relative h-48 mb-4 rounded-lg overflow-hidden bg-zinc-800">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBag className="w-12 h-12 text-zinc-600" />
                </div>
              )}
              {!product.in_stock && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <Badge variant="danger">Out of Stock</Badge>
                </div>
              )}
            </div>
            <h3 className="font-semibold text-zinc-100 mb-1">{product.name}</h3>
            <p className="text-sm text-zinc-500 line-clamp-2 mb-3">
              {product.description}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-amber-400">
                  ${product.price.toFixed(2)}
                </span>
                {product.compare_price && (
                  <span className="text-sm text-zinc-500 line-through">
                    ${product.compare_price.toFixed(2)}
                  </span>
                )}
              </div>
              <Badge variant="outline" size="sm" className="capitalize">
                {product.category}
              </Badge>
            </div>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <Card className="py-12 text-center">
          <ShoppingBag className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-500">No products found</p>
        </Card>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-zinc-900 rounded-2xl border border-zinc-800 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-2xl font-bold text-zinc-100">{selectedProduct.name}</h2>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-2 hover:bg-zinc-800 rounded-lg"
              >
                ✕
              </button>
            </div>

            {selectedProduct.image_url && (
              <img
                src={selectedProduct.image_url}
                alt={selectedProduct.name}
                className="w-full h-48 object-cover rounded-xl mb-6"
              />
            )}

            <p className="text-zinc-400 mb-4">{selectedProduct.description}</p>

            <div className="flex items-center gap-2 mb-6">
              <span className="text-2xl font-bold text-amber-400">
                ${selectedProduct.price.toFixed(2)}
              </span>
              {selectedProduct.compare_price && (
                <span className="text-lg text-zinc-500 line-through">
                  ${selectedProduct.compare_price.toFixed(2)}
                </span>
              )}
            </div>

            <Button
              fullWidth
              disabled={!selectedProduct.in_stock}
              onClick={() => {
                addToCart(selectedProduct);
                setSelectedProduct(null);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              {selectedProduct.in_stock ? 'Add to Cart' : 'Out of Stock'}
            </Button>
          </div>
        </div>
      )}

      {/* Cart Modal */}
      {isCartOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setIsCartOpen(false)}
        >
          <div
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-zinc-900 rounded-2xl border border-zinc-800 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-zinc-100">Your Cart</h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-zinc-800 rounded-lg"
              >
                ✕
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                <p className="text-zinc-500">Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div
                    key={`${item.product.id}-${item.variant?.id}`}
                    className="flex items-center gap-4 p-3 rounded-lg bg-zinc-800/50"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-zinc-200">{item.product.name}</p>
                      {item.variant && (
                        <p className="text-sm text-zinc-500">{item.variant.name}</p>
                      )}
                      <p className="text-amber-400">
                        ${
                          (item.product.price + (item.variant?.price_adjustment || 0)) *
                          item.quantity
                        }
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, item.variant?.id, -1)
                        }
                        className="p-1 hover:bg-zinc-700 rounded"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, item.variant?.id, 1)
                        }
                        className="p-1 hover:bg-zinc-700 rounded"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                <div className="border-t border-zinc-800 pt-4">
                  <div className="flex justify-between text-lg font-bold mb-4">
                    <span className="text-zinc-300">Total</span>
                    <span className="text-amber-400">${cartTotal.toFixed(2)}</span>
                  </div>
                  <Button fullWidth>Checkout</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
