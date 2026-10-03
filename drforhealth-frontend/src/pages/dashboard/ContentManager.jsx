import { useEffect, useRef, useState } from 'react';
import {
  BookOpen,
  Edit3,
  Plus,
  Search,
  Trash2,
  X,
  Upload,
  Save,
  FileText,
  Image as ImageIcon,
  FolderPlus,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { ebookApi, categoryApi } from '@/api/ebookApi';
import { useAuthStore } from '@/store/authStore';


// ============================================================
// FILE UPLOAD LIMITS
// ============================================================
// Frontend limit for the main eBook PDF.
// Backend upload.js must use the same 500 MB limit.
const MAX_EBOOK_PDF_SIZE = 500 * 1024 * 1024;
const MAX_PREVIEW_PDF_SIZE = 50 * 1024 * 1024;
const MAX_COVER_IMAGE_SIZE = 10 * 1024 * 1024;

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.floor(Math.log(bytes) / Math.log(1024));

  return `${(bytes / Math.pow(1024, index)).toFixed(1)} ${units[index]}`;
};



// ============================================================
// INITIAL EBOOK FORM
// ============================================================

const initialForm = {
  title: '',
  subtitle: '',
  description: '',
  category: '',
  priceINR: '',
  discountPercent: '0',
  saleEndsAt: '',
  tags: '',
  adminKeywords: [],
  isFeatured: false,
  isActive: true,
};


// ============================================================
// INITIAL CATEGORY FORM
// ============================================================

const initialCategoryForm = {
  name: '',
  description: '',
};


// ============================================================
// HELPERS
// ============================================================

const normalizeKeyword = (value) => {
  return String(value || '')
    .trim()
    .toLowerCase();
};


const normalizeCategoryName = (value) => {
  return String(value || '')
    .trim();
};


// ============================================================
// COMPONENT
// ============================================================

