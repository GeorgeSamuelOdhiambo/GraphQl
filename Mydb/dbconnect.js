const mongoose = require('mongoose');
require('dotenv').config();


exports.dbconnects = () => {
    mongoose.connect(process.env.DB_URL,{
    useNewUrlParser: true,
    useUnifiedTopology: true 
})
.then((result) => console.log('connected'))
.catch((err) => {
    // throw new Error(err);
    console.log(err);
});
}
