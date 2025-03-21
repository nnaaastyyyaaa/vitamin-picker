module.exports = function (fastify) {
  fastify.setErrorHandler((error, request, reply) => {
    if (error.code === 11000) {
      const key = Object.keys(error.keyValue);
      const value = Object.values(error.keyValue);
      return reply.status(400).send({
        message: `Field "${key}" with value "${value}" already exists. Please use another value`,
      });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((el) => el.message);
      return reply.status(400).send({ message: messages.join('. ') });
    }
    reply
      .status(error.statusCode || 500)
      .send({ message: error.message || 'Something went wrong' });
  });
};
