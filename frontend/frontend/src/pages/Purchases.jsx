
import { useState, useEffect } from 'react';
import { Plus, Search, ShoppingBag, X } from 'lucide-react';

const API = 'http://localhost:5000/api';

function Purchases() {
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [fruits, setFruits] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [purchaseItems, setPurchaseItems] = useState([
    { fruit_id: '', packaging_size: 'SMALL', quantity: '', unit_cost: '' }
  ]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const [purchaseRes, supplierRes, fruitRes] = await Promise.all([
        fetch(`${API}/purchases`),
        fetch(`${API}/suppliers`),
        fetch(`${API}/fruits`)
      ]);

      if (!purchaseRes.ok || !supplierRes.ok || !fruitRes.ok) {
        throw new Error('Could not load purchase information.');
      }

      const purchaseData = await purchaseRes.json();
      const supplierData = await supplierRes.json();
      const fruitData = await fruitRes.json();

      setPurchases(Array.isArray(purchaseData) ? purchaseData : []);
      setSuppliers(Array.isArray(supplierData) ? supplierData : []);
      setFruits(Array.isArray(fruitData) ? fruitData : []);
    } catch (err) {
      setError(err.message || 'Failed to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const addItem = () => {
    setPurchaseItems([
      ...purchaseItems,
      { fruit_id: '', packaging_size: 'SMALL', quantity: '', unit_cost: '' }
    ]);
  };

  const updateItem = (index, field, value) => {
    const updated = [...purchaseItems];
    updated[index][field] = value;
    setPurchaseItems(updated);
  };

  const removeItem = (index) => {
    setPurchaseItems(purchaseItems.filter((_, i) => i !== index));
  };

  const totalAmount = purchaseItems.reduce((total, item) => {
    return total + Number(item.quantity || 0) * Number(item.unit_cost || 0);
  }, 0);

  const totalPurchaseValue = purchases.reduce(
    (sum, purchase) => sum + Number(purchase.total_amount || 0),
    0
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedSupplier) {
      setError('Please select a supplier.');
      return;
    }

    const validItems = purchaseItems.every(item =>
      item.fruit_id &&
      Number(item.quantity) > 0 &&
      Number(item.unit_cost) > 0
    );

    if (!validItems) {
      setError('Please complete all purchase item fields correctly.');
      return;
    }

    try {
      setSaving(true);

      const body = {
        supplier_id: Number(selectedSupplier),
        purchase_date: new Date().toISOString().slice(0, 10),
        items: purchaseItems.map(item => ({
          fruit_id: Number(item.fruit_id),
          quantity: Number(item.quantity),
          unit_cost: Number(item.unit_cost),
          packaging_size: item.packaging_size
        }))
      };

      const response = await fetch(`${API}/purchases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Could not save purchase.');
      }

      setShowForm(false);
      setSelectedSupplier('');
      setPurchaseItems([
        { fruit_id: '', packaging_size: 'SMALL', quantity: '', unit_cost: '' }
      ]);

      await loadData();
      alert('Purchase recorded successfully!');
    } catch (err) {
      setError(err.message || 'Failed to save purchase.');
    } finally {
      setSaving(false);
    }
  };

  const filteredPurchases = purchases.filter(purchase =>
    `${purchase.purchase_id} ${purchase.business_name || ''}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="purchases-page">
      <div className="purchases-header">
        <div>
          <h1>Purchases</h1>
          <p>Record and manage fruit purchases from suppliers.</p>
        </div>

        <button className="primary-button" onClick={() => setShowForm(true)}>
          <Plus size={18} /> Record Purchase
        </button>
      </div>

      <div className="purchase-summary">
        <div>
          <ShoppingBag size={25} />
          <span>Total Purchases</span>
          <h2>{purchases.length}</h2>
        </div>

        <div>
          <span>Total Purchase Value</span>
          <h2>M{totalPurchaseValue.toFixed(2)}</h2>
        </div>
      </div>

      {error && <p className="error-message">{error}</p>}

      <div className="purchase-toolbar">
        <div className="search-box">
          <Search size={18} />
          <input
            placeholder="Search purchases..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <span>{filteredPurchases.length} purchases found</span>
      </div>

      <div className="purchase-table-container">
        <table className="purchase-table">
          <thead>
            <tr>
              <th>Purchase ID</th>
              <th>Supplier</th>
              <th>Purchase Date</th>
              <th>Items</th>
              <th>Total Amount</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="no-data">Loading purchases...</td>
              </tr>
            ) : filteredPurchases.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">No purchases found.</td>
              </tr>
            ) : (
              filteredPurchases.map(purchase => (
                <tr key={purchase.purchase_id}>
                  <td>#{purchase.purchase_id}</td>
                  <td><strong>{purchase.business_name}</strong></td>
                  <td>
                    {purchase.purchase_date
                      ? String(purchase.purchase_date).slice(0, 10)
                      : '-'}
                  </td>
                  <td>{purchase.items ?? '-'}</td>
                  <td className="purchase-amount">
                    M{Number(purchase.total_amount || 0).toFixed(2)}
                  </td>
                  <td><span className="purchase-status">Recorded</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="supplier-modal purchase-modal">
            <div className="modal-header">
              <div>
                <h2>Record New Purchase</h2>
                <p>Enter supplier and purchased fruit details.</p>
              </div>

              <button className="close-button" onClick={() => setShowForm(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <label>Select Supplier</label>
              <select
                value={selectedSupplier}
                onChange={e => setSelectedSupplier(e.target.value)}
                required
              >
                <option value="">Choose supplier</option>
                {suppliers.map(supplier => (
                  <option key={supplier.supplier_id} value={supplier.supplier_id}>
                    {supplier.business_name}
                  </option>
                ))}
              </select>

              <div className="purchase-items-heading">
                <strong>Purchase Items</strong>
                <button type="button" className="add-item-button" onClick={addItem}>
                  <Plus size={15} /> Add Item
                </button>
              </div>

              {purchaseItems.map((item, index) => (
                <div className="purchase-item-row" key={index}>
                  <div className="purchase-field">
                    <label>Fruit</label>
                    <select
                      value={item.fruit_id}
                      onChange={e => updateItem(index, 'fruit_id', e.target.value)}
                      required
                    >
                      <option value="">Select fruit</option>
                      {fruits.map(fruit => (
                        <option key={fruit.fruit_id} value={fruit.fruit_id}>
                          {fruit.fruit_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="purchase-field">
                    <label>Size</label>
                    <select
                      value={item.packaging_size}
                      onChange={e => updateItem(index, 'packaging_size', e.target.value)}
                    >
                      <option value="SMALL">Small</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="LARGE">Large</option>
                    </select>
                  </div>

                  <div className="purchase-field">
                    <label>Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={e => updateItem(index, 'quantity', e.target.value)}
                      required
                    />
                  </div>

                  <div className="purchase-field">
                    <label>Unit Cost (M)</label>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={item.unit_cost}
                      onChange={e => updateItem(index, 'unit_cost', e.target.value)}
                      required
                    />
                  </div>

                  {purchaseItems.length > 1 && (
                    <button
                      type="button"
                      className="remove-item-button"
                      onClick={() => removeItem(index)}
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}

              <div className="purchase-total">
                <span>Total Purchase Amount</span>
                <strong>M{totalAmount.toFixed(2)}</strong>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="primary-button" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Purchase'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Purchases;
