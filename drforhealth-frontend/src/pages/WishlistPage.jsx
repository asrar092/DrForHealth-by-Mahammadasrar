import { useEffect, useState } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { wishlistApi } from '@/api/wishlistApi';
import EbookCard from '@/components/ui/EbookCard';

export default function WishlistPage() {
  const [ebooks, setEbooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // ============================================================
  // LOAD WISHLIST
  // ============================================================

  const loadWishlist = async () => {
    try {
      setLoading(true);

      const response =
        await wishlistApi.getWishlist();

      const wishlist =
        response.data?.data || [];

      setEbooks(wishlist);

    } catch (error) {
      console.error(
        '[Wishlist] Failed to load:',
        error
      );

      toast.error(
        error.response?.data?.message ||
        'Unable to load wishlist.'
      );

      setEbooks([]);

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
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">

        <div className="flex items-center gap-3 mb-8">
          <Heart
            size={28}
            className="text-red-500 fill-red-500"
          />

          <h1 className="font-display text-3xl font-bold">
            My Wishlist
          </h1>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

          {Array.from({ length: 8 }).map(
            (_, index) => (
              <div
                key={index}
                className="glass-card aspect-[3/5] animate-pulse bg-black/5"
              />
            )
          )}

        </div>

      </div>
    );
  }


  // ============================================================
  // EMPTY WISHLIST
  // ============================================================

  if (ebooks.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16">

        <div className="glass-card text-center py-20 px-6">

          <div className="flex justify-center mb-5">

            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">

              <Heart
                size={30}
                className="text-red-500"
              />

            </div>

          </div>

          <h1 className="font-display text-2xl font-bold text-charcoal mb-2">
            Your Wishlist is Empty
          </h1>

          <p className="text-charcoal/60 max-w-md mx-auto">
            Save your favorite health and wellness
            eBooks here so you can easily find them
            later.
          </p>

        </div>

      </div>
    );
  }


  // ============================================================
  // WISHLIST
  // ============================================================

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">

      {/* ======================================================
          HEADER
      ======================================================= */}

      <div className="flex items-center gap-3 mb-2">

        <Heart
          size={28}
          className="text-red-500 fill-red-500"
        />

        <h1 className="font-display text-3xl font-bold">
          My Wishlist
        </h1>

      </div>


      <p className="text-charcoal/60 mb-10">
        Your saved health & wellness eBooks.
      </p>


      {/* ======================================================
          EBOOK GRID
      ======================================================= */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

        {ebooks.map((ebook) => (
          <EbookCard
            key={ebook._id}
            ebook={ebook}
          />
        ))}

      </div>

    </div>
  );
}