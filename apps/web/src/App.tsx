import { Routes, Route, Navigate } from "react-router-dom";
import { useSession } from "@supabase/auth-helpers-react";

// Pages (placeholders — will be implemented in subsequent prompts)
const LoginPage = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-brand-600 mb-4">Tasky</h1>
      <p className="text-gray-500">Login page — coming in Prompt 2</p>
    </div>
  </div>
);

const DashboardPage = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-brand-600 mb-4">Dashboard</h1>
      <p className="text-gray-500">Dashboard — coming in Prompt 3</p>
    </div>
  </div>
);

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const session = useSession();
  if (!session) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
