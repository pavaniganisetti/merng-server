const { MongoDataSource } = require("apollo-datasource-mongodb");

class Users extends MongoDataSource {
    getUser(username) {
        return this.model.findOne({ username: username });
    }
    createUser(user) {
        return this.model.create(user);
    }
}

module.exports = Users;
