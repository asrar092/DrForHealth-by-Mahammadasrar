import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingBag } from 'lucide-react';

import { wishlistApi } from '@/api/wishlistApi';

export default function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [error, setError] = useState('');

  // ============================================================
  // LOAD WISHLIST
  // ============================================================

  const loadWishlist = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await wishlistApi.getWishlist();

      const data =
        response.data?.data ||
        response.data?.wishlist ||
        [];

      setWishlist(
        Array.isArray(data) ? data : []
      );

    } catch (err) {
      console.error(
        '[Wishlist] Failed to load:',
        err
      );

      setError(
        err.response?.data?.message ||
        'Unable to load your wishlist.'
      );

    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    loadWishlist();
  }, []);

  // ============================================================
  // REMOVE FROM WISHLIST
  // ============================================================

  const handleRemove = async (ebookId) => {
    if (!ebookId) return;

    try {
      setRemovingId(ebookId);

      await wishlistApi.removeFromWishlist(
        ebookId
      );

      setWishlist((current) =>
        current.filter(
          (ebook) =>
            String(ebook._id || ebook.id) !==
            String(ebookId)
        )
      );

    } catch (err) {
      console.error(
        '[Wishlist] Remove failed:',
        err
      );

      setError(
        err.response?.data?.message ||
        'Unable to remove this eBook from wishlist.'
      );

    } finally {
      setRemovingId(null);
    }
  };

  // ============================================================
  // GET EBOOK ID
  // ============================================================

  const getEbookId = (ebook) => {
    return ebook?._id || ebook?.id;
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="space-y-8">

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-charcoal">
            Wishlist
          </h1>

          <p className="text-charcoal/60 mt-2">
            Your saved eBooks
          </p>
        </div>

        <div className="glass-card p-10 text-center">
          <div className="mx-auto w-10 h-10 border-4 border-border border-t-green-dark rounded-full animate-spin" />

          <p className="mt-4 text-sm text-charcoal/60">
            Loading your wishlist...
          </p>
        </div>

      </div>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="space-y-8">

      {/* ========================================================
          HEADER
      ======================================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        <div>
          <div className="flex items-center gap-3">

            <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center">
              <Heart
                size={22}
                className="text-red-500 fill-red-500"
              />
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-charcoal">
                Wishlist
              </h1>

              <p className="text-charcoal/60 mt-1">
                Save your favourite eBooks for later.
              </p>
            </div>

          </div>
        </div>

        {wishlist.length > 0 && (
          <div className="text-sm text-charcoal/60">
            {wishlist.length}{' '}
            {wishlist.length === 1
              ? 'eBook'
              : 'eBooks'}
          </div>
        )}

      </div>


      {/* ========================================================
          ERROR
      ======================================================== */}

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}


      {/* ========================================================
          EMPTY WISHLIST
      ======================================================== */}

      {wishlist.length === 0 ? (

        <div className="glass-card p-10 sm:p-16 text-center">

          <div className="mx-auto w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">

            <Heart
              size={30}
              className="text-red-400"
            />

          </div>

          <h2 className="mt-5 text-xl font-semibold text-charcoal">
            Your wishlist is empty
          </h2>

          <p className="mt-2 max-w-md mx-auto text-sm text-charcoal/60">
            You haven't added any eBooks to your wishlist yet.
            Browse our collection and save the books you love.
          </p>

          <Link
            to="/store"
            className="btn-primary mt-6 inline-flex items-center gap-2"
          >
            <ShoppingBag size={18} />

            Browse eBooks
          </Link>

        </div>

      ) : (

        /* ======================================================
           WISHLIST GRID
        ======================================================= */

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

          {wishlist.map((ebook) => {

            const ebookId =
              getEbookId(ebook);

            const slug =
              ebook.slug ||
              ebook._id ||
              ebook.id;

            const image =
              ebook.coverImageUrl ||
              ebook.coverImage ||
              ebook.cover ||
              '/drforhealth-logo.png';

            const price =
              Number(
                ebook.priceINR ?? 0
              );

            const discount =
              Number(
                ebook.discountPercent ?? 0
              );

            const finalPrice =
              discount > 0
                ? price -
                  (price * discount) / 100
                : price;

            return (

              <div
                key={ebookId}
                className="glass-card overflow-hidden group"
              >

                {/* =================================================
                    COVER
                ================================================= */}

                <Link
                  to={`/store/${slug}`}
                  className="block"
                >

                  <div className="relative aspect-[3/4] bg-surface overflow-hidden">

                    <img
                      src={image}
                      alt={
                        ebook.title ||
                        'eBook'
                      }
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(event) => {
                        event.currentTarget.src =
                          '/drforhealth-logo.png';
                      }}
                    />

                    {/* Discount */}

                    {discount > 0 && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-green-dark text-white text-xs font-semibold">
                        {discount}% OFF
                      </span>
                    )}

                  </div>

                </Link>


                {/* =================================================
                    CONTENT
                ================================================= */}

                <div className="p-5">

                  <Link
                    to={`/store/${slug}`}
                  >
                    <h2 className="font-semibold text-lg text-charcoal line-clamp-2 hover:text-green-dark transition-colors">
                      {ebook.title ||
                        'Untitled eBook'}
                    </h2>
                  </Link>

                  {ebook.subtitle && (
                    <p className="mt-1 text-sm text-charcoal/60 line-clamp-2">
                      {ebook.subtitle}
                    </p>
                  )}


                  {/* =================================================
                      CATEGORY
                  ================================================= */}

                  {ebook.category && (
                    <p className="mt-3 text-xs text-charcoal/50">
                      {typeof ebook.category ===
                      'object'
                        ? ebook.category.name
                        : ebook.category}
                    </p>
                  )}


                  {/* =================================================
                      PRICE + REMOVE
                  ================================================= */}

                  <div className="mt-5 flex items-center justify-between gap-3">

                    <div className="flex items-center gap-2">

                      <span className="font-bold text-green-dark">
                        ₹
                        {Math.round(
                          finalPrice
                        )}
                      </span>

                      {discount > 0 && (
                        <span className="text-sm text-charcoal/40 line-through">
                          ₹
                          {Math.round(
                            price
                          )}
                        </span>
                      )}

                    </div>


                    <button
                      type="button"
                      onClick={() =>
                        handleRemove(
                          ebookId
                        )
                      }
                      disabled={
                        removingId ===
                        ebookId
                      }
                      className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Remove from wishlist"
                      aria-label="Remove from wishlist"
                    >

                      {removingId ===
                      ebookId ? (
                        <span className="block w-[18px] h-[18px] border-2 border-red-300 border-t-red-500 rounded-full animate-spin" />
                      ) : (
                        <Trash2
                          size={18}
                        />
                      )}

                    </button>

                  </div>

                </div>

              </div>

            );
          })}

        </div>

      )}

    </div>
  );
}