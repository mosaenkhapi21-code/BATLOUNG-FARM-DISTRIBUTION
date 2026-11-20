
function Reports() {
  const fruitStock = [
    { name: 'Apples', small: 100, medium: 50, large: 30 },
    { name: 'Bananas', small: 80, medium: 40, large: 20 },
    { name: 'Oranges', small: 70, medium: 35, large: 15 },
    { name: 'Mangoes', small: 60, medium: 30, large: 10 },
    { name: 'Grapes', small: 50, medium: 25, large: 8 }
  ];

  const totalPackages = fruitStock.reduce(
    (sum, fruit) => sum + fruit.small + fruit.medium + fruit.large,
    0
  );

  const lowStock = fruitStock.reduce((count, fruit) => {
    return count +
      [fruit.small, fruit.medium, fruit.large].filter(qty => qty <= 10).length;
  }, 0);

  return (
    <div className="reports-page">
      <div className="reports-header">
        <div>
          <h1>Reports</h1>
          <p>View business performance and stock information.</p>
        </div>
        <div className="report-date">
          Report Date: {new Date().toLocaleDateString()}
        </div>
      </div>

      <div className="report-summary">
        <div className="report-card">
          <span>Total Purchases</span>
          <h2>1</h2>
          <p>Recorded purchases</p>
        </div>

        <div className="report-card">
          <span>Total Sales</span>
          <h2>0</h2>
          <p>Recorded sales</p>
        </div>

        <div className="report-card">
          <span>Available Packages</span>
          <h2>{totalPackages}</h2>
          <p>Across all fruit sizes</p>
        </div>

        <div className="report-card">
          <span>Low Stock Records</span>
          <h2>{lowStock}</h2>
          <p>Records with 10 or fewer packages</p>
        </div>
      </div>

      <div className="report-section">
        <div className="report-section-heading">
          <div>
            <h2>Stock Report</h2>
            <p>Available quantities by fruit and packaging size.</p>
          </div>
        </div>

        <div className="report-table-container">
          <table className="report-table">
            <thead>
              <tr>
                <th>Fruit</th>
                <th>Small</th>
                <th>Medium</th>
                <th>Large</th>
                <th>Total Packages</th>
              </tr>
            </thead>

            <tbody>
              {fruitStock.map((fruit) => {
                const total = fruit.small + fruit.medium + fruit.large;

                return (
                  <tr key={fruit.name}>
                    <td><strong>{fruit.name}</strong></td>
                    <td>{fruit.small}</td>
                    <td>{fruit.medium}</td>
                    <td>{fruit.large}</td>
                    <td><strong>{total}</strong></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="report-section">
        <div className="report-section-heading">
          <div>
            <h2>Business Summary</h2>
            <p>A quick overview of recorded business activities.</p>
          </div>
        </div>

        <div className="business-summary">
          <div>
            <span>Purchase Value</span>
            <h3>M4,040.00</h3>
          </div>
          <div>
            <span>Sales Revenue</span>
            <h3>M0.00</h3>
          </div>
          <div>
            <span>Outstanding Payments</span>
            <h3>M0.00</h3>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;
