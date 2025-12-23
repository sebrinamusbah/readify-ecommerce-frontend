import { useDispatch, useSelector } from "react-redux";
import { removeFromCart, updateQuantity } from "../features/cart/cartSlice";
import { Link } from "react-router-dom";

function Cart() {
  const dispatch = useDispatch();
  const items = useSelector((state) => state.cart.items);

  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="p-6">
        <h2 className="text-xl">Your cart is empty</h2>
        <Link to="/" className="text-blue-500">
          Go shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>

      {items.map((item) => (
        <div
          key={item.product.id}
          className="flex justify-between items-center border-b py-4"
        >
          <div>
            <h2 className="font-semibold">{item.product.name}</h2>
            <p>${item.product.price}</p>
          </div>

          <input
            type="number"
            min="1"
            value={item.quantity}
            onChange={(e) =>
              dispatch(
                updateQuantity({
                  id: item.product.id,
                  quantity: Number(e.target.value),
                })
              )
            }
            className="w-16 border p-1"
          />

          <button
            onClick={() => dispatch(removeFromCart(item.product.id))}
            className="text-red-500"
          >
            Remove
          </button>
        </div>
      ))}

      <div className="mt-6 text-xl font-bold">Total: ${total.toFixed(2)}</div>

      <Link
        to="/checkout"
        className="inline-block mt-4 bg-green-500 text-white px-6 py-2 rounded"
      >
        Proceed to Checkout
      </Link>
    </div>
  );
}

export default Cart;
