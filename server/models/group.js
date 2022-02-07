const dynamoose = require("dynamoose");
var shortId = require('shortid');

require('dotenv').config()
dynamoose.aws.sdk.config.update({
    "region": process.env.AWS_REGION,
    "endpoint": process.env.AWS_ENDPOINT,
    "accessKeyId": process.env.AWS_ACCESSKEYID,
    "secretAccessKey": process.env.AWS_SECRET
});

const group_schema = new dynamoose.Schema({
    "id": {
        type: String,
        hashKey: true,
        default: shortId.generate
    },
    "kind": String,
    "etag": String,
    "email": String,
    "name": String,
    "description": String,
    "adminCreated": Boolean,
    "directMembersCount": String,
    } ,{
        "timestamps": {
            "createdAt": "createDate",
        }
    }
);

const group_db = dynamoose.model("group", group_schema);

module.exports = group_db