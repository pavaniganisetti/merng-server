const { MongoDataSource } = require("apollo-datasource-mongodb");

class Posts extends MongoDataSource {
    getAllPosts() {
        return this.model.find().sort({ createdAt: -1 });
    }
    getPost(postId) {
        return this.model.findOne({ _id: postId });
    }
    createPost(post = {}) {
        return this.model.create(post);
    }
    updatePost(post = {}) {
        return this.model.updateOne({ _id: post._id }, post);
    }
    deletePost(postId) {
        return this.model.deleteOne({ _id: postId });
    }
}

module.exports = Posts;
