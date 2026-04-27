import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useNav } from "@/context/NavContext";
import { useAuth } from "@/context/AuthContext";
import { message } from "antd";
import { checkPropertyListingLimit } from "@/utils/propertyLimits";
import { slugify } from "@/utils/slugify";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  Twitter,
  Globe,
} from "lucide-react";

const Footer = () => {
  const [socialLinks, setSocialLinks] = useState([]);
  const { businessTypes, propertyCategories = [] } = useNav();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handlePostProperty = () => {
    if (isAuthenticated && user) {
      const { canPost, reason, message: limitMessage, redirectPath } = checkPropertyListingLimit(user);

      if (!canPost) {
        message.warning({
          content: limitMessage,
          key: "verification-restricted"
        });

        if (reason === "unverified") {
          const role = user?.role_id?.role_name?.toUpperCase() || user?.role?.name?.toUpperCase();
          if (role === "SELLER") {
            navigate("/seller/profile");
          } else {
            navigate("/user/profile");
          }
        } else if (reason === "limit_reached") {
          navigate(redirectPath || "/seller/upgrade-plan");
        }
        return;
      }

      const role =
        user?.role_id?.role_name?.toUpperCase() ||
        user?.role?.name?.toUpperCase();
      if (role === "ADMIN") {
        navigate("/admin/properties/add");
      } else if (role === "SELLER") {
        navigate("/seller/add-property");
      } else {
        navigate("/add-property");
      }
    } else {
      navigate("/post-property");
    }
  };

  const getIcon = (platform) => {
    switch (platform.toLowerCase()) {
      case "facebook":
        return <Facebook size={18} />;
      case "instagram":
        return <Instagram size={18} />;
      case "linkedin":
        return <Linkedin size={18} />;
      case "youtube":
        return <Youtube size={18} />;
      case "twitter":
        return <Twitter size={18} />;
      default:
        return <Globe size={18} />;
    }
  };

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

  return (
    <footer className="bg-[#151c22] text-gray-300 pt-20 pb-10 relative font-sans border-t border-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-20 xl:px-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16 text-left">
          {/* Column 1: Brand Info */}
          <div className="pl-4 lg:pl-8">
            <div className="mb-6">
              <img src="/Logo/logo1.png" alt="Namma Pondy Logo" className="h-16 w-auto object-contain" />
            </div>
            <h4 className="text-white text-lg font-bold mb-6 tracking-wide underline-offset-8">
              Namma Pondy Properties
            </h4>
            <div className="text-sm leading-relaxed text-gray-400">
              <p>Pondicherry's leading platform to buy, sell, and rent certified properties.</p>
            </div>
          </div>

          {/* Column 2: Properties */}
          <div>
            <h4 className="text-white text-lg font-bold uppercase mb-6 tracking-wide">
              Properties
            </h4>
            <ul className="space-y-4 text-sm">
              <li>
                <Link
                  to="/properties"
                  className="text-gray-400 hover:text-white transition-colors underline-offset-4 hover:underline"
                >
                  All Properties
                </Link>
              </li>
              {propertyCategories.map((category) => (
                <li key={category}>
                  <Link
                    to={`/properties?category=${encodeURIComponent(category)}`}
                    className="text-gray-400 hover:text-white transition-colors capitalize underline-offset-4 hover:underline"
                  >
                    {category}
                  </Link>
                </li>
              ))}
              {businessTypes.map((type) => (
                <li key={type._id}>
                  <Link
                    to={`/business/${slugify(type.name)}`}
                    className="text-gray-400 hover:text-white transition-colors capitalize underline-offset-4 hover:underline"
                  >
                    {type.name}
                  </Link>
                </li>
              ))}
              <li className="pt-0">
                <button
                  onClick={handlePostProperty}
                  className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm group"
                >
                  <span className="underline-offset-4 group-hover:underline">Post Property</span>
                  <span className="bg-[#1aa554] text-white text-[10px] tracking-wider font-bold px-1.5 py-0.5 rounded">
                    FREE
                  </span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h4 className="text-white text-lg font-bold mb-6 uppercase tracking-wide">
              Company
            </h4>
            <ul className="space-y-4 text-sm">
              <li>
                <Link
                  to="/"
                  className="text-gray-400 hover:text-white transition-colors underline-offset-4 hover:underline"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-gray-400 hover:text-white transition-colors underline-offset-4 hover:underline"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/agent-info"
                  className="text-gray-400 hover:text-white transition-colors underline-offset-4 hover:underline"
                >
                  Agent Info
                </Link>
              </li>
              <li>
                <Link
                  to="/builder-info"
                  className="text-gray-400 hover:text-white transition-colors underline-offset-4 hover:underline"
                >
                  Builder Info
                </Link>
              </li>
              <li>
                <Link
                  to="/favorites"
                  className="text-gray-400 hover:text-white transition-colors underline-offset-4 hover:underline"
                >
                  My Favorites
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-gray-400 hover:text-white transition-colors underline-offset-4 hover:underline"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy-policy"
                  className="text-gray-400 hover:text-white transition-colors underline-offset-4 hover:underline"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms-and-condition"
                  className="text-gray-400 hover:text-white transition-colors underline-offset-4 hover:underline"
                >
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Get in Touch & Connect */}
          <div>
            <h4 className="text-white text-lg font-bold uppercase mb-6 tracking-wide">
              Get in Touch
            </h4>
            <ul className="space-y-5 text-sm text-gray-400 mb-10">
              <li className="flex items-start justify-start gap-4">
                {/* <MapPin className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" /> */}
                <span className="underline-offset-4 hover:underline cursor-pointer">
                  123, Anna Salai, Pondicherry - 605001
                </span>
              </li>
              <li className="flex items-center justify-start gap-4">
                {/* <Phone className="w-5 h-5 text-gray-400 shrink-0" /> */}
                <span className="underline-offset-4 hover:underline cursor-pointer">
                  +91 94038 92971
                </span>
              </li>
              <li className="flex items-center justify-start gap-4">
                {/* <Mail className="w-5 h-5 text-gray-400 shrink-0" /> */}
                <span className="underline-offset-4 hover:underline cursor-pointer">
                  help@nammapondyproperties.com
                </span>
              </li>
            </ul>
            
            <h5 className="text-white text-sm font-bold uppercase tracking-wide mb-6">Connect with Us</h5>
            <div className="flex flex-wrap gap-4">
              {socialLinks.map((link) => (
                <a
                  key={link._id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-[#166aa8] hover:text-white transition-all duration-300 shadow-lg group"
                  title={link.platform}
                >
                  <div className="group-hover:scale-110 transition-transform duration-300">
                    {getIcon(link.platform)}
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Copyright & Credits */}
          <div className="text-[11px] text-gray-500 font-medium whitespace-nowrap">
            &copy; {new Date().getFullYear()} Namma Pondy Properties. All rights reserved. | Designed by <a href="https://bmtechx.in" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">BM TechX</a>
          </div>

          {/* Payment Methods */}
          <div className="flex items-center gap-3 text-[11px] text-gray-400 tracking-wider">
            <div className="flex items-center gap-4">
              <img src="/icons/upi.svg" alt="UPI" className="h-5 w-auto object-contain opacity-90" />
              <img src="/icons/gpay.svg" alt="GPay" className="h-5 w-auto object-contain opacity-90" />
              <img src="/icons/payment.svg" alt="RuPay" className="h-5 w-auto object-contain opacity-90" />
              <img src="/icons/visa.svg" alt="Visa" className="h-5 w-auto object-contain opacity-90" />
              <img src="/icons/mastercard.svg" alt="Mastercard" className="h-5 w-auto object-contain opacity-90" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
