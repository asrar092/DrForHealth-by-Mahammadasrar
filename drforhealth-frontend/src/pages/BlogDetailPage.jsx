import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

import api from '@/api/axios';

export default function BlogDetailPage() {
  const { slug } = useParams();

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBlog = async () => {
      try {
        setLoading(true);

        const response = await api.get(`/blogs/${slug}`);

        setBlog(response.data.blog);
      } catch (error) {
        console.error(
          '[BlogDetailPage] Load blog error:',
          error
        );

        toast.error(
          error.response?.data?.message ||
            'Failed to load blog.'
        );

        setBlog(null);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      loadBlog();
    }
  }, [slug]);

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2
            size={36}
            className="animate-spin text-green-600"
          />

          <p className="text-sm text-charcoal/60">
            Loading blog...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // BLOG NOT FOUND
  // ============================================================

  if (!blog) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
        <FileText
          size={50}
          className="text-charcoal/30 mb-4"
        />

        <h1 className="text-2xl font-bold text-charcoal">
          Blog Not Found
        </h1>

        <p className="text-charcoal/60 mt-2 mb-6">
          The blog you are looking for does not exist.
        </p>

        <Link
          to="/blog"
          className="btn-primary"
        >
          Back to Blog
        </Link>
      </div>
    );
  }

  // ============================================================
  // BLOG DETAIL
  // ============================================================

  return (
    <article className="max-w-4xl mx-auto px-6 py-10">

      {/* Back Button */}
      <Link
        to="/blog"
        className="inline-flex items-center gap-2 text-sm text-charcoal/60 hover:text-charcoal mb-8"
      >
        <ArrowLeft size={17} />
        Back to Blog
      </Link>


      {/* Cover Image */}
      {blog.coverImage ? (
        <div className="w-full h-[300px] md:h-[450px] rounded-2xl overflow-hidden mb-8">
          <img
            src={blog.coverImage}
            alt={blog.title}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-full h-[250px] rounded-2xl bg-slate-100 flex items-center justify-center mb-8">
          <FileText
            size={60}
            className="text-charcoal/20"
          />
        </div>
      )}


      {/* Category */}
      {blog.category && (
        <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium mb-4">
          {blog.category}
        </span>
      )}


      {/* Title */}
      <h1 className="font-display text-3xl md:text-5xl font-bold text-charcoal leading-tight">
        {blog.title}
      </h1>


      {/* Meta */}
      <div className="flex flex-wrap items-center gap-4 mt-5 text-sm text-charcoal/50">

        <span>
          By {blog.author?.name || 'Dr For Health'}
        </span>

        {blog.publishedAt && (
          <span>
            {new Date(
              blog.publishedAt
            ).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </span>
        )}

      </div>


      {/* Excerpt */}
      {blog.excerpt && (
        <p className="text-lg text-charcoal/70 mt-8 leading-relaxed">
          {blog.excerpt}
        </p>
      )}


      {/* Content */}
      <div className="mt-8">

        <div className="whitespace-pre-wrap text-charcoal/80 leading-8 text-base md:text-lg">
          {blog.content}
        </div>

      </div>

    </article>
  );
}