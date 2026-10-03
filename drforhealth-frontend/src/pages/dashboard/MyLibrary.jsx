import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Download, Loader2 } from 'lucide-react';
import { purchaseApi } from '@/api/ebookApi';

export default function MyLibrary() {

  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);


  // ==========================================================
  // LOAD MY LIBRARY
  // ==========================================================

  useEffect(() => {

    let mounted = true;

    const loadLibrary = async () => {

      try {

        const response =
          await purchaseApi.myLibrary();

        console.log(
          '[MyLibrary] API response:',
          response.data
        );

        if (!mounted) return;

        const library =
          response.data?.data || [];

        setPurchases(library);

      } catch (err) {

        console.error(
          '[MyLibrary] Failed:',
          err.response?.data || err
        );

        if (!mounted) return;

        toast.error(
          err.response?.data?.message ||
          'Could not load your library.'
        );

      } finally {

        if (mounted) {
          setLoading(false);
        }

      }
    };

    loadLibrary();

    return () => {
      mounted = false;
    };

  }, []);


  // ==========================================================
  // DOWNLOAD EBOOK
  // ==========================================================

  const handleDownload = async (ebookId) => {

    if (!ebookId) {
      toast.error('Invalid eBook.');
      return;
    }

    setDownloadingId(ebookId);

    try {

      const response =
        await purchaseApi.getDownloadUrl(
          ebookId
        );

      const downloadUrl =
        response.data?.data?.downloadUrl ||
        response.data?.downloadUrl;

      if (!downloadUrl) {
        throw new Error(
          'Download URL was not returned.'
        );
      }

      // Open signed URL immediately
      window.open(
        downloadUrl,
        '_blank',
        'noopener,noreferrer'
      );

    } catch (err) {

      console.error(
        '[MyLibrary] Download failed:',
        err.response?.data || err
      );

      toast.error(
        err.response?.data?.message ||
        'Download failed.'
      );

    } finally {

      setDownloadingId(null);

    }
  };


  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {

    return (
      <div className="text-charcoal/50">
        Loading your library…
      </div>
    );

  }


  // ==========================================================
  // EMPTY LIBRARY
  // ==========================================================

  if (purchases.length === 0) {

    return (
      <div className="glass-card p-12 text-center">

        <p className="text-charcoal/60 mb-4">
          You haven't purchased any eBooks yet.
        </p>

        <a
          href="/store"
          className="btn-primary inline-flex"
        >
          Browse eBooks
        </a>

      </div>
    );

  }


  // ==========================================================
  // LIBRARY
  // ==========================================================

  return (

    <div>

      <h1 className="font-display text-2xl font-bold mb-6">
        My Library
      </h1>


      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

        {purchases.map((purchase) => {

          const ebook = purchase?.ebook;

          if (!ebook) {
            return null;
          }

          return (

            <div
              key={purchase._id}
              className="glass-card p-5 flex gap-4"
            >

              {/* ==================================================
                  COVER
              ================================================== */}

              <img
                src={
                  ebook.coverImageUrl ||
                  (
                    ebook.coverImageKey
                      ? `/api/assets/${ebook.coverImageKey}`
                      : ''
                  )
                }
                alt={ebook.title}
                className="w-20 h-28 object-cover rounded-lg bg-black/5 shrink-0"
                onError={(e) => {
                  e.currentTarget.style.display =
                    'none';
                }}
              />


              {/* ==================================================
                  CONTENT
              ================================================== */}

              <div className="flex flex-col flex-1">

                {ebook.category?.name && (

                  <p className="text-xs text-blue-dark font-semibold uppercase mb-1">
                    {ebook.category.name}
                  </p>

                )}


                <h3 className="font-display font-semibold mb-2 line-clamp-2">
                  {ebook.title}
                </h3>


                {/* ==================================================
                    DOWNLOAD
                ================================================== */}

                <button
                  type="button"
                  onClick={() =>
                    handleDownload(ebook._id)
                  }
                  disabled={
                    downloadingId === ebook._id
                  }
                  className="btn-primary !py-2 !px-4 text-sm mt-auto self-start"
                >

                  {downloadingId === ebook._id ? (

                    <>
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />

                      Downloading...
                    </>

                  ) : (

                    <>
                      <Download size={16} />

                      Download
                    </>

                  )}

                </button>

              </div>

            </div>

          );

        })}

      </div>

    </div>

  );
}