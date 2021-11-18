// const { ApolloServer } = require("apollo-server-express");
// const { ApolloServerPluginDrainHttpServer } = require("apollo-server-core");
// const mongoose = require("mongoose");
// const express = require("express");
// const http = require("http");

// const typeDefs = require("./graphql/typeDefs");
// const { MONGODB } = require("./config");
// const resolvers = require("./graphql/resolvers");

// const app = express();
// const httpServer = http.createServer(app);

// const server = new ApolloServer({
//   typeDefs,
//   resolvers,
//   context: ({ req }) => ({ req }),
//   plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
// });

// mongoose
//   .connect(MONGODB, {
//     useNewUrlParser: true,
//   })
//   .then(() => {
//     console.log("MONGODB CONNECTED");
//     return server.start();
//   })
//   .then(() => {
//     server.applyMiddleware({ app, path: "/" });
//   })
//   .then(() => {
//     new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));
//   })
//   .then(() => {
//     console.log(
//       `🚀 Server ready at http://localhost:4000${server.graphqlPath}`
//     );
//   })
//   .catch((err) => {
//     console.log(err);
//   });
