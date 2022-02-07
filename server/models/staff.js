const dynamoose = require("dynamoose");
var shortId = require('shortid');

require('dotenv').config()
dynamoose.aws.sdk.config.update({
    "region": process.env.AWS_REGION,
    "endpoint": process.env.AWS_ENDPOINT,
    "accessKeyId": process.env.AWS_ACCESSKEYID,
    "secretAccessKey": process.env.AWS_SECRET
});

const staff_schema = new dynamoose.Schema({
        "id": {
            type: String,
            hashKey: true,
            default: shortId.generate
        },
        "email": String,
        "name": String,
        "last_name": String,
        "invited_by": String,
    } ,{
        "timestamps": {
            "createdAt": "createDate",
        }
    }
);

const staff_db = dynamoose.model("staff", staff_schema);

module.exports = staff_db