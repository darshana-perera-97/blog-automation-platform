import * as ReactRouterDom from "react-router-dom";
import AdminProtectedRoute from "./layouts/AdminProtectedRoute";
import UserProtectedRoute from "./layouts/UserProtectedRoute";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import BlogsPage from "./pages/BlogsPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import DashboardPage from "./pages/DashboardPage";
import InfoPage from "./pages/InfoPage";
import KnowledgePage from "./pages/KnowledgePage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import WebsitesPage from "./pages/WebsitesPage";

const { BrowserRouter, Navigate, Route, Routes } = ReactRouterDom;

function withUserProtection(element) {
  return <UserProtectedRoute>{element}</UserProtectedRoute>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/admin/dashboard"
          element={
            <AdminProtectedRoute>
              <AdminDashboardPage />
            </AdminProtectedRoute>
          }
        />
        <Route path="/dashboard" element={withUserProtection(<DashboardPage />)} />
        <Route
          path="/websites"
          element={withUserProtection(<WebsitesPage />)}
        />
        <Route
          path="/intergrations"
          element={withUserProtection(
            <InfoPage
              title="Intergrations"
              description="Connect external services used for publishing, analytics, notifications, and automation."
              sections={[
                {
                  heading: "Before you start",
                  body: "Collect all required credentials first to avoid setup interruptions.",
                  items: [
                    "API key or OAuth client details",
                    "Callback/redirect URL for your environment",
                    "Workspace or project identifier from the provider dashboard",
                    "Required permission scopes (publish, read analytics, notifications)",
                  ],
                },
                {
                  heading: "Integration steps",
                  body: "Follow this sequence for each provider to keep setup consistent and traceable.",
                  items: [
                    "Step 1: Open the provider admin panel and create an app/integration.",
                    "Step 2: Copy client credentials and allowed redirect URLs.",
                    "Step 3: Add credentials to your secure environment settings.",
                    "Step 4: Connect from this dashboard and run the authorization flow.",
                    "Step 5: Verify with a test action (publish, fetch analytics, or send notification).",
                    "Step 6: Save connection status and owner notes for future maintenance.",
                  ],
                },
                {
                  heading: "Post-setup validation",
                  body: "Run a quick health check after connecting to confirm data and permissions are correct.",
                  items: [
                    "Confirm connection state is active in this workspace",
                    "Test both read and write actions where applicable",
                    "Check logs for permission or webhook delivery errors",
                    "Document renewal/rotation date for credentials",
                  ],
                },
                {
                  heading: "Security best practices",
                  body: "Rotate API keys regularly and use least-privilege scopes for all service accounts.",
                },
              ]}
            />
          )}
        />
        <Route
          path="/knowledge"
          element={withUserProtection(<KnowledgePage />)}
        />
        <Route
          path="/blogs"
          element={withUserProtection(<BlogsPage />)}
        />
        <Route
          path="/settings"
          element={withUserProtection(<SettingsPage />)}
        />
        <Route
          path="/about"
          element={withUserProtection(
            <InfoPage
              title="About"
              description="This dashboard helps teams track growth, activity, and outcomes across marketing, product, and operations."
              sections={[
                {
                  heading: "What this dashboard does",
                  body: "It brings key numbers into a single screen so teams can detect trends and act faster.",
                  items: [
                    "Tracks user activity and engagement over time",
                    "Summarizes revenue and transaction signals",
                    "Highlights team progress and open work",
                  ],
                },
                {
                  heading: "Who uses it",
                  body: "Product managers, analysts, and leadership teams use this view for daily status checks and weekly reporting.",
                },
              ]}
            />
          )}
        />
        <Route
          path="/license"
          element={withUserProtection(
            <InfoPage
              title="License"
              description="Use of this project is governed by the repository license and any third-party package licenses."
              sections={[
                {
                  heading: "Project usage",
                  body: "You may use, modify, and distribute this project according to the terms described in the main repository license file.",
                },
                {
                  heading: "Third-party dependencies",
                  body: "Some UI and charting behavior depends on external libraries, each with their own license terms.",
                  items: [
                    "Review dependency licenses before commercial distribution",
                    "Keep attribution notices when required",
                    "Verify compliance during release reviews",
                  ],
                },
              ]}
            />
          )}
        />
        <Route
          path="/support"
          element={withUserProtection(
            <InfoPage
              title="Support"
              description="Need help with setup, data issues, or dashboard behavior? Use the channels below for faster resolution."
              sections={[
                {
                  heading: "How to get help",
                  body: "Include environment details, screenshots, and exact steps to reproduce when opening a request.",
                  items: [
                    "Open a repository issue for bugs or feature requests",
                    "Contact your internal admin for access problems",
                    "Share logs and timestamps for data-sync incidents",
                  ],
                },
                {
                  heading: "Response expectations",
                  body: "Critical production issues should be escalated immediately. Standard requests are usually reviewed during normal business hours.",
                },
              ]}
            />
          )}
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
