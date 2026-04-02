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
  const { businessTypes, propertyTypes = [] } = useNav();

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
    <footer className="bg-[#151c22] text-gray-300 pt-20 pb-10 relative font-sans border-t border-gray-800">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-12 mb-16 text-left">
          {/* Column 2: Useful Links */}
          <div>
            <h4 className="text-white text-lg font-bold mb-6 tracking-wide">
              Useful Links
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="/"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/properties"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  All Properties
                </Link>
              </li>
              <li>
                <Link
                  to="/favorites"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  My Favorites
                </Link>
              </li>
              <li>
                <Link
                  to="/properties?businessType=67cf90f898393e83b487d605"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Meet Kamar
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Properties */}
          <div>
            <h4 className="text-white text-lg font-bold mb-6 tracking-wide">
              Properties
            </h4>
            <ul className="space-y-3 text-sm">
              {propertyTypes
                .filter((type) => {
                  const name = typeof type === "string" ? type : type?.name;
                  return name && ["buy", "rent"].includes(name.toLowerCase());
                })
                .map((type) => {
                  const name = typeof type === "string" ? type : type.name;
                  return (
                    <li key={name}>
                      <Link
                        to={`/properties?type=${encodeURIComponent(name)}`}
                        className="text-gray-400 hover:text-white transition-colors capitalize"
                      >
                        For {name}
                      </Link>
                    </li>
                  );
                })}
              {businessTypes.slice(0, 3).map((type) => (
                <li key={type._id}>
                  <Link
                    to={`/properties?businessType=${type._id}`}
                    className="text-gray-400 hover:text-white transition-colors capitalize"
                  >
                    {type.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Company */}
          <div>
            <h4 className="text-white text-lg font-bold mb-6 tracking-wide">
              Company
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="/contact"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy-policy"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms-and-condition"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Get in Touch */}
          <div>
            <h4 className="text-white text-lg font-bold mb-6 tracking-wide">
              Get in Touch
            </h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="flex items-start justify-start gap-3">
                <MapPin className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
                <span>123, Anna Salai, Pondicherry - 605001</span>
              </li>
              <li className="flex items-center justify-start gap-3">
                <Phone className="w-5 h-5 text-gray-500 shrink-0" />
                <span>+91 94038 92971</span>
              </li>
              <li className="flex items-center justify-start gap-3">
                <Mail className="w-5 h-5 text-gray-500 shrink-0" />
                <span>info@nammapondy.com</span>
              </li>
            </ul>
            <div className="flex flex-wrap justify-start gap-3 pt-8">
              {socialLinks.map((link) => (
                <a
                  key={link._id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-lg bg-[#242424] border border-gray-800 text-gray-400 hover:bg-white hover:text-gray-900 transition-all duration-300 shadow-sm"
                  title={link.platform}
                >
                  {getIcon(link.icon || link.platform)}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} NammaPondy Properties. All rights
            reserved.
          </p>
          <p>
            Designed by{" "}
            <a
              href="https://bmtechx.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              BM TechX
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
