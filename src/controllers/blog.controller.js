import { ErrorWithStatus } from '../exceptions/error-with-status.exception.js';
import * as blogService from '../services/blog.service.js';

export const getAllBlogs = async (req, res) => {
  try {
    let page = Number(req.query.page) || 1;
    let limit = Number(req.query.limit) || 20;

    const query = req.query;

    const { data, meta } = await blogService.getAllBlogs(page, limit, query);
    res.json({ message: 'Get all blogs', data, meta });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const getAuthorBlogs = async (req, res) => {
  try {
    let page = Number(req.query.page) || 1;
    let limit = Number(req.query.limit) || 20;

    const query = req.query;
    const authorId = req.user._id;

    const { data, meta } = await blogService.getAuthorBlogs(
      authorId,
      page,
      limit,
      query
    );
    res.json({ message: 'Get all authors blogs', data, meta });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const createBlog = async (req, res) => {
  try {
    const { title, description, body, tags } = req.body;
    const authorId = req.user._id;
    const newBlog = await blogService.create(
      authorId,
      title,
      description,
      body,
      tags
    );
    res.status(201).json({
      message: 'Blog created successfully',
      data: {
        blog: newBlog,
      },
    });
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

export const getBlog = async (req, res) => {
  const { id } = req.params;
  const blog = await blogService.getBlog(id);
  if (blog) {
    return res.status(200).json({
      success: true,
      message: 'Successfully retrieved Blog',
      data: { blog },
    });
  } else {
    return res.status(404).json({
      message: 'Blog not found',
    });
  }
};

export const publishBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const authorId = req.user._id;
    const blog = await blogService.publish(authorId, id);

    return res.status(200).json({
      success: true,
      message: 'Successfully published Blog',
      data: { blog },
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const authorId = req.user._id;
    console.log('Params', (authorId, id, req.body));
    const blog = await blogService.updateBlog(authorId, id, req.body);

    return res.status(200).json({
      success: true,
      message: 'Successfully updated Blog',
      data: { blog },
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const authorId = req.user._id;
    await blogService.deleteBlog(authorId, id);
    return res.status(204).json({});
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};
