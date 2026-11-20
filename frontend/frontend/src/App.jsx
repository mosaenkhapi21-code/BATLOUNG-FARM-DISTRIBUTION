
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Truck, Apple, Warehouse,
  Users, ShoppingBag, ShoppingCart, ChartNoAxesCombined,
  Package, TrendingUp, ArrowDownRight, MapPin
} from 'lucide-react';

import Suppliers from './pages/Suppliers';
import Purchases from './pages/Purchases';
import Reports from './pages/Reports';
import Sales from './pages/Sales';
import Fruits from './pages/Fruits';
import Vendors from './pages/Vendors';
import Stock from './pages/Stock';
import './App.css';

const menuItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Suppliers', path: '/suppliers', icon: Truck },
  { name: 'Fruits', path: '/fruits', icon: Apple },
  { name: 'Stock', path: '/stock', icon: Warehouse },
  { name: 'Vendors', path: '/vendors', icon: Users },
  { name: 'Purchases', path: '/purchases', icon: ShoppingBag },
  { name: 'Sales', path: '/sales', icon: ShoppingCart },
  { name: 'Reports', path: '/reports', icon: ChartNoAxesCombined },
  { name: 'Location', path: '/location', icon: MapPin }
];

function Dashboard() {
  const statistics = [
    { title: 'Total Suppliers', value: '8', icon: Truck, color: 'green' },
    { title: 'Total Fruits', value: '5', icon: Apple, color: 'orange' },
    { title: 'Total Vendors', value: '5', icon: Users, color: 'blue' },
    { title: 'Stock Records', value: '15', icon: Package, color: 'purple' }
  ];

  return (
    <div className="dashboard">
      <div className="welcome-section">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back! Here is an overview of your farm distribution business.</p>
        </div>
        <span className="today-label">Farm Overview</span>
      </div>

      <div className="stats-grid">
        {statistics.map((item) => {
          const Icon = item.icon;

          return (
            <div className="stat-card" key={item.title}>
              <div className={`stat-icon ${item.color}`}>
                <Icon size={23} />
              </div>
              <div>
                <p>{item.title}</p>
                <h2>{item.value}</h2>
              </div>
            </div>
          );
        })}
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <h2>Recent Purchases</h2>
              <p>Latest stock purchases from suppliers</p>
            </div>
            <ShoppingBag size={21} />
          </div>

          <div className="transaction">
            <div className="transaction-icon purchase">
              <ArrowDownRight size={20} />
            </div>
            <div className="transaction-info">
              <strong>Purchase #1</strong>
              <span>Fresh fruit stock received</span>
            </div>
            <strong className="amount">M4,040.00</strong>
          </div>

          <div className="empty-note">
            Showing your recorded purchase.
          </div>
        </div>

        <div className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <h2>Recent Sales</h2>
              <p>Latest sales to vendors</p>
            </div>
            <TrendingUp size={21} />
          </div>

          <div className="empty-state">
            <div className="empty-icon">
              <ShoppingCart size={28} />
            </div>
            <strong>No sales recorded yet</strong>
            <span>Sales transactions will appear here.</span>
          </div>
        </div>
      </div>

      <div className="dashboard-panel quick-actions">
        <div className="panel-heading">
          <div>
            <h2>Quick Actions</h2>
            <p>Quickly access important activities</p>
          </div>
        </div>

        <div className="action-buttons">
          <NavLink to="/suppliers" className="action-link">
            <Truck size={19} /> Manage Suppliers
          </NavLink>
          <NavLink to="/purchases" className="action-link">
            <ShoppingBag size={19} /> Record Purchase
          </NavLink>
          <NavLink to="/sales" className="action-link">
            <ShoppingCart size={19} /> Record Sale
          </NavLink>
          <NavLink to="/stock" className="action-link">
            <Warehouse size={19} /> View Stock
          </NavLink>
        </div>
      </div>
    </div>
  );
}

// BUSINESS LOCATION PAGE
function Location() {
  return (
    <div className="location-page">
      <div className="welcome-section">
        <div>
          <h1>Our Location</h1>
          <p>Find Batloung Farm Distribution.</p>
        </div>
        <MapPin size={28} />
      </div>

      <div className="dashboard-panel location-panel">
        <div className="location-details">
          <MapPin size={25} />
          <div>
            <h2>Batloung Farm Distribution</h2>
            <p>Maseru, Lesotho</p>
          </div>
        </div>

        <div className="location-map">
          <iframe
            title="Batloung Farm Distribution Map"
            src="https://maps.google.com/maps?q=Maseru%2C%20Lesotho&t=&z=13&ie=UTF8&iwloc=&output=embed"
            width="100%"
            height="450"
            style={{ border: 0, borderRadius: '10px' }}
            loading="lazy"
            allowFullScreen
          ></iframe>
        </div>

        <a
          href="https://www.google.com/maps/search/?api=1&query=Maseru%2C+Lesotho"
          target="_blank"
          rel="noopener noreferrer"
          className="action-link directions-link"
        >
          <MapPin size={19} />
          Get Directions
        </a>
      </div>
    </div>
  );
}

function AppLayout() {
  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">B</div>
          <div>
            <h2>Batloung Farm</h2>
            <span>Distribution System</span>
          </div>
        </div>

        <p className="menu-heading">MAIN MENU</p>

        <nav>
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  isActive ? 'nav-link active' : 'nav-link'
                }
              >
                <Icon size={19} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <span>Fresh produce, delivered.</span>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <span>Farm Management</span>
          <div className="user-profile">
            <div className="user-avatar">A</div>
            <span>Administrator</span>
          </div>
        </header>

        <section className="page-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/fruits" element={<Fruits />} />
            <Route path="/stock" element={<Stock />} />
            <Route path="/vendors" element={<Vendors />} />
            <Route path="/purchases" element={<Purchases />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/location" element={<Location />} />
          </Routes>
        </section>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;
