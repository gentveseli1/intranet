const express = require('express');
const  axios = require('axios')
require('dotenv').config();

const router = express.Router();

const { save_staff, get_staff, delete_staff_by_email, get_staff_by_email, validate_user} = require('../../../controllers/staff')

const staff = require('../../../models/staff')

const { google } = require('googleapis');
const { CloudWatchLogs } = require('aws-sdk');

const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.CALLBACK_URL
);

const DOMAIN = process.env.USER_DOMAIN;

/**
 * GET the whole staff users in the google API
*/
router.get('/get_all_staff', async (req,res) => {
    oauth2Client.setCredentials({
        refresh_token: req.session.token.tokens.refresh_token,
        access_token: req.session.access_token
    });

    const admin = google.admin({
        version: 'directory_v1',
        auth: oauth2Client
    });

    admin.users.list({domain: DOMAIN})
        .then(r => res.json(r.data.users))
        .catch(e => {
            res.json(e)
        })
})

/**
 * ADD a single user in the google API
*/
router.post("/add_staff", async (req, res) => {
    let requestBody = {
        name: {
            givenName: req.body.givenName,
            familyName: req.body.familyName
        },
        primaryEmail: req.body.email,
        password: req.body.password
    }
    
    const valid_user = validate_user(requestBody);
    if(!valid_user.is_valid) {
        return res.status(400).json(valid_user.errors)
    }

    oauth2Client.setCredentials({
        refresh_token: req.session.token.tokens.refresh_token,
        access_token: req.session.access_token
    });

    const admin = google.admin({
        version: 'directory_v1',
        auth: oauth2Client
    });

    admin.users.insert({
        requestBody: {
            name: {
                givenName: req.body.givenName,
                familyName: req.body.familyName
            },
            primaryEmail: req.body.email,
            password: req.body.password
        }
    })
    .then(async r => {
        /**
         * if adding an user is successfull
         * add the same user in dynamoDB
        */
        const staff_data = r.data;

        const new_staff = new staff();

        new_staff.email = staff_data.primaryEmail
        new_staff.name = staff_data.name.givenName
        new_staff.last_name =  staff_data.name.familyName
        new_staff.invited_by = "Google"

        const db_user = await save_staff(new_staff);

        res.json( db_user )
    }).catch(err => {
        res.status(err.code).send(err.errors[0].message);
    })
})

/**
 * GET the whole staff users in the dynamoDB
*/
router.get('/get_staff', async  (req, res) => {
     res.json( await get_staff());
})

/**
 * UPDATE a single staff member in google API
*/
router.patch("/edit_staff", async (req, res) => {

    oauth2Client.setCredentials({
        refresh_token: req.session.token.tokens.refresh_token,
        access_token: req.session.access_token
    });

    const admin = google.admin({
        version: 'directory_v1',
        auth: oauth2Client
    });

    const edit_user = (await get_staff_by_email(req.body.email))

    const data = {
        name: {
            givenName: req.body.givenName,
            familyName: req.body.familyName
        },
        primaryEmail: req.body.email,
    };

    if(req.body.password){
        data.password = req.body.password;
    }

    admin.users.patch({
        userKey: req.body.email,
        requestBody: data
    })
    .then( (d) => {
        /**
         * if updating an user in google API was successfull
         * update and save the changes in dynamoDB
        */
        edit_user.name = req.body.givenName;
        edit_user.last_name = req.body.familyName;

        save_staff(edit_user)
            .then(data => {
                res.json(data)
            })
            .catch( () => res.sendStatus(400))
        
    }).catch(err => {
        res.status(err.code).send(err.errors[0].message);
    })
})

/**
 * REMOVE a single staff member in google API
*/
router.delete('/delete_staff', async (req, res) => {
    const name = {
        givenName: req.body.givenName,
        familyName:  req.body.familyName
    };

    oauth2Client.setCredentials({
        refresh_token: req.session.token.tokens.refresh_token,
        access_token: req.session.access_token
    });

    const admin = google.admin({
        version: 'directory_v1',
        auth: oauth2Client
    });

    admin.users.delete({
        userKey: req.body.email
    })
    .then(() => {
        /**
         * if removing an user in google API was successfull
         * remove the same user in dynamoDB
        */
        delete_staff_by_email(req.body.email)
        res.sendStatus(200);
    }).catch(e =>{
        res.status(e.code).send(e.errors[0].message);
    })

})
module.exports = router;