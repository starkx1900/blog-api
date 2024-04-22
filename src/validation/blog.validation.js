import Joi from 'joi';

export const createBlogSchema = Joi.object({
  title: Joi.string().min(4).required(),
  description: Joi.string().min(4),
  body: Joi.string().min(10).required(),
  tags: Joi.array().items(Joi.string()),
});

export const updateBlogSchema = Joi.object({
  title: Joi.string().min(4),
  description: Joi.string().min(4),
  body: Joi.string().min(10),
  tags: Joi.array().items(Joi.string()),
});
