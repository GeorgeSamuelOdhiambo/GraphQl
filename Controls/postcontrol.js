const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const {validationResult} = require('express-validator');
const nodemailer = require('nodemailer');
const sgTransport = require('nodemailer-sendgrid-transport');
require('dotenv').config();

const Post = require('../Dbmodule/postmod');
const User = require('../Dbmodule/usermod');

comparepass = async (cupass,dbpass) => {
    return bcrypt.compare(cupass, dbpass);
}

const transporter = nodemailer.createTransport({
    auth: {
        api_key: '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'
    }
});

exports.postlog = async (req,res,next) => {
    try {
        const cupass = req.body.password;
    let user;
    const result = await User.findOne({email: req.body.email})
        if (!result) {
            const error = new Error('Email not found');
            error.statusCode = 401;
            throw error;
        }
          user = result
    const passequal = await comparepass(cupass,result.password);

        if(!passequal){
            const error = new Error('Password hot a mach');
            error.statuscode = 401;
            throw error;
        }

        const token = jwt.sign({
            email: user.email,
            userId: user._id.toString()
        },process.env.SECRET,{expiresIn: '1h'});

        res.status(200).json({
            token: token,
            userId: user._id.toString()
        });

        return transporter.sendMail({
            to: user.email,
            from: 'odhiamboweb@gmail.com',
            subject: 'you are loged in',
            html: `thank you ${user.name} for visiting us`
        });
    
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        console.log('Error in login control'+error);
        res.status(500).json({ massage: 'Login error' });
    }
    
}


exports.postPosts = async (req,res,next) => {
    
    try {
        
        let postCreator;
        const error = validationResult(req);
        if (!error.isEmpty()) {
            res.status(422).json({
                massage: 'Validation fail',
                error: error.array()
            });
        }
        if(!req.file){
            const error = new Error('image not found');
            error.statuscode = 422;
            throw error;
        }

        const imageUrl = req.file.path;
        const post = new Post({
            title: req.body.title,
            content: req.body.content,
            imageUrl: imageUrl,
            creator: req.userId,
    });
    await post.save()
        //finds the user who is creating the post
    const user = await User.findById(req.userId)
        //saving the post id to the user collection
        postCreator = user;
        user.posts.push(post);

     await user.save()
        // result is sent to the front end
        res.status(201).json({
            massage: 'post ctreated by me',
            post: post,
            creator: {_id: postCreator._id, name: postCreator.name }
         })

    } catch (error) {
         if(!error.statusCode){
            error.statusCode = 500;
        }
        res.status(500).json({massage: 'Post not added'});
        console.log('Error in adding post'+error);
    }
}  


exports.postsingle = async (req,res,next) => {
    try {
        const postId = req.params.postId;
    const result = await Post.findById(postId)
        if(!result){
            const error = new Error('Post not found');
            error.statusCode = 401;
            throw error;
        }
        res.status(200).json({
            message: 'Post fetched.',
            post: result
        }); 
    
    } catch (error) {
         if (!error.statusCode) {
            error.statusCode = 500;
        }
        console.log('Error feaching single post'+error);
        res.status(500).json({ massage: 'error feching the post' });
    }
    
}

exports.postSignup = async (req,res,next) => {
    try {
        const hassp = await bcrypt.hashSync(req.body.password,10);
            const user = new User({
                email: req.body.email,
                name:  req.body.name,
                password: hassp
            });

        const result = await user.save()
            res.status(201).json({
                message: 'User Created',
                userId: result._id
            });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        res.status(500).json({ massage: 'Something went wrong' });
        console.log('User not created'+error);
    }
    
}

exports.postDelete = async (req,res,next) => {

    try {
        const selectId = req.params.selectedId;
        const result = await Post.findById({_id: selectId})
            if(!result){
                const error = new Error('Post Might have been moved');
                error.statusCode = 401;
                throw error;
            }
        //check if the user created the post
        if(req.userId !== result.creator.toString()){
            console.log('you cant delete post');
            const error = new Error('You are not allowed to delete post');
            error.statusCode = 403;
            throw error;
        }
        deleteImage(result.imageUrl);
        await Post.findByIdAndDelete(selectId);

        const user = await User.findById(req.userId);
            user.posts.pull(selectId);
             await user.save();
                res.status(200).json({
                    massage: 'Post Deleated'
                })
    } catch (error) {
         if (!error.statusCode) {
            error.statusCode = 500;
        }
        res.status(500).json({ massage: 'Something went wrong' });
        console.log('Error in deleting post'+error);
    }
    
}

exports.postEdit = async (req,res,next) => {
   
  try { 
    let imageUrl = req.body.image;
    if (req.file) {
        imageUrl = req.file.path;
    }
    if (!imageUrl) {
        const error = new Error('No file picked.');
        error.statusCode = 422;
        throw error;
    }
    const post = await Post.findById(req.params.selectedId)

    if (req.userId !== post.creator.toString()) {
          const error = new Error('Not allowd to edit post');
          error.statusCode = 403;
          throw error;
      }
    if (!post) {
        const error = new Error('Post not found');
        error.statusCode = 401;
        throw error;
    }

    if (imageUrl !== post.imageUrl) {
        deleteImage(post.imageUrl);
      }

    post.title = req.body.title;
    post.content = req.body.content;
    post.imageUrl = imageUrl;
    
    await post.save();
        res.status(200).json({
            massage: 'Saved',
            post: edit
        })
  } catch (error) {

      if (!error.statusCode) {
            error.statusCode = 500;
        }
        res.status(500).json({ massage: 'Something went wrong while editing' });
        console.log('Error in editing post  '+error);
  }
    
}

exports.postStatus = async (req,res,next) => {

    try {
        let newStatus = req.body.status;
        const result = await User.findById(req.userId);
        
        if (!result) {
            const error = new Error('Result not found');
            error.statusCode = 401;
            throw error;
        };

        result.status = newStatus;
         await result.save();

        res.status(200).json({
            massage: 'Status Updated'
        });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        };
        res.status(500).json({ massage: 'Something went wrong' });
        console.log('Error in editing status  '+error);
    }

}

//deleating image function
const deleteImage = filepath => {
    filepath = path.join(__dirname,'../',filepath);
    fs.unlink(filepath,(err => {
        if (err) {
            console.log("Error while deleting photo  "+err) 
        }
    }))
}