
import { useState } from 'react';
import { Search, Pencil, Package, AlertTriangle } from 'lucide-react';

function Stock() {
  const [stock, setStock] = useState([
    { stock_id: 1, fruit_name: 'Apples', packaging_size: 'SMALL', available_quantity: 100 },
    { stock_id: 2, fruit_name: 'Apples', packaging_size: 'MEDIUM', available_quantity: 50 },
    { stock_id: 3, fruit_name: 'Apples', packaging_size: 'LARGE', available_quantity: 30 },
    { stock_id: 4, fruit_name: 'Bananas', packaging_size: 'SMALL', available_quantity: 80 },
    { stock_id: 5, fruit_name: 'Bananas', packaging_size: 'MEDIUM', available_quantity: 40 },
    { stock_id: 6, fruit_name: 'Bananas', packaging_size: 'LARGE', available_quantity: 20 },
    { stock_id: 7, fruit_name: 'Oranges', packaging_size: 'SMALL', available_quantity: 70 },
    { stock_id: 8, fruit_name: 'Oranges', packaging_size: 'MEDIUM', available_quantity: 35 },
    { stock_id: 9, fruit_name: 'Oranges', packaging_size: 'LARGE', available_quantity: 15 },
    { stock_id: 10, fruit_name: 'Mangoes', packaging_size: 'SMALL', available_quantity: 60 },
    { stock_id: 11, fruit_name: 'Mangoes', packaging_size: 'MEDIUM', available_quantity: 30 },
    { stock_id: 12, fruit_name: 'Mangoes', packaging_size: 'LARGE', available_quantity: 10 },
    { stock_id: 13, fruit_name: 'Grapes', packaging_size: 'SMALL', available_quantity: 50 },
    { stock_id: 14, fruit_name: 'Grapes', packaging_size: 'MEDIUM', available_quantity: 25 },
    { stock_id: 15, fruit_name: 'Grapes', packaging_size: 'LARGE', available_quantity: 8 }
  ]);

  const [search, setSearch] = useState('');
  const [editingStock, setEditingStock] = useState(null);
  const [quantity, setQuantity] = useState('');

  const totalQuantity = stock.reduce(
    (total, item) => total + Number(item.available_quantity), 0
  );

  const lowStock = stock.filter(
    item => item.available_quantity <= 10
  ).length;

  const filteredStock = stock.filter(item =>
    `${item.fruit_name} ${item.packaging_size}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const handleUpdate = (e) => {
    e.preventDefault();

    setStock(stock.map(item =>
      item.stock_id === editingStock.stock_id
        ? { ...item, available_quantity: Number(quantity) }
        : item
    ));

    setEditingStock(null);
    setQuantity('');
  };

  return (
    <div className="stock-page">
      <div className="stock-header">
        <div>
          <h1>Stock Management</h1>
          <p>Monitor and manage available fruit quantities.</p>
        </div>
      </div>

      <div className="stock-summary">
        <div className="stock-card">
          <div className="stock-card-icon green">
            <Package size={23} />
          </div>
          <div>
            <span>Total Packages</span>
            <h2>{totalQuantity}</h2>
          </div>
        </div>

        <div className="stock-card">
          <div className="stock-card-icon orange">
            <AlertTriangle size={23} />
          </div>
          <div>
            <span>Low Stock Records</span>
            <h2>{lowStock}</h2>
          </div>
        </div>

        <div className="stock-card">
          <div className="stock-card-icon blue">
            <Package size={23} />
          </div>
          <div>
            <span>Stock Records</span>
            <h2>{stock.length}</h2>
          </div>
        </div>
      </div>

      <div className="stock-toolbar">
        <div className="search-box">
          <Search size={18} />
          <input
            placeholder="Search by fruit or size..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span>{filteredStock.length} records found</span>
      </div>

      <div className="stock-table-container">
        <table className="stock-table">
          <thead>
            <tr>
              <th>Fruit</th>
              <th>Packaging Size</th>
              <th>Available Quantity</th>
              <th>Stock Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredStock.map(item => (
              <tr key={item.stock_id}>
                <td><strong>{item.fruit_name}</strong></td>
                <td>{item.packaging_size}</td>
                <td>{item.available_quantity}</td>
                <td>
                  <span className={
                    `stock-status ${
                      item.available_quantity <= 10 ? 'low' : 'available'
                    }`
                  }>
                    {item.available_quantity <= 10 ? 'Low Stock' : 'Available'}
                  </span>
                </td>
                <td>
                  <button
                    className="edit-button"
                    onClick={() => {
                      setEditingStock(item);
                      setQuantity(item.available_quantity);
                    }}
                  >
                    <Pencil size={16} />
                  </button>
                </td>
              </tr>
            ))}

            {filteredStock.length === 0 && (
              <tr>
                <td colSpan="5" className="no-data">
                  No stock records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editingStock && (
        <div className="modal-overlay">
          <div className="supplier-modal">
            <div className="modal-header">
              <div>
                <h2>Update Stock</h2>
                <p>
                  {editingStock.fruit_name} - {editingStock.packaging_size}
                </p>
              </div>
            </div>

            <form onSubmit={handleUpdate}>
              <label>Available Quantity</label>
              <input
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setEditingStock(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  Update Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Stock;
