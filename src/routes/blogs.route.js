import { Router } from 'express';
import * as blogController from '../controllers/blog.controller.js';
import { generateMiddleWare } from '../middleware/route.middleware.js';
import {
  createBlogSchema,
  updateBlogSchema,
} from './../validation/blog.validation.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const blogRoute = Router();

blogRoute.get('/', blogController.getAllBlogs);
blogRoute.get('/:id', blogController.getBlog);
blogRoute.get('/users/me', authMiddleware, blogController.getAuthorBlogs);
blogRoute.post(
  '/',
  authMiddleware,
  generateMiddleWare(createBlogSchema),
  blogController.createBlog
);
blogRoute.patch(
  '/:id',
  authMiddleware,
  generateMiddleWare(updateBlogSchema),
  blogController.updateBlog
);
blogRoute.patch('/:id/publish', authMiddleware, blogController.publishBlog);
blogRoute.delete('/:id', authMiddleware, blogController.deleteBlog);

export default blogRoute;
