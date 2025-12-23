function Checkout() {
  const handleCheckout = () => {
    // later → backend creates Stripe session
    window.location.href = "https://stripe.com";
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>

      <button
        onClick={handleCheckout}
        className="bg-purple-600 text-white px-6 py-2 rounded"
      >
        Pay with Stripe
      </button>
    </div>
  );
}

export default Checkout;
