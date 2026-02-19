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
    <footer className="bg-indigo-950 text-indigo-100 pt-20 pb-10  relative font-sans">

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand & About */}
          <div className="space-y-6">
            <Link to="/" className="inline-block bg-white p-3 rounded-xl shadow-md">
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
            <p className="text-indigo-200/80 text-sm leading-relaxed pr-4">
              Pondicherry's most trusted real estate platform. Whether you're buying, selling, or renting, we ensure a seamless and verified experience from start to finish.
            </p>
          </div>

          {/* Explore Links */}
          <div>
            <h4 className="text-white text-lg font-bold mb-6 tracking-wide">Explore</h4>
            <ul className="space-y-3 text-sm">
              {['Home', 'Properties', 'About Us', 'Contact Us'].map((item) => (
                <li key={item}>
                  <Link 
                    to={item === 'Home' ? '/' : `/${item.toLowerCase().replace(' ', '-')}`}
                    className="text-indigo-200/80 hover:text-white hover:underline underline-offset-4 decoration-indigo-400 transition-all"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-white text-lg font-bold mb-6 tracking-wide">Contact</h4>
            <ul className="space-y-4 text-sm text-indigo-200/80">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <span>123, Anna Salai,<br />Pondicherry - 605001</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-indigo-400 shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-indigo-400 shrink-0" />
                <span>info@nammapondy.com</span>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h4 className="text-white text-lg font-bold mb-6 tracking-wide">Connect</h4>
            <p className="text-sm text-indigo-200/80 mb-6">
              Follow us to get the latest updates on new properties and market trends.
            </p>
            <div className="flex flex-wrap gap-3">
              {socialLinks?.length > 0 ? (
                socialLinks.map((link) => (
                  <a
                    key={link._id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-indigo-200 hover:bg-white hover:text-indigo-600 hover:-translate-y-1 backdrop-blur-sm transition-all duration-300"
                    title={link.platform}
                  >
                    {getIcon(link.icon || link.platform)}
                  </a>
                ))
              ) : (
                <span className="text-sm text-indigo-300/50">No socials connected</span>
              )}
            </div>
          </div>

        </div>

        {/* Footer Bottom */}
        <div className="pt-8 border-t border-indigo-800/50 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-indigo-300/70">
          <p>&copy; {new Date().getFullYear()} NammaPondy Properties. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link to="/sitemap" className="hover:text-white transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;