const express = require('express');
const {google} = require('googleapis')
const request = require('request')
const {save_user, get_user, update_access_token, update_refresh_token, update_id_token} = require('../../../controllers/user')
const { get_payload_token, logout_user} = require('../../../middleware/auth')
require('dotenv').config();
const  axios = require('axios')

const google_user = require('../../../models/user')

const router = express.Router();

const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.CALLBACK_URL
);

// checks if a token is changed
oauth2Client.on('tokens',async (tokens) => {
    const user_data = await get_payload_token(tokens.id_token)

    if (tokens.refresh_token) {
        await update_refresh_token(user_data.email, tokens.refresh_token)
    }
    await update_access_token(user_data.email, tokens.access_token)
    await update_id_token(user_data.email, tokens.id_token)
});

// GET URL FOR GOOGLE REQUEST
router.get('/url', (req,res) => {
    const oauth2Client = new google.auth.OAuth2(
        process.env.CLIENT_ID,
        process.env.CLIENT_SECRET,
        process.env.CALLBACK_URL
    );

    const scopes = [
        'profile',
        'email',
        'https://www.googleapis.com/auth/plus.login',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/cloud-platform',
        'https://apps-apis.google.com/a/feeds/groups/',
        'https://www.googleapis.com/auth/admin.directory.group',
        'https://www.googleapis.com/auth/admin.directory.group.readonly',
        'https://www.googleapis.com/auth/admin.directory.group.member',
        'https://www.googleapis.com/auth/admin.directory.group.member.readonly',
        'https://www.googleapis.com/auth/admin.directory.domain',
        'https://www.googleapis.com/auth/admin.directory.domain.readonly',
        'https://www.googleapis.com/auth/admin.directory.user',
        'https://www.googleapis.com/auth/admin.directory.user.security',

    ];

    const url =  oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        state: JSON.stringify(
            {
                callbackUrl: req.body.callbackUrl,
                userID: req.body.userid
            }
        )
    });

    request(url, (err, response, body) => {
        res.send({url})
    })

})

//GOOGLE CALLBACK URL
router.get("/", async (req, res) => {

    const code = req.query.code;
    let tokens = '';
    
    try {
        tokens = await oauth2Client.getToken(code);
    } catch(e) {}

    if(tokens==='') return res.status(400).send("");

    oauth2Client.setCredentials(tokens);

    req.session.token = tokens;
    req.session.access_token = tokens.tokens.access_token;

    oauth2Client.setCredentials({
        refresh_token: tokens.tokens.refresh_token,
        access_token: tokens.tokens.access_token
    });

    const admin = google.admin({
        version: 'directory_v1',
        auth: oauth2Client
    });

    const user_data = await get_payload_token(tokens.tokens.id_token)

    const hasAccess = await admin.members.hasMember({
        groupKey: process.env.ADMIN_GROUP,
        memberKey:  user_data.email,
    })
    .then( (d) => {
        return d.data.isMember;
    })
    .catch(() =>{
        return false
    })

    if(!hasAccess) {
        return res.status(403).send("no access!");
    }

    let db_user = await get_user({"email":{"eq": user_data.email}})

    if(!db_user) {
        db_user = new google_user();
    }

    db_user.email           = user_data.email
    db_user.last_name       = user_data.family_name
    db_user.name            = user_data.given_name
    db_user.access_token    = req.session.token.tokens?.access_token
    db_user.client_id       = process.env.CLIENT_ID
    db_user.client_secret   =  process.env.CLIENT_SECRET
    db_user.environment     =  process.env.ENV
    db_user.id_token        = req.session.token.tokens?.id_token
    db_user.refresh_token   = req.session.token.tokens?.refresh_token ?? db_user.refresh_token
    db_user.status          = 1
    db_user.tenant_id       = 0
    db_user.invited_by      = "google"
    db_user.expires         = user_data.exp

    req.session.refresh_token = db_user.refresh_token;

    const cookie_config = {
        expires: new Date(user_data.exp * 1000),
        httpOnly: false,
        secure:false
    }

    res.cookie('authorize', req.session.token.tokens?.access_token, cookie_config);

    save_user(db_user);

    res.status(200).json(tokens)

})

// GET ALL USERS
router.get('/get_users', async (req,res) => {
    const user = await get_user({"refresh_token": {"eq": req.session.refresh_token}});

    res.json(user);
})

router.get('/sess', (req,res) => {
    res.json(req.session)
})

router.post('/logout', logout_user)

module.exports = router;