export default function ContentManager() {

  // ==========================================================
  // AUTH
  // ==========================================================

  const { user } = useAuthStore();


  // ==========================================================
  // EBOOK STATE
  // ==========================================================

  const [ebooks, setEbooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [search, setSearch] = useState('');

  const [editingEbook, setEditingEbook] =
    useState(null);

  const [form, setForm] =
    useState(initialForm);

  const [keywordInput, setKeywordInput] =
    useState('');


  // ==========================================================
  // CATEGORY STATE
  // ==========================================================

  const [categories, setCategories] = useState([]);

  const [categoriesLoading, setCategoriesLoading] =
    useState(true);

  const [categorySaving, setCategorySaving] =
    useState(false);

  const [categoryDeletingId, setCategoryDeletingId] =
    useState(null);

  const [categoryForm, setCategoryForm] =
    useState(initialCategoryForm);

  const [editingCategory, setEditingCategory] =
    useState(null);


  // ==========================================================
  // FILE STATE
  // ==========================================================

  const [coverImage, setCoverImage] =
    useState(null);

  const [pdfFile, setPdfFile] =
    useState(null);

  const [previewFile, setPreviewFile] =
    useState(null);


  // ==========================================================
  // FILE INPUT REFS
  // ==========================================================

  const coverInputRef = useRef(null);
  const pdfInputRef = useRef(null);
  const previewInputRef = useRef(null);


  // ==========================================================
  // ROLE CHECK
  // ==========================================================

  const isSuperAdmin =
    user?.role === 'super_admin';


  // ==========================================================
  // LOAD CATEGORIES
  // ==========================================================

  const loadCategories = async () => {

    setCategoriesLoading(true);

    try {

      const response =
        await categoryApi.list();

      const data =
        response.data?.data;

      setCategories(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (error) {

      console.error(
        '[ContentManager] Category loading failed:',
        error
      );

      setCategories([]);

      toast.error(
        error.response?.data?.message ||
        'Failed to load categories.'
      );

    } finally {

      setCategoriesLoading(false);

    }

  };


  // ==========================================================
  // LOAD EBOOKS
  // ==========================================================

  const loadEbooks = async () => {

    setLoading(true);

    try {

      const response =
        await ebookApi.adminList();

      const data =
        response.data?.data;

      setEbooks(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (error) {

      console.error(
        '[ContentManager] eBook loading failed:',
        error
      );

      setEbooks([]);

      toast.error(
        error.response?.data?.message ||
        'Failed to load eBooks.'
      );

    } finally {

      setLoading(false);

    }

  };


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {

    if (!isSuperAdmin) {

      setLoading(false);
      setCategoriesLoading(false);

      return;

    }

    loadCategories();
    loadEbooks();

  }, [isSuperAdmin]);


  // ==========================================================
  // EBOOK FORM CHANGE
  // ==========================================================

  const handleChange = (event) => {

    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((previous) => ({
      ...previous,

      [name]:
        type === 'checkbox'
          ? checked
          : value,
    }));

  };


  // ==========================================================
  // CATEGORY FORM CHANGE
  // ==========================================================

  const handleCategoryChange = (event) => {

    const {
      name,
      value,
    } = event.target;

    setCategoryForm((previous) => ({
      ...previous,
      [name]: value,
    }));

  };


  // ==========================================================
  // ADD KEYWORD
  // ==========================================================

  const addKeyword = () => {

    const keyword =
      normalizeKeyword(keywordInput);

    if (!keyword) {
      return;
    }

    setForm((previous) => {

      const existingKeywords =
        Array.isArray(previous.adminKeywords)
          ? previous.adminKeywords
          : [];

      const alreadyExists =
        existingKeywords.some(
          (item) =>
            normalizeKeyword(item) === keyword
        );

      if (alreadyExists) {

        toast.error(
          'This keyword is already added.'
        );

        return previous;

      }

      return {
        ...previous,

        adminKeywords: [
          ...existingKeywords,
          keyword,
        ],
      };

    });

    setKeywordInput('');

  };


  // ==========================================================
  // KEYWORD ENTER
  // ==========================================================

  const handleKeywordKeyDown = (event) => {

    if (event.key === 'Enter') {

      event.preventDefault();

      addKeyword();

    }

  };


  // ==========================================================
  // REMOVE KEYWORD
  // ==========================================================

  const removeKeyword = (keywordToRemove) => {

    setForm((previous) => ({

      ...previous,

      adminKeywords:
        previous.adminKeywords.filter(
          (keyword) =>
            keyword !== keywordToRemove
        ),

    }));

  };


  // ==========================================================
  // RESET EBOOK FORM
  // ==========================================================

  const resetForm = () => {

    setForm({
      ...initialForm,
      adminKeywords: [],
    });

    setKeywordInput('');

    setCoverImage(null);
    setPdfFile(null);
    setPreviewFile(null);

    setEditingEbook(null);

    if (coverInputRef.current) {
      coverInputRef.current.value = '';
    }

    if (pdfInputRef.current) {
      pdfInputRef.current.value = '';
    }

    if (previewInputRef.current) {
      previewInputRef.current.value = '';
    }

  };


  // ==========================================================
  // RESET CATEGORY FORM
  // ==========================================================

  const resetCategoryForm = () => {

    setCategoryForm(
      initialCategoryForm
    );

    setEditingCategory(null);

  };


  // ==========================================================
  // CREATE / UPDATE CATEGORY
  // ==========================================================

  const handleCategorySubmit = async (event) => {

    event.preventDefault();

    if (!isSuperAdmin) {

      toast.error(
        'Only Super Admin can manage categories.'
      );

      return;

    }

    const name =
      normalizeCategoryName(
        categoryForm.name
      );

    const description =
      String(
        categoryForm.description || ''
      ).trim();


    if (!name) {

      toast.error(
        'Category name is required.'
      );

      return;

    }


    try {

      setCategorySaving(true);


      // ------------------------------------------------------
      // UPDATE CATEGORY
      // ------------------------------------------------------

      if (editingCategory) {

        const response =
          await categoryApi.update(
            editingCategory._id,
            {
              name,
              description,
            }
          );


        const updatedCategory =
          response.data?.data;


        if (updatedCategory) {

          setCategories((previous) =>
            previous.map((category) =>
              category._id ===
              editingCategory._id
                ? updatedCategory
                : category
            )
          );

        } else {

          await loadCategories();

        }


        // If the currently selected eBook category
        // was this category, keep it selected.

        if (
          form.category ===
          editingCategory._id
        ) {

          setForm((previous) => ({
            ...previous,
            category:
              updatedCategory?._id ||
              editingCategory._id,
          }));

        }


        toast.success(
          'Category updated successfully.'
        );

      }


      // ------------------------------------------------------
      // CREATE CATEGORY
      // ------------------------------------------------------

      else {

        const response =
          await categoryApi.create({
            name,
            description,
          });


        const createdCategory =
          response.data?.data;


        if (createdCategory) {

          setCategories((previous) => [
            ...previous,
            createdCategory,
          ]);

        } else {

          await loadCategories();

        }


        toast.success(
          'Category created successfully.'
        );

      }


      resetCategoryForm();

    } catch (error) {

      console.error(
        '[ContentManager] Category save failed:',
        error
      );

      if (error?.response?.status === 401) {
        toast.error(
          'Your login session is invalid or expired. Please log out and log in again.'
        );
      } else {
        toast.error(
          error.response?.data?.message ||
          error.message ||
          'Failed to save category.'
        );
      }

    } finally {

      setCategorySaving(false);

    }

  };


  // ==========================================================
  // EDIT CATEGORY
  // ==========================================================

  const handleEditCategory = (category) => {

    setEditingCategory(category);

    setCategoryForm({

      name:
        category.name || '',

      description:
        category.description || '',

    });

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });

  };


  // ==========================================================
  // DELETE CATEGORY
  // ==========================================================

  const handleDeleteCategory = async (category) => {

    if (!isSuperAdmin) {

      toast.error(
        'Only Super Admin can delete categories.'
      );

      return;

    }


    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${category.name}"?`
      );


    if (!confirmed) {
      return;
    }


    try {

      setCategoryDeletingId(
        category._id
      );


      await categoryApi.delete(
        category._id
      );


      setCategories((previous) =>
        previous.filter(
          (item) =>
            item._id !== category._id
        )
      );


      // Clear category from ebook form
      // if deleted category was selected.

      if (
        form.category ===
        category._id
      ) {

        setForm((previous) => ({
          ...previous,
          category: '',
        }));

      }


      if (
        editingCategory?._id ===
        category._id
      ) {

        resetCategoryForm();

      }


      toast.success(
        'Category deleted successfully.'
      );

    } catch (error) {

      console.error(
        '[ContentManager] Category delete failed:',
        error
      );

      toast.error(
        error.response?.data?.message ||
        'Failed to delete category.'
      );

    } finally {

      setCategoryDeletingId(null);

    }

  };


  // ==========================================================
  // EDIT EBOOK
  // ==========================================================

  const handleEdit = (ebook) => {

    setEditingEbook(ebook);

    setForm({

      title:
        ebook.title || '',

      subtitle:
        ebook.subtitle || '',

      description:
        ebook.description || '',

      category:
        ebook.category?._id ||
        ebook.category ||
        '',

      priceINR:
        ebook.priceINR ?? '',

      discountPercent:
        ebook.discountPercent ?? '0',

      saleEndsAt:
        ebook.saleEndsAt
          ? new Date(ebook.saleEndsAt)
              .toISOString()
              .slice(0, 16)
          : '',

      tags:
        Array.isArray(ebook.tags)
          ? ebook.tags.join(', ')
          : '',

      adminKeywords:
        Array.isArray(ebook.adminKeywords)
          ? ebook.adminKeywords.map(
              normalizeKeyword
            )
          : [],

      isFeatured:
        Boolean(ebook.isFeatured),

      isActive:
        ebook.isActive !== false,

    });

    setKeywordInput('');

    setCoverImage(null);
    setPdfFile(null);
    setPreviewFile(null);

    if (coverInputRef.current) {
      coverInputRef.current.value = '';
    }

    if (pdfInputRef.current) {
      pdfInputRef.current.value = '';
    }

    if (previewInputRef.current) {
      previewInputRef.current.value = '';
    }

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });

  };


  // ==========================================================
  // BUILD EBOOK FORM DATA
  // ==========================================================

  const buildFormData = () => {

    const formData =
      new FormData();


    // --------------------------------------------------------
    // BASIC FIELDS
    // --------------------------------------------------------

    formData.append(
      'title',
      form.title.trim()
    );

    formData.append(
      'subtitle',
      form.subtitle.trim()
    );

    formData.append(
      'description',
      form.description.trim()
    );

    formData.append(
      'category',
      form.category
    );

    formData.append(
      'priceINR',
      form.priceINR
    );

    formData.append(
      'discountPercent',
      form.discountPercent || '0'
    );

    formData.append(
      'saleEndsAt',
      form.saleEndsAt || ''
    );


    // --------------------------------------------------------
    // PUBLIC TAGS
    // --------------------------------------------------------

    const tags =
      form.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);

    tags.forEach((tag) => {

      formData.append(
        'tags',
        tag
      );

    });


    // --------------------------------------------------------
    // ADMIN KEYWORDS
    // --------------------------------------------------------

    form.adminKeywords.forEach(
      (keyword) => {

        const normalized =
          normalizeKeyword(keyword);

        if (normalized) {

          formData.append(
            'adminKeywords',
            normalized
          );

        }

      }
    );


    // --------------------------------------------------------
    // BOOLEAN
    // --------------------------------------------------------

    formData.append(
      'isFeatured',
      String(form.isFeatured)
    );

    formData.append(
      'isActive',
      String(form.isActive)
    );


    // --------------------------------------------------------
    // FILES
    // --------------------------------------------------------

    if (coverImage) {

      formData.append(
        'coverImage',
        coverImage
      );

    }

    if (pdfFile) {

      formData.append(
        'pdfFile',
        pdfFile
      );

    }

    if (previewFile) {

      formData.append(
        'previewFile',
        previewFile
      );

    }


    return formData;

  };


  // ==========================================================
  // VALIDATE EBOOK FORM
  // ==========================================================

  const validateForm = () => {

    if (!form.title.trim()) {

      toast.error(
        'eBook title is required.'
      );

      return false;

    }


    if (!form.description.trim()) {

      toast.error(
        'eBook description is required.'
      );

      return false;

    }


    if (!form.category) {

      toast.error(
        'Please select a category.'
      );

      return false;

    }


    if (
      form.priceINR === '' ||
      Number(form.priceINR) < 0
    ) {

      toast.error(
        'Please enter a valid price.'
      );

      return false;

    }


    if (
      Number(form.discountPercent) < 0 ||
      Number(form.discountPercent) > 100
    ) {

      toast.error(
        'Discount must be between 0 and 100.'
      );

      return false;

    }


    if (!editingEbook && !pdfFile) {

      toast.error(
        'PDF file is required.'
      );

      return false;

    }


    if (!editingEbook && !coverImage) {

      toast.error(
        'Cover image is required.'
      );

      return false;

    }


    return true;

  };


  // ==========================================================
  // CREATE / UPDATE EBOOK
  // ==========================================================

  const handleSubmit = async (event) => {

    event.preventDefault();


    if (!isSuperAdmin) {

      toast.error(
        'Only Super Admin can manage eBooks.'
      );

      return;

    }


    if (!validateForm()) {
      return;
    }


    try {

      setSaving(true);


      const formData =
        buildFormData();


      // ------------------------------------------------------
      // UPDATE
      // ------------------------------------------------------

      if (editingEbook) {

        const response =
          await ebookApi.update(
            editingEbook._id,
            formData
          );


        const updatedEbook =
          response.data?.data;


        if (updatedEbook) {

          setEbooks((previous) =>
            previous.map((ebook) =>
              ebook._id ===
              editingEbook._id
                ? updatedEbook
                : ebook
            )
          );

        } else {

          await loadEbooks();

        }


        toast.success(
          'eBook updated successfully.'
        );

      }


      // ------------------------------------------------------
      // CREATE
      // ------------------------------------------------------

      else {

        const response =
          await ebookApi.create(
            formData
          );


        const createdEbook =
          response.data?.data;


        if (createdEbook) {

          setEbooks((previous) => [
            createdEbook,
            ...previous,
          ]);

        } else {

          await loadEbooks();

        }


        toast.success(
          'eBook uploaded successfully.'
        );

      }


      resetForm();

    } catch (error) {

      console.error(
        '[ContentManager] Save eBook failed:',
        error
      );

      if (error?.response?.status === 401) {
        toast.error(
          'Your login session is invalid or expired. Please log out and log in again.'
        );
      } else {
        toast.error(
          error.response?.data?.message ||
          error.message ||
          'Failed to save eBook.'
        );
      }

    } finally {

      setSaving(false);

    }

  };


  // ==========================================================
  // DELETE EBOOK
  // ==========================================================

  const handleDelete = async (ebook) => {

    if (!isSuperAdmin) {

      toast.error(
        'Only Super Admin can delete eBooks.'
      );

      return;

    }


    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${ebook.title}"?`
      );


    if (!confirmed) {
      return;
    }


    try {

      setDeletingId(
        ebook._id
      );


      await ebookApi.delete(
        ebook._id
      );


      setEbooks((previous) =>
        previous.filter(
          (item) =>
            item._id !== ebook._id
        )
      );


      if (
        editingEbook?._id ===
        ebook._id
      ) {

        resetForm();

      }


      toast.success(
        'eBook deleted successfully.'
      );

    } catch (error) {

      console.error(
        '[ContentManager] Delete eBook failed:',
        error
      );

      toast.error(
        error.response?.data?.message ||
        'Failed to delete eBook.'
      );

    } finally {

      setDeletingId(null);

    }

  };


  // ==========================================================
  // FILTER EBOOKS
  // ==========================================================

  const filteredEbooks =
    ebooks.filter((ebook) => {

      const query =
        search.trim().toLowerCase();

      if (!query) {
        return true;
      }


      const title =
        String(
          ebook.title || ''
        ).toLowerCase();


      const description =
        String(
          ebook.description || ''
        ).toLowerCase();


      const categoryName =
        String(
          ebook.category?.name || ''
        ).toLowerCase();


      const keywords =
        Array.isArray(
          ebook.adminKeywords
        )
          ? ebook.adminKeywords
              .join(' ')
              .toLowerCase()
          : '';


      return (
        title.includes(query) ||
        description.includes(query) ||
        categoryName.includes(query) ||
        keywords.includes(query)
      );

    });


  // ==========================================================
  // ACCESS DENIED
  // ==========================================================

  if (!isSuperAdmin) {

    return (

      <div className="glass-card p-8">

        <h2 className="font-display text-2xl font-bold text-charcoal mb-2">
          Access Denied
        </h2>

        <p className="text-charcoal/60">
          Only the Super Admin can manage categories and eBooks.
        </p>

      </div>

    );

  }


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <div className="space-y-8">


      {/* ======================================================
          PAGE HEADER
      ======================================================= */}

      <div>

        <div className="flex items-center gap-3 mb-2">

          <div
            className="
              w-11
              h-11
              rounded-xl
              bg-brand-gradient
              text-white
              flex
              items-center
              justify-center
            "
          >

            <BookOpen size={22} />

          </div>


          <div>

            <h1 className="font-display text-3xl font-bold text-charcoal">
              Content Manager
            </h1>

            <p className="text-charcoal/60">
              Manage categories, upload eBooks and manage keywords.
            </p>

          </div>

        </div>

      </div>


      {/* ======================================================
          CATEGORY MANAGEMENT
      ======================================================= */}

      <div className="glass-card p-6 md:p-8">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

          <div>

            <div className="flex items-center gap-2">

              <FolderPlus
                size={21}
                className="text-green-dark"
              />

              <h2 className="font-display text-xl font-semibold text-charcoal">

                {editingCategory
                  ? 'Edit Category'
                  : 'Create Category'}

              </h2>

            </div>

            <p className="text-sm text-charcoal/50 mt-1">
              Create and manage eBook categories.
            </p>

          </div>


          <button
            type="button"
            onClick={loadCategories}
            disabled={categoriesLoading}
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              px-4
              py-2.5
              rounded-xl
              border
              border-charcoal/10
              text-charcoal
              text-sm
              font-medium
              hover:bg-black/5
              transition
              disabled:opacity-50
            "
          >

            <RefreshCw
              size={16}
              className={
                categoriesLoading
                  ? 'animate-spin'
                  : ''
              }
            />

            Refresh

          </button>

        </div>


        {/* ====================================================
            CATEGORY FORM
        ===================================================== */}

        <form
          onSubmit={handleCategorySubmit}
          className="space-y-5"
        >

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <div>

              <label className="block text-sm font-medium text-charcoal mb-2">
                Category Name *
              </label>

              <input
                type="text"
                name="name"
                value={categoryForm.name}
                onChange={handleCategoryChange}
                className="input-field"
                placeholder="e.g. Diabetes"
                required
              />

            </div>


            <div>

              <label className="block text-sm font-medium text-charcoal mb-2">
                Description
              </label>

              <input
                type="text"
                name="description"
                value={categoryForm.description}
                onChange={handleCategoryChange}
                className="input-field"
                placeholder="Short category description"
              />

            </div>

          </div>


          <div className="flex flex-wrap gap-3">

            <button
              type="submit"
              disabled={categorySaving}
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                px-6
                py-3
                rounded-xl
                bg-brand-gradient
                text-white
                font-semibold
                shadow-sm
                hover:opacity-90
                transition
                disabled:opacity-60
                disabled:cursor-not-allowed
              "
            >

              {editingCategory ? (
                <Save size={18} />
              ) : (
                <Plus size={18} />
              )}

              {categorySaving
                ? 'Saving...'
                : editingCategory
                  ? 'Update Category'
                  : 'Create Category'}

            </button>


            {editingCategory && (

              <button
                type="button"
                onClick={resetCategoryForm}
                disabled={categorySaving}
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  px-6
                  py-3
                  rounded-xl
                  border
                  border-charcoal/15
                  text-charcoal
                  font-medium
                  hover:bg-black/5
                  transition
                "
              >

                <X size={18} />

                Cancel

              </button>

            )}

          </div>

        </form>


        {/* ====================================================
            EXISTING CATEGORIES
        ===================================================== */}

        <div className="mt-8 pt-7 border-t border-charcoal/10">

          <div className="flex items-center justify-between mb-4">

            <div>

              <h3 className="font-display text-lg font-semibold text-charcoal">
                Existing Categories
              </h3>

              <p className="text-sm text-charcoal/50 mt-1">
                {categories.length} categor
                {categories.length === 1
                  ? 'y'
                  : 'ies'}
              </p>

            </div>

          </div>


          {categoriesLoading ? (

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">

              {Array.from({
                length: 3,
              }).map((_, index) => (

                <div
                  key={index}
                  className="
                    h-20
                    rounded-xl
                    bg-black/5
                    animate-pulse
                  "
                />

              ))}

            </div>

          ) : categories.length === 0 ? (

            <div className="rounded-xl border border-dashed border-charcoal/15 p-8 text-center">

              <FolderPlus
                size={32}
                className="mx-auto text-charcoal/25 mb-2"
              />

              <p className="text-sm text-charcoal/50">
                No categories created yet.
              </p>

            </div>

          ) : (

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">

              {categories.map((category) => (

                <div
                  key={category._id}
                  className="
                    flex
                    items-center
                    justify-between
                    gap-3
                    p-4
                    rounded-xl
                    border
                    border-charcoal/10
                    bg-white
                  "
                >

                  <div className="min-w-0">

                    <h4 className="font-semibold text-charcoal truncate">
                      {category.name}
                    </h4>

                    {category.description && (

                      <p className="text-xs text-charcoal/50 mt-1 line-clamp-2">
                        {category.description}
                      </p>

                    )}

                  </div>


                  <div className="flex items-center gap-1 shrink-0">

                    <button
                      type="button"
                      onClick={() =>
                        handleEditCategory(
                          category
                        )
                      }
                      className="
                        w-9
                        h-9
                        rounded-lg
                        flex
                        items-center
                        justify-center
                        text-charcoal/60
                        hover:bg-black/5
                        hover:text-charcoal
                        transition
                      "
                      title="Edit category"
                    >

                      <Edit3 size={16} />

                    </button>


                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteCategory(
                          category
                        )
                      }
                      disabled={
                        categoryDeletingId ===
                        category._id
                      }
                      className="
                        w-9
                        h-9
                        rounded-lg
                        flex
                        items-center
                        justify-center
                        text-red-500
                        hover:bg-red-50
                        transition
                        disabled:opacity-50
                      "
                      title="Delete category"
                    >

                      <Trash2 size={16} />

                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </div>


      {/* ======================================================
          EBOOK FORM
      ======================================================= */}

      <div className="glass-card p-6 md:p-8">


        {/* FORM HEADER */}

        <div className="flex items-center justify-between mb-6">

          <div>

            <h2 className="font-display text-xl font-semibold text-charcoal">

              {editingEbook
                ? 'Edit eBook'
                : 'Upload New eBook'}

            </h2>

            <p className="text-sm text-charcoal/50 mt-1">

              {editingEbook
                ? 'Update eBook information and admin keywords.'
                : 'Add a new health & wellness eBook.'}

            </p>

          </div>


          {editingEbook && (

            <button
              type="button"
              onClick={resetForm}
              className="
                inline-flex
                items-center
                gap-2
                text-sm
                font-medium
                text-charcoal/60
                hover:text-charcoal
              "
            >

              <X size={17} />

              Cancel Edit

            </button>

          )}

        </div>


        {/* ====================================================
            EBOOK FORM
        ===================================================== */}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >


          {/* TITLE / SUBTITLE */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <div>

              <label className="block text-sm font-medium text-charcoal mb-2">
                Title *
              </label>

              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g. Diabetes Management Guide"
                required
              />

            </div>


            <div>

              <label className="block text-sm font-medium text-charcoal mb-2">
                Subtitle
              </label>

              <input
                type="text"
                name="subtitle"
                value={form.subtitle}
                onChange={handleChange}
                className="input-field"
                placeholder="Optional subtitle"
              />

            </div>

          </div>


          {/* DESCRIPTION */}

          <div>

            <label className="block text-sm font-medium text-charcoal mb-2">
              Description *
            </label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={5}
              className="input-field resize-y"
              placeholder="Enter eBook description..."
              required
            />

          </div>


          {/* CATEGORY / PRICE / DISCOUNT */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            <div>

              <label className="block text-sm font-medium text-charcoal mb-2">
                Category *
              </label>

              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                disabled={categoriesLoading}
                className="input-field"
                required
              >

                <option value="">
                  {categoriesLoading
                    ? 'Loading categories...'
                    : categories.length === 0
                      ? 'Create a category first'
                      : 'Select category'}
                </option>

                {categories.map((category) => (

                  <option
                    key={category._id}
                    value={category._id}
                  >
                    {category.name}
                  </option>

                ))}

              </select>

            </div>


            <div>

              <label className="block text-sm font-medium text-charcoal mb-2">
                Price (INR) *
              </label>

              <input
                type="number"
                name="priceINR"
                value={form.priceINR}
                onChange={handleChange}
                min="0"
                step="1"
                className="input-field"
                placeholder="499"
                required
              />

            </div>


            <div>

              <label className="block text-sm font-medium text-charcoal mb-2">
                Discount (%)
              </label>

              <input
                type="number"
                name="discountPercent"
                value={form.discountPercent}
                onChange={handleChange}
                min="0"
                max="100"
                step="1"
                className="input-field"
                placeholder="0"
              />

            </div>

          </div>


          {/* SALE END */}

          <div>

            <label className="block text-sm font-medium text-charcoal mb-2">
              Sale Ends At
            </label>

            <input
              type="datetime-local"
              name="saleEndsAt"
              value={form.saleEndsAt}
              onChange={handleChange}
              className="input-field md:w-80"
            />

          </div>


          {/* PUBLIC TAGS */}

          <div>

            <label className="block text-sm font-medium text-charcoal mb-2">
              Public Tags
            </label>

            <input
              type="text"
              name="tags"
              value={form.tags}
              onChange={handleChange}
              className="input-field"
              placeholder="health, diabetes, nutrition"
            />

            <p className="text-xs text-charcoal/45 mt-1">
              Separate public tags using commas.
            </p>

          </div>


          {/* ==================================================
              ADMIN KEYWORDS
          =================================================== */}

          <div>

            <div className="flex items-center justify-between mb-2">

              <label className="block text-sm font-medium text-charcoal">
                Admin Keywords
              </label>

              <span className="text-xs text-charcoal/40">
                Super Admin only
              </span>

            </div>


            <div className="flex gap-2">

              <input
                type="text"
                value={keywordInput}
                onChange={(event) =>
                  setKeywordInput(
                    event.target.value
                  )
                }
                onKeyDown={
                  handleKeywordKeyDown
                }
                className="input-field flex-1"
                placeholder="Type a keyword..."
              />


              <button
                type="button"
                onClick={addKeyword}
                className="
                  shrink-0
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  px-5
                  rounded-xl
                  bg-charcoal
                  text-white
                  font-medium
                  hover:bg-charcoal/90
                  transition
                "
              >

                <Plus size={17} />

                Add

              </button>

            </div>


            <p className="text-xs text-charcoal/45 mt-2">
              Type a keyword and press Enter or click Add.
            </p>


            {form.adminKeywords.length > 0 && (

              <div className="flex flex-wrap gap-2 mt-4">

                {form.adminKeywords.map(
                  (keyword) => (

                    <div
                      key={keyword}
                      className="
                        inline-flex
                        items-center
                        gap-2
                        px-3
                        py-1.5
                        rounded-full
                        bg-green/10
                        text-green-dark
                        border
                        border-green/20
                        text-sm
                        font-medium
                      "
                    >

                      <span>
                        {keyword}
                      </span>


                      <button
                        type="button"
                        onClick={() =>
                          removeKeyword(
                            keyword
                          )
                        }
                        aria-label={`Remove keyword ${keyword}`}
                        title="Remove keyword"
                        className="
                          w-5
                          h-5
                          rounded-full
                          flex
                          items-center
                          justify-center
                          hover:bg-red-500
                          hover:text-white
                          transition
                        "
                      >

                        <X size={13} />

                      </button>

                    </div>

                  )
                )}

              </div>

            )}

          </div>


          {/* ==================================================
              FILE UPLOADS
          =================================================== */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">


            {/* COVER */}

            <div>

              <label className="block text-sm font-medium text-charcoal mb-2">
                Cover Image {!editingEbook && '*'}
              </label>

              <label
                className="
                  block
                  border-2
                  border-dashed
                  border-charcoal/15
                  rounded-xl
                  p-5
                  cursor-pointer
                  hover:border-green
                  transition
                "
              >

                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];

                    if (!file) {
                      setCoverImage(null);
                      return;
                    }

                    if (file.size > MAX_COVER_IMAGE_SIZE) {
                      toast.error(
                        `Cover image must be 10 MB or smaller. Selected: ${formatFileSize(file.size)}.`
                      );
                      event.target.value = '';
                      setCoverImage(null);
                      return;
                    }

                    setCoverImage(file);
                  }}
                />

                <div className="flex flex-col items-center text-center">

                  <ImageIcon
                    size={25}
                    className="text-charcoal/40 mb-2"
                  />

                  <span className="text-sm font-medium break-all">
                    {coverImage
                      ? coverImage.name
                      : 'Choose cover image'}
                  </span>

                  <span className="text-xs text-charcoal/40 mt-1">
                    JPG, PNG, WEBP • Maximum 10 MB
                  </span>

                  {coverImage && (
                    <span className="text-xs text-green-dark mt-1">
                      Selected: {formatFileSize(coverImage.size)}
                    </span>
                  )}

                </div>

              </label>

            </div>


            {/* PDF */}

            <div>

              <label className="block text-sm font-medium text-charcoal mb-2">
                eBook PDF {!editingEbook && '*'}
              </label>

              <label
                className="
                  block
                  border-2
                  border-dashed
                  border-charcoal/15
                  rounded-xl
                  p-5
                  cursor-pointer
                  hover:border-green
                  transition
                "
              >

                <input
                  ref={pdfInputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];

                    if (!file) {
                      setPdfFile(null);
                      return;
                    }

                    if (
                      file.type !== 'application/pdf' &&
                      !file.name.toLowerCase().endsWith('.pdf')
                    ) {
                      toast.error('Only PDF files are allowed.');
                      event.target.value = '';
                      setPdfFile(null);
                      return;
                    }

                    if (file.size > MAX_EBOOK_PDF_SIZE) {
                      toast.error(
                        `eBook PDF must be 500 MB or smaller. Selected: ${formatFileSize(file.size)}.`
                      );
                      event.target.value = '';
                      setPdfFile(null);
                      return;
                    }

                    setPdfFile(file);
                  }}
                />

                <div className="flex flex-col items-center text-center">

                  <FileText
                    size={25}
                    className="text-charcoal/40 mb-2"
                  />

                  <span className="text-sm font-medium break-all">
                    {pdfFile
                      ? pdfFile.name
                      : 'Choose PDF file'}
                  </span>

                  <span className="text-xs text-charcoal/40 mt-1">
                    PDF only • Maximum 500 MB
                  </span>

                  {pdfFile && (
                    <span className="text-xs text-green-dark mt-1">
                      Selected: {formatFileSize(pdfFile.size)}
                    </span>
                  )}

                </div>

              </label>

            </div>


            {/* PREVIEW */}

            <div>

              <label className="block text-sm font-medium text-charcoal mb-2">
                Preview PDF
              </label>

              <label
                className="
                  block
                  border-2
                  border-dashed
                  border-charcoal/15
                  rounded-xl
                  p-5
                  cursor-pointer
                  hover:border-green
                  transition
                "
              >

                <input
                  ref={previewInputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];

                    if (!file) {
                      setPreviewFile(null);
                      return;
                    }

                    if (
                      file.type !== 'application/pdf' &&
                      !file.name.toLowerCase().endsWith('.pdf')
                    ) {
                      toast.error('Only PDF files are allowed.');
                      event.target.value = '';
                      setPreviewFile(null);
                      return;
                    }

                    if (file.size > MAX_PREVIEW_PDF_SIZE) {
                      toast.error(
                        `Preview PDF must be 50 MB or smaller. Selected: ${formatFileSize(file.size)}.`
                      );
                      event.target.value = '';
                      setPreviewFile(null);
                      return;
                    }

                    setPreviewFile(file);
                  }}
                />

                <div className="flex flex-col items-center text-center">

                  <Upload
                    size={25}
                    className="text-charcoal/40 mb-2"
                  />

                  <span className="text-sm font-medium break-all">
                    {previewFile
                      ? previewFile.name
                      : 'Choose preview PDF'}
                  </span>

                  <span className="text-xs text-charcoal/40 mt-1">
                    Optional • Maximum 50 MB
                  </span>

                  {previewFile && (
                    <span className="text-xs text-green-dark mt-1">
                      Selected: {formatFileSize(previewFile.size)}
                    </span>
                  )}

                </div>

              </label>

            </div>

          </div>


          {/* STATUS */}

          <div className="flex flex-wrap gap-6">

            <label className="inline-flex items-center gap-2 cursor-pointer">

              <input
                type="checkbox"
                name="isFeatured"
                checked={form.isFeatured}
                onChange={handleChange}
                className="w-4 h-4"
              />

              <span className="text-sm text-charcoal">
                Featured eBook
              </span>

            </label>


            <label className="inline-flex items-center gap-2 cursor-pointer">

              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
                className="w-4 h-4"
              />

              <span className="text-sm text-charcoal">
                Active
              </span>

            </label>

          </div>


          {/* SUBMIT */}

          <div className="flex flex-wrap gap-3 pt-2">

            <button
              type="submit"
              disabled={saving}
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                px-6
                py-3
                rounded-xl
                bg-brand-gradient
                text-white
                font-semibold
                shadow-sm
                hover:opacity-90
                transition
                disabled:opacity-60
                disabled:cursor-not-allowed
              "
            >

              {editingEbook ? (
                <Save size={18} />
              ) : (
                <Upload size={18} />
              )}

              {saving
                ? 'Saving...'
                : editingEbook
                  ? 'Update eBook'
                  : 'Upload eBook'}

            </button>


            {editingEbook && (

              <button
                type="button"
                onClick={resetForm}
                disabled={saving}
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  px-6
                  py-3
                  rounded-xl
                  border
                  border-charcoal/15
                  text-charcoal
                  font-medium
                  hover:bg-black/5
                  transition
                "
              >

                <X size={18} />

                Cancel

              </button>

            )}

          </div>

        </form>

      </div>


      {/* ======================================================
          EBOOK LIST
      ======================================================= */}

      <div className="glass-card p-6 md:p-8">


        {/* HEADER */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

          <div>

            <h2 className="font-display text-xl font-semibold">
              Manage eBooks
            </h2>

            <p className="text-sm text-charcoal/50 mt-1">
              {ebooks.length} eBook
              {ebooks.length !== 1 ? 's' : ''} total
            </p>

          </div>


          {/* SEARCH */}

          <div className="relative md:w-80">

            <Search
              size={17}
              className="
                absolute
                left-3
                top-1/2
                -translate-y-1/2
                text-charcoal/40
                pointer-events-none
              "
            />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search eBooks..."
              className="input-field pl-10"
            />

          </div>

        </div>


        {/* LOADING */}

        {loading ? (

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

            {Array.from({
              length: 6,
            }).map((_, index) => (

              <div
                key={index}
                className="
                  h-64
                  rounded-xl
                  bg-black/5
                  animate-pulse
                "
              />

            ))}

          </div>

        ) : filteredEbooks.length === 0 ? (

          <div className="text-center py-16">

            <BookOpen
              size={40}
              className="mx-auto text-charcoal/25 mb-3"
            />

            <h3 className="font-display text-lg font-semibold">
              No eBooks found
            </h3>

            <p className="text-sm text-charcoal/50 mt-1">
              Upload your first eBook using the form above.
            </p>

          </div>

        ) : (

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

            {filteredEbooks.map((ebook) => (

              <div
                key={ebook._id}
                className="
                  border
                  border-charcoal/10
                  rounded-2xl
                  overflow-hidden
                  bg-white
                  shadow-sm
                "
              >

                {/* COVER */}

                <div className="relative aspect-[3/2] bg-black/5">

                  {ebook.coverImageUrl ? (

                    <img
                      src={ebook.coverImageUrl}
                      alt={ebook.title}
                      className="
                        w-full
                        h-full
                        object-cover
                      "
                      onError={(event) => {
                        event.currentTarget.style.display =
                          'none';
                      }}
                    />

                  ) : (

                    <div className="w-full h-full flex items-center justify-center">

                      <BookOpen
                        size={40}
                        className="text-charcoal/20"
                      />

                    </div>

                  )}


                  {/* STATUS */}

                  <div className="absolute top-3 left-3 flex gap-2">

                    {ebook.isFeatured && (

                      <span
                        className="
                          px-2.5
                          py-1
                          rounded-full
                          bg-brand-gradient
                          text-white
                          text-xs
                          font-semibold
                        "
                      >
                        Featured
                      </span>

                    )}


                    <span
                      className={`
                        px-2.5
                        py-1
                        rounded-full
                        text-xs
                        font-semibold
                        ${
                          ebook.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }
                      `}
                    >
                      {ebook.isActive
                        ? 'Active'
                        : 'Inactive'}
                    </span>

                  </div>

                </div>


                {/* DETAILS */}

                <div className="p-5">


                  <p className="text-xs text-blue-dark font-semibold uppercase tracking-wide mb-1">
                    {ebook.category?.name ||
                      'Uncategorized'}
                  </p>


                  <h3 className="font-display font-semibold text-lg line-clamp-2 mb-2">
                    {ebook.title}
                  </h3>


                  {ebook.description && (

                    <p className="text-sm text-charcoal/55 line-clamp-2 mb-4">
                      {ebook.description}
                    </p>

                  )}


                  {/* PRICE */}

                  <div className="flex items-center gap-2 mb-4">

                    <span className="font-display font-bold text-lg">
                      ₹{ebook.finalPrice}
                    </span>


                    {Number(
                      ebook.discountPercent
                    ) > 0 && (

                      <span className="text-sm text-charcoal/40 line-through">
                        ₹{ebook.priceINR}
                      </span>

                    )}

                  </div>


                  {/* STATISTICS */}

                  <div className="grid grid-cols-2 gap-2 mb-4">

                    <div className="rounded-lg bg-black/[0.03] p-2.5">

                      <p className="text-[11px] text-charcoal/40">
                        Sales
                      </p>

                      <p className="text-sm font-semibold">
                        {ebook.salesCount || 0}
                      </p>

                    </div>


                    <div className="rounded-lg bg-black/[0.03] p-2.5">

                      <p className="text-[11px] text-charcoal/40">
                        Downloads
                      </p>

                      <p className="text-sm font-semibold">
                        {ebook.downloadsCount || 0}
                      </p>

                    </div>

                  </div>


                  {/* ADMIN KEYWORDS */}

                  {Array.isArray(
                    ebook.adminKeywords
                  ) &&
                    ebook.adminKeywords.length > 0 && (

                      <div className="mb-4">

                        <p className="text-xs font-semibold text-charcoal/50 mb-2">
                          Admin Keywords
                        </p>

                        <div className="flex flex-wrap gap-1.5">

                          {ebook.adminKeywords.map(
                            (keyword) => (

                              <span
                                key={keyword}
                                className="
                                  px-2
                                  py-1
                                  rounded-full
                                  bg-green/10
                                  text-green-dark
                                  text-xs
                                "
                              >
                                {keyword}
                              </span>

                            )
                          )}

                        </div>

                      </div>

                    )}


                  {/* ACTIONS */}

                  <div className="flex gap-2">

                    <button
                      type="button"
                      onClick={() =>
                        handleEdit(ebook)
                      }
                      className="
                        flex-1
                        inline-flex
                        items-center
                        justify-center
                        gap-2
                        px-4
                        py-2.5
                        rounded-xl
                        bg-black/5
                        text-charcoal
                        text-sm
                        font-medium
                        hover:bg-black/10
                        transition
                      "
                    >

                      <Edit3 size={16} />

                      Edit

                    </button>


                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(
                          ebook
                        )
                      }
                      disabled={
                        deletingId ===
                        ebook._id
                      }
                      className="
                        inline-flex
                        items-center
                        justify-center
                        gap-2
                        px-4
                        py-2.5
                        rounded-xl
                        bg-red-50
                        text-red-600
                        text-sm
                        font-medium
                        hover:bg-red-100
                        transition
                        disabled:opacity-50
                      "
                    >

                      <Trash2 size={16} />

                      {deletingId ===
                      ebook._id
                        ? 'Deleting...'
                        : 'Delete'}

                    </button>

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>

  );

}