import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { SkillListPage } from './pages/SkillListPage';
import { SkillDetailPage } from './pages/SkillDetailPage';
import { LoginPage } from './pages/LoginPage';
import { SellerDashboardPage } from './pages/SellerDashboardPage';
import { BuyerDashboardPage } from './pages/BuyerDashboardPage';
import { AgentDashboardPage } from './pages/AgentDashboardPage';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth pages (no header/footer) */}
        <Route path="/login" element={<LoginPage />} />

        {/* Public pages with layout */}
        <Route
          path="/"
          element={
            <Layout>
              <HomePage />
            </Layout>
          }
        />
        <Route
          path="/skills"
          element={
            <Layout>
              <SkillListPage />
            </Layout>
          }
        />
        <Route
          path="/skills/:slug"
          element={
            <Layout>
              <SkillDetailPage />
            </Layout>
          }
        />
        <Route
          path="/categories/:slug"
          element={
            <Layout>
              <SkillListPage />
            </Layout>
          }
        />

        {/* Dashboard pages */}
        <Route
          path="/dashboard/seller/*"
          element={
            <Layout>
              <SellerDashboardPage />
            </Layout>
          }
        />
        <Route
          path="/dashboard/buyer"
          element={
            <Layout>
              <BuyerDashboardPage />
            </Layout>
          }
        />
        <Route
          path="/dashboard/agents"
          element={
            <Layout>
              <AgentDashboardPage />
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
