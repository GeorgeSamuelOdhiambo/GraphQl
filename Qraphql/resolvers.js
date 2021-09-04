const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const validator = require('validator');
require('dotenv').config();

const User = require('../Dbmodule/usermod');
const Post = require('../Dbmodule/postmod');
const imageDelete = require('../Controls/imagedelete');

module.exports = {
    createUser: async ({userInput},req) => {
        const result = await User.findOne({email: userInput.email})

        if (result) {
            const error = new Error('User already exist');
            throw error;
        }

        const hassp = await bcrypt.hash(userInput.password,12);
            const user = new User({
                email: userInput.email,
                name:  userInput.name,
                password: hassp
            });

        const createdUser = await user.save();
        return {...createdUser._doc, _id: createdUser._id.toString()};
        
    },

    createPost: async ({postInput},req) => {
        const user = await User.findById(req.userId);

        if (!user) {
            const error = new Error('User not found');
            throw error;
        }

        const post = new Post({
            title: postInput.title,
            content: postInput.content,
            imageUrl: postInput.imageUrl,
            creator: user
        });

        const createdPost = await post.save();
        user.posts.push(createdPost);
        await user.save();

        return {
            ...createdPost._doc,
            _id: createdPost._id.toString(),
            createdAt: createdPost.createdAt.toISOString(),
            updatedAt: createdPost.updatedAt.toISOString()
          };
    },

    updatePost: async({id, postInput},req) => {
        const result = await Post.findById(id).populated('creator');

        if (!result) {
            const error = new Error('Something went wrong');
            error.code = 404;
            throw error;
        }

        if (result.creator._id.toString() !== req.userId.toString()) {
            const error = new Error('You are not the creater');
            error.code = 403;
            throw error;
        }

        result.title = postInput.title;
        result.content = postInput.content;
    },

    logIn: async ({email,password}) => {
        const checkUser = await User.findOne({email: email});

        if(!checkUser){
            const error = new Error('Email not found');
            throw error;
        }

        const isEqual = await bcrypt.compare(password, checkUser.password);

        if (!isEqual) {
            const error = new Error('Passward not valied');
            throw error;
        }

        const token = jwt.sign({
              userId: checkUser._id.toString(),
              email: checkUser.email
            },process.env.SECRET,
            { expiresIn: '1h' }
          );

          return { token: token, userId: checkUser._id.toString() };

    },

    deletePost: async ({id},req) => {

        if(!req.isAuth){
            const error = new Error('User not authenticated');
            error.code = 401;
            throw error;
        }
        
        const post = await Post.findById(id)

        if (!post) {
            const error = new Error('Post not found');
            error.code = 404;
            throw error;
        }

        if(post.creator.toString() !== req.userId.toString()){
            const error = new Error('Not allowed');
            error.code = 401;
            throw error;
        }

        imageDelete.deleteImage(post.imageUrl);
        await Post.findByIdAndRemove(id);

        const user = await User.findById(req.userId);
        user.posts.pull(id);
        await user.save();
        return true;
    }

};