import AuthLoginPage from "../components/AuthLoginPage";

function AdminLoginPage() {
  return (
    <AuthLoginPage
      title="Admin Sign in"
      subtitle="Access the admin console to manage platform settings and users."
      isAdmin
    />
  );
}

export default AdminLoginPage;
