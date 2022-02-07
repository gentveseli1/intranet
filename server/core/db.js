var AWS = require('aws-sdk');
require('dotenv').config();

// dynamoDataBase configuration
const awsConfig = {
    "region": process.env.AWS_REGION,
    "endpoint": process.env.AWS_ENDPOINT,
    "accessKeyId": process.env.AWS_ACCESSKEYID,
    "secretAccessKey": process.env.AWS_SECRET
};
AWS.config.update(awsConfig);

const dynamodb = new AWS.DynamoDB();

module.exports= dynamodb