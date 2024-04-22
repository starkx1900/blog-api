import Blog from '../database/schema/blog.schema.js';
import { ErrorWithStatus } from '../exceptions/error-with-status.exception.js';

export const getBlog = async (blogId) => {
  const blog = await Blog.findOneAndUpdate(
    { _id: blogId, state: 'published' },
    { $inc: { read_count: 1 } },
    { new: true }
  ).populate('author', '-password');

  return blog;
};

export const getAuthorBlogs = async (authorId, page = 1, limit = 20, query) => {
  try {
    console.log(query);
    const filter = { author: authorId };
    if (query.state) {
      filter.state = state;
    }

    const skip = (page - 1) * limit;
    const blogs = await Blog.find(filter)
      .populate('author', '-password')
      .skip(skip)
      .limit(limit);
    const total = await Blog.countDocuments(filter);
    return { data: blogs, meta: { page, limit, total } };
  } catch (error) {
    console.log(error);
    throw new ErrorWithStatus(error.message, 500);
  }
};

export const getAllBlogs = async (page = 1, limit = 20, query) => {
  try {
    const filter = { state: 'published' };
    if (query.title) {
      filter.title = { $regex: new RegExp(query.title, 'i') };
    }
    if (query.tags) {
      filter.tags = { $in: new RegExp(query.tags, 'i') };
    }
    if (query.author) {
      const authorIds = await Blog.find({
        $or: [
          { first_name: { $regex: new RegExp(query.author, 'i') } },
          { last_name: { $regex: new RegExp(query.author, 'i') } },
        ],
      }).select('_id');
      filter.author = { $in: authorIds.map((author) => author._id) };
    }

    const skip = (page - 1) * limit;
    const blogs = await Blog.find(filter)
      .populate('author', '-password')
      .skip(skip)
      .limit(limit);
    const total = await Blog.countDocuments(filter);
    return { data: blogs, meta: { page, limit, total } };
  } catch (error) {
    console.log(error);
    throw new ErrorWithStatus(error.message, 500);
  }
};

export const create = async (authorId, title, description, body, tags) => {
  // Check if blog with same title exists
  const blog = await Blog.findOne({ title });
  if (blog) {
    throw new ErrorWithStatus('Blog already with the title exists', 400);
  }

  const reading_time = Math.ceil(body.split(' ').length / 35);

  // Create new blog
  const newBlog = await new Blog({
    title,
    description,
    body,
    tags,
    author: authorId,
    reading_time,
  }).populate('author', '-password');
  await newBlog.save();

  return newBlog;
};

export const publish = async (authorId, blogId) => {
  try {
    const blogExists = await Blog.findById(blogId);

    if (!blogExists) throw new ErrorWithStatus('Blog not found', 404);

    const blog = await Blog.findOneAndUpdate(
      { _id: blogId, author: authorId },
      { $set: { state: 'published' } },
      { new: true }
    ).populate('author', '-password');

    if (!blog) throw new ErrorWithStatus('Unauthorized', 401);
    return blog;
  } catch (error) {
    throw new ErrorWithStatus(error.message, 500);
  }
};

export const updateBlog = async (authorId, blogId, payload) => {
  try {
    const blogExists = await Blog.findById(blogId);
    if (!blogExists) throw new ErrorWithStatus('Blog not found', 404);

    if (payload.body) {
      payload.reading_time = Math.ceil(payload.body.split(' ').length / 35);
    }

    const blog = await Blog.findOneAndUpdate(
      { _id: blogId, author: authorId },
      { $set: payload },
      { new: true }
    ).populate('author', '-password');

    if (!blog) throw new ErrorWithStatus('Unauthorized', 401);
    return blog;
  } catch (error) {
    if (error.code === 11000) {
      throw new ErrorWithStatus('Blog with same title already exists', 400);
    }
    throw new ErrorWithStatus(error.message, 500);
  }
};

export const deleteBlog = async (authorId, blogId) => {
  try {
    const blogExists = await Blog.findById(blogId);
    if (!blogExists) throw new ErrorWithStatus('Blog not found', 404);

    const blog = await Blog.findOneAndDelete({
      _id: blogId,
      author: authorId,
    });

    if (!blog) throw new ErrorWithStatus('Unauthorized', 401);
    return blog;
  } catch (error) {
    throw new ErrorWithStatus(error.message, 500);
  }
};
