import { Link } from 'react-router-dom';
import { Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-charcoal text-white/80 mt-24">

      {/* =====================================================
          FOOTER MAIN CONTENT
      ====================================================== */}

      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">

        {/* =====================================================
            BRAND
        ====================================================== */}

        <div>
          <Link
            to="/"
            className="flex items-center gap-3 mb-4"
          >
            <img
              src="/drforhealth-logo.png"
              alt="Dr For Health"
              className="w-10 h-10 object-contain"
            />

            <span className="font-display font-bold text-white text-lg">
              Dr For Health
            </span>
          </Link>

          <p className="text-sm leading-relaxed">
            Practical, evidence-based health and wellness eBooks —
            written to be read, not skimmed.
          </p>
        </div>


        {/* =====================================================
            EXPLORE
        ====================================================== */}

        <div>
          <h4 className="font-display font-semibold text-white mb-4">
            Explore
          </h4>

          <ul className="space-y-2 text-sm">

            <li>
              <Link
                to="/store"
                className="hover:text-green transition-colors"
              >
                All eBooks
              </Link>
            </li>

            <li>
              <Link
                to="/blog"
                className="hover:text-green transition-colors"
              >
                Blog
              </Link>
            </li>

            <li>
              <Link
                to="/about"
                className="hover:text-green transition-colors"
              >
                About
              </Link>
            </li>

            <li>
              <Link
                to="/contact"
                className="hover:text-green transition-colors"
              >
                Contact
              </Link>
            </li>

            <li>
              <Link
                to="/dashboard"
                className="hover:text-green transition-colors"
              >
                Dashboard
              </Link>
            </li>

          </ul>
        </div>


        {/* =====================================================
            LEGAL
        ====================================================== */}

        <div>
          <h4 className="font-display font-semibold text-white mb-4">
            Legal
          </h4>

          <ul className="space-y-2 text-sm">

            <li>
              <Link
                to="/privacy-policy"
                className="hover:text-green transition-colors"
              >
                Privacy Policy
              </Link>
            </li>

            <li>
              <Link
                to="/terms"
                className="hover:text-green transition-colors"
              >
                Terms & Conditions
              </Link>
            </li>

            <li>
              <Link
                to="/refund-policy"
                className="hover:text-green transition-colors"
              >
                Refund Policy
              </Link>
            </li>

          </ul>
        </div>


        {/* =====================================================
            CONTACT
        ====================================================== */}

        <div>
          <h4 className="font-display font-semibold text-white mb-4">
            Contact
          </h4>

          <ul className="space-y-3 text-sm">

            {/* Email */}
            <li className="flex items-start gap-2">

              <Mail
                size={16}
                className="mt-0.5 shrink-0"
              />

              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=drforhealthsupport@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-green transition-colors"
              >
                drforhealthsupport@gmail.com
              </a>

            </li>


            {/* Location */}
            <li className="flex items-start gap-2">

              <MapPin
                size={16}
                className="mt-0.5 shrink-0"
              />

              <span>
                Ahmedabad, Gujarat 380055
              </span>

            </li>

          </ul>
        </div>

      </div>

    </footer>
  );
}