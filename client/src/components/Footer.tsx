import { Link } from "react-router-dom";
import { Facebook, Twitter, Linkedin, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#134848] text-white mt-16">
      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-4 gap-10">
        {/* Logo + About */}
        <div>
          <h2 className="text-2xl font-bold">Talyent Sync</h2>
          <p className="mt-3 text-sm text-gray-200 leading-relaxed">
            Connecting talented freelancers with clients worldwide. Modern, fast, and secure
            marketplace.
          </p>
        </div>

        {/* Navigation */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm text-gray-200">
            <li>
              <Link to="/jobs" className="hover:text-[#2E90EB] transition">
                Find Jobs
              </Link>
            </li>
            <li>
              <Link to="/freelancers" className="hover:text-[#2E90EB] transition">
                Find Freelancers
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-[#2E90EB] transition">
                About Us
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-[#2E90EB] transition">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Contact</h3>
          <ul className="space-y-2 text-sm text-gray-200">
            <li>Email: support@talyentsync.com</li>
            <li>Phone: +92 300 1234567</li>
            <li>Location: Lahore, Pakistan</li>
          </ul>
        </div>

        {/* Social */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Follow Us</h3>
          <div className="flex space-x-4">
            <Link to="/" className="hover:text-[#2E90EB] transition">
              <Facebook size={20} />
            </Link>
            <Link to="/" className="hover:text-[#2E90EB] transition">
              <Twitter size={20} />
            </Link>
            <Link to="/" className="hover:text-[#2E90EB] transition">
              <Linkedin size={20} />
            </Link>
            <Link to="/" className="hover:text-[#2E90EB] transition">
              <Instagram size={20} />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-600">
        <p className="text-center py-4 text-sm text-gray-300">
          © 2025 Talyent Sync. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
