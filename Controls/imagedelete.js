const path = require('path');

exports.deleteImage = filepath => {
    filepath = path.join(__dirname,'../',filepath);
    fs.unlink(filepath,(err => {
        if (err) {
            console.log("Error while deleting photo  "+err) 
        }
    }))
}