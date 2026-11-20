
import { useState } from 'react';
import { Plus, Search, Pencil, Trash2, X } from 'lucide-react';

function Fruits() {
  const [fruits, setFruits] = useState([
    {
      fruit_id: 1,
      fruit_name: 'Apples',
      description: 'Fresh red apples',
      small_price: 30,
      medium_price: 50,
      large_price: 80,
      status: 'Available'
    },
    {
      fruit_id: 2,
      fruit_name: 'Bananas',
      description: 'Fresh yellow bananas',
      small_price: 25,
      medium_price: 45,
      large_price: 70,
      status: 'Available'
    },
    {
      fruit_id: 3,
      fruit_name: 'Oranges',
      description: 'Fresh juicy oranges',
      small_price: 28,
      medium_price: 48,
      large_price: 75,
      status: 'Available'
    },
    {
      fruit_id: 4,
      fruit_name: 'Mangoes',
      description: 'Sweet ripe mangoes',
      small_price: 35,
      medium_price: 60,
      large_price: 90,
      status: 'Available'
    },
    {
      fruit_id: 5,
      fruit_name: 'Grapes',
      description: 'Fresh seedless grapes',
      small_price: 40,
      medium_price: 65,
      large_price: 100,
      status: 'Available'
    }
  ]);

  const emptyForm = {
    fruit_name: '',
    description: '',
    small_price: '',
    medium_price: '',
    large_price: '',
    status: 'Available'
  };

  const [formData, setFormData] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Handle different status formats consistently
  const normalizeStatus = (status) => {
    const value = String(status).trim().toLowerCase();

    if (value === 'available' || value === 'active') {
      return 'Available';
    }

    return 'Unavailable';
  };

  const availableFruits = fruits.filter(
    fruit => normalizeStatus(fruit.status) === 'Available'
  ).length;

  const unavailableFruits = fruits.filter(
    fruit => normalizeStatus(fruit.status) === 'Unavailable'
  ).length;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const fruitData = {
      ...formData,
      small_price: Number(formData.small_price),
      medium_price: Number(formData.medium_price),
      large_price: Number(formData.large_price),
      status: normalizeStatus(formData.status)
    };

    if (editingId) {
      setFruits(fruits.map((fruit) =>
        fruit.fruit_id === editingId
          ? { ...fruitData, fruit_id: editingId }
          : fruit
      ));
    } else {
      setFruits([
        ...fruits,
        { ...fruitData, fruit_id: Date.now() }
      ]);
    }

    setFormData(emptyForm);
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (fruit) => {
    setFormData({
      fruit_name: fruit.fruit_name,
      description: fruit.description,
      small_price: fruit.small_price,
      medium_price: fruit.medium_price,
      large_price: fruit.large_price,
      status: normalizeStatus(fruit.status)
    });

    setEditingId(fruit.fruit_id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this fruit?')) {
      setFruits(fruits.filter(
        fruit => fruit.fruit_id !== id
      ));
    }
  };

  const filteredFruits = fruits.filter((fruit) =>
    fruit.fruit_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fruits-page">

      <div className="fruits-header">
        <div>
          <h1>Fruits</h1>
          <p>Manage fruit products and their packaging prices.</p>
        </div>

        <button
          className="primary-button"
          onClick={() => {
            setFormData(emptyForm);
            setEditingId(null);
            setShowForm(true);
          }}
        >
          <Plus size={18} /> Add Fruit
        </button>
      </div>

      {/* Fruit Summary */}
      <div className="fruit-summary">

        <div>
          <span>Total Fruits</span>
          <h2>{fruits.length}</h2>
        </div>

        <div>
          <span>Available Fruits</span>
          <h2>{availableFruits}</h2>
        </div>

        <div>
          <span>Unavailable Fruits</span>
          <h2>{unavailableFruits}</h2>
        </div>

      </div>

      {/* Search */}
      <div className="fruit-toolbar">
        <div className="search-box">
          <Search size={18} />

          <input
            placeholder="Search fruits..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <span>{filteredFruits.length} fruits found</span>
      </div>

      {/* Fruit Table */}
      <div className="fruit-table-container">
        <table className="fruit-table">

          <thead>
            <tr>
              <th>Fruit Name</th>
              <th>Description</th>
              <th>Small Price</th>
              <th>Medium Price</th>
              <th>Large Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredFruits.map((fruit) => {
              const status = normalizeStatus(fruit.status);

              return (
                <tr key={fruit.fruit_id}>

                  <td>
                    <strong>{fruit.fruit_name}</strong>
                  </td>

                  <td>{fruit.description}</td>

                  <td>
                    M{Number(fruit.small_price).toFixed(2)}
                  </td>

                  <td>
                    M{Number(fruit.medium_price).toFixed(2)}
                  </td>

                  <td>
                    M{Number(fruit.large_price).toFixed(2)}
                  </td>

                  <td>
                    <span className={`fruit-status ${status.toLowerCase()}`}>
                      {status}
                    </span>
                  </td>

                  <td>
                    <div className="table-actions">

                      <button
                        className="edit-button"
                        onClick={() => handleEdit(fruit)}
                        title="Edit Fruit"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        className="delete-button"
                        onClick={() => handleDelete(fruit.fruit_id)}
                        title="Delete Fruit"
                      >
                        <Trash2 size={16} />
                      </button>

                    </div>
                  </td>

                </tr>
              );
            })}

            {filteredFruits.length === 0 && (
              <tr>
                <td colSpan="7" className="no-data">
                  No fruits found.
                </td>
              </tr>
            )}

          </tbody>
        </table>
      </div>

      {/* Add / Edit Fruit Modal */}
      {showForm && (
        <div className="modal-overlay">

          <div className="supplier-modal">

            <div className="modal-header">
              <div>
                <h2>
                  {editingId ? 'Edit Fruit' : 'Add New Fruit'}
                </h2>

                <p>Enter fruit details and packaging prices.</p>
              </div>

              <button
                className="close-button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData(emptyForm);
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>

              <label>Fruit Name</label>
              <input
                name="fruit_name"
                value={formData.fruit_name}
                onChange={handleChange}
                placeholder="Enter fruit name"
                required
              />

              <label>Description</label>
              <input
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter description"
              />

              <label>Small Packaging Price (M)</label>
              <input
                type="number"
                name="small_price"
                min="0"
                step="0.01"
                value={formData.small_price}
                onChange={handleChange}
                required
              />

              <label>Medium Packaging Price (M)</label>
              <input
                type="number"
                name="medium_price"
                min="0"
                step="0.01"
                value={formData.medium_price}
                onChange={handleChange}
                required
              />

              <label>Large Packaging Price (M)</label>
              <input
                type="number"
                name="large_price"
                min="0"
                step="0.01"
                value={formData.large_price}
                onChange={handleChange}
                required
              />

              <label>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Available">Available</option>
                <option value="Unavailable">Unavailable</option>
              </select>

              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData(emptyForm);
                  }}
                >
                  Cancel
                </button>

                <button type="submit" className="primary-button">
                  {editingId ? 'Update Fruit' : 'Save Fruit'}
                </button>

              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Fruits;
