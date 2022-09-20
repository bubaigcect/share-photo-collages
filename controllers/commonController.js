require('dotenv').config();
const ApiMessages = require('../config/ApiMessages');
const path = require('path');
const multer = require("multer");

// Common Response Handler
const commonResponseHandler = (res, result) => {
    return new Promise(async (resolve, reject) => {
        try {
            if(result.success) {
                if(!res.headerSent) {
                    resolve(res.status(200).json(result))
                }
                else {
                    resolve('Already sent');
                }
            } else if(!result.success) {
                if(!res.headerSent) {
                    let code = 400;
                    if(result.extras.code == 404) code = 404;
                    else if(result.extras.code == 500) code = 500;
                    else if(result.extras.code == 503) code = 503;
                    resolve(res.status(code).json(await commonErrorHandler(result)));
                }
                else {
                    resolve('Already sent');
                }
            } else {
                if (!res.headerSent) {
                    resolve(res.status(400).json({ success: false, extras: { code: ApiMessages.SERVER_ERROR.code, msg: ApiMessages.SERVER_ERROR.description } }));
                }
                else {
                    resolve('Already sent');
                }
            }
        } catch (err) {
            console.log('Something wrong', err);
        }
    });
}

//Common Error Handler
const commonErrorHandler = (error) => {
    return new Promise((resolve, reject) => {
        try {
            if(typeof error.success === "undefined" || error.success === null) {
                if (error instanceof SyntaxError) {
                    resolve({ success: false, extras: { code: ApiMessages.SERVER_ERROR.code, msg: ApiMessages.SERVER_ERROR.description } });
                } else {
                    resolve({ success: false, extras: { code: ApiMessages.SERVICE_UNAVAILABLE.code, msg: ApiMessages.SERVICE_UNAVAILABLE.description } });
                }
            } else {
                resolve(error);
            }
        } catch (err) {
            console.log('Something wrong', err);
        }
    });
}

const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(`${__dirname}/../uploads`));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    },
});

const multerUploader = multer({ 
    storage: multerStorage,
    limits : {fileSize : parseInt(process.env.MULTER_FILESIZE_LIMIT) || 10000000},
    fileFilter: (req, file, cb) => {
        // Allowed ext
        const filetypes = /jpeg|jpg|png|gif/;
        // Check ext
        const extname =  filetypes.test(path.extname(file.originalname).toLowerCase());
        // Check mime
        const mimetype = filetypes.test(file.mimetype);
        if(mimetype && extname){
            return cb(null, true);
        } else {
            req.fileValidationError = ApiMessages.INVALID_IMAGE_FILE;
            return cb(null, false, req.fileValidationError);
        }
    }
});

const uploadImage = multerUploader.array("files", parseInt(process.env.MULTER_FILE_UPLOAD_LIMIT) || 10);

module.exports = {  
    commonResponseHandler,
    uploadImage
};