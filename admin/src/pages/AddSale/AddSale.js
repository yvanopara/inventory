// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { api } from "../../api/api";
// import "./AddSale.css";

// export default function AddSale() {
//   const [products, setProducts] = useState([]);
//   const [formData, setFormData] = useState({
//     productId: "",
//     variantSize: "",
//     quantity: "",
//     discount: "",
//     customerPhone: "",
//     comment: ""
//   });
//   const [proofImage, setProofImage] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         const res = await api.get("/products");
//         setProducts(res.data);
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchProducts();
//   }, []);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       const data = new FormData();
//       data.append("productId", formData.productId);
//       data.append("variantSize", formData.variantSize);
//       data.append("quantity", formData.quantity);
//       data.append("discount", formData.discount || 0);
//       data.append("customerPhone", formData.customerPhone);
//       data.append("comment", formData.comment);

//       if (proofImage) {
//         data.append("proofImage", proofImage);
//       }

//       const res = await api.post("/sales", data, {
//         headers: { "Content-Type": "multipart/form-data" }
//       });

//       console.log("Vente ajoutée :", res.data);
//       navigate("/products");
//     } catch (err) {
//       console.error("Erreur lors de la vente :", err.response?.data || err.message);
//     }
//   };

//   if (loading) return <p>Chargement des produits...</p>;

//   return (
//     <div className="add-sale-container">
//       <h1>Effectuer une vente</h1>
//       <form onSubmit={handleSubmit} className="add-sale-form">
//         <label>Produit</label>
//         <select
//           name="productId"
//           value={formData.productId}
//           onChange={handleChange}
//           required
//         >
//           <option value="">Sélectionner un produit</option>
//           {products.map((product) => (
//             <option key={product._id} value={product._id}>
//               {product.name}
//             </option>
//           ))}
//         </select>

//         <label>Taille (si applicable)</label>
//         <input
//           type="text"
//           name="variantSize"
//           value={formData.variantSize}
//           onChange={handleChange}
//           placeholder="Exemple : M, L, XL"
//         />

//         <label>Quantité</label>
//         <input
//           type="number"
//           name="quantity"
//           value={formData.quantity}
//           onChange={handleChange}
//           required
//         />

//         <label>Remise</label>
//         <input
//           type="number"
//           name="discount"
//           value={formData.discount}
//           onChange={handleChange}
//         />

//         <label>Téléphone client</label>
//         <input
//           type="text"
//           name="customerPhone"
//           value={formData.customerPhone}
//           onChange={handleChange}
//         />

//         <label>Commentaire</label>
//         <input
//           type="text"
//           name="comment"
//           value={formData.comment}
//           onChange={handleChange}
//         />

//         <label>Preuve (photo optionnelle)</label>
//         <input
//           type="file"
//           onChange={(e) => setProofImage(e.target.files[0])}
//         />

//         <button type="submit">Valider la vente</button>
//       </form>
//     </div>
//   );
// }
