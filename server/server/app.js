const express = require('express');
const app = express();
const cors = require('cors')
const {init_session, check_token, logout_user, is_auth} = require("../middleware/auth");
const {dynamodb} = require('../core/db')
const bodyParser = require('body-parser')
const session = require('express-session')
const DynamoDBStore = require('connect-dynamodb')(session)
const cookieParser = require('cookie-parser');
app.use(cookieParser());

require('dotenv').config()
app.use(cors({
    origin: process.env.FRONT_ORIGIN,
    credentials: true,
}));

app.use(bodyParser.urlencoded({extended: true}))

app.use(bodyParser.json())

app.set('trust proxy', 1)

app.use(session({

    secret: process.env.SESSION_HASH,
    resave: false,
    saveUninitialized: false,
    store: new DynamoDBStore({
        client: dynamodb,
        AWSConfigJSON: {
            accessKeyId: process.env.AWS_ACCESSKEYID,
            secretAccessKey: process.env.AWS_SECRET,
            region: process.env.AWS_REGION
        },
        table: 'session'
    })
}))

app.use(check_token)

const oauth = require('./api/googleapis/oauth')
app.use('/google/oauth', oauth)

const google_users = require('./api/googleapis/users')
app.use('/google/users', is_auth, google_users)

const google_groups = require('./api/googleapis/groups')
app.use('/google/groups', is_auth, google_groups)

const port = process.env.PORT;

// SERVER PORT
app.listen(port, () => console.log(`Server started in port ${port}`))
