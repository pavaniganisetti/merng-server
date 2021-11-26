const {
    UserInputError,
    AuthenticationError,
} = require("apollo-server-express");
const checkAuth = require("../utils/check-auth");

module.exports = {
    Query: {
        getComments: async (_, { postId }, { dataSources: { commentsDS } }) => {
            const comments = await commentsDS.getAllComments(postId);
            return comments;
        },
    },
    Mutation: {
        createComment: async (_, { postId, body }, context) => {
            const { username } = checkAuth(context);
            const {
                dataSources: { commentsDS, postDS },
            } = context;
            if (body.trim() === "")
                throw new UserInputError("Empty comment", {
                    errors: {
                        body: "Comment body must not be empty",
                    },
                });
            const post = await postDS.getPost(postId);

            if (post) {
                const comment = {
                    body,
                    username,
                    createdAt: new Date().toISOString(),
                    postId: post.id,
                };
                const createComment = await commentsDS.createComment(comment);
                context.pubsub.publish("NEW-COMMENT", {
                    newComment: createComment,
                });

                return post;
            } else {
                throw new UserInputError("Post not found");
            }
        },
        async deleteComment(_, { postId, commentId }, context) {
            const { username } = checkAuth(context);
            const {
                dataSources: { commentsDS, postDS },
            } = context;
            const post = await postDS.getPost(postId);
            if (post) {
                const comments = await commentsDS.getAllComments(postId);
                const commentIndex = comments.findIndex(
                    (c) => c.id === commentId
                );

                if (comments[commentIndex].username === username) {
                    const commentId = comments[commentIndex].id;

                    await commentsDS.deleteComment(commentId);
                    return post;
                } else {
                    throw new AuthenticationError("Action not allowed");
                }
            } else {
                throw new UserInputError("Post not found");
            }
        },
    },
    Subscription: {
        newComment: {
            subscribe: (parent, args, context) => {
                return context.pubsub.asyncIterator(["NEW-COMMENT"]);
            },
        },
    },
};
