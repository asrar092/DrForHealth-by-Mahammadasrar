import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Sparkles,
  Download,
  ArrowRight,
} from 'lucide-react';

import { ebookApi } from '@/api/ebookApi';
import EbookCard from '@/components/ui/EbookCard';

export default function HomePage() {
  const [featured, setFeatured] = useState([]);

  // ==========================================================
  // LOAD FEATURED EBOOKS
  // ==========================================================

  useEffect(() => {
    ebookApi
      .list({
        featured: 'true',
        limit: 4,
      })
      .then(({ data }) => {
        setFeatured(data.data || []);
      })
      .catch(() => {
        setFeatured([]);
      });
  }, []);

  return (
    <div>

      {/* =====================================================
          HERO SECTION
      ====================================================== */}

      <section className="relative overflow-hidden">

        {/* Background Gradient */}

        <div className="absolute inset-0 bg-gradient-to-br from-green/10 via-transparent to-blue/10" />

        <div className="max-w-7xl mx-auto px-6 py-24 md:py-32 relative">

          <div className="max-w-3xl">

            {/* =================================================
                BRAND BADGE
            ================================================== */}

            <span
              className="
                inline-flex
                items-center
                gap-2
                glass-card
                px-4
                py-2
                text-sm
                font-medium
                text-charcoal/80
                mb-6
              "
            >
              <Sparkles
                size={16}
                className="text-green-dark"
              />

              DrForHealth
            </span>


            {/* =================================================
                MAIN TAGLINE
            ================================================== */}

            <h1
              className="
                font-display
                text-4xl
                md:text-6xl
                font-extrabold
                text-charcoal
                leading-tight
                mb-6
              "
            >
              Eat Right.{' '}

              <span
                className="
                  bg-brand-gradient
                  bg-clip-text
                  text-transparent
                "
              >
                Live Better.
              </span>
            </h1>


            {/* =================================================
                DESCRIPTION
            ================================================== */}

            <p
              className="
                text-lg
                text-charcoal/70
                mb-8
                leading-relaxed
                max-w-2xl
              "
            >
              Discover practical health eBooks and trusted wellness
              resources designed to help you make better choices,
              build healthier habits, and live better every day.
            </p>


            {/* =================================================
                HERO BUTTONS
            ================================================== */}

            <div className="flex flex-wrap gap-4">

              {/* =================================================
                  EXPLORE EBOOKS
              ================================================== */}

              <Link
                to="/store"
                className="
                  btn-primary
                  inline-flex
                  items-center
                  gap-2
                "
              >
                Explore eBooks

                <ArrowRight size={18} />
              </Link>


              {/* =================================================
                  EXPLORE HEALTH TOPICS
                  REDIRECTS TO ABOUT PAGE
              ================================================== */}

              <Link
                to="/about"
                className="
                  btn-secondary
                  inline-flex
                  items-center
                  gap-2
                "
              >
                Explore Health Topics
              </Link>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          TRUST / VALUE SECTION
      ====================================================== */}

      <section
        className="
          max-w-7xl
          mx-auto
          px-6
          pb-16
        "
      >

        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-3
            gap-6
          "
        >

          {/* =================================================
              TRUSTED & SECURE
          ================================================== */}

          <div className="glass-card p-6">

            <div
              className="
                bg-brand-gradient
                w-11
                h-11
                rounded-xl
                flex
                items-center
                justify-center
                mb-4
              "
            >
              <ShieldCheck
                size={20}
                className="text-white"
              />
            </div>

            <h3
              className="
                font-display
                font-semibold
                mb-1
              "
            >
              Trusted & Secure
            </h3>

            <p className="text-sm text-charcoal/60">
              Your account and purchase information are handled
              securely so you can access your health resources
              with confidence.
            </p>

          </div>


          {/* =================================================
              READ ANYTIME
          ================================================== */}

          <div className="glass-card p-6">

            <div
              className="
                bg-brand-gradient
                w-11
                h-11
                rounded-xl
                flex
                items-center
                justify-center
                mb-4
              "
            >
              <Download
                size={20}
                className="text-white"
              />
            </div>

            <h3
              className="
                font-display
                font-semibold
                mb-1
              "
            >
              Read Anytime
            </h3>

            <p className="text-sm text-charcoal/60">
              Access your purchased eBooks and health resources
              whenever you need them, on your preferred device.
            </p>

          </div>


          {/* =================================================
              PRACTICAL HEALTH GUIDANCE
          ================================================== */}

          <div className="glass-card p-6">

            <div
              className="
                bg-brand-gradient
                w-11
                h-11
                rounded-xl
                flex
                items-center
                justify-center
                mb-4
              "
            >
              <Sparkles
                size={20}
                className="text-white"
              />
            </div>

            <h3
              className="
                font-display
                font-semibold
                mb-1
              "
            >
              Practical Health Guidance
            </h3>

            <p className="text-sm text-charcoal/60">
              Clear, useful health information created to help you
              make better everyday choices and build healthier habits.
            </p>

          </div>

        </div>

      </section>


      {/* =====================================================
          FEATURED EBOOKS
      ====================================================== */}

      {featured.length > 0 && (

        <section
          className="
            max-w-7xl
            mx-auto
            px-6
            pb-24
          "
        >

          {/* =================================================
              FEATURED HEADER
          ================================================== */}

          <div
            className="
              flex
              items-center
              justify-between
              mb-8
            "
          >

            <h2
              className="
                font-display
                text-2xl
                md:text-3xl
                font-bold
              "
            >
              Featured eBooks
            </h2>


            <Link
              to="/store"
              className="
                text-sm
                font-medium
                text-green-dark
                hover:underline
              "
            >
              View all →
            </Link>

          </div>


          {/* =================================================
              EBOOK GRID
          ================================================== */}

          <div
            className="
              grid
              grid-cols-2
              md:grid-cols-4
              gap-6
            "
          >

            {featured.map((ebook) => (
              <EbookCard
                key={ebook._id}
                ebook={ebook}
              />
            ))}

          </div>

        </section>

      )}

    </div>
  );
}