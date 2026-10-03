import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import {
  ShieldCheck,
  Download,
  BadgeCheck,
  Loader2,
  Eye,
  X,
} from 'lucide-react';

import { ebookApi, orderApi } from '@/api/ebookApi';
import { useAuthStore } from '@/store/authStore';
import { openRazorpayCheckout } from '@/utils/razorpay';
import Button from '@/components/ui/Button';

export default function EbookDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const { user, isAuthenticated } = useAuthStore();

  const [ebook, setEbook] = useState(null);
  const [owned, setOwned] = useState(false);

  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  const [couponCode, setCouponCode] = useState('');

  // ==========================================
  // PREVIEW STATES
  // ==========================================

  const [previewUrl, setPreviewUrl] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);

  // ==========================================
  // LOAD EBOOK
  // ==========================================

  useEffect(() => {
    setLoading(true);

    ebookApi
      .getBySlug(slug)
      .then(({ data }) => {
        setEbook(data.data);
        setOwned(data.owned);
      })
      .catch(() => {
        setEbook(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  // ==========================================
  // OPEN PREVIEW
  // ==========================================

  const handlePreview = async () => {
    if (!ebook?._id) {
      return;
    }

    setPreviewLoading(true);

    try {
      const { data } =
        await ebookApi.getPreviewUrl(
          ebook._id
        );

      const url = data.data.previewUrl;

      setPreviewUrl(url);
      setPreviewOpen(true);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          'Preview is not available.'
      );
    } finally {
      setPreviewLoading(false);
    }
  };

  // ==========================================
  // CLOSE PREVIEW
  // ==========================================

  const closePreview = () => {
    setPreviewOpen(false);
    setPreviewUrl('');
  };

  // ==========================================
  // PURCHASE
  // ==========================================

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      navigate('/login', {
        state: {
          from: `/ebooks/${slug}`,
        },
      });

      return;
    }

    setPurchasing(true);

    try {
      const { data } = await orderApi.create({
        ebookId: ebook._id,
        couponCode: couponCode || undefined,
      });

      await openRazorpayCheckout({
        orderData: data.data,
        userEmail: user.email,
        userName: user.name,

        onSuccess: async (response) => {
          try {
            await orderApi.verify({
              razorpayOrderId:
                response.razorpay_order_id,

              razorpayPaymentId:
                response.razorpay_payment_id,

              razorpaySignature:
                response.razorpay_signature,
            });

            toast.success(
              'Payment successful! Your eBook is being added to your library.'
            );

            navigate('/dashboard/library');
          } catch {
            toast.error(
              'Payment verification failed. Contact support if you were charged.'
            );
          }
        },

        onDismiss: () => {
          setPurchasing(false);
        },
      });
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          'Could not start checkout.'
      );

      setPurchasing(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-24 text-center text-charcoal/50">
        Loading…
      </div>
    );
  }

  // ==========================================
  // NOT FOUND
  // ==========================================

  if (!ebook) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-24 text-center text-charcoal/50">
        eBook not found.
      </div>
    );
  }

  return (
    <>
      {/* ========================================
          MAIN EBOOK DETAIL PAGE
      ========================================= */}

      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-[340px_1fr] gap-12">

        {/* ======================================
            COVER + PURCHASE CARD
        ====================================== */}

        <div className="md:sticky md:top-24 h-fit">

          {/* Cover Image */}
          <div className="glass-card overflow-hidden aspect-[3/4] mb-6 bg-gradient-to-br from-green/10 to-blue/10">

            <img
              src={ebook.coverImageUrl}
              alt={ebook.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display =
                  'none';
              }}
            />

          </div>

          {/* Purchase Card */}
          <div className="glass-card p-6">

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-4">

              <span className="font-display text-3xl font-bold">
                ₹{ebook.finalPrice}
              </span>

              {ebook.discountPercent > 0 && (
                <span className="text-charcoal/40 line-through">
                  ₹{ebook.priceINR}
                </span>
              )}

            </div>

            {/* ==================================
                PREVIEW BUTTON
            ================================== */}

            <Button
              variant="outline"
              className="w-full mb-3"
              onClick={handlePreview}
              disabled={previewLoading}
            >
              {previewLoading ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />

                  Loading Preview...
                </>
              ) : (
                <>
                  <Eye size={18} />

                  Preview 2 Pages
                </>
              )}
            </Button>

            {/* ==================================
                PURCHASE
            ================================== */}

            {owned ? (
              <Button
                className="w-full"
                onClick={() =>
                  navigate(
                    '/dashboard/library'
                  )
                }
              >
                <Download size={18} />

                Go to My Library
              </Button>
            ) : (
              <>
                <input
                  className="input-field mb-3 text-sm"
                  placeholder="Coupon code (optional)"
                  value={couponCode}
                  onChange={(e) =>
                    setCouponCode(
                      e.target.value
                    )
                  }
                />

                <Button
                  className="w-full"
                  onClick={handlePurchase}
                  disabled={purchasing}
                >
                  {purchasing ? (
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                  ) : (
                    'Buy Now'
                  )}
                </Button>
              </>
            )}

            {/* Security Information */}
            <div className="mt-5 space-y-2 text-sm text-charcoal/60">

              <div className="flex items-center gap-2">

                <ShieldCheck
                  size={16}
                  className="text-green-dark shrink-0"
                />

                Secure checkout via Razorpay

              </div>

              <div className="flex items-center gap-2">

                <BadgeCheck
                  size={16}
                  className="text-green-dark shrink-0"
                />

                Lifetime access after purchase

              </div>

            </div>

          </div>
        </div>

        {/* ======================================
            EBOOK CONTENT
        ====================================== */}

        <div>

          <p className="text-sm font-semibold text-blue-dark uppercase tracking-wide mb-2">
            {ebook.category?.name}
          </p>

          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            {ebook.title}
          </h1>

          {ebook.subtitle && (
            <p className="text-lg text-charcoal/60 mb-6">
              {ebook.subtitle}
            </p>
          )}

          <div className="prose prose-charcoal max-w-none whitespace-pre-line leading-relaxed text-charcoal/80">
            {ebook.description}
          </div>

          {ebook.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-8">

              {ebook.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-black/5 px-3 py-1.5 rounded-full text-charcoal/60"
                >
                  {tag}
                </span>
              ))}

            </div>
          )}

        </div>
      </div>

      {/* ========================================
          PREVIEW MODAL
      ========================================= */}

      {previewOpen && previewUrl && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">

          {/* Modal */}
          <div className="bg-white rounded-2xl w-full max-w-5xl h-[90vh] overflow-hidden shadow-2xl flex flex-col">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b">

              <div>
                <h2 className="font-display text-lg font-bold">
                  eBook Preview
                </h2>

                <p className="text-sm text-charcoal/50">
                  Preview of the first 2 pages
                </p>
              </div>

              <button
                type="button"
                onClick={closePreview}
                className="p-2 rounded-full hover:bg-black/5 transition"
                aria-label="Close preview"
              >
                <X size={22} />
              </button>

            </div>

            {/* PDF */}
            <div className="flex-1 bg-gray-100">

              <iframe
                src={previewUrl}
                title={`${ebook.title} Preview`}
                className="w-full h-full border-0"
              />

            </div>

          </div>
        </div>
      )}
    </>
  );
}