const express = require('express');
const cors = require('cors');
const path = require('path');
const ApiMessages = require('./config/ApiMessages');
const commonController = require('./controllers/commonController');
const routes = require('./routes/routes.js');
const app = express();
require('dotenv').config();

const PORT = parseInt(process.env.PORT) || 3001;
const BODY_PARSER_LIMIT = parseInt(process.env.BODY_PARSER_LIMIT) || '10mb';
const PARAMETER_LIMIT = parseInt(process.env.PARAMETER_LIMIT) || 100000000;

app.use(cors({ origin: "*" }));
app.use(express.raw({ limit: BODY_PARSER_LIMIT }));
app.use(express.json({ limit: BODY_PARSER_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: BODY_PARSER_LIMIT, parameterLimit: PARAMETER_LIMIT }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/v1', routes);

//For 404 Route
app.use(async (req, res, next) => {
    let msg = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    let Result = { success: false, extras: { code: ApiMessages.NOT_FOUND.code, msg: ApiMessages.NOT_FOUND.description, Req: msg } };
    await commonController.commonResponseHandler(res, Result);
});

app.listen(PORT, () => console.log(`Server running on ${PORT}`));