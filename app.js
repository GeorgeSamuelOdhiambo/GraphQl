const express = require('express');
const bodyparser = require('body-parser');
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');
const {graphqlHTTP} = require('express-graphql');
require('dotenv').config();

const auth = require('./Authcheck/is_Auth');
const graphqlSchema = require('./Qraphql/schema');
const graphqlResolver = require('./Qraphql/resolvers');


const app = express();

const fileStorage = multer.diskStorage({
    destination: (req,file,cb) => {
        cb(null,'Images');
    },
    filename: (req,file,cb) => {
        cb(null, Date.now().toString()+''+file.originalname);
    }
});

const fileFilter = (req,file,cb) => {
    if(
        file.mimetype === 'image/png' || 
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'
    ){cb(null,true)}
    else{cb(null,false)}
}

app.use(auth);  //this check if the user is authenticated
app.use('/graphql', 
graphqlHTTP({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true
})
);
app.use(bodyparser.json());
app.use('/image',express.static(path.join(__dirname,'Images')));
app.use(multer({
    storage: fileStorage,
    fileFilter: fileFilter
}).single('image'));
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});



mongoose.connect(process.env.DB_URL,{
    useNewUrlParser: true,
    useUnifiedTopology: true 
})
.then((result) => { app.listen(8080);
    // const io = require('./Socket/socketIo').init(server);

    // io.on('connection', socket => {
    //     console.log('Cliant Connected');
    // });
})
.catch((err) => {
    // throw new Error(err);
    console.log(err);
});
