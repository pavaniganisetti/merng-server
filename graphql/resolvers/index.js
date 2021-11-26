const postsResolvers = require("./posts");
const userResolvers = require("./users");
const commentsResolvers = require("./comments");
module.exports = {
    Post: {
        comments: async (parentValue, _, { dataSources: { commentsDS } }) => {
            const comments = await commentsDS.getAllComments(parentValue._id);
            if (comments.length === 0) {
                return [];
            }
            return comments;
        },
        likesCount: (parentValue) => parentValue.likes.length,
        commentsCount: async (
            parentValue,
            _,
            { dataSources: { commentsDS } }
        ) => {
            const comments = await commentsDS.getAllComments(parentValue._id);
            return comments.length;
        },
    },
    Query: {
        ...postsResolvers.Query,
        ...commentsResolvers.Query,
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
