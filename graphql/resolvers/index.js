const postsResolvers = require("./posts");
const userResolvers = require("./users");
const commentsResolvers = require("./comments");
module.exports = {
  Post: {
    likesCount: (parentValue) => parentValue.likes.length,
    commentsCount: (parentValue) => parentValue.comments.length,
  },
  Query: {
    ...postsResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...postsResolvers.Mutation,
    ...commentsResolvers.Mutation,
  },
  Subscription: {
    ...postsResolvers.Subscription,
    ...commentsResolvers.Subscription,
  },
};
