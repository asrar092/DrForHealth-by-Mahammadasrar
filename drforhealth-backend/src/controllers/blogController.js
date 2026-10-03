const Blog = require('../models/Blog');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');


// ============================================================
// CREATE BLOG
// @route POST /api/blogs
// @access Super Admin
// ============================================================

exports.createBlog = asyncHandler(async (req, res) => {
  const {
    title,
    slug,
    excerpt,
    content,
    coverImage,
    status,
  } = req.body;

  // ----------------------------------------------------------
  // Validation
  // ----------------------------------------------------------

  if (!title || !title.trim()) {
    throw new ApiError(
      400,
      'Blog title is required.'
    );
  }

  if (!content || !content.trim()) {
    throw new ApiError(
      400,
      'Blog content is required.'
    );
  }

  // ----------------------------------------------------------
  // Generate slug if not provided
  // ----------------------------------------------------------

  let finalSlug = slug;

  if (!finalSlug || !finalSlug.trim()) {
    finalSlug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  } else {
    finalSlug = finalSlug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  // ----------------------------------------------------------
  // Check duplicate slug
  // ----------------------------------------------------------

  const existingBlog = await Blog.findOne({
    slug: finalSlug,
  });

  if (existingBlog) {
    throw new ApiError(
      409,
      'A blog with this slug already exists.'
    );
  }

  // ----------------------------------------------------------
  // Status
  // ----------------------------------------------------------

  const blogStatus =
    status === 'published'
      ? 'published'
      : 'draft';

  // ----------------------------------------------------------
  // Published date
  // ----------------------------------------------------------

  const publishedAt =
    blogStatus === 'published'
      ? new Date()
      : null;

  // ----------------------------------------------------------
  // Create Blog
  // ----------------------------------------------------------

  const blog = await Blog.create({
    title: title.trim(),
    slug: finalSlug,
    excerpt: excerpt
      ? excerpt.trim()
      : '',
    content: content.trim(),
    coverImage: coverImage || '',
    author: req.user._id,
    status: blogStatus,
    publishedAt,
  });

  // ----------------------------------------------------------
  // Response
  // ----------------------------------------------------------

  res.status(201).json({
    success: true,
    message: 'Blog created successfully.',
    blog,
  });
});


// ============================================================
// GET ALL PUBLISHED BLOGS
// @route GET /api/blogs
// @access Public
// ============================================================

exports.getBlogs = asyncHandler(async (req, res) => {
  const blogs = await Blog.find({
    status: 'published',
  })
    .populate(
      'author',
      'name avatar'
    )
    .sort({
      publishedAt: -1,
      createdAt: -1,
    });

  res.json({
    success: true,
    count: blogs.length,
    blogs,
  });
});


// ============================================================
// GET SINGLE BLOG BY SLUG
// @route GET /api/blogs/:slug
// @access Public
// ============================================================

exports.getBlogBySlug = asyncHandler(
  async (req, res) => {
    const { slug } = req.params;

    const blog = await Blog.findOne({
      slug,
      status: 'published',
    }).populate(
      'author',
      'name avatar'
    );

    if (!blog) {
      throw new ApiError(
        404,
        'Blog not found.'
      );
    }

    res.json({
      success: true,
      blog,
    });
  }
);


// ============================================================
// GET ALL BLOGS FOR ADMIN
// @route GET /api/blogs/admin/all
// @access Super Admin
// ============================================================

exports.getAllBlogsAdmin = asyncHandler(
  async (req, res) => {
    const blogs = await Blog.find()
      .populate(
        'author',
        'name email avatar role'
      )
      .sort({
        createdAt: -1,
      });

    res.json({
      success: true,
      count: blogs.length,
      blogs,
    });
  }
);


// ============================================================
// GET SINGLE BLOG BY ID FOR ADMIN
// @route GET /api/blogs/admin/:id
// @access Super Admin
// ============================================================

exports.getBlogByIdAdmin = asyncHandler(
  async (req, res) => {
    const { id } = req.params;

    const blog = await Blog.findById(id).populate(
      'author',
      'name email avatar role'
    );

    if (!blog) {
      throw new ApiError(
        404,
        'Blog not found.'
      );
    }

    res.json({
      success: true,
      blog,
    });
  }
);


// ============================================================
// UPDATE BLOG
// @route PUT /api/blogs/:id
// @access Super Admin
// ============================================================

exports.updateBlog = asyncHandler(
  async (req, res) => {
    const { id } = req.params;

    const {
      title,
      slug,
      excerpt,
      content,
      coverImage,
      status,
    } = req.body;

    // --------------------------------------------------------
    // Find blog
    // --------------------------------------------------------

    const blog = await Blog.findById(id);

    if (!blog) {
      throw new ApiError(
        404,
        'Blog not found.'
      );
    }

    // --------------------------------------------------------
    // Update title
    // --------------------------------------------------------

    if (
      title !== undefined &&
      title.trim()
    ) {
      blog.title = title.trim();
    }

    // --------------------------------------------------------
    // Update slug
    // --------------------------------------------------------

    if (
      slug !== undefined &&
      slug.trim()
    ) {
      const newSlug = slug
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');

      // Check duplicate slug
      const duplicate = await Blog.findOne({
        slug: newSlug,
        _id: {
          $ne: blog._id,
        },
      });

      if (duplicate) {
        throw new ApiError(
          409,
          'Another blog already uses this slug.'
        );
      }

      blog.slug = newSlug;
    }

    // --------------------------------------------------------
    // Update excerpt
    // --------------------------------------------------------

    if (excerpt !== undefined) {
      blog.excerpt = excerpt.trim();
    }

    // --------------------------------------------------------
    // Update content
    // --------------------------------------------------------

    if (
      content !== undefined &&
      content.trim()
    ) {
      blog.content = content.trim();
    }

    // --------------------------------------------------------
    // Update cover image
    // --------------------------------------------------------

    if (coverImage !== undefined) {
      blog.coverImage = coverImage;
    }

    // --------------------------------------------------------
    // Update status
    // --------------------------------------------------------

    if (
      status === 'draft' ||
      status === 'published'
    ) {
      // If changing to published for first time
      if (
        status === 'published' &&
        blog.status !== 'published'
      ) {
        blog.publishedAt = new Date();
      }

      // If changing back to draft
      if (
        status === 'draft'
      ) {
        blog.publishedAt = null;
      }

      blog.status = status;
    }

    // --------------------------------------------------------
    // Save
    // --------------------------------------------------------

    await blog.save();

    // --------------------------------------------------------
    // Populate author
    // --------------------------------------------------------

    await blog.populate(
      'author',
      'name email avatar role'
    );

    res.json({
      success: true,
      message: 'Blog updated successfully.',
      blog,
    });
  }
);


// ============================================================
// DELETE BLOG
// @route DELETE /api/blogs/:id
// @access Super Admin
// ============================================================

exports.deleteBlog = asyncHandler(
  async (req, res) => {
    const { id } = req.params;

    const blog = await Blog.findById(id);

    if (!blog) {
      throw new ApiError(
        404,
        'Blog not found.'
      );
    }

    await Blog.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Blog deleted successfully.',
    });
  }
);


// ============================================================
// PUBLISH BLOG
// @route PATCH /api/blogs/:id/publish
// @access Super Admin
// ============================================================

exports.publishBlog = asyncHandler(
  async (req, res) => {
    const { id } = req.params;

    const blog = await Blog.findById(id);

    if (!blog) {
      throw new ApiError(
        404,
        'Blog not found.'
      );
    }

    blog.status = 'published';
    blog.publishedAt = new Date();

    await blog.save();

    res.json({
      success: true,
      message: 'Blog published successfully.',
      blog,
    });
  }
);


// ============================================================
// UNPUBLISH BLOG
// @route PATCH /api/blogs/:id/unpublish
// @access Super Admin
// ============================================================

exports.unpublishBlog = asyncHandler(
  async (req, res) => {
    const { id } = req.params;

    const blog = await Blog.findById(id);

    if (!blog) {
      throw new ApiError(
        404,
        'Blog not found.'
      );
    }

    blog.status = 'draft';
    blog.publishedAt = null;

    await blog.save();

    res.json({
      success: true,
      message: 'Blog moved to draft successfully.',
      blog,
    });
  }
);