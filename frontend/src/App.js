import * as ReactRouterDom from "react-router-dom";
import AdminProtectedRoute from "./layouts/AdminProtectedRoute";
import UserProtectedRoute from "./layouts/UserProtectedRoute";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import DashboardPage from "./pages/DashboardPage";
import InfoPage from "./pages/InfoPage";
import LoginPage from "./pages/LoginPage";
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
              description="Configure external services used for publishing, analytics, notifications, and automation."
              sections={[
                {
                  heading: "Integration categories",
                  body: "Group integrations by purpose to simplify maintenance and troubleshooting.",
                  items: [
                    "CMS and content distribution platforms",
                    "Analytics and reporting providers",
                    "Messaging and alerting tools",
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
          element={withUserProtection(
            <InfoPage
              title="Knowledge"
              description="Store reusable playbooks, writing guides, and operational notes for your content team."
              sections={[
                {
                  heading: "What to document",
                  body: "Capture repeatable workflows so new contributors can move quickly.",
                  items: [
                    "Content brief templates and checklists",
                    "SEO review and approval guidelines",
                    "Escalation procedures for incidents",
                  ],
                },
                {
                  heading: "Maintenance cadence",
                  body: "Review and refresh articles on a regular schedule to keep guidance accurate.",
                },
              ]}
            />
          )}
        />
        <Route
          path="/blogs"
          element={withUserProtection(
            <InfoPage
              title="Blogs"
              description="Plan, review, and publish blog posts with consistent quality and release timing."
              sections={[
                {
                  heading: "Editorial workflow",
                  body: "Move each article through drafting, reviewing, and publishing stages with clear ownership.",
                },
                {
                  heading: "Performance focus",
                  body: "Measure outcomes by combining traffic, engagement, and conversion metrics.",
                  items: [
                    "Monitor page views and reading time",
                    "Track keyword movement after publishing",
                    "Compare conversion performance by topic",
                  ],
                },
              ]}
            />
          )}
        />
        <Route
          path="/settings"
          element={withUserProtection(
            <InfoPage
              title="Settings"
              description="Control workspace preferences, notification rules, and account-level behavior."
              sections={[
                {
                  heading: "Workspace controls",
                  body: "Set defaults for timezone, approval policy, and publishing behavior.",
                },
                {
                  heading: "User preferences",
                  body: "Customize personal options to improve daily workflow.",
                  items: [
                    "Notification frequency and channels",
                    "Theme and interface preferences",
                    "Default filters for dashboard views",
                  ],
                },
              ]}
            />
          )}
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
