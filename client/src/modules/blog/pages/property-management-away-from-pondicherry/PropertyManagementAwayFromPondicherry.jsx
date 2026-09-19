import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Home, ChevronRight, User, Calendar, ClipboardList, MessageSquare } from "lucide-react";

const CANONICAL_URL = "https://nammapondyproperties.com/blog/property-management-away-from-pondicherry";
const HERO_IMAGE = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1600&q=80";
const WA = "https://wa.me/919403892971?text=";

const PropertyManagementAwayFromPondicherry = () => {
  useEffect(() => {
    // Scroll to top on mount
    const mainContent = document.getElementById("main-content");
    if (mainContent) {
      mainContent.scrollTo({ top: 0, behavior: "instant" });
    }
  }, []);

  return (
    <div className="blog-detail-wrapper">
      <Helmet>
        <title>How to Protect and Maintain Your Property When You Live Away From Pondicherry | Namma Pondy Properties</title>
        <meta
          name="description"
          content="Practical guide for owners living away from Pondicherry — inspections, document upkeep, tax tracking, local contacts, boundary protection, and NRI tips."
        />
        <link rel="canonical" href={CANONICAL_URL} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={CANONICAL_URL} />
        <meta
          property="og:title"
          content="How to Protect and Maintain Your Property When You Live Away From Pondicherry"
        />
        <meta
          property="og:description"
          content="Inspections, documents, taxes, local contacts and boundary protection — how to look after a house or plot in Pondicherry from another city or country."
        />
        <meta property="og:image" content={HERO_IMAGE} />
      </Helmet>

      <style>{`
        .blog-detail-wrapper {
          --coral: #fb2c36;
          --coral-hover: #e0242c;
          --ocean: #006699;
          --navy: #1A2B4C;
          --navy-deep: #0D1B2A;
          --primary: #166aa8;
          --whatsapp: #166aa8;
          --amber-fill: #FFF3E0;
          --amber-text: #D97706;
          --blue-fill: #E6F2FA;
          --green-fill: #E6F2FA;
          --bg: #F8F9FA;
          --white: #FFFFFF;
          --ink: #1A2129;
          --gray: #667085;
          --line: #E7E9EC;
          background: var(--bg);
          color: var(--ink);
          font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif;
          line-height: 1.7;
          -webkit-font-smoothing: antialiased;
          min-height: 100vh;
          padding-top: 100px;
        }

        .blog-detail-wrapper h1,
        .blog-detail-wrapper h2,
        .blog-detail-wrapper h3,
        .blog-detail-wrapper h4 {
          font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
          letter-spacing: -0.01em;
          margin: 0;
        }

        .blog-detail-wrapper p {
          margin: 0 0 16px;
          font-size: 1.02rem;
          color: #374151;
        }

        .blog-page {
          max-width: 1180px;
          margin: 0 auto;
          padding: 20px 5% 60px;
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 36px;
          align-items: start;
        }

        .blog-detail-wrapper main {
          background: transparent;
        }

        .blog-breadcrumb {
          font-size: 0.85rem;
          color: var(--gray);
          margin-bottom: 18px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .blog-breadcrumb a {
          color: var(--gray);
          font-weight: 500;
        }
        .blog-breadcrumb a:hover {
          color: var(--ocean);
        }

        .cat-pill {
          display: inline-block;
          background: var(--blue-fill);
          color: var(--ocean);
          font-weight: 800;
          font-size: 0.72rem;
          letter-spacing: 0.6px;
          text-transform: uppercase;
          padding: 7px 14px;
          border-radius: 100px;
          margin-bottom: 16px;
        }

        h1.title {
          font-size: 2.2rem;
          line-height: 1.25;
          font-weight: 600;
          color: #0A0E14;
          margin-bottom: 20px;
        }

        .byline {
          display: flex;
          align-items: center;
          gap: 22px;
          color: var(--gray);
          font-size: 0.9rem;
          font-weight: 500;
          padding-bottom: 24px;
          margin-bottom: 28px;
          border-bottom: 1px solid var(--line);
        }
        .byline span {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .hero-img {
          width: 100%;
          aspect-ratio: 16 / 9;
          object-fit: cover;
          border-radius: 16px;
          display: block;
          box-shadow: 0 12px 32px rgba(13,27,42,0.12);
          margin-bottom: 32px;
        }

        .callout {
          background: var(--blue-fill);
          border-left: 4px solid var(--ocean);
          border-radius: 0 12px 12px 0;
          padding: 22px 26px;
          margin: 28px 0 34px;
        }
        .callout h4 {
          color: var(--navy-deep);
          font-size: 1.15rem;
          font-weight: 800;
          margin-bottom: 8px;
        }
        .callout p {
          margin: 0;
          color: #334155;
          font-size: 0.98rem;
        }

        .subsection {
          margin: 44px 0;
        }
        .subsection h3 {
          font-size: 1.4rem;
          color: var(--navy-deep);
          font-weight: 800;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .num-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 12px;
          background: #0d1b2a;
          color: var(--white);
          font-size: 1.1rem;
          font-weight: 800;
          flex-shrink: 0;
        }
        .subsection img {
          width: 100%;
          aspect-ratio: 16 / 9;
          object-fit: cover;
          border-radius: 14px;
          display: block;
          margin-bottom: 16px;
          box-shadow: 0 8px 24px rgba(13,27,42,0.1);
        }
        .subsection p {
          color: #374151;
          font-size: 1rem;
        }

        .cta-pill-wrap {
          text-align: center;
          margin-top: 20px;
        }
        .cta-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--whatsapp);
          color: var(--white) !important;
          font-weight: 700;
          font-size: 0.95rem;
          padding: 14px 28px;
          border-radius: 100px;
          transition: all 0.2s ease;
          box-shadow: 0 6px 18px rgba(22, 106, 168, 0.3);
        }
        .cta-pill:hover {
          background: #125a91 !important;
          color: var(--white) !important;
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(22, 106, 168, 0.4);
        }

        .usecase-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin: 20px 0;
        }
        .usecase-card {
          background: #F3F6F9;
          border-radius: 12px;
          padding: 18px 20px;
        }
        .usecase-card h3 {
          font-size: 1rem;
          color: var(--primary);
          margin-bottom: 8px;
          font-weight: 800;
        }
        .usecase-card p,
        .usecase-card ul {
          margin: 0;
          color: #374151;
          font-size: 0.92rem;
        }
        .usecase-card ul {
          padding-left: 18px;
        }

        .inline-checklist {
          list-style: none;
          padding: 0;
          margin: 16px 0;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px 20px;
        }
        .inline-checklist li {
          font-size: 0.92rem;
          color: #374151;
          padding: 6px 0;
          border-bottom: 1px dashed var(--line);
        }

        .mistake-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin: 20px 0;
        }
        .mistake-card {
          background: #FEF2F2;
          border-left: 3px solid var(--coral);
          border-radius: 0 12px 12px 0;
          padding: 16px 20px;
        }
        .mistake-card h3 {
          font-size: 0.98rem;
          color: var(--coral);
          margin-bottom: 6px;
          font-weight: 800;
        }
        .mistake-card p {
          margin: 0;
          color: #374151;
          font-size: 0.9rem;
        }

        .cta-strip {
          background: var(--blue-fill);
          border-radius: 16px;
          padding: 22px 26px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          flex-wrap: wrap;
          margin: 32px 0;
        }
        .cta-strip p {
          margin: 0;
          font-weight: 700;
          color: var(--navy-deep);
        }
        .btn-solid {
          background: var(--coral);
          color: var(--white) !important;
          font-weight: 700;
          padding: 12px 26px;
          border-radius: 100px;
          white-space: nowrap;
          transition: all 0.2s ease;
        }
        .btn-solid:hover {
          background: var(--coral-hover) !important;
          transform: translateY(-2px);
        }

        .compare-table-wrap {
          overflow-x: auto;
          margin: 20px 0;
        }
        table.compare-table {
          width: 100%;
          border-collapse: collapse;
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 4px 18px rgba(13,27,42,0.08);
          min-width: 560px;
        }
        table.compare-table thead tr {
          background: linear-gradient(135deg, var(--navy-deep) 0%, var(--navy) 100%);
          color: var(--white);
        }
        table.compare-table th,
        table.compare-table td {
          padding: 14px 16px;
          text-align: left;
          font-size: 0.9rem;
        }
        table.compare-table tbody tr:nth-child(even) { background: #F3F6F9; }
        table.compare-table tbody tr:nth-child(odd) { background: var(--white); }

        .why-list {
          list-style: none;
          padding: 0;
          margin: 20px 0 24px;
        }
        .why-list li {
          padding: 16px 0 16px 36px;
          position: relative;
          border-bottom: 1px solid var(--line);
          font-size: 1.02rem;
          color: #374151;
        }
        .why-list li:last-child {
          border-bottom: none;
        }
        .why-list li::before {
          content: "●";
          position: absolute;
          left: 0;
          color: var(--coral);
          font-size: 1.2rem;
          top: 16px;
        }
        .why-list b {
          color: var(--navy-deep);
          font-weight: 800;
        }

        .why-choose h2,
        .success-stories h2,
        .subsection-plain h2 {
          font-size: 1.7rem;
          color: var(--navy-deep);
          font-weight: 800;
          margin-bottom: 16px;
        }

        .success-card {
          background: var(--navy-deep);
          border-radius: 16px;
          padding: 32px 34px;
          color: var(--white);
        }
        .stars {
          color: var(--amber-text);
          font-size: 1.1rem;
          margin-bottom: 14px;
          letter-spacing: 2px;
        }
        .success-card p.quote {
          color: #D6DEEA;
          font-size: 1.05rem;
          font-style: italic;
          margin-bottom: 16px;
        }
        .success-card .client {
          font-weight: 800;
          color: var(--white);
          font-size: 0.98rem;
        }
        .success-card .client span {
          display: block;
          color: #8B9AB3;
          font-weight: 500;
          font-size: 0.85rem;
          margin-top: 2px;
        }

        .faq-item {
          margin-bottom: 20px;
        }
        .faq-item h3 {
          font-size: 1.05rem;
          color: var(--primary);
          margin-bottom: 6px;
          font-weight: 800;
        }
        .faq-item p {
          margin: 0;
          color: #374151;
        }

        .final-cta {
          background: linear-gradient(135deg, #0D1B2A 0%, #1A2B4C 100%);
          border-radius: 20px;
          padding: 56px 6%;
          margin: 56px 0 10px;
          text-align: center;
        }
        .final-cta h2 {
          color: var(--white);
          font-size: 1.9rem;
          font-weight: 800;
          margin-bottom: 14px;
        }
        .final-cta p {
          color: #C7D2E0;
          font-size: 1.05rem;
          max-width: 520px;
          margin: 0 auto 28px;
        }
        .final-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: var(--amber-text);
          color: #ede9e5ff !important;
          font-weight: 800;
          font-size: 1rem;
          padding: 16px 34px;
          border-radius: 100px;
          transition: all 0.2s ease;
        }
        .final-cta-btn:hover {
          background: #B8690A !important;
          color: var(--white) !important;
          transform: translateY(-2px);
        }

        .blog-aside {
          position: sticky;
          top: 110px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .side-card {
          background: var(--white);
          border: 1px solid var(--line);
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 16px rgba(13,27,42,0.05);
        }
        .side-label {
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.6px;
          text-transform: uppercase;
          color: var(--gray);
          margin-bottom: 14px;
        }
        .brand-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 14px;
        }
        .brand-row .name {
          font-weight: 700;
          color: var(--navy-deep);
          font-size: 1.02rem;
        }
        .side-card .desc {
          font-size: 0.92rem;
          color: var(--gray);
          margin-bottom: 16px;
        }
        .side-divider {
          border: none;
          border-top: 1px solid var(--line);
          margin: 16px 0;
        }
        .tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .tag-chip {
          background: #F1F3F5;
          color: #4B5563;
          font-size: 0.78rem;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: 100px;
        }
        .checklist {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .checklist li {
          padding: 8px 0;
          border-bottom: 1px dashed var(--line);
          font-size: 0.9rem;
          display: flex;
          gap: 8px;
        }
        .checklist li:last-child {
          border-bottom: none;
        }

        .side-card.consult {
          background: var(--blue-fill);
          border-color: #BFE0F2;
        }
        .side-card.consult h4 {
          color: var(--primary);
          font-size: 1.15rem;
          font-weight: 800;
          margin-bottom: 8px;
        }
        .side-card.consult p {
          color: #3f556b;
          font-size: 0.92rem;
          margin-bottom: 18px;
        }
        .wa-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          background: var(--whatsapp);
          color: var(--white) !important;
          font-weight: 700;
          font-size: 0.95rem;
          padding: 14px;
          border-radius: 100px;
          transition: all 0.2s ease;
        }
        .wa-btn:hover {
          background: #125a91 !important;
          color: var(--white) !important;
          transform: translateY(-2px);
        }

        @media(max-width: 900px) {
          .blog-page {
            grid-template-columns: 1fr;
            padding: 28px 5% 40px;
          }
          .blog-aside {
            position: static;
          }
          .usecase-grid,
          .mistake-grid,
          .inline-checklist {
            grid-template-columns: 1fr;
          }
        }
      `}</style>


      <div className="blog-page">
        <main>
          <div className="blog-breadcrumb flex items-center gap-1.5 flex-wrap">
            <Home className="w-4 h-4 text-gray-500" />
            <Link to="/">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <Link to="/blog">Blog</Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-gray-800 font-semibold truncate">Property Management</span>
          </div>

          <div className="cat-pill">Property Management • Pondicherry</div>

          <h1 className="title">
            How to Protect and Maintain Your Property When You Live Away From Pondicherry
          </h1>

          <div className="byline">
            <span><User className="w-4 h-4 text-[#166aa8]" /> Namma Pondy Properties Team</span>
            <span><Calendar className="w-4 h-4 text-[#166aa8]" /> 19 September 2026</span>
          </div>

          <img
            className="hero-img"
            src="/blog/PropertyManagementAwayFromPondicherry.webp"
            alt="House in Pondicherry owned by someone living away from the city"
          />

          <p>
            Buying a plot, house, apartment, or commercial property in Pondicherry can be a long-term
            decision. But what happens when you don't live nearby? Maybe you purchased a plot while
            working in Chennai. Maybe you moved to Bengaluru after buying your house. Or perhaps
            you're an NRI who invested in property around Pondicherry and can visit only once or twice
            a year.
          </p>
          <p>
            This is where property management becomes important. Owning property from a distance
            doesn't mean you have to constantly worry about it. With the right system, you can keep
            track of the property's condition, documents, maintenance, and local activities without
            being physically present every day. Let's look at some practical ways to protect your
            Pondicherry property.
          </p>

          <div className="callout">
            <h4>Quick Answer</h4>
            <p>
              If you own a property in Pondicherry but live in Chennai, Bengaluru, another city, or
              abroad, regular property management can help you protect the property from neglect,
              damage, unauthorized use, and documentation issues. The key is simple: inspect the
              property regularly, maintain documents, monitor taxes and utilities, and have a trusted
              local person or professional property manager handle on-ground needs.
            </p>
          </div>

          <div className="subsection-plain">
            <h2>Why Property Management Matters When You Live Away</h2>
            <p>
              An empty property can require attention even when nobody is living there. A vacant house
              may need periodic cleaning, electrical and plumbing checks, garden maintenance, security
              monitoring, pest control, repair work, and utility monitoring. A vacant plot also needs
              attention — over time, vegetation may grow, boundaries may become unclear, or access and
              surrounding development may change. If you are living far away, you may not notice these
              issues immediately. A simple local property management system can help you stay
              informed.
            </p>
          </div>

          <div className="subsection-plain">
            <h2>What Does Property Management Include?</h2>
            <p>
              Property management is more than collecting rent. For a property owner living away from
              Pondicherry, it can include regular property inspections, maintenance coordination,
              cleaning, repair coordination, security checks, utility monitoring, document follow-up,
              property tax follow-up, tenant coordination where applicable, site photographs and
              updates, and emergency assistance. The exact services depend on the property and the
              owner's requirements — if a professional is handling these services, always confirm the
              scope of work and charges in writing.
            </p>
          </div>

          <div className="subsection">
            <h3>
              <span className="num-badge">1</span> Schedule Regular Property Inspections
            </h3>
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ3Vnt58Y1b1ZbOGSNX4sQjbIwmtfztucVvvYBfx677i3KJE-TkPIC7jT5s&s=10"
              alt="Inspecting a property including doors, windows, and outdoor areas"
            />
            <p>
              If you cannot visit personally, ask a trusted local person or professional property
              manager to inspect it. For a house, check doors, windows, walls, ceilings, water
              leakage, plumbing, electrical systems, locks, and outdoor areas. For a vacant plot,
              check boundary condition, access road, fencing, vegetation, and any visible encroachment
              concerns. Ask for dated photographs or videos after every inspection.
            </p>
            <div className="cta-pill-wrap">
              <a
                className="cta-pill"
                href={`${WA}${encodeURIComponent("Hi, I'd like help arranging regular inspections for my Pondicherry property.")}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageSquare className="w-4 h-4" /> Ask About Inspection Support
              </a>
            </div>
          </div>

          <div className="subsection">
            <h3>
              <span className="num-badge">2</span> Keep Property Documents Organised
            </h3>
            <img
              src="https://bradish.com/wp-content/uploads/2021/02/organize-documents-to-protect-your-identity-pexels-anete-lusina-4792285-scaled-1.jpg"
              alt="Organising property documents including sale deed and tax records"
            />
            <p>
              Keep digital and physical copies of the sale deed, parent documents, Patta or applicable
              land records, Encumbrance Certificate, layout approval where applicable, property tax
              records, utility records, building-related approvals, and any lease or rental agreement.
              Puducherry's Revenue and Registration departments provide official services related to
              land records and registration, including EC-related services — keeping records
              organised makes future verification and transactions easier.
            </p>
            <div className="cta-pill-wrap">
              <a
                className="cta-pill"
                href={`${WA}${encodeURIComponent("Hi, I'd like help organising my property documents.")}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageSquare className="w-4 h-4" /> Ask About Document Support
              </a>
            </div>
          </div>

          <div className="subsection">
            <h3>
              <span className="num-badge">3</span> Keep Track of Taxes and Other Payments
            </h3>
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTKNEdHI048Jux49rSV8NzBTd1ytfhQ1YrRG4btTKaPmauE-XYwRn5buAlM&s=10"
              alt="Reviewing property tax and utility payment records"
            />
            <p>
              Don't assume that being away means payments can be ignored. Depending on the type and
              location of the property, monitor property tax, electricity bills, water charges,
              maintenance charges, association dues, and other applicable local payments. Exact taxes
              and charges depend on the property and jurisdiction, so check the relevant authority for
              current information — a trusted local representative can help you monitor these matters.
            </p>
            <div className="cta-pill-wrap">
              <a
                className="cta-pill"
                href={`${WA}${encodeURIComponent("Hi, I'd like help tracking taxes and payments for my Pondicherry property.")}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageSquare className="w-4 h-4" /> Ask About Tax &amp; Payment Tracking
              </a>
            </div>
          </div>

          <div className="subsection">
            <h3>
              <span className="num-badge">4</span> Keep a Local Contact Person
            </h3>
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT64Bd8Rv5OyyQ16wewy3KdTy72L38mdBRoVnRAUzOft90L7SmPal8OdBTA&s=10"
              alt="Trusted local contact coordinating property visits"
            />
            <p>
              If you live outside Pondicherry, having a trusted local contact — a family member, a
              trusted friend, a professional property manager, or a reliable caretaker — can be
              extremely useful for coordinating site visits, repairs, cleaning, utility issues,
              emergencies, and contractor access. However, avoid giving broad authority without
              understanding exactly what the person is permitted to do. For important legal or
              financial matters, use properly documented authority and professional advice where
              necessary.
            </p>
            <div className="cta-pill-wrap">
              <a
                className="cta-pill"
                href={`${WA}${encodeURIComponent("Hi, I'd like a trusted local contact for my Pondicherry property.")}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageSquare className="w-4 h-4" /> Ask About Local Support
              </a>
            </div>
          </div>

          <div className="subsection-plain">
            <h2>Protecting Boundaries and Preventing Unauthorized Use</h2>
            <div className="usecase-grid">
              <div className="usecase-card">
                <h3>Protect From Unauthorized Use</h3>
                <p>
                  For a vacant plot, clearly identify the boundaries and maintain appropriate fencing
                  or other lawful measures. For a vacant house, good locks, periodic inspections, and
                  appropriate security arrangements are useful. If you notice any suspected
                  encroachment, don't try to resolve it informally — obtain legal advice and use the
                  relevant official channels.
                </p>
              </div>
              <div className="usecase-card">
                <h3>Maintain Clear Property Boundaries</h3>
                <p>
                  During periodic inspections, check whether boundary stones remain identifiable,
                  fencing is intact, the plot is accessible, surrounding land has changed, or any
                  construction appears to have crossed the boundary. Puducherry's Survey and Land
                  Records department provides survey-related services — consult a qualified surveyor
                  and legal professional for any genuine boundary dispute.
                </p>
              </div>
            </div>
          </div>

          <div className="subsection-plain">
            <h2>Use a Property Inspection Checklist</h2>
            <p>
              Don't make property inspections random — create a simple monthly or periodic checklist
              covering property condition, security, outdoor area, documents, and photos.
            </p>
            <ul className="inline-checklist">
              <li>✅ Any visible damage or water leakage?</li>
              <li>✅ Any electrical problem?</li>
              <li>✅ Locks working, gates secure?</li>
              <li>✅ Any signs of unauthorized entry?</li>
              <li>✅ Vegetation controlled, boundary visible?</li>
              <li>✅ Any waste dumping?</li>
              <li>✅ Tax and utility payments updated?</li>
              <li>✅ Important notices received?</li>
            </ul>
            <p style={{ color: "#4b5563", fontSize: "0.92rem" }}>
              Also take photos each visit: front view, entrance, main building, boundary, and
              surrounding area. A consistent checklist makes it easier to compare the property's
              condition over time.
            </p>
          </div>

          <div className="cta-strip">
            <p>Want help setting up a property management routine for your Pondicherry property?</p>
            <a
              className="btn-solid"
              href={`${WA}${encodeURIComponent("Hi, I'd like help setting up property management for my Pondicherry property.")}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Talk to Our Team
            </a>
          </div>

          <div className="subsection-plain">
            <h2>Property Management: DIY vs Local Professional</h2>
            <div className="compare-table-wrap">
              <table className="compare-table">
                <thead>
                  <tr>
                    <th>Factor</th>
                    <th>Self-Managed</th>
                    <th>Professional Property Management</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>Site Visits</td><td>Owner/family must coordinate</td><td>Manager can coordinate</td></tr>
                  <tr><td>Maintenance</td><td>Owner handles vendors</td><td>Manager can coordinate vendors</td></tr>
                  <tr><td>Local Issues</td><td>Owner needs to travel or call contacts</td><td>Local support may be available</td></tr>
                  <tr><td>Documentation Follow-up</td><td>Owner-managed</td><td>Can be coordinated depending on agreement</td></tr>
                  <tr><td>Convenience</td><td>Lower if you live far away</td><td>Higher</td></tr>
                  <tr><td>Cost</td><td>Depends on your own time and travel</td><td>Professional charges may apply</td></tr>
                  <tr><td>Best For</td><td>Owners with trusted local support</td><td>Owners living far away or overseas</td></tr>
                </tbody>
              </table>
            </div>
            <p style={{ marginTop: "14px", color: "#4b5563", fontSize: "0.92rem" }}>
              There is no one-size-fits-all option. If you have reliable family members nearby,
              occasional professional support may be enough. If you're living overseas, a more
              structured arrangement may be useful.
            </p>
          </div>

          <div className="subsection-plain">
            <h2>Maintaining Vacant Houses &amp; Vacant Plots</h2>
            <div className="usecase-grid">
              <div className="usecase-card">
                <h3>Maintain Vacant Houses Properly</h3>
                <ul>
                  <li>Check for water leakage and dampness</li>
                  <li>Verify electrical systems function safely</li>
                  <li>Look for signs of pests</li>
                  <li>Periodic cleaning and garden maintenance</li>
                </ul>
              </div>
              <div className="usecase-card">
                <h3>Maintain Vacant Plots</h3>
                <ul>
                  <li>Boundary markers and fencing</li>
                  <li>Vegetation and access roads</li>
                  <li>Drainage and waste dumping</li>
                  <li>Nearby construction or encroachment</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="subsection-plain">
            <h2>Digital Records &amp; Remote Monitoring</h2>
            <img
              src="https://www.digi.com/getattachment/Blog/Industrial-Remote-Monitoring-What-it-is-Benefits-a/GettyImages-889236816-1280x720.jpg?lang=en-US"
              alt="Digital property record folder and remote monitoring setup"
              style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", borderRadius: "14px", display: "block", marginBottom: "16px", boxShadow: "0 8px 24px rgba(13,27,42,0.1)" }}
            />
            <p>
              Create a secure digital property folder holding the sale deed, parent documents,
              Patta/land records, EC, layout approval, tax receipts, utility and maintenance bills,
              site photos, legal documents, and contact details — with backups in more than one secure
              location, and avoid sharing sensitive documents casually. Technology can also make
              remote management easier: security cameras, smart locks, motion alerts, remote
              monitoring, digital payment records, and cloud document storage. But the exact setup
              should suit the property and comply with applicable privacy and local requirements —
              technology should support physical inspections, not replace them.
            </p>
          </div>

          <div className="subsection-plain">
            <h2>Have an Emergency Plan</h2>
            <p>
              Create a simple emergency contact list: local caretaker, property manager, electrician,
              plumber, security contact, building association (if applicable), a nearby family member,
              and a legal contact. If a major issue occurs, you don't want to start searching for
              contacts from another city — keep the list updated.
            </p>
          </div>

          <div className="subsection-plain">
            <h2>Special Tips for NRI Property Owners</h2>
            <p>
              If you live outside India and own property in Pondicherry, remote management becomes
              even more important. Before appointing someone locally, clearly define what they can
              manage, what expenses they can approve, how often they should inspect, what reports they
              should provide, and how emergencies should be handled. For major legal transactions,
              consult an appropriate legal professional regarding the required authorisation and
              documentation. Don't give someone unrestricted control simply because they are familiar
              to you.
            </p>
          </div>

          <div className="why-choose">
            <h2>When Should You Consider Professional Property Management?</h2>
            <ul className="why-list">
              <li><b>You live in another city or outside India.</b></li>
              <li><b>You own multiple properties</b> that are hard to track individually.</li>
              <li><b>The property is vacant</b> or you have tenants.</li>
              <li><b>You don't have trusted local support</b> nearby.</li>
              <li><b>Regular maintenance is difficult to coordinate</b> from a distance.</li>
            </ul>
            <p style={{ color: "#4b5563", fontSize: "0.92rem" }}>
              The exact service package and charges can vary by provider. Before appointing a property
              manager, ask for a written scope of services.
            </p>
          </div>

          <div className="subsection-plain">
            <h2>How to Choose a Property Management Service</h2>
            <div className="usecase-grid">
              <div className="usecase-card">
                <h3>What Services Are Included?</h3>
                <p>Get the services in writing.</p>
              </div>
              <div className="usecase-card">
                <h3>How Often Will They Inspect?</h3>
                <p>Ask for a clear inspection schedule.</p>
              </div>
              <div className="usecase-card">
                <h3>Will I Receive Photos?</h3>
                <p>Regular photo/video reports help remote owners monitor the property.</p>
              </div>
              <div className="usecase-card">
                <h3>Who Handles Repairs?</h3>
                <p>Understand whether they arrange vendors or only inform you about problems.</p>
              </div>
              <div className="usecase-card">
                <h3>How Are Expenses Approved?</h3>
                <p>Set a clear approval process.</p>
              </div>
              <div className="usecase-card">
                <h3>Are Charges Clearly Explained?</h3>
                <p>Avoid unclear or open-ended arrangements.</p>
              </div>
            </div>
          </div>

          <div className="subsection-plain">
            <h2>Common Property Management Mistakes</h2>
            <div className="mistake-grid">
              <div className="mistake-card">
                <h3>Ignoring the Property for Years</h3>
                <p>Even if you don't plan to sell, periodic monitoring is important.</p>
              </div>
              <div className="mistake-card">
                <h3>Giving One Person Unlimited Control</h3>
                <p>Define responsibilities clearly.</p>
              </div>
              <div className="mistake-card">
                <h3>Not Keeping Documents</h3>
                <p>Lost documents can make future transactions more difficult.</p>
              </div>
              <div className="mistake-card">
                <h3>No Inspection Records</h3>
                <p>Photos and reports can help you track changes.</p>
              </div>
              <div className="mistake-card">
                <h3>Delaying Repairs</h3>
                <p>Small problems can sometimes become larger maintenance issues.</p>
              </div>
              <div className="mistake-card">
                <h3>Not Updating Contact Information</h3>
                <p>Make sure relevant service providers and authorities have the correct contact details.</p>
              </div>
            </div>
          </div>

          <div className="success-stories">
            <h2>Success Story</h2>
            <div className="success-card">
              <div className="stars">★★★★★</div>
              <p className="quote">
                "Living in Bengaluru, I was worried about my house sitting empty in Villianur. Having
                someone send monthly photos and flag issues early made a huge difference."
              </p>
              <div className="client">
                Arjun R. <span>Property Owner, based in Bengaluru</span>
              </div>
            </div>
          </div>

          <div className="subsection-plain" style={{ marginTop: "44px" }}>
            <h2>Frequently Asked Questions</h2>
            <div className="faq-item">
              <h3>What is property management?</h3>
              <p>Property management involves maintaining, monitoring, and coordinating activities related to a property. Depending on the arrangement, it may include inspections, maintenance, tenant coordination, and documentation follow-up.</p>
            </div>
            <div className="faq-item">
              <h3>Do I need property management if I live in Chennai?</h3>
              <p>Not necessarily. If you have trusted family or reliable local support in Pondicherry, you may be able to manage the property yourself. Professional support can be considered if regular visits are difficult.</p>
            </div>
            <div className="faq-item">
              <h3>How often should I inspect a vacant property?</h3>
              <p>There is no universal schedule suitable for every property. The appropriate frequency depends on the property type, location, security arrangements, and owner's requirements. A regular inspection routine is advisable.</p>
            </div>
            <div className="faq-item">
              <h3>How can I protect a vacant plot?</h3>
              <p>Regularly inspect the plot, maintain clear boundaries, monitor access, keep documents organised, and address any suspected issues promptly through appropriate channels.</p>
            </div>
            <div className="faq-item">
              <h3>How do I choose a property management company?</h3>
              <p>Compare their services, inspection process, reporting system, emergency support, vendor coordination, responsibilities, and charges. Get the arrangement in writing before handing over responsibility.</p>
            </div>
          </div>

          <div className="final-cta">
            <h2>Looking for Property Management Support in Pondicherry?</h2>
            <p>
              Let Namma Pondy Properties help you explore property-related solutions across
              Pondicherry, Cuddalore, Villupuram, Tindivanam, and Chennai. Whether you're buying a
              plot, managing an existing property, or exploring land investment, proper local guidance
              makes it easier.
            </p>
            <a
              className="final-cta-btn"
              href={`${WA}${encodeURIComponent("Hi, I'd like support managing my property in Pondicherry.")}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ClipboardList className="w-5 h-5 mr-1" /> Plan Your Site Visit
            </a>
          </div>
        </main>

        <aside className="blog-aside">
          <div className="side-card">
            <div className="side-label">About Namma Pondy Properties</div>
            <div className="brand-row">
              <img src="/Logo/logo.webp" alt="Namma Pondy Properties" className="w-14 h-14 object-contain shrink-0" />
              <div className="name">Namma Pondy Properties</div>
            </div>
            <p className="desc">
              Helping property owners explore property-related solutions across Pondicherry,
              Cuddalore, Villupuram, Tindivanam, and Chennai — from buying to remote property
              management.
            </p>
            <hr className="side-divider" />
            <div className="tags">
              <span className="tag-chip">#PropertyManagement</span>
              <span className="tag-chip">#Pondicherry</span>
              <span className="tag-chip">#RemoteOwnership</span>
              <span className="tag-chip">#NRIProperty</span>
            </div>
          </div>

          <div className="side-card">
            <div className="side-label">Emergency Contact List</div>
            <ul className="checklist">
              <li>🧑‍🔧 Local Caretaker</li>
              <li>🏢 Property Manager</li>
              <li>⚡ Electrician</li>
              <li>🔧 Plumber</li>
              <li>🔒 Security Contact</li>
              <li>👪 Nearby Family Member</li>
              <li>⚖️ Legal Contact</li>
            </ul>
          </div>

          <div className="side-card consult">
            <h4>Need a Local Contact?</h4>
            <p>Talk to our team about property management and site inspection support in Pondicherry.</p>
            <a
              className="wa-btn"
              href={`${WA}${encodeURIComponent("Hi, I'd like a consultation about property management in Pondicherry.")}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageSquare className="w-4 h-4" /> Connect on WhatsApp
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default PropertyManagementAwayFromPondicherry;
