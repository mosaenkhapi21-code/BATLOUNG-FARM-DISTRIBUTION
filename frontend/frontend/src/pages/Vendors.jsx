
import { useState } from 'react';
import { Plus, Search, Pencil, Trash2, X, Users } from 'lucide-react';

function Vendors() {
  const [vendors, setVendors] = useState([
    {
      vendor_id: 1,
      vendor_name: 'Maseru Street Vendors',
      phone_number: '58111222',
      location: 'Maseru',
      registration_date: '2026-11-10'
    },
    {
      vendor_id: 2,
      vendor_name: 'Fresh Market Traders',
      phone_number: '58222333',
      location: 'Maseru',
      registration_date: '2026-11-11'
    },
    {
      vendor_id: 3,
      vendor_name: 'City Fruit Shop',
      phone_number: '58333444',
      location: 'Maseru',
      registration_date: '2026-11-12'
    },
    {
      vendor_id: 4,
      vendor_name: 'Green Basket Store',
      phone_number: '58444555',
      location: 'Leribe',
      registration_date: '2026-11-13'
    },
    {
      vendor_id: 5,
      vendor_name: 'Healthy Foods Market',
      phone_number: '58555666',
      location: 'Mafeteng',
      registration_date: '2026-11-14'
    }
  ]);

  const emptyForm = {
    vendor_name: '',
    phone_number: '',
    location: ''
  };

  const [formData, setFormData] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingId) {
      setVendors(vendors.map(vendor =>
        vendor.vendor_id === editingId
          ? { ...formData, vendor_id: editingId, registration_date: vendor.registration_date }
          : vendor
      ));
    } else {
      setVendors([
        ...vendors,
        {
          ...formData,
          vendor_id: Date.now(),
          registration_date: new Date().toISOString().slice(0, 10)
        }
      ]);
    }

    setFormData(emptyForm);
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (vendor) => {
    setFormData({
      vendor_name: vendor.vendor_name,
      phone_number: vendor.phone_number,
      location: vendor.location
    });

    setEditingId(vendor.vendor_id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this vendor?')) {
      setVendors(vendors.filter(vendor => vendor.vendor_id !== id));
    }
  };

  const filteredVendors = vendors.filter(vendor =>
    `${vendor.vendor_name} ${vendor.phone_number} ${vendor.location}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="vendors-page">
      <div className="vendors-header">
        <div>
          <h1>Vendors</h1>
          <p>Manage retailers and customers who purchase fruits.</p>
        </div>

        <button
          className="primary-button"
          onClick={() => {
            setFormData(emptyForm);
            setEditingId(null);
            setShowForm(true);
          }}
        >
          <Plus size={18} /> Add Vendor
        </button>
      </div>

      <div className="vendor-summary">
        <div className="vendor-summary-icon">
          <Users size={25} />
        </div>
        <div>
          <span>Total Registered Vendors</span>
          <h2>{vendors.length}</h2>
        </div>
      </div>

      <div className="vendor-toolbar">
        <div className="search-box">
          <Search size={18} />
          <input
            placeholder="Search vendors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span>{filteredVendors.length} vendors found</span>
      </div>

      <div className="vendor-table-container">
        <table className="vendor-table">
          <thead>
            <tr>
              <th>Vendor Name</th>
              <th>Phone Number</th>
              <th>Location</th>
              <th>Registration Date</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredVendors.map(vendor => (
              <tr key={vendor.vendor_id}>
                <td><strong>{vendor.vendor_name}</strong></td>
                <td>{vendor.phone_number}</td>
                <td>{vendor.location}</td>
                <td>{vendor.registration_date}</td>
                <td>
                  <div className="table-actions">
                    <button
                      className="edit-button"
                      onClick={() => handleEdit(vendor)}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => handleDelete(vendor.vendor_id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredVendors.length === 0 && (
              <tr>
                <td colSpan="5" className="no-data">
                  No vendors found.
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
                <h2>{editingId ? 'Edit Vendor' : 'Add New Vendor'}</h2>
                <p>Enter vendor information below.</p>
              </div>

              <button
                className="close-button"
                onClick={() => setShowForm(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <label>Vendor Name</label>
              <input
                name="vendor_name"
                value={formData.vendor_name}
                onChange={handleChange}
                placeholder="Enter vendor name"
                required
              />

              <label>Phone Number</label>
              <input
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="Enter phone number"
                required
              />

              <label>Location</label>
              <input
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter vendor location"
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
                  {editingId ? 'Update Vendor' : 'Save Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Vendors;
