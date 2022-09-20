const ApiMessages = require('../config/ApiMessages');
const commonController = require('./commonController');
require('dotenv').config();

// Upload collage images
const saveCollage = async (req, res) => {
    commonController.uploadImage(req, res, async (error) => {
        let response = {};
        if (error) {
            if (error.code == 'LIMIT_FILE_SIZE') {
                response = { success: false, extras: { code: ApiMessages.INVALID_IMAGE_FILE_SIZE.code, msg: ApiMessages.INVALID_IMAGE_FILE_SIZE.description }};
            } else if (error.code == 'LIMIT_UNEXPECTED_FILE') {
                response = { success: false, extras: { code: ApiMessages.IMAGE_FILES_LIMIT_EXCEEDED.code, msg: ApiMessages.IMAGE_FILES_LIMIT_EXCEEDED.description }};
            } else {
                response = { success: false, extras: { code: ApiMessages.UNKNOWN_FILE_UPLOAD_ERROR.code, msg: ApiMessages.UNKNOWN_FILE_UPLOAD_ERROR.description }};
            }
        }
        else {
            if (req.fileValidationError) {
                response = { success: false, extras: { code: req.fileValidationError.code, msg: req.fileValidationError.description }};
            }
            else if (!req.files.length) {
                response = { success: false, extras: { code: ApiMessages.FILE_NOT_FOUND.code, msg: ApiMessages.FILE_NOT_FOUND.description }};
            }
            else{
                const baseUrl = req.protocol + '://' + req.get('host');
                const imgUrl = [];
                req.files.forEach((value) =>  {
                    imgUrl.push(`${baseUrl}/uploads/${value.filename}`)
                });

                response = { success: true, extras: { msg: ApiMessages.FILE_UPLOADED_SUCCESSFULLY.description, imgUrl: imgUrl }};
            }
        }

        await commonController.commonResponseHandler(res, response);
    });
}

module.exports = {
    saveCollage
};