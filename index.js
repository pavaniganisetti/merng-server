const { createServer } = require("http");
const { execute, subscribe } = require("graphql");
const { SubscriptionServer } = require("subscriptions-transport-ws");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const express = require("express");
const moogoose = require("mongoose");
const { PubSub } = require("graphql-subscriptions");
const { ApolloServer } = require("apollo-server-express");
const resolvers = require("./graphql/resolvers");
const typeDefs = require("./graphql/typeDefs");
const { MONGODB } = require("./config");

const PostDS = require("./graphql/datasources/posts");
const UserDS = require("./graphql/datasources/users");
const Post = require("./models/Post");
const User = require("./models/User");

(async function () {
    const app = express();
    const httpServer = createServer(app);
    const pubsub = new PubSub();

    const schema = makeExecutableSchema({
        typeDefs,
        resolvers,
    });

    const server = new ApolloServer({
        schema,
        context: ({ req }) => ({ req, pubsub }),
        dataSources: () => ({
            postDS: new PostDS(Post),
            userDS: new UserDS(User),
        }),
    });

    await server.start().catch((err) => console.log(err));
    server.applyMiddleware({ app });

    SubscriptionServer.create(
        {
            schema,
            execute,
            subscribe,
            onConnect(connectionParams, __, context) {
                if (connectionParams.authHeader !== null) {
                    return { pubsub };
                } else {
                    return false;
                }
            },
        },
        { server: httpServer, path: server.graphqlPath }
    );

    const PORT = 4000;

    await moogoose
        .connect(MONGODB, {
            useNewUrlParser: true,
        })
        .then(() => {
            console.log("MongoDB Connected");
        })
        .catch((err) => console.log(err));

    httpServer.listen(PORT, () => {
        console.log(
            `Query endpoint ready at http://localhost:${PORT}${server.graphqlPath}`
        );
        console.log(
            `Subscription endpoint ready at ws://localhost:${PORT}${server.graphqlPath}`
        );
    });
})();
