import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X } from 'lucide-react';

import { ebookApi, categoryApi } from '@/api/ebookApi';
import EbookCard from '@/components/ui/EbookCard';

export default function StorePage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [ebooks, setEbooks] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // ==========================================================
  // SEARCH PARAMS
  // ==========================================================

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';


  // ==========================================================
  // LOAD CATEGORIES
  // ==========================================================

  useEffect(() => {
    let mounted = true;

    const loadCategories = async () => {
      setCategoriesLoading(true);

      try {
        const { data } = await categoryApi.list();

        if (!mounted) return;

        setCategories(
          Array.isArray(data?.data)
            ? data.data
            : []
        );

      } catch (error) {
        if (!mounted) return;

        console.error(
          'Failed to load categories:',
          error
        );

        setCategories([]);

      } finally {
        if (mounted) {
          setCategoriesLoading(false);
        }
      }
    };

    loadCategories();

    return () => {
      mounted = false;
    };
  }, []);


  // ==========================================================
  // LOAD EBOOKS
  // ==========================================================
  //
  // IMPORTANT:
  //
  // User can search using:
  //
  // 1. Book title
  // 2. Description
  // 3. Public tags
  // 4. Private adminKeywords
  //
  // The backend performs the search.
  //
  // adminKeywords are NOT returned to normal users.
  //
  // ==========================================================

  useEffect(() => {
    let mounted = true;

    const loadEbooks = async () => {
      setLoading(true);

      try {
        const params = {};

        // ------------------------------------------------------
        // SEARCH
        // ------------------------------------------------------

        if (search.trim()) {
          params.search = search.trim();
        }

        // ------------------------------------------------------
        // CATEGORY
        // ------------------------------------------------------

        if (category) {
          params.category = category;
        }

        // ------------------------------------------------------
        // PUBLIC EBOOK API
        // ------------------------------------------------------

        const { data } =
          await ebookApi.list(params);

        if (!mounted) return;

        // ------------------------------------------------------
        // IMPORTANT SECURITY RULE
        // ------------------------------------------------------
        //
        // Backend should already remove adminKeywords.
        //
        // This extra frontend sanitization guarantees that
        // adminKeywords are never passed to EbookCard.
        //
        // ------------------------------------------------------

        const publicEbooks =
          Array.isArray(data?.data)
            ? data.data.map((ebook) => {
                const safeEbook = {
                  ...ebook,
                };

                delete safeEbook.adminKeywords;

                return safeEbook;
              })
            : [];

        setEbooks(publicEbooks);

      } catch (error) {
        if (!mounted) return;

        console.error(
          'Failed to load eBooks:',
          error
        );

        setEbooks([]);

      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadEbooks();

    return () => {
      mounted = false;
    };
  }, [search, category]);


  // ==========================================================
  // HANDLE SEARCH CHANGE
  // ==========================================================

  const handleSearchChange = (e) => {
    const value = e.target.value;

    setSearchParams((prev) => {
      const next =
        new URLSearchParams(prev);

      if (value.trim()) {
        next.set(
          'search',
          value
        );
      } else {
        next.delete('search');
      }

      return next;
    });
  };


  // ==========================================================
  // HANDLE CATEGORY CHANGE
  // ==========================================================

  const handleCategoryChange = (e) => {
    const value = e.target.value;

    setSearchParams((prev) => {
      const next =
        new URLSearchParams(prev);

      if (value) {
        next.set(
          'category',
          value
        );
      } else {
        next.delete('category');
      }

      return next;
    });
  };


  // ==========================================================
  // CLEAR SEARCH
  // ==========================================================

  const clearSearch = () => {
    setSearchParams((prev) => {
      const next =
        new URLSearchParams(prev);

      next.delete('search');

      return next;
    });
  };


  // ==========================================================
  // CLEAR ALL FILTERS
  // ==========================================================

  const clearAllFilters = () => {
    setSearchParams({});
  };


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">

      {/* ======================================================
          PAGE HEADER
      ======================================================= */}

      <div className="mb-8">

        <h1 className="font-display text-3xl font-bold mb-2">
          All eBooks
        </h1>

        <p className="text-charcoal/60">
          Browse the full library of health & wellness guides.
        </p>

      </div>


      {/* ======================================================
          SEARCH + CATEGORY
      ======================================================= */}

      <div className="flex flex-col md:flex-row gap-4 mb-10">

        {/* ====================================================
            SEARCH
        ===================================================== */}

        <div className="relative flex-1">

          <Search
            size={18}
            className="
              absolute
              left-4
              top-1/2
              -translate-y-1/2
              text-charcoal/40
              pointer-events-none
            "
          />

          <input
            type="search"
            className="
              input-field
              pl-11
              pr-11
              w-full
            "
            placeholder="Search eBooks, topics or keywords..."
            value={search}
            onChange={handleSearchChange}
            aria-label="Search eBooks"
          />

          {/* CLEAR SEARCH BUTTON */}

          {search && (
            <button
              type="button"
              onClick={clearSearch}
              aria-label="Clear search"
              className="
                absolute
                right-3
                top-1/2
                -translate-y-1/2
                p-1
                rounded-full
                text-charcoal/40
                hover:text-charcoal
                hover:bg-black/5
              "
            >
              <X size={17} />
            </button>
          )}

        </div>


        {/* ====================================================
            CATEGORY
        ===================================================== */}

        <select
          className="input-field md:w-56"
          value={category}
          onChange={handleCategoryChange}
          disabled={categoriesLoading}
          aria-label="Filter by category"
        >

          <option value="">
            All Categories
          </option>

          {categories.map((c) => (
            <option
              key={c._id}
              value={c._id}
            >
              {c.name}
            </option>
          ))}

        </select>

      </div>


      {/* ======================================================
          ACTIVE SEARCH INFORMATION
      ======================================================= */}

      {(search.trim() || category) &&
        !loading && (

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">

            <div className="text-sm text-charcoal/60">

              {search.trim() && (
                <span>
                  Search results for{' '}

                  <span className="font-medium text-charcoal">
                    "{search}"
                  </span>
                </span>
              )}

              {!search.trim() &&
                category && (
                  <span>
                    Showing books from the selected category.
                  </span>
                )}

            </div>


            <button
              type="button"
              onClick={clearAllFilters}
              className="
                text-sm
                text-green-dark
                font-medium
                hover:underline
                w-fit
              "
            >
              Clear filters
            </button>

          </div>

        )}


      {/* ======================================================
          LOADING STATE
      ======================================================= */}

      {loading ? (

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

          {Array.from({ length: 8 }).map(
            (_, index) => (

              <div
                key={index}
                className="
                  glass-card
                  aspect-[3/5]
                  animate-pulse
                  bg-black/5
                "
              />

            )
          )}

        </div>

      ) : ebooks.length === 0 ? (

        /* ====================================================
           EMPTY STATE
        ===================================================== */

        <div className="text-center py-24">

          <div
            className="
              mx-auto
              mb-4
              w-14
              h-14
              rounded-full
              bg-black/5
              flex
              items-center
              justify-center
            "
          >
            <Search
              size={24}
              className="text-charcoal/40"
            />
          </div>


          <h2 className="font-display text-xl font-semibold mb-2">
            No eBooks found
          </h2>


          <p className="text-charcoal/50 text-sm">
            Try searching with a different title,
            topic, or keyword.
          </p>


          {(search.trim() || category) && (

            <button
              type="button"
              onClick={clearAllFilters}
              className="
                mt-5
                text-sm
                text-green-dark
                font-medium
                hover:underline
              "
            >
              Clear filters
            </button>

          )}

        </div>

      ) : (

        /* ====================================================
           EBOOK GRID
        ===================================================== */

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

          {ebooks.map((ebook) => (

            <EbookCard
              key={ebook._id}
              ebook={ebook}
            />

          ))}

        </div>

      )}

    </div>
  );
}