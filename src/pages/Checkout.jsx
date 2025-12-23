import { useSelector } from "react-redux";
import api from "../api/axios";

function Checkout() {
  const cartItems = useSelector((state) => state.cart.items);

  const handleCheckout = async () => {
    const res = await api.post("/checkout", {
      items: cartItems,
    });

    window.location.href = res.data.url; // Stripe redirect
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>

      <button
        onClick={handleCheckout}
        className="bg-green-500 text-white px-6 py-2 rounded"
      >
        Pay with Stripe
      </button>
    </div>
  );
}

export default Checkout;
