const checkAuth = require("../utils/check-auth");
const {
    AuthenticationError,
    UserInputError,
} = require("apollo-server-express");

module.exports = {
    Query: {
        async getPosts(_, __, { dataSources: { postDS } }) {
            try {
                const posts = await postDS.getAllPosts();
                return posts;
            } catch (err) {
                throw new Error(err);
            }
        },
        async getPost(_, { postId }, { dataSources: { postDS } }) {
            try {
                const post = await postDS.getPost(postId);
                if (post) return post;
                else throw new Error("Post not found!");
            } catch (err) {
                throw new Error(err);
            }
        },
    },
    Mutation: {
        async createPost(_, { body }, context) {
            const user = checkAuth(context);
            const {
                dataSources: { postDS },
            } = context;
            try {
                if (body.trim() === "")
                    throw new Error("Post body must not be empty!");

                const post = await postDS.createPost({
                    body,
                    user: user.id,
                    username: user.username,
                    createdAt: new Date().toISOString(),
                });

                context.pubsub.publish("NEW-POST", {
                    newPost: post,
                });
                return post;
            } catch (err) {
                throw new Error(err);
            }
        },
        async deletePost(_, { postId }, context) {
            const user = checkAuth(context);
            const {
                dataSources: { postDS, commentsDS },
            } = context;
            try {
                const post = await postDS.getPost(postId);
                if (user.username === post.username) {
                    await postDS.deletePost(postId);
                    await commentsDS.deleteAllComments(postId);
                    return "Post deleted successfully";
                } else {
                    throw new AuthenticationError("Action not allowed!");
                }
            } catch (err) {
                throw new Error(err);
            }
        },
        async likePost(_, { postId }, context) {
            const { username } = checkAuth(context);
            const {
                dataSources: { postDS },
            } = context;
            const post = await postDS.getPost(postId);
            if (post) {
                if (post.likes.find((like) => like.username === username)) {
                    //Post already likes, unlike it
                    post.likes = post.likes.filter(
                        (like) => like.username !== username
                    );
                } else {
                    //Like the post
                    post.likes.push({
                        username,
                        createdAt: new Date().toISOString(),
                    });
                }
                await postDS.updatePost(post);
                return post;
            } else throw new UserInputError("Post not found");
        },
    },
    Subscription: {
        newPost: {
            subscribe: (parent, args, context) => {
                return context?.pubsub.asyncIterator(["NEW-POST"]);
            },
        },
    },
};
