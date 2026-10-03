import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';
import toast from 'react-hot-toast';

import { wishlistApi } from '@/api/wishlistApi';
import { useAuthStore } from '@/store/authStore';

export default function EbookCard({ ebook }) {
  const { isAuthenticated } = useAuthStore();

  const [isWishlisted, setIsWishlisted] =
    useState(false);

  const [wishlistLoading, setWishlistLoading] =
    useState(false);

  const hasDiscount =
    Number(ebook?.discountPercent || 0) > 0;


  // ============================================================
  // IMPORTANT SECURITY RULE
  // ============================================================
  //
  // adminKeywords must NEVER be displayed in this component.
  //
  // The backend removes adminKeywords from public responses.
  //
  // This component intentionally does NOT render:
  //
  // ebook.adminKeywords
  //
  // Therefore normal users cannot see private keywords.
  //
  // ============================================================


  // ============================================================
  // CHECK CURRENT WISHLIST STATUS
  // ============================================================

  useEffect(() => {
    let active = true;

    const checkWishlistStatus = async () => {
      if (
        !isAuthenticated ||
        !ebook?._id
      ) {
        if (active) {
          setIsWishlisted(false);
        }

        return;
      }

      try {
        const response =
          await wishlistApi.checkStatus(
            ebook._id
          );

        const wishlisted =
          response.data?.wishlisted === true;

        if (active) {
          setIsWishlisted(
            wishlisted
          );
        }

      } catch (error) {
        console.error(
          '[Wishlist] Status check failed:',
          error
        );

        if (active) {
          setIsWishlisted(false);
        }
      }
    };

    checkWishlistStatus();

    return () => {
      active = false;
    };
  }, [
    ebook?._id,
    isAuthenticated,
  ]);


  // ============================================================
  // SYNC WISHLIST CHANGES BETWEEN CARDS
  // ============================================================

  useEffect(() => {
    const handleWishlistUpdated = (
      event
    ) => {
      const {
        ebookId,
        wishlisted,
      } = event.detail || {};

      if (
        String(ebookId) ===
        String(ebook?._id)
      ) {
        setIsWishlisted(
          Boolean(wishlisted)
        );
      }
    };

    window.addEventListener(
      'wishlist-updated',
      handleWishlistUpdated
    );

    return () => {
      window.removeEventListener(
        'wishlist-updated',
        handleWishlistUpdated
      );
    };
  }, [ebook?._id]);


  // ============================================================
  // TOGGLE WISHLIST
  // ============================================================

  const handleWishlist = async (
    event
  ) => {
    // Prevent opening ebook detail page
    event.preventDefault();
    event.stopPropagation();

    if (!isAuthenticated) {
      toast.error(
        'Please log in to use your wishlist.'
      );

      return;
    }

    if (
      wishlistLoading ||
      !ebook?._id
    ) {
      return;
    }

    try {
      setWishlistLoading(true);

      const response =
        await wishlistApi.toggleWishlist(
          ebook._id
        );

      const newStatus =
        response.data?.wishlisted === true;

      // Update this card
      setIsWishlisted(
        newStatus
      );

      // Notify other components/cards
      window.dispatchEvent(
        new CustomEvent(
          'wishlist-updated',
          {
            detail: {
              ebookId:
                ebook._id,

              wishlisted:
                newStatus,
            },
          }
        )
      );

      // Toast
      toast.success(
        response.data?.message ||
          (
            newStatus
              ? 'eBook added to wishlist.'
              : 'eBook removed from wishlist.'
          )
      );

    } catch (error) {
      console.error(
        '[Wishlist] Toggle failed:',
        error
      );

      toast.error(
        error.response?.data?.message ||
          'Unable to update wishlist.'
      );

    } finally {
      setWishlistLoading(false);
    }
  };


  // ============================================================
  // UI
  // ============================================================

  return (
    <Link
      to={`/ebooks/${ebook.slug}`}
      className="
        glass-card
        glass-card-hover
        group
        flex
        flex-col
        overflow-hidden
      "
    >

      {/* ======================================================
          COVER
      ======================================================= */}

      <div
        className="
          relative
          aspect-[3/4]
          w-full
          overflow-hidden
          bg-gradient-to-br
          from-green/10
          to-blue/10
        "
      >

        {/* COVER IMAGE */}

        {ebook.coverImageUrl ? (
          <img
            src={ebook.coverImageUrl}
            alt={ebook.title}
            className="
              h-full
              w-full
              object-cover
              transition-transform
              duration-500
              group-hover:scale-105
            "
            onError={(e) => {
              e.currentTarget.style.display =
                'none';
            }}
          />
        ) : (
          <div
            className="
              h-full
              w-full
              flex
              items-center
              justify-center
              text-sm
              text-charcoal/40
            "
          >
            No Cover
          </div>
        )}


        {/* ====================================================
            FEATURED
        ===================================================== */}

        {ebook.isFeatured && (
          <span
            className="
              absolute
              top-3
              left-3
              bg-brand-gradient
              text-white
              text-xs
              font-semibold
              px-3
              py-1
              rounded-full
            "
          >
            Featured
          </span>
        )}


        {/* ====================================================
            DISCOUNT
        ===================================================== */}

        {hasDiscount && (
          <span
            className="
              absolute
              top-3
              right-3
              bg-charcoal
              text-white
              text-xs
              font-semibold
              px-3
              py-1
              rounded-full
            "
          >
            -{ebook.discountPercent}%
          </span>
        )}


        {/* ====================================================
            WISHLIST HEART
        ===================================================== */}

        <button
          type="button"
          onClick={handleWishlist}
          disabled={wishlistLoading}
          aria-label={
            isWishlisted
              ? 'Remove from wishlist'
              : 'Add to wishlist'
          }
          title={
            isWishlisted
              ? 'Remove from wishlist'
              : 'Add to wishlist'
          }
          className={`
            absolute
            bottom-3
            right-3
            z-20
            w-10
            h-10
            flex
            items-center
            justify-center
            rounded-full
            bg-white/95
            shadow-md
            transition-all
            duration-200
            hover:scale-110
            disabled:opacity-60
            disabled:cursor-not-allowed
            ${
              isWishlisted
                ? 'text-red-500'
                : 'text-charcoal/60 hover:text-red-500'
            }
          `}
        >
          <Heart
            size={20}
            strokeWidth={2}
            className={
              isWishlisted
                ? 'fill-red-500 text-red-500'
                : ''
            }
          />
        </button>

      </div>


      {/* ======================================================
          EBOOK DETAILS
      ======================================================= */}

      <div className="p-5 flex flex-col flex-1">

        {/* CATEGORY */}

        {ebook.category?.name && (
          <p
            className="
              text-xs
              text-blue-dark
              font-semibold
              uppercase
              tracking-wide
              mb-1
            "
          >
            {ebook.category.name}
          </p>
        )}


        {/* TITLE */}

        <h3
          className="
            font-display
            font-semibold
            text-charcoal
            leading-snug
            line-clamp-2
            mb-2
          "
        >
          {ebook.title}
        </h3>


        {/* ====================================================
            REVIEWS
        ===================================================== */}

        {Number(ebook.reviewsCount || 0) > 0 && (
          <div
            className="
              flex
              items-center
              gap-1
              text-sm
              text-charcoal/60
              mb-3
            "
          >
            <Star
              size={14}
              className="fill-warning text-warning"
            />

            <span>
              {Number(
                ebook.averageRating || 0
              ).toFixed(1)}
            </span>

            <span>
              ({ebook.reviewsCount})
            </span>
          </div>
        )}


        {/* ====================================================
            PRICE
        ===================================================== */}

        <div
          className="
            mt-auto
            flex
            items-baseline
            gap-2
            pt-2
          "
        >

          <span
            className="
              font-display
              font-bold
              text-lg
              text-charcoal
            "
          >
            ₹{ebook.finalPrice}
          </span>


          {hasDiscount && (
            <span
              className="
                text-sm
                text-charcoal/40
                line-through
              "
            >
              ₹{ebook.priceINR}
            </span>
          )}

        </div>

      </div>

    </Link>
  );
}