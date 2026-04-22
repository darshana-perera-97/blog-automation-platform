import * as ReactRouterDom from "react-router-dom";
import AppFooter from "../components/AppFooter";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import { clearUserSession } from "../lib/userAuth";

const { useNavigate } = ReactRouterDom;

function PlatformLayout({ title, children }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearUserSession();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#ffffff_0%,_#f8fafc_40%,_#f1f5f9_100%)] text-slate-700">
      <div className="mx-auto w-full max-w-[1800px] px-3 py-3 sm:px-4 sm:py-4 lg:px-5">
        <Sidebar />
        <main className="flex min-h-[calc(100vh-1.5rem)] flex-col gap-4 pb-4 lg:ml-[260px] lg:gap-5 xl:ml-[280px]">
          <TopBar title={title} onLogout={handleLogout} />
          {children}
          <div className="mt-auto">
            <AppFooter />
          </div>
        </main>
      </div>
    </div>
  );
}

export default PlatformLayout;
