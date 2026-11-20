
import { useState } from 'react';
import { Plus, Search, ShoppingCart, X } from 'lucide-react';

function Sales() {
  const [sales, setSales] = useState([]);

  const vendors = [
    'Maseru Street Vendors',
    'Fresh Market Traders',
    'City Fruit Shop',
    'Green Basket Store',
    'Healthy Foods Market'
  ];

  const fruits = ['Apples', 'Bananas', 'Oranges', 'Mangoes', 'Grapes'];

  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedVendor, setSelectedVendor] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [paymentStatus, setPaymentStatus] = useState('PAID');
  const [amountPaid, setAmountPaid] = useState('');
  const [saleItems, setSaleItems] = useState([
    { fruit_name: '', packaging_size: 'SMALL', quantity: '', unit_price: '' }
  ]);

  const addItem = () => {
    setSaleItems([
      ...saleItems,
      { fruit_name: '', packaging_size: 'SMALL', quantity: '', unit_price: '' }
    ]);
  };

  const updateItem = (index, field, value) => {
    const updated = [...saleItems];
    updated[index][field] = value;
    setSaleItems(updated);
  };

  const removeItem = (index) => {
    setSaleItems(saleItems.filter((_, i) => i !== index));
  };

  const totalAmount = saleItems.reduce((total, item) => {
    return total + Number(item.quantity || 0) * Number(item.unit_price || 0);
  }, 0);

  const balance = Math.max(0, totalAmount - Number(amountPaid || 0));

  const handleSubmit = (e) => {
    e.preventDefault();

    if (Number(amountPaid) > totalAmount) {
      alert('Amount paid cannot be greater than the sale total.');
      return;
    }

    const newSale = {
      sale_id: Date.now(),
      vendor: selectedVendor,
      sale_date: new Date().toISOString().slice(0, 10),
      total_amount: totalAmount,
      amount_paid: Number(amountPaid),
      payment_method: paymentMethod,
      payment_status: balance === 0 ? 'PAID' : Number(amountPaid) > 0 ? 'PARTIALLY_PAID' : 'UNPAID',
      items: saleItems.length
    };

    setSales([newSale, ...sales]);
    setShowForm(false);
    setSelectedVendor('');
    setPaymentMethod('CASH');
    setPaymentStatus('PAID');
    setAmountPaid('');
    setSaleItems([
      { fruit_name: '', packaging_size: 'SMALL', quantity: '', unit_price: '' }
    ]);
  };

  const filteredSales = sales.filter(sale =>
    `${sale.sale_id} ${sale.vendor}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="sales-page">
      <div className="sales-header">
        <div>
          <h1>Sales</h1>
          <p>Record and manage fruit sales to vendors.</p>
        </div>

        <button className="primary-button" onClick={() => setShowForm(true)}>
          <Plus size={18} /> Record Sale
        </button>
      </div>

      <div className="sales-summary">
        <div>
          <ShoppingCart size={25} />
          <span>Total Sales</span>
          <h2>{sales.length}</h2>
        </div>
        <div>
          <span>Total Revenue</span>
          <h2>
            M{sales.reduce((sum, sale) => sum + sale.total_amount, 0).toFixed(2)}
          </h2>
        </div>
        <div>
          <span>Outstanding Balance</span>
          <h2>
            M{sales.reduce((sum, sale) => sum + (sale.total_amount - sale.amount_paid), 0).toFixed(2)}
          </h2>
        </div>
      </div>

      <div className="sales-toolbar">
        <div className="search-box">
          <Search size={18} />
          <input
            placeholder="Search sales..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span>{filteredSales.length} sales found</span>
      </div>

      <div className="sales-table-container">
        <table className="sales-table">
          <thead>
            <tr>
              <th>Sale ID</th>
              <th>Vendor</th>
              <th>Date</th>
              <th>Items</th>
              <th>Total</th>
              <th>Paid</th>
              <th>Payment Status</th>
            </tr>
          </thead>

          <tbody>
            {filteredSales.map(sale => (
              <tr key={sale.sale_id}>
                <td>#{sale.sale_id}</td>
                <td><strong>{sale.vendor}</strong></td>
                <td>{sale.sale_date}</td>
                <td>{sale.items}</td>
                <td>M{sale.total_amount.toFixed(2)}</td>
                <td>M{sale.amount_paid.toFixed(2)}</td>
                <td>
                  <span className={`sale-status ${sale.payment_status.toLowerCase()}`}>
                    {sale.payment_status.replace('_', ' ')}
                  </span>
                </td>
              </tr>
            ))}

            {filteredSales.length === 0 && (
              <tr>
                <td colSpan="7" className="no-data">No sales recorded yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="supplier-modal sale-modal">
            <div className="modal-header">
              <div>
                <h2>Record New Sale</h2>
                <p>Enter vendor, fruit and payment details.</p>
              </div>
              <button className="close-button" onClick={() => setShowForm(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <label>Select Vendor</label>
              <select
                value={selectedVendor}
                onChange={(e) => setSelectedVendor(e.target.value)}
                required
              >
                <option value="">Choose vendor</option>
                {vendors.map(vendor => (
                  <option key={vendor} value={vendor}>{vendor}</option>
                ))}
              </select>

              <div className="sale-items-heading">
                <strong>Sale Items</strong>
                <button type="button" className="add-item-button" onClick={addItem}>
                  <Plus size={15} /> Add Item
                </button>
              </div>

              {saleItems.map((item, index) => (
                <div className="sale-item-row" key={index}>
                  <div className="sale-field">
                    <label>Fruit</label>
                    <select
                      value={item.fruit_name}
                      onChange={(e) => updateItem(index, 'fruit_name', e.target.value)}
                      required
                    >
                      <option value="">Select fruit</option>
                      {fruits.map(fruit => (
                        <option key={fruit} value={fruit}>{fruit}</option>
                      ))}
                    </select>
                  </div>

                  <div className="sale-field">
                    <label>Size</label>
                    <select
                      value={item.packaging_size}
                      onChange={(e) => updateItem(index, 'packaging_size', e.target.value)}
                    >
                      <option value="SMALL">Small</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="LARGE">Large</option>
                    </select>
                  </div>

                  <div className="sale-field">
                    <label>Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                      required
                    />
                  </div>

                  <div className="sale-field">
                    <label>Unit Price (M)</label>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={item.unit_price}
                      onChange={(e) => updateItem(index, 'unit_price', e.target.value)}
                      required
                    />
                  </div>

                  {saleItems.length > 1 && (
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

              <div className="sale-payment-fields">
                <div>
                  <label>Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="CASH">Cash</option>
                    <option value="MOBILE_MONEY">Mobile Money</option>
                    <option value="CREDIT">Credit</option>
                  </select>
                </div>

                <div>
                  <label>Payment Status</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                  >
                    <option value="PAID">Paid</option>
                    <option value="PARTIALLY_PAID">Partially Paid</option>
                    <option value="UNPAID">Unpaid</option>
                  </select>
                </div>

                <div>
                  <label>Amount Paid (M)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="sale-total">
                <div>
                  <span>Total Sale</span>
                  <strong>M{totalAmount.toFixed(2)}</strong>
                </div>
                <div>
                  <span>Balance Due</span>
                  <strong>M{balance.toFixed(2)}</strong>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  Save Sale
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sales;
