import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  Youtube,
  Github,
  Globe,
} from "lucide-react";

const Footer = () => {
  const [socialLinks, setSocialLinks] = useState([]);

  useEffect(() => {
    const fetchSocialLinks = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/social-media/fetch-all-social-media`,
        );
        const data = await response.json();
        if (Array.isArray(data)) {
          setSocialLinks(data.filter((link) => link.status));
        }
      } catch (error) {
        console.error("Failed to fetch social media links", error);
      }
    };

    fetchSocialLinks();
  }, []);

  const getIcon = (iconName) => {
    // Check if iconName is one of our known keys, otherwise default to Globe
    // The admin panel saves explicit icon names: "Facebook", "Twitter", etc.
    const name = iconName || "";
    if (name === "Facebook") return <Facebook className="w-5 h-5" />;
    if (name === "Twitter") return <Twitter className="w-5 h-5" />;
    if (name === "Instagram") return <Instagram className="w-5 h-5" />;
    if (name === "Linkedin") return <Linkedin className="w-5 h-5" />;
    if (name === "Youtube") return <Youtube className="w-5 h-5" />;
    if (name === "Github") return <Github className="w-5 h-5" />;

    // Fallback for legacy or unknown
    const lower = name.toLowerCase();
    if (lower.includes("facebook")) return <Facebook className="w-5 h-5" />;
    if (lower.includes("twitter")) return <Twitter className="w-5 h-5" />;
    if (lower.includes("instagram")) return <Instagram className="w-5 h-5" />;
    if (lower.includes("linkedin")) return <Linkedin className="w-5 h-5" />;

    return <Globe className="w-5 h-5" />;
  };

  return (
    <footer className="bg-gray-900 text-white pt-12 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-bold mb-4">NammaPondy Properties</h3>
            <p className="text-gray-400 text-sm">
              Your trusted partner for buying, selling, and renting properties
              in Pondicherry. We provide verified listings and seamless
              transactions.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link to="/" className="hover:text-white transition">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/properties" className="hover:text-white transition">
                  Properties
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition">
                  Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-blue-500 mt-0.5" />
                <span>123, Anna Salai, Pondicherry - 605001</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-blue-500" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-blue-500" />
                <span>info@nammapondy.com</span>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              {socialLinks?.map((link) => (
                <a
                  key={link._id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-800 p-2 rounded-full hover:bg-blue-600 transition duration-300"
                  title={link.platform}
                >
                  {getIcon(link.icon || link.platform)}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500 text-sm">
          <p>
            &copy; {new Date().getFullYear()} NammaPondy Properties. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
