require('dotenv').config();
const {google} = require('googleapis');
const {OAuth2Client} = require('google-auth-library');

// client authentication credentials
const client = new OAuth2Client(process.env.CLIENT_ID);
const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.CALLBACK_URL
);

/**
 * verifying and storing refresh token in session
 * getting access token after first login
*/
async function verify_and_refresh(req, res) {
    oauth2Client.setCredentials({
        refresh_token: req.session.refresh_token
    });

    let tokens = '';

    try {
       tokens =  await oauth2Client.getAccessToken()
    }catch (e) {
        return false;
    }

    return tokens.res.data.access_token
}

/**
 * payload is the part of the private user
 * verifying token and returning payload
*/ 
async function get_payload_token(token) {
    try {
        let ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.CLIENT_ID,
        });
        
        return ticket.getPayload()
    } catch (e) {
        console.error(e)
    }
}

/**
 * is_auth is a middleware
 * used for checking if session has stored authentication
 * returning an error status code if token is null
*/ 
function is_auth(req, res, next) {
    if (req.session?.access_token) {
        return next();
    }
    res.sendStatus(401);
}

/**
 * logout_user function is used to destroy the session
 * if the user requested to log out
*/ 
function logout_user(req, res, next) {
    if (req.session) {
        req.session.destroy(function(err) {
            // cannot access session here
        })
    }
    res.json(req.session)
}

function init_session(req, res, next) {
    req.session.init = 1;  
    next();
}

/**
 * checking if user has refresh token then refreshing
 * if no token is stored destroy seesion
*/ 
const check_token = async (req, res, next) => {
    if (req.session.refresh_token) {
        let data = await verify_and_refresh(req, res)
        if(data === false){
            req.session.destroy(function(err) {
                console.log("session not cleared")
            })
            res.clearCookie("authorize");
           return  res.sendStatus(401)
        }
        req.session.access_token = data;
    }
    next()
}

module.exports = {
    is_auth,
    logout_user,
    init_session,
    verify_and_refresh,
    check_token,
    get_payload_token
}