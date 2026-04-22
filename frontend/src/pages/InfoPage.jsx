import * as ReactRouterDom from "react-router-dom";
import PlatformLayout from "../layouts/PlatformLayout";

const { Link } = ReactRouterDom;

function InfoPage({ title, description, sections }) {
  return (
    <PlatformLayout title={title}>
      <section className="rounded-3xl border border-[#f1f5f9] bg-white p-6 shadow-[0_15px_35px_rgba(148,163,184,0.18)] sm:p-8">
        <p className="text-sm leading-6 text-slate-500 sm:text-base">{description}</p>

        <div className="mt-6 space-y-5">
          {sections.map((section) => (
            <section key={section.heading} className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
              <h2 className="text-sm font-semibold text-slate-800 sm:text-base">{section.heading}</h2>
              <p className="mt-2 text-sm text-slate-500">{section.body}</p>
              {section.items ? (
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>

        <Link
          to="/dashboardd"
          className="mt-6 inline-flex rounded-xl bg-gradient-to-r from-slate-700 to-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:from-slate-600 hover:to-slate-700"
        >
          Back to Dashboard
        </Link>
      </section>
    </PlatformLayout>
  );
}

export default InfoPage;
