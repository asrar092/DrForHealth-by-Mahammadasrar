import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  X,
  Loader2,
  FileText,
  RefreshCw,
} from 'lucide-react';

import api from '@/api/axios';


// ============================================================
// INITIAL FORM
// ============================================================

const initialForm = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  coverImage: '',
  author: 'Dr For Health',
  category: 'Health',
  tags: '',
  status: 'draft',
};


// ============================================================
// SLUG GENERATOR
// ============================================================

const createSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};


// ============================================================
// BLOG MANAGEMENT
// ============================================================

export default function BlogManagement() {

  const [blogs, setBlogs] = useState([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [deletingId, setDeletingId] = useState(null);

  const [actionId, setActionId] = useState(null);

  const [showForm, setShowForm] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState(initialForm);


  // ==========================================================
  // LOAD BLOGS
  // ==========================================================

  const loadBlogs = async () => {

    try {

      setLoading(true);

      const response =
        await api.get('/blogs/admin/all');

      const data =
        response.data;

      setBlogs(
        data.blogs ||
        data.data ||
        []
      );

    } catch (error) {

      console.error(
        '[BlogManagement] Load blogs error:',
        error
      );

      toast.error(
        error.response?.data?.message ||
        'Failed to load blogs.'
      );

    } finally {

      setLoading(false);

    }
  };


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    loadBlogs();
  }, []);


  // ==========================================================
  // FORM CHANGE
  // ==========================================================

  const handleChange = (e) => {

    const {
      name,
      value,
    } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

  };


  // ==========================================================
  // TITLE CHANGE
  // ==========================================================

  const handleTitleChange = (e) => {

    const value =
      e.target.value;

    setForm((previous) => ({
      ...previous,
      title: value,

      // Automatically generate slug
      // only while creating a new blog.
      ...(editingId
        ? {}
        : {
            slug: createSlug(value),
          }),
    }));

  };


  // ==========================================================
  // OPEN ADD FORM
  // ==========================================================

  const handleAdd = () => {

    setEditingId(null);

    setForm(initialForm);

    setShowForm(true);

  };


  // ==========================================================
  // OPEN EDIT FORM
  // ==========================================================

  const handleEdit = (blog) => {

    setEditingId(blog._id);

    setForm({
      title: blog.title || '',
      slug: blog.slug || '',
      excerpt: blog.excerpt || '',
      content: blog.content || '',
      coverImage: blog.coverImage || '',
      author: blog.author || 'Dr For Health',
      category: blog.category || 'Health',
      tags: Array.isArray(blog.tags)
        ? blog.tags.join(', ')
        : blog.tags || '',
      status: blog.status || 'draft',
    });

    setShowForm(true);

  };


  // ==========================================================
  // CLOSE FORM
  // ==========================================================

  const handleCloseForm = () => {

    if (saving) return;

    setShowForm(false);

    setEditingId(null);

    setForm(initialForm);

  };


  // ==========================================================
  // SUBMIT FORM
  // ==========================================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!form.title.trim()) {
      toast.error('Blog title is required.');
      return;
    }

    if (!form.content.trim()) {
      toast.error('Blog content is required.');
      return;
    }

    try {

      setSaving(true);

      const payload = {
        title: form.title.trim(),

        slug:
          form.slug.trim() ||
          createSlug(form.title),

        excerpt:
          form.excerpt.trim(),

        content:
          form.content.trim(),

        coverImage:
          form.coverImage.trim(),

        author:
          form.author.trim() ||
          'Dr For Health',

        category:
          form.category.trim() ||
          'Health',

        tags:
          form.tags
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean),

        status:
          form.status,
      };


      // ======================================================
      // UPDATE
      // ======================================================

      if (editingId) {

        await api.put(
          `/blogs/${editingId}`,
          payload
        );

        toast.success(
          'Blog updated successfully.'
        );

      }

      // ======================================================
      // CREATE
      // ======================================================

      else {

        await api.post(
          '/blogs',
          payload
        );

        toast.success(
          'Blog created successfully.'
        );

      }


      handleCloseForm();

      await loadBlogs();

    } catch (error) {

      console.error(
        '[BlogManagement] Save blog error:',
        error
      );

      toast.error(
        error.response?.data?.message ||
        'Failed to save blog.'
      );

    } finally {

      setSaving(false);

    }

  };


  // ==========================================================
  // DELETE BLOG
  // ==========================================================

  const handleDelete = async (id) => {

    const confirmed =
      window.confirm(
        'Are you sure you want to delete this blog? This action cannot be undone.'
      );

    if (!confirmed) {
      return;
    }

    try {

      setDeletingId(id);

      await api.delete(
        `/blogs/${id}`
      );

      toast.success(
        'Blog deleted successfully.'
      );

      await loadBlogs();

    } catch (error) {

      console.error(
        '[BlogManagement] Delete error:',
        error
      );

      toast.error(
        error.response?.data?.message ||
        'Failed to delete blog.'
      );

    } finally {

      setDeletingId(null);

    }

  };


  // ==========================================================
  // PUBLISH BLOG
  // ==========================================================

  const handlePublish = async (id) => {

    try {

      setActionId(id);

      await api.patch(
        `/blogs/${id}/publish`
      );

      toast.success(
        'Blog published successfully.'
      );

      await loadBlogs();

    } catch (error) {

      console.error(
        '[BlogManagement] Publish error:',
        error
      );

      toast.error(
        error.response?.data?.message ||
        'Failed to publish blog.'
      );

    } finally {

      setActionId(null);

    }

  };


  // ==========================================================
  // UNPUBLISH BLOG
  // ==========================================================

  const handleUnpublish = async (id) => {

    try {

      setActionId(id);

      await api.patch(
        `/blogs/${id}/unpublish`
      );

      toast.success(
        'Blog unpublished successfully.'
      );

      await loadBlogs();

    } catch (error) {

      console.error(
        '[BlogManagement] Unpublish error:',
        error
      );

      toast.error(
        error.response?.data?.message ||
        'Failed to unpublish blog.'
      );

    } finally {

      setActionId(null);

    }

  };


  // ==========================================================
  // FORMAT DATE
  // ==========================================================

  const formatDate = (date) => {

    if (!date) {
      return '-';
    }

    return new Date(date).toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }
    );

  };


  // ==========================================================
  // LOADING
  // ==========================================================

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


  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="space-y-6">

      {/* ======================================================
          HEADER
      ======================================================= */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        <div>

          <h1 className="font-display text-2xl font-bold text-charcoal">
            Blog Management
          </h1>

          <p className="text-sm text-charcoal/60 mt-1">
            Create, edit, publish and manage your blogs.
          </p>

        </div>


        <div className="flex items-center gap-2">

          <button
            type="button"
            onClick={loadBlogs}
            disabled={loading}
            className="btn-secondary !py-2 !px-3 flex items-center gap-2"
            title="Refresh blogs"
          >

            <RefreshCw
              size={16}
              className={
                loading
                  ? 'animate-spin'
                  : ''
              }
            />

            <span className="hidden sm:inline">
              Refresh
            </span>

          </button>


          <button
            type="button"
            onClick={handleAdd}
            className="btn-primary !py-2 !px-4 flex items-center gap-2"
          >

            <Plus size={18} />

            Add Blog

          </button>

        </div>

      </div>


      {/* ======================================================
          BLOG COUNT
      ======================================================= */}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <div className="glass-card p-5">

          <p className="text-sm text-charcoal/60">
            Total Blogs
          </p>

          <p className="text-2xl font-bold mt-1">
            {blogs.length}
          </p>

        </div>


        <div className="glass-card p-5">

          <p className="text-sm text-charcoal/60">
            Published
          </p>

          <p className="text-2xl font-bold mt-1 text-green-600">
            {
              blogs.filter(
                (blog) =>
                  blog.status === 'published'
              ).length
            }
          </p>

        </div>


        <div className="glass-card p-5">

          <p className="text-sm text-charcoal/60">
            Drafts
          </p>

          <p className="text-2xl font-bold mt-1 text-orange-600">
            {
              blogs.filter(
                (blog) =>
                  blog.status !== 'published'
              ).length
            }
          </p>

        </div>

      </div>


      {/* ======================================================
          BLOG LIST
      ======================================================= */}

      {blogs.length === 0 ? (

        <div className="glass-card p-10 text-center">

          <FileText
            size={42}
            className="mx-auto text-charcoal/30 mb-4"
          />

          <h2 className="text-lg font-semibold">
            No blogs found
          </h2>

          <p className="text-sm text-charcoal/60 mt-1 mb-5">
            Create your first blog to get started.
          </p>

          <button
            type="button"
            onClick={handleAdd}
            className="btn-primary inline-flex items-center gap-2"
          >

            <Plus size={18} />

            Create Blog

          </button>

        </div>

      ) : (

        <div className="space-y-4">

          {blogs.map((blog) => (

            <div
              key={blog._id}
              className="glass-card p-5"
            >

              <div className="flex flex-col lg:flex-row lg:items-center gap-5">

                {/* ==================================================
                    IMAGE
                =================================================== */}

                <div className="w-full lg:w-32 h-32 flex-shrink-0 rounded-xl overflow-hidden bg-slate-100">

                  {blog.coverImage ? (

                    <img
                      src={blog.coverImage}
                      alt={blog.title}
                      className="w-full h-full object-cover"
                    />

                  ) : (

                    <div className="w-full h-full flex items-center justify-center">

                      <FileText
                        size={32}
                        className="text-charcoal/30"
                      />

                    </div>

                  )}

                </div>


                {/* ==================================================
                    BLOG INFORMATION
                =================================================== */}

                <div className="flex-1 min-w-0">

                  <div className="flex flex-wrap items-center gap-2 mb-2">

                    <span
                      className={
                        blog.status === 'published'
                          ? 'px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700'
                          : 'px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700'
                      }
                    >
                      {blog.status === 'published'
                        ? 'Published'
                        : 'Draft'}
                    </span>


                    {blog.category && (

                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-charcoal/70">
                        {blog.category}
                      </span>

                    )}

                  </div>


                  <h2 className="font-display text-lg font-bold text-charcoal truncate">

                    {blog.title}

                  </h2>


                  {blog.excerpt && (

                    <p className="text-sm text-charcoal/60 mt-1 line-clamp-2">

                      {blog.excerpt}

                    </p>

                  )}


                  <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-charcoal/50">

                    <span>
                      Author: {blog.author || 'Dr For Health'}
                    </span>

                    <span>
                      Created: {formatDate(blog.createdAt)}
                    </span>

                    {typeof blog.views === 'number' && (

                      <span>
                        Views: {blog.views}
                      </span>

                    )}

                  </div>

                </div>


                {/* ==================================================
                    ACTIONS
                =================================================== */}

                <div className="flex flex-wrap lg:flex-col gap-2">

                  <button
                    type="button"
                    onClick={() => handleEdit(blog)}
                    className="btn-secondary !py-2 !px-3 flex items-center justify-center gap-2 text-sm"
                  >

                    <Pencil size={15} />

                    Edit

                  </button>


                  {blog.status === 'published' ? (

                    <button
                      type="button"
                      disabled={actionId === blog._id}
                      onClick={() =>
                        handleUnpublish(blog._id)
                      }
                      className="btn-secondary !py-2 !px-3 flex items-center justify-center gap-2 text-sm"
                    >

                      {actionId === blog._id ? (

                        <Loader2
                          size={15}
                          className="animate-spin"
                        />

                      ) : (

                        <EyeOff size={15} />

                      )}

                      Unpublish

                    </button>

                  ) : (

                    <button
                      type="button"
                      disabled={actionId === blog._id}
                      onClick={() =>
                        handlePublish(blog._id)
                      }
                      className="btn-primary !py-2 !px-3 flex items-center justify-center gap-2 text-sm"
                    >

                      {actionId === blog._id ? (

                        <Loader2
                          size={15}
                          className="animate-spin"
                        />

                      ) : (

                        <Eye size={15} />

                      )}

                      Publish

                    </button>

                  )}


                  <button
                    type="button"
                    disabled={deletingId === blog._id}
                    onClick={() =>
                      handleDelete(blog._id)
                    }
                    className="!py-2 !px-3 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 flex items-center justify-center gap-2 text-sm"
                  >

                    {deletingId === blog._id ? (

                      <Loader2
                        size={15}
                        className="animate-spin"
                      />

                    ) : (

                      <Trash2 size={15} />

                    )}

                    Delete

                  </button>

                </div>

              </div>

            </div>

          ))}

        </div>

      )}


      {/* ======================================================
          ADD / EDIT MODAL
      ======================================================= */}

      {showForm && (

        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">

          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">

            {/* ==================================================
                MODAL HEADER
            =================================================== */}

            <div className="sticky top-0 z-10 bg-white border-b border-border px-6 py-4 flex items-center justify-between">

              <div>

                <h2 className="font-display text-xl font-bold">

                  {editingId
                    ? 'Edit Blog'
                    : 'Create New Blog'}

                </h2>

                <p className="text-sm text-charcoal/50 mt-1">

                  {editingId
                    ? 'Update your blog information.'
                    : 'Add a new blog article.'}

                </p>

              </div>


              <button
                type="button"
                onClick={handleCloseForm}
                disabled={saving}
                className="p-2 rounded-lg hover:bg-slate-100"
              >

                <X size={20} />

              </button>

            </div>


            {/* ==================================================
                FORM
            =================================================== */}

            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-5"
            >

              {/* Title */}

              <div>

                <label className="block text-sm font-medium mb-2">
                  Blog Title *
                </label>

                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleTitleChange}
                  placeholder="Enter blog title"
                  className="input-field w-full"
                  disabled={saving}
                  required
                />

              </div>


              {/* Slug */}

              <div>

                <label className="block text-sm font-medium mb-2">
                  Slug
                </label>

                <input
                  type="text"
                  name="slug"
                  value={form.slug}
                  onChange={handleChange}
                  placeholder="blog-title"
                  className="input-field w-full"
                  disabled={saving}
                />

                <p className="text-xs text-charcoal/50 mt-1">
                  URL: /blog/{form.slug || 'blog-title'}
                </p>

              </div>


              {/* Category + Author */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>

                  <label className="block text-sm font-medium mb-2">
                    Category
                  </label>

                  <input
                    type="text"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    placeholder="Health"
                    className="input-field w-full"
                    disabled={saving}
                  />

                </div>


                <div>

                  <label className="block text-sm font-medium mb-2">
                    Author
                  </label>

                  <input
                    type="text"
                    name="author"
                    value={form.author}
                    onChange={handleChange}
                    placeholder="Dr For Health"
                    className="input-field w-full"
                    disabled={saving}
                  />

                </div>

              </div>


              {/* Cover Image */}

              <div>

                <label className="block text-sm font-medium mb-2">
                  Cover Image URL
                </label>

                <input
                  type="url"
                  name="coverImage"
                  value={form.coverImage}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  className="input-field w-full"
                  disabled={saving}
                />

              </div>


              {/* Excerpt */}

              <div>

                <label className="block text-sm font-medium mb-2">
                  Short Description
                </label>

                <textarea
                  name="excerpt"
                  value={form.excerpt}
                  onChange={handleChange}
                  placeholder="Write a short description..."
                  rows={3}
                  className="input-field w-full resize-none"
                  disabled={saving}
                />

              </div>


              {/* Content */}

              <div>

                <label className="block text-sm font-medium mb-2">
                  Blog Content *
                </label>

                <textarea
                  name="content"
                  value={form.content}
                  onChange={handleChange}
                  placeholder="Write your blog content here..."
                  rows={10}
                  className="input-field w-full resize-y"
                  disabled={saving}
                  required
                />

              </div>


              {/* Tags */}

              <div>

                <label className="block text-sm font-medium mb-2">
                  Tags
                </label>

                <input
                  type="text"
                  name="tags"
                  value={form.tags}
                  onChange={handleChange}
                  placeholder="health, wellness, fitness"
                  className="input-field w-full"
                  disabled={saving}
                />

                <p className="text-xs text-charcoal/50 mt-1">
                  Separate tags using commas.
                </p>

              </div>


              {/* Status */}

              <div>

                <label className="block text-sm font-medium mb-2">
                  Status
                </label>

                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="input-field w-full"
                  disabled={saving}
                >

                  <option value="draft">
                    Draft
                  </option>

                  <option value="published">
                    Published
                  </option>

                </select>

              </div>


              {/* ==================================================
                  FORM BUTTONS
              =================================================== */}

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-border">

                <button
                  type="button"
                  onClick={handleCloseForm}
                  disabled={saving}
                  className="btn-secondary"
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary flex items-center justify-center gap-2"
                >

                  {saving ? (

                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />

                      Saving...
                    </>

                  ) : (

                    editingId
                      ? 'Update Blog'
                      : 'Create Blog'

                  )}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}