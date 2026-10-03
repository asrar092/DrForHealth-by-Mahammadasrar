import {
  MessageCircle,
  Mail,
  Phone,
  ArrowLeft,
} from 'lucide-react';

import { Link } from 'react-router-dom';

export default function ContactPage() {

  // ==========================================================
  // CONTACT DETAILS
  // ==========================================================

  const whatsappNumber = '919925468237';
  const displayNumber = '+91 99254 68237';

  const email = 'drforhealthsupport@gmail.com';


  // ==========================================================
  // WHATSAPP MESSAGE
  // ==========================================================

  const whatsappMessage = encodeURIComponent(
    'Hello Dr For Health Support, I need help regarding your website/service.'
  );


  // ==========================================================
  // EMAIL DETAILS
  // ==========================================================

  const emailSubject = encodeURIComponent(
    'Dr For Health Support'
  );

  const emailBody = encodeURIComponent(
    'Hello Dr For Health Support,\n\nI need help regarding your website/service.\n\nThank you.'
  );


  // ==========================================================
  // GMAIL COMPOSE URL
  // ==========================================================

  const gmailComposeUrl =
    `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${emailSubject}&body=${emailBody}`;


  return (
    <div className="min-h-[70vh] bg-surface py-12 px-6">

      <div className="max-w-5xl mx-auto">


        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="text-center mb-10">

          <h1 className="font-display text-4xl md:text-5xl font-bold text-charcoal">
            Contact Us
          </h1>

          <p className="text-charcoal/60 mt-3 max-w-2xl mx-auto">
            Need help or have a question? Contact Dr For Health support
            and our team will be happy to assist you.
          </p>

        </div>


        {/* =====================================================
            CONTACT CARDS
        ====================================================== */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">


          {/* =================================================
              WHATSAPP SUPPORT
          ================================================== */}

          <div className="glass-card p-7 text-center">

            {/* WhatsApp Icon */}

            <div className="w-16 h-16 mx-auto rounded-2xl bg-green-100 flex items-center justify-center mb-5">

              <MessageCircle
                size={32}
                className="text-green-600"
              />

            </div>


            {/* Title */}

            <h2 className="font-display text-xl font-bold text-charcoal">
              WhatsApp Support
            </h2>


            {/* Description */}

            <p className="text-charcoal/60 text-sm mt-2">
              Chat with our support team on WhatsApp.
            </p>


            {/* WhatsApp Number */}

            <p className="font-semibold text-charcoal mt-4">
              {displayNumber}
            </p>


            {/* =================================================
                CHAT ON WHATSAPP
            ================================================== */}

            <a
              href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="
                btn-primary
                inline-flex
                items-center
                justify-center
                gap-2
                mt-5
              "
            >

              <MessageCircle size={18} />

              Chat on WhatsApp

            </a>

          </div>



          {/* =================================================
              EMAIL SUPPORT
          ================================================== */}

          <div className="glass-card p-7 text-center">


            {/* Email Icon */}

            <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-100 flex items-center justify-center mb-5">

              <Mail
                size={32}
                className="text-blue-600"
              />

            </div>


            {/* Title */}

            <h2 className="font-display text-xl font-bold text-charcoal">
              Email Support
            </h2>


            {/* Description */}

            <p className="text-charcoal/60 text-sm mt-2">
              Send us an email for support and assistance.
            </p>


            {/* =================================================
                EMAIL ADDRESS
                DISPLAY ONLY
            ================================================== */}

            <p
              className="
                font-semibold
                text-charcoal
                mt-4
                break-all
                select-text
                cursor-default
              "
            >
              {email}
            </p>


            {/* =================================================
                SEND EMAIL
                OPENS GMAIL COMPOSE
            ================================================== */}

            <a
              href={gmailComposeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="
                btn-secondary
                inline-flex
                items-center
                justify-center
                gap-2
                mt-5
              "
            >

              <Mail size={18} />

              Send Email

            </a>

          </div>

        </div>



        {/* =====================================================
            CUSTOMER SUPPORT INFORMATION
        ====================================================== */}

        <div className="glass-card max-w-3xl mx-auto mt-8 p-6">

          <div className="flex items-start gap-4">


            {/* Phone Icon */}

            <div className="w-11 h-11 flex-shrink-0 rounded-xl bg-slate-100 flex items-center justify-center">

              <Phone
                size={20}
                className="text-charcoal/70"
              />

            </div>


            {/* Support Information */}

            <div>

              <h3 className="font-semibold text-charcoal">
                Customer Support
              </h3>

              <p className="text-sm text-charcoal/60 mt-1">
                For questions about orders, eBooks, account access,
                payments, or any other issue, please contact us through
                WhatsApp or email.
              </p>

            </div>

          </div>

        </div>



        {/* =====================================================
            BACK TO HOME
        ====================================================== */}

        <div className="text-center mt-8">

          <Link
            to="/"
            className="
              inline-flex
              items-center
              gap-2
              text-sm
              font-medium
              text-charcoal/70
              hover:text-charcoal
            "
          >

            <ArrowLeft size={16} />

            Back to Home

          </Link>

        </div>

      </div>

    </div>
  );
}