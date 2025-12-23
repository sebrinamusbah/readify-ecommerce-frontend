import React from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { deleteProduct } from "../features/products/productSlice";

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      dispatch(deleteProduct(product.id))
        .unwrap()
        .then(() => toast.success("Product deleted successfully!"))
        .catch(() => toast.error("Failed to delete product."));
    }
  };

  return (
    <div className="card">
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p>${product.price}</p>
      <button onClick={handleDelete} className="btn btn-red">
        Delete
      </button>
    </div>
  );
};

export default ProductCard;
