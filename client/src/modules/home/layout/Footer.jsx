import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useNav } from "@/context/NavContext";
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
  const { businessTypes, propertyTypes } = useNav();

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
    const name = iconName || "";
    if (name === "Facebook") return <Facebook className="w-5 h-5" />;
    if (name === "Twitter") return <Twitter className="w-5 h-5" />;
    if (name === "Instagram") return <Instagram className="w-5 h-5" />;
    if (name === "Linkedin") return <Linkedin className="w-5 h-5" />;
    if (name === "Youtube") return <Youtube className="w-5 h-5" />;
    if (name === "Github") return <Github className="w-5 h-5" />;

    const lower = name.toLowerCase();
    if (lower.includes("facebook")) return <Facebook className="w-5 h-5" />;
    if (lower.includes("twitter")) return <Twitter className="w-5 h-5" />;
    if (lower.includes("instagram")) return <Instagram className="w-5 h-5" />;
    if (lower.includes("linkedin")) return <Linkedin className="w-5 h-5" />;

    return <Globe className="w-5 h-5" />;
  };

  return (
    <footer className="bg-[#1a1a1a] text-gray-300 pt-20 pb-10 relative font-sans border-t border-gray-800">

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-12 mb-16 text-center md:text-left">

          {/* Brand & About */}
          <div className="space-y-6 flex flex-col items-center md:items-start">
            <Link to="/" className="inline-block">
              <img
                src="/Logo/logo.png"
                alt="NammaPondy Logo"
                className="h-10 w-auto object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/Logo/logo.png";
                }}
              />
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed pr-4 max-w-xs md:max-w-none">
              Pondicherry's most trusted real estate platform. Whether you're buying, selling, or renting, we ensure a seamless and verified experience from start to finish.
            </p>
          </div>

          {/* Property Types */}
          <div>
            <h4 className="text-white text-lg font-bold mb-6 tracking-wide relative inline-block after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-8 after:h-1 after:bg-yellow-300 hover:after:w-full after:transition-all after:duration-300 cursor-default">
              Properties
            </h4>
            <ul className="space-y-3 text-sm">
              {propertyTypes
                .filter((type) => {
                  const name = typeof type === "string" ? type : type?.name;
                  return (
                    name &&
                    typeof name === "string" &&
                    ["buy", "rent"].includes(name.toLowerCase())
                  );
                })
                .map((type) => {
                  const name = typeof type === "string" ? type : type.name;
                  return (
                    <li key={name}>
                      <Link
                        to={`/properties?type=${encodeURIComponent(name)}`}
                        className="text-gray-400 hover:text-yellow-300 font-medium transition-colors text-[15px] tracking-wide"
                      >
                        For {name.charAt(0).toUpperCase() + name.slice(1)}
                      </Link>
                    </li>
                  );
                })}
              <li>
                <Link
                  to="/properties"
                  className="text-gray-400 hover:text-yellow-300 font-medium transition-colors text-[15px] tracking-wide"
                >
                  All Properties
                </Link>
              </li>
            </ul>
          </div>

          {/* Business Types */}
          <div>
            <h4 className="text-white text-lg font-bold mb-6 tracking-wide relative inline-block after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-8 after:h-1 after:bg-yellow-300 hover:after:w-full after:transition-all after:duration-300 cursor-default">
              Categories
            </h4>
            <ul className="space-y-3 text-sm">
              {businessTypes.map((type) => {
                const id = type._id?.toString() || type.name;
                const name =
                  typeof type.name === "string"
                    ? type.name
                    : type.name?.name || "Unknown";
                return (
                  <li key={id}>
                    <Link
                      to={`/properties?businessType=${id}`}
                      className="text-gray-400 hover:text-yellow-300 font-medium transition-colors text-[15px] tracking-wide capitalize"
                    >
                      {name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Explore Links */}
          <div>
            <h4 className="text-white text-lg font-bold mb-6 tracking-wide relative inline-block after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-8 after:h-1 after:bg-yellow-300 hover:after:w-full after:transition-all after:duration-300 cursor-default">
              Explore
            </h4>
            <ul className="space-y-3 text-sm">
              {['Home', 'About', 'Contact'].map((item) => (
                <li key={item}>
                  <Link
                    to={item === 'Home' ? '/' : `/${item.toLowerCase().replace(' ', '-')}`}
                    className="text-gray-400 hover:text-yellow-300 font-medium transition-colors text-[15px] tracking-wide"
                  >
                    {item}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/favorites"
                  className="text-gray-400 hover:text-yellow-300 font-medium transition-colors text-[15px] tracking-wide"
                >
                  My Favorites
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Socials */}
          <div className="space-y-8">
            <div>
              <h4 className="text-white text-lg font-bold mb-6 tracking-wide relative inline-block after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-8 after:h-1 after:bg-yellow-300 hover:after:w-full after:transition-all after:duration-300 cursor-default">
                Contact
              </h4>
              <ul className="space-y-4 text-sm text-gray-400 font-medium tracking-wide">
                <li className="flex items-start justify-center md:justify-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
                  <span>123, Anna Salai,<br />Pondicherry - 605001</span>
                </li>
                <li className="flex items-center justify-center md:justify-start gap-3">
                  <Phone className="w-5 h-5 text-gray-500 shrink-0" />
                  <span>+91 98765 43210</span>
                </li>
                <li className="flex items-center justify-center md:justify-start gap-3">
                  <Mail className="w-5 h-5 text-gray-500 shrink-0" />
                  <span>info@nammapondy.com</span>
                </li>
              </ul>
            </div>

            <div>
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                {socialLinks?.length > 0 ? (
                  socialLinks.map((link) => (
                    <a
                      key={link._id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-lg bg-[#242424] border border-gray-800 text-gray-400 hover:bg-white hover:text-gray-900 hover:-translate-y-1 transition-all duration-300 shadow-sm"
                      title={link.platform}
                    >
                      {getIcon(link.icon || link.platform)}
                    </a>
                  ))
                ) : (
                  <span className="text-sm text-gray-600">No socials connected</span>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Footer Bottom */}
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500 font-medium">
          <p>
            &copy; {new Date().getFullYear()} NammaPondy Properties. All rights reserved. | Designed by{" "}
            <a
              href="https://bmtechx.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-yellow-300 transition-colors font-medium"
            >
              BM TechX
            </a>
          </p>
          <div className="flex items-center gap-6">
            <Link
              to="/terms-and-condition"
              className="text-gray-500 hover:text-yellow-300 transition-colors"
            >
              Terms & Conditions
            </Link>
            <Link
              to="/privacy-policy"
              className="text-gray-500 hover:text-yellow-300 transition-colors"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;