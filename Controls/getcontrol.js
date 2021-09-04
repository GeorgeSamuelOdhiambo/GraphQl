const Post = require('../Dbmodule/postmod');
const User = require('../Dbmodule/usermod');
const isAuth = require('../Authcheck/is_Auth');

exports.getslash = async (req,res,next) => {
   try { 
    const curentPage = req.query.page || 1;
    const perPage = 2;
    let totalItem;
    const counts = await Post.collection.countDocuments()
    totalItem = counts;
    const result = await Post.find()
        .populate('creator')
        .sort({ createdAt: -1 })
        .skip((curentPage - 1) * perPage)
        .limit(perPage);

        if (!result) {
            const error = new Error('Result empty');
            error.statusCode = 404;
            throw error;
        }
       res.status(200).json({
        posts: result,
        totalItems: totalItem
    }); 
}catch (error){

         if (!err.statusCode) {
            err.statusCode = 500;
        }
        console.log('Error while feaching products'+err);
        res.status(500).json({ massage: 'Somthing went wrong' });

}
    
}

exports.getpost = (req,res,next) => {
    res.status(200).json({
        post: [{
            title: 'Blogs',
            bodys: 'this is sweet',
            footer: 'Love it'
        }]
    });
}

exports.postsingle = async (req,res,next) => {
    
    try {
        const postId = req.params.postId;
        const result = await Post.findById(postId)
            .populate('creator')
        if (!result) {
            const error = new Error('Result is empty');
            error.statusCode = 401;
            throw error;
        }
        
        res.status(200).json({post: result});

    } catch (error) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        console.log('Error while feaching single post '+ error);
        res.status(500).json({
            massage: 'Cant find the request'
        })
    }
}

exports.getstatus = async (req,res,next) => {
    
    try {
        const result = await User.findById(req.userId);

        if (!result) {
            const error = new Error('result not found');
            error.statusCode = 401;
            throw error;
        }
        
        res.status(200).json({
            status: result.status,
        })

    } catch (error) {
        if(!error.statusCode){
            error.statusCode = 500;
        }
        console.log('error for status  '+error);
        res.status(500).json({
            massage: 'Status Error'
        })
    }
}