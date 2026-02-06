
import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Landing from "@/pages/Landing";
import Index from "@/pages/Index";
import AdminPanel from "@/pages/AdminPanel";
import SupportPanel from "@/pages/SupportPanel";
import OperatorPanel from "@/pages/OperatorPanel";
import AccountantPanel from "@/pages/AccountantPanel";
import NotFound from "@/pages/NotFound";
import AccountPage from "@/pages/AccountPage";
import AuthPage from "@/pages/AuthPage";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/platform" element={<Index />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/support" element={<SupportPanel />} />
        <Route path="/operator" element={<OperatorPanel />} />
        <Route path="/accountant" element={<AccountantPanel />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
