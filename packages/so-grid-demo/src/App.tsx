import { useState } from 'react';
import 'so-grid-react/styles.css';
import ClientSideDemo from './pages/ClientSideDemo';
import ServerSideDemo from './pages/ServerSideDemo';
import OrderDemo from './pages/order/order-demo';

function App() {
  const [activeMenu, setActiveMenu] = useState<'client' | 'server' | 'orderdemo'>('orderdemo');

  const renderContent = () => {
    switch (activeMenu) {
      case 'orderdemo':
        return <OrderDemo />;
      case 'client':
        return <ClientSideDemo />;
      case 'server':
        return <ServerSideDemo />;
      default:
        return <ClientSideDemo />;
    }
  };

  return (
    <div className="app">
      <nav className="app-sidebar">
        <div className="sidebar-header">
          <h1>SO-Grid Demo</h1>
          <p>TanStack Table Based</p>
        </div>
        <div className="sidebar-menu">
          <button
            className={`menu-item ${activeMenu === 'orderdemo' ? 'active' : ''}`}
            onClick={() => setActiveMenu('orderdemo')}
          >
            Order Demo
          </button>
          <button
            className={`menu-item ${activeMenu === 'client' ? 'active' : ''}`}
            onClick={() => setActiveMenu('client')}
          >
            Client-Side Grid
          </button>
          <button
            className={`menu-item ${activeMenu === 'server' ? 'active' : ''}`}
            onClick={() => setActiveMenu('server')}
          >
            Server-Side Grid
          </button>
        </div>
      </nav>

      <main className="app-main">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
