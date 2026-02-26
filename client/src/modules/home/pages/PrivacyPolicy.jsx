import React from "react";
import { Typography, Breadcrumb, Divider } from "antd";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";

const { Title, Paragraph, Text } = Typography;

const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <Helmet>
        <title>Privacy Policy | Namma Pondy Properties</title>
        <meta
          name="description"
          content="Read how Namma Pondy Properties collects, uses, and protects your personal information."
        />
      </Helmet>
      <Breadcrumb className="mb-4">
        <Breadcrumb.Item>
          <Link to="/">Home</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Privacy Policy</Breadcrumb.Item>
      </Breadcrumb>

      <Title level={2}>Privacy Policy</Title>
      <Text type="secondary">Effective Date: February 26, 2026</Text>

      <div className="mt-8">
        <Paragraph>
          <strong>Namma Pondy Properties</strong> (“Company”, “We”, “Our”, or
          “Us”) operates as a real estate advisory and property listing service
          based in Kottakuppam, Puducherry, Tamil Nadu, India. This Privacy
          Policy explains how we collect, use, disclose, and safeguard your
          information when you visit our website, submit inquiries, or use our
          services. By using our website or services, you agree to this Privacy
          Policy.
        </Paragraph>

        <Divider />

        <section className="mb-8">
          <Title level={4}>1. Information We Collect</Title>
          <Paragraph>
            We may collect the following types of information:
          </Paragraph>

          <Title level={5}>A. Personal Information</Title>
          <ul>
            <li>Full Name, Phone Number, and Email Address</li>
            <li>City / Location</li>
            <li>Property preferences and Budget range</li>
            <li>Investment requirements</li>
          </ul>

          <Title level={5}>B. Technical Information</Title>
          <ul>
            <li>IP address and Browser type</li>
            <li>Device details and Pages visited</li>
            <li>Cookies and usage data</li>
          </ul>
        </section>

        <section className="mb-8">
          <Title level={4}>2. How We Use Your Information</Title>
          <Paragraph>We use your information to:</Paragraph>
          <ul>
            <li>Respond to property inquiries and schedule site visits</li>
            <li>Share property details, pricing, and investment guidance</li>
            <li>
              Send updates about new listings and promotional offers (with
              consent)
            </li>
            <li>Improve our services and website performance</li>
          </ul>
        </section>

        <section className="mb-8">
          <Title level={4}>3. Communication Consent</Title>
          <Paragraph>
            By submitting your details through contact forms, WhatsApp buttons,
            or inquiry forms, you consent to receive Phone calls, SMS messages,
            WhatsApp messages, and Emails related to property listings, offers,
            site visits, and updates.
          </Paragraph>
          <Paragraph>
            You may opt out at any time by contacting:{" "}
            <strong>info@nammapondy.com</strong>
          </Paragraph>
        </section>

        <section className="mb-8">
          <Title level={4}>4. Data Sharing</Title>
          <Paragraph>
            We do not sell or rent your personal information. However, we may
            share your information with property owners, developers, legal
            advisors, or authorized business partners only when necessary to
            fulfill your property inquiry or transaction.
          </Paragraph>
        </section>

        <section className="mb-8">
          <Title level={4}>5. Data Security</Title>
          <Paragraph>
            We implement reasonable security measures to protect your personal
            information. However, no online transmission or storage system is
            completely secure, and we cannot guarantee absolute security.
          </Paragraph>
        </section>

        <section className="mb-8">
          <Title level={4}>6. Cookies & Tracking</Title>
          <Paragraph>
            Our website may use cookies to improve user experience and analyze
            traffic. You may disable cookies through your browser settings if
            preferred.
          </Paragraph>
        </section>

        <section className="mb-8">
          <Title level={4}>7. Data Retention</Title>
          <Paragraph>
            We retain personal information only as long as necessary for
            responding to inquiries, completing transactions, legal compliance,
            and business record-keeping.
          </Paragraph>
        </section>

        <section className="mb-8">
          <Title level={4}>8. Your Rights</Title>
          <Paragraph>
            You have the right to request access to your personal information,
            request corrections, request deletion (subject to legal
            obligations), and withdraw consent for marketing communication.
          </Paragraph>
          <Paragraph>
            To exercise your rights, contact:{" "}
            <strong>info@nammapondy.com</strong>
          </Paragraph>
        </section>

        <section className="mb-8">
          <Title level={4}>9. Third-Party Links</Title>
          <Paragraph>
            Our website may contain links to external websites. We are not
            responsible for their privacy practices or content.
          </Paragraph>
        </section>

        <section className="mb-8">
          <Title level={4}>10. Changes to This Policy</Title>
          <Paragraph>
            Namma Pondy Properties reserves the right to update this Privacy
            Policy at any time. Updates will be posted on this page with a
            revised effective date.
          </Paragraph>
        </section>

        <Divider />

        <section>
          <Title level={4}>Contact Information</Title>
          <Paragraph>
            <strong>Namma Pondy Properties</strong>
            <br />
            Kottakuppam, Puducherry, Tamil Nadu, India
            <br />
            Email: info@nammapondy.com
          </Paragraph>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
