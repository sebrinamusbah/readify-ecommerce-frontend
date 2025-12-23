function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <form className="w-96 border p-6 rounded shadow">
        <h2 className="text-2xl font-bold mb-4">Register</h2>

        <input
          type="text"
          placeholder="Name"
          className="w-full border p-2 mb-3 rounded"
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 mb-3 rounded"
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 mb-4 rounded"
        />

        <button className="w-full bg-green-500 text-white py-2 rounded">
          Register
        </button>
      </form>
    </div>
  );
}

export default Register;
