import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

import api from '@/api/axios';

export default function BlogPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBlogs = async () => {
      try {
        setLoading(true);

        const response = await api.get('/blogs');

        setBlogs(response.data.blogs || []);
      } catch (error) {
        console.error('[BlogPage] Load blogs error:', error);

        toast.error(
          error.response?.data?.message ||
            'Failed to load blogs.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadBlogs();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2
            size={32}
            className="animate-spin text-green-600"
          />

          <p className="text-sm text-charcoal/60">
            Loading blogs...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">

      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="font-display text-4xl font-bold text-charcoal">
          Dr For Health Blog
        </h1>

        <p className="text-charcoal/60 mt-3">
          Health, wellness and lifestyle information.
        </p>
      </div>

      {/* No blogs */}
      {blogs.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <FileText
            size={42}
            className="mx-auto text-charcoal/30 mb-4"
          />

          <h2 className="text-xl font-semibold">
            No blogs available
          </h2>

          <p className="text-sm text-charcoal/60 mt-2">
            Check back soon for new articles.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {blogs.map((blog) => (
            <article
              key={blog._id}
              className="glass-card overflow-hidden hover:shadow-lg transition-shadow"
            >

              {/* Cover Image */}
              <div className="h-52 bg-slate-100 overflow-hidden">

                {blog.coverImage ? (
                  <img
                    src={blog.coverImage}
                    alt={blog.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileText
                      size={42}
                      className="text-charcoal/30"
                    />
                  </div>
                )}

              </div>

              {/* Content */}
              <div className="p-5">

                {blog.category && (
                  <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium mb-3">
                    {blog.category}
                  </span>
                )}

                <h2 className="font-display text-xl font-bold text-charcoal line-clamp-2">
                  {blog.title}
                </h2>

                {blog.excerpt && (
                  <p className="text-sm text-charcoal/60 mt-2 line-clamp-3">
                    {blog.excerpt}
                  </p>
                )}

                <div className="flex items-center justify-between mt-5">

                  <span className="text-xs text-charcoal/50">
                    {blog.author?.name || 'Dr For Health'}
                  </span>

                  <Link
                    to={`/blog/${blog.slug}`}
                    className="text-sm font-medium text-green-dark hover:underline"
                  >
                    Read More →
                  </Link>

                </div>

              </div>
            </article>
          ))}

        </div>
      )}

    </div>
  );
}