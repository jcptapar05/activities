import { ethers } from "ethers";
import { uploadFileToIPFS, uploadJSONToIPFS } from "../services/pinata";
import { useState } from "react";
import contractData from "../utils/BookNFT.json";

const ADDRESS = "0x730C937FCB0A91d82962F66E782dcBBb6813d55E";
const contractABI = contractData.abi;

export default function BookUploadForm({ account }) {
  const [form, setForm] = useState({
    book_title: "",
    author: "",
    author_wallet_address: account || "",
    isbn: "",
    genre: "",
    price: "",
  });
  const [cover, setCover] = useState(null);
  const [pdf, setPdf] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  function validateForm() {
    let errs = {};

    if (!form.book_title.trim()) errs.book_title = "Book title is required.";
    if (!form.author.trim()) errs.author = "Author name is required.";
    if (!form.isbn.trim()) errs.isbn = "ISBN is required.";
    if (!form.genre.trim()) errs.genre = "Genre is required.";
    if (!form.price.trim() || isNaN(form.price)) errs.price = "Price must be a valid number.";
    if (!cover) errs.cover = "Cover image is required.";
    if (!pdf) errs.pdf = "PDF file is required.";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      const coverHash = await uploadFileToIPFS(cover);
      const pdfHash = await uploadFileToIPFS(pdf);

      const metadata = {
        ...form,
        cover_url: `https://gateway.pinata.cloud/ipfs/${coverHash}`,
        pdf_url: `https://gateway.pinata.cloud/ipfs/${pdfHash}`,
      };

      const metadataHash = await uploadJSONToIPFS(metadata);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(ADDRESS, contractABI, signer);

      const tx = await contract.mintBook(account, metadataHash);
      await tx.wait();

      alert("Book minted successfully!");
      setForm({
        book_title: "",
        author: "",
        author_wallet_address: account || "",
        isbn: "",
        genre: "",
        price: "",
      });
      setCover(null);
      setPdf(null);
    } catch (err) {
      console.error(err);
      alert("Failed to mint book");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4"
    >
      {/* Book Title */}
      <input
        type="text"
        placeholder="Book Title"
        value={form.book_title}
        onChange={(e) => setForm({ ...form, book_title: e.target.value })}
        className="border p-2 rounded"
      />
      {errors.book_title && <p className="text-red-500">{errors.book_title}</p>}

      {/* Author */}
      <input
        type="text"
        placeholder="Author"
        value={form.author}
        onChange={(e) => setForm({ ...form, author: e.target.value })}
        className="border p-2 rounded"
      />
      {errors.author && <p className="text-red-500">{errors.author}</p>}

      {/* ISBN */}
      <input
        type="text"
        placeholder="ISBN"
        value={form.isbn}
        onChange={(e) => setForm({ ...form, isbn: e.target.value })}
        className="border p-2 rounded"
      />
      {errors.isbn && <p className="text-red-500">{errors.isbn}</p>}

      {/* Genre */}
      <input
        type="text"
        placeholder="Genre"
        value={form.genre}
        onChange={(e) => setForm({ ...form, genre: e.target.value })}
        className="border p-2 rounded"
      />
      {errors.genre && <p className="text-red-500">{errors.genre}</p>}

      {/* Price */}
      <input
        type="number"
        step="0.01"
        placeholder="Price (ETH)"
        value={form.price}
        onChange={(e) => setForm({ ...form, price: e.target.value })}
        className="border p-2 rounded"
      />
      {errors.price && <p className="text-red-500">{errors.price}</p>}

      {/* Cover Image */}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setCover(e.target.files[0])}
        className="border p-2 rounded"
      />
      {errors.cover && <p className="text-red-500">{errors.cover}</p>}

      {/* PDF File */}
      <input
        type="file"
        accept=".pdf"
        onChange={(e) => setPdf(e.target.files[0])}
        className="border p-2 rounded"
      />
      {errors.pdf && <p className="text-red-500">{errors.pdf}</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white p-2 rounded"
      >
        {loading ? "Minting..." : "Mint Book"}
      </button>
    </form>
  );
}
