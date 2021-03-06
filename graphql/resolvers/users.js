const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../../config");
const { UserInputError } = require("apollo-server-express");
const {
    validateRegisterInput,
    validateLoginInput,
} = require("../utils/validators");

function generateToken(user) {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            username: user.username,
        },
        SECRET_KEY,
        {
            expiresIn: "1h",
        }
    );
}

module.exports = {
    Mutation: {
        async login(_, { username, password }, { dataSources: { userDS } }) {
            const { errors, valid } = validateLoginInput(username, password);
            if (!valid) {
                throw new UserInputError("Errors", { errors });
            }
            const user = await userDS.getUser(username);
            if (!user) {
                errors.general = "User not found";
                throw new UserInputError("User not found", {
                    errors,
                });
            }
            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                errors.general = "Wrong credentials";
                throw new UserInputError("Wrong credentials", {
                    errors,
                });
            }
            const token = generateToken(user);

            return {
                ...user._doc,
                id: user._id,
                token,
            };
        },
        async register(
            _,
            { registerInput: { username, email, password, confirmPassword } },
            { dataSources: { userDS } }
        ) {
            const { valid, errors } = validateRegisterInput(
                username,
                email,
                password,
                confirmPassword
            );
            if (!valid) throw new UserInputError("Errors", { errors });
            const existingUsername = await userDS.getUser(username);

            if (existingUsername)
                throw new UserInputError("Username is taken", {
                    errors: {
                        username: "This username is taken",
                    },
                });
            password = await bcrypt.hash(password, 12);

            const newUser = {
                email,
                password,
                username,
                createdAt: new Date().toISOString(),
            };

            const res = await userDS.createUser(newUser);
            const token = generateToken(res);

            return {
                ...res._doc,
                id: res._id,
                token,
            };
        },
    },
};
