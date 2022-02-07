const dynamoose = require("dynamoose");
var shortId = require('shortid');

require('dotenv').config()
dynamoose.aws.sdk.config.update({
    "region": process.env.AWS_REGION,
    "endpoint": process.env.AWS_ENDPOINT,
    "accessKeyId": process.env.AWS_ACCESSKEYID,
    "secretAccessKey": process.env.AWS_SECRET
});

const google_user_schema = new dynamoose.Schema({
    "id": {
        type: String,
        hashKey: true,
        default: shortId.generate
    },
    "email": String,
    "name": String,
    "last_name": String,
    "access_token": String,
    "client_id": String,
    "client_secret": String,
    "environment": String,
    "id_token": String,
    "refresh_token": String, 
    "status": Number,
    "tenant_id": Number,
    "invited_by": String,
    "expires": Number, 
    "temp_hash": String,
    } ,{
        "timestamps": {
            "createdAt": "createDate",
        }  
    }
);

const google_user = dynamoose.model("google_users_logged", google_user_schema);

module.exports = google_user