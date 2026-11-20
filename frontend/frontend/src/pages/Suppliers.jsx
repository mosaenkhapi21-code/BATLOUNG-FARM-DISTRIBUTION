
import { useState } from 'react';
import { Plus, Search, Pencil, Trash2, X } from 'lucide-react';

function Suppliers() {
  const [suppliers, setSuppliers] = useState([
    {
      supplier_id: 1,
      business_name: 'Fresh Harvest Suppliers',
      contact_person: 'John Smith',
      phone: '58123456',
      province: 'Gauteng',
      address: 'Johannesburg'
    },
    {
      supplier_id: 2,
      business_name: 'Green Valley Farms',
      contact_person: 'Mary Jones',
      phone: '58234567',
      province: 'Free State',
      address: 'Bloemfontein'
    }
  ]);

  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const emptyForm = {
    business_name: '',
    contact_person: '',
    phone: '',
    province: '',
    address: ''
  };

  const [formData, setFormData] = useState(emptyForm);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingId) {
      setSuppliers(suppliers.map((supplier) =>
        supplier.supplier_id === editingId
          ? { ...formData, supplier_id: editingId }
          : supplier
      ));
    } else {
      setSuppliers([
        ...suppliers,
        { ...formData, supplier_id: Date.now() }
      ]);
    }

    setFormData(emptyForm);
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (supplier) => {
    setFormData({
      business_name: supplier.business_name,
      contact_person: supplier.contact_person,
      phone: supplier.phone,
      province: supplier.province,
      address: supplier.address
    });

    setEditingId(supplier.supplier_id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      setSuppliers(suppliers.filter(
        (supplier) => supplier.supplier_id !== id
      ));
    }
  };

  const filteredSuppliers = suppliers.filter((supplier) =>
    `${supplier.business_name} ${supplier.contact_person} ${supplier.province}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="suppliers-page">
      <div className="suppliers-header">
        <div>
          <h1>Suppliers</h1>
          <p>Manage the suppliers who provide fruits to your business.</p>
        </div>

        <button
          className="primary-button"
          onClick={() => {
            setFormData(emptyForm);
            setEditingId(null);
            setShowForm(true);
          }}
        >
          <Plus size={18} /> Add Supplier
        </button>
      </div>

      <div className="supplier-toolbar">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search suppliers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <span>{filteredSuppliers.length} suppliers found</span>
      </div>

      <div className="supplier-table-container">
        <table className="supplier-table">
          <thead>
            <tr>
              <th>Business Name</th>
              <th>Contact Person</th>
              <th>Phone</th>
              <th>Province</th>
              <th>Address</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredSuppliers.map((supplier) => (
              <tr key={supplier.supplier_id}>
                <td><strong>{supplier.business_name}</strong></td>
                <td>{supplier.contact_person}</td>
                <td>{supplier.phone}</td>
                <td>{supplier.province}</td>
                <td>{supplier.address}</td>
                <td>
                  <div className="table-actions">
                    <button
                      className="edit-button"
                      onClick={() => handleEdit(supplier)}
                      title="Edit supplier"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      className="delete-button"
                      onClick={() => handleDelete(supplier.supplier_id)}
                      title="Delete supplier"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredSuppliers.length === 0 && (
              <tr>
                <td colSpan="6" className="no-data">
                  No suppliers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="supplier-modal">
            <div className="modal-header">
              <div>
                <h2>{editingId ? 'Edit Supplier' : 'Add New Supplier'}</h2>
                <p>Enter the supplier's information below.</p>
              </div>

              <button
                className="close-button"
                onClick={() => setShowForm(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <label>Business Name</label>
              <input
                name="business_name"
                value={formData.business_name}
                onChange={handleChange}
                placeholder="Enter business name"
                required
              />

              <label>Contact Person</label>
              <input
                name="contact_person"
                value={formData.contact_person}
                onChange={handleChange}
                placeholder="Enter contact person"
                required
              />

              <label>Phone Number</label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                required
              />

              <label>Province</label>
              <select
                name="province"
                value={formData.province}
                onChange={handleChange}
                required
              >
                <option value="">Select province</option>
                <option value="Eastern Cape">Eastern Cape</option>
                <option value="Free State">Free State</option>
                <option value="Gauteng">Gauteng</option>
                <option value="KwaZulu-Natal">KwaZulu-Natal</option>
                <option value="Limpopo">Limpopo</option>
                <option value="Mpumalanga">Mpumalanga</option>
                <option value="Northern Cape">Northern Cape</option>
                <option value="North West">North West</option>
                <option value="Western Cape">Western Cape</option>
              </select>

              <label>Address</label>
              <input
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter address"
                required
              />

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="primary-button">
                  {editingId ? 'Update Supplier' : 'Save Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Suppliers;
