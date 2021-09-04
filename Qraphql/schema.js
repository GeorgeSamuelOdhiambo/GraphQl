const { buildSchema } = require('graphql');

module.exports = buildSchema(`
    type Post {
        _id: ID!
        title: String!
        content: String!
        imageUrl: String!
        creator: User!
        createdAt: String!
        updatedAt: String!
    }

    type User {
        _id: ID!
        email: String!
        name: String!
        password: String
        status: String!
        posts: [Post!]!
        createdAt: String!
        updatedAt: String!
    }

    type AuthData {
        token: String!
        userId: String!
    }

    input PostInputData {
        title: String!
        content: String!
        imageUrl: String!
    }
    

    input UserInputData {
        email: String!
        name: String!
        password: String!
    }

    type RootQuery{
        logIn(email: String!, password: String!): AuthData!
        user: User!
    }

    type RootMutation {
        createUser(userInput: UserInputData): User!
        createPost(postInput: PostInputData): Post!
        updatePost(id: ID!, postInput: PostInputData): Post!
        deletePost(id: ID!): Boolean
        
    }

    schema {
        query: RootQuery
        mutation: RootMutation
    }
`);