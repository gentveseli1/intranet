const express = require("express");
const axios = require("axios");
require("dotenv").config();

const router = express.Router();

const { google } = require('googleapis');

const {
    save_group,
    get_group,
    get_group_by_id,
    delete_group_by_id,
    get_group_by_email,
    delete_group_by_email,
    validate_group
} = require("../../../controllers/group");

const group = require("../../../models/group");

const DOMAIN = "thesocialplus.com";

const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.CALLBACK_URL
);

/**
 * GET all groups from google API
*/
router.get("/get_groups", async (req, res) => {
    oauth2Client.setCredentials({
        refresh_token: req.session.token.tokens.refresh_token,
        access_token: req.session.access_token
    });

    const admin = google.admin({
        version: 'directory_v1',
        auth: oauth2Client
    });

    admin.groups.list({domain: DOMAIN})
        .then(data => {
            res.json(data.data)
        })
        .catch(err => res.json(err))
});

/**
 * GET all groups saved in dynamoDB
*/
router.get("/get_groups_db", async (req, res) => {
    res.json(await get_group());
});

/**
 * ADD a group in google API
*/
router.post("/add_groups", async (req, res) => {
    let data_g = {
        email: req.body.email,
        name: req.body.name,
        description: req.body.description,
    };

    const valid_group = validate_group(data_g);
    if(!valid_group.is_valid) {
        return res.status(400).json(valid_group.errors)
    }

    oauth2Client.setCredentials({
        refresh_token: req.session.token.tokens.refresh_token,
        access_token: req.session.access_token
    });

    const admin = google.admin({
        version: 'directory_v1',
        auth: oauth2Client
    });

    admin.groups.insert({
        requestBody: data_g
    }).then(async (d) => {
        /**
         * if inserting a group in google was successfull
         * insert the same group to dynamoDB
        */   
        const group_data = d.data;
        const new_group = new group();

        new_group.email = group_data.email;
        new_group.name = group_data.name;
        new_group.description = group_data.description;

        const db_user = await save_group(new_group);

        res.json(db_user);
    })
    .catch((e) => {
        res.status(e.code).send(e.errors[0].message);
    });
});

/**
 * UPDATE a group in google API
*/
router.patch("/edit_groups", async (req, res) => {
    let edit_group = await get_group_by_email(req.body.email);

    let data_g = {
        name: req.body.name,
        description: req.body.description,
    };

    oauth2Client.setCredentials({
        refresh_token: req.session.token.tokens.refresh_token,
        access_token: req.session.access_token
    });

    const admin = google.admin({
        version: 'directory_v1',
        auth: oauth2Client
    });

    admin.groups.patch({
        groupKey: req.body.email,
        requestBody: data_g
    }).then(async (d) => {
        /**
         * if updating a group in google was successfull
         * update the same group to dynamoDB
        */ 
        edit_group.name = req.body.name;
        edit_group.description = req.body.description;

        const db_user = await save_group(edit_group);

        res.json(db_user);
    })
    .catch((e) => {
        res.status(e.code).send(e.errors[0].message);
    });
});

/**
 * REMOVE a group in google API
*/
router.delete("/delete_groups", async (req, res) => {
    oauth2Client.setCredentials({
        refresh_token: req.session.token.tokens.refresh_token,
        access_token: req.session.access_token
    });

    const admin = google.admin({
        version: 'directory_v1',
        auth: oauth2Client
    });

    admin.groups.delete({
        groupKey: req.body.email,
    }).then((d) => {
        /**
         * if removing a group in google was successfull
         * remove the same group from dynamoDB
        */ 
        delete_group_by_email(req.body.email);
        res.sendStatus(200);
    })
    .catch((e) => {
        res.status(e.code).send(e.errors[0].message);
    });
});

/**
 * GET specific member from a group in google API
*/
router.get("/get_members", async (req, res) => {
    oauth2Client.setCredentials({
        refresh_token: req.session.token.tokens.refresh_token,
        access_token: req.session.access_token
    });

    const admin = google.admin({
        version: 'directory_v1',
        auth: oauth2Client
    });

    admin.members.list({
        groupKey: req.query.email
    })
    .then((d) => {
        res.json(d.data);
    })
    .catch((e) => {
        res.send("error");
    });
});

/**
 * ADD specific member to a group in google API
*/
router.post("/add_members", async (req, res) => {
    oauth2Client.setCredentials({
        refresh_token: req.session.token.tokens.refresh_token,
        access_token: req.session.access_token
    });

    const admin = google.admin({
        version: 'directory_v1',
        auth: oauth2Client
    });

    admin.members.insert({
      groupKey: req.body.groupKey,
      requestBody: {
        email: req.body.email,
      },
    })
    .then(d => res.json(d.data))
    .catch(console.error);
});

/**
 * REMOVE specific member to a group in google API
*/
router.delete("/delete_members", async (req, res) => {
    oauth2Client.setCredentials({
        refresh_token: req.session.token.tokens.refresh_token,
        access_token: req.session.access_token
    });

    const admin = google.admin({
        version: 'directory_v1',
        auth: oauth2Client
    });

    admin.members.delete({
        groupKey: req.body.groupKey,
        memberKey: req.body.email,
    })
        .then(d => res.json(d))
        .catch(e => { });
});

/**
 * UPDATE specific member to a group in google API
*/
router.patch("/edit_members", async (req, res) => {

    oauth2Client.setCredentials({
        refresh_token: req.session.token.tokens.refresh_token,
        access_token: req.session.access_token
    });

    const admin = google.admin({
        version: 'directory_v1',
        auth: oauth2Client
    });

    admin.members.patch({
        memberKey: req.body.email,
        groupKey: req.body.groupKey,
        requestBody: {
            role: req.body.role,
            type: req.body.type,
        },
    })
    .then(d => res.json(d))
    .catch(e => { });
});

/**
 * ASSIGN single/multiple members at the same time in single/multiple groups
 * BATCH groups/members
*/
router.post("/add_members_bulk", async (req, res) => {
    oauth2Client.setCredentials({
        refresh_token: req.session.token.tokens.refresh_token,
        access_token: req.session.access_token
    });

    const admin = google.admin({
        version: 'directory_v1',
        auth: oauth2Client
    });
    
    const to_return = [];
    const to_return_errors = [];
    const members = req.body.email_arr;
    const groups = req.body.groupKey_arr;
    const promises = [];

    for(i = 0; i< groups.length; i++){
        for(j = 0; j<members.length; j++){
            
            let promisee = admin.members.insert({
                groupKey:groups[i] ,
                requestBody: {
                    email:members[j] ,
                },
            }) 
            .then((d) => {
                let newUrl = d.config.url.split("/");
                to_return.push({
                    user: d.data,
                    groupemail: decodeURIComponent(newUrl[ newUrl.length - 2 ] )

                })
            })
            .catch(e => {
                let url = e.response.config.url;
                let newUrl = url.split("/");

                to_return_errors.push({
                    email: decodeURIComponent(e.config.data.email),
                    groupemail: decodeURIComponent(newUrl[ newUrl.length - 2 ] ) ,
                    msg: e.errors[0].message
                })
            });

            // add to waiting list...
            promises.push(promisee) 
        }
    }
    await Promise.all(promises);
    res.json({ added: to_return, error: to_return_errors})
});

/**
 * UNASSIGN single/multiple members at the same time in single/multiple groups
 * UNBATCH groups/members
*/
router.delete("/delete_members_bulk", async (req, res) => {
    oauth2Client.setCredentials({
        refresh_token: req.session.token.tokens.refresh_token,
        access_token: req.session.access_token
    });

    const admin = google.admin({
        version: 'directory_v1',
        auth: oauth2Client
    });
    
    const to_return = [];
    const to_return_errors = [];
    const members = req.body.email_arr;
    const groups = req.body.groupKey_arr;
    const promises = [];
 
    for(i = 0; i< groups.length; i++){
        for(j = 0; j<members.length; j++){
            
            let promisee = admin.members.delete({
                groupKey:groups[i] ,
                memberKey: members[j],
            }) 
            .then((d) => {
                let newUrl = d.config.url.split("/");

                to_return.push({
                    email: decodeURIComponent(newUrl[ newUrl.length - 1 ] ),
                    groupemail: decodeURIComponent(newUrl[ newUrl.length - 3 ] )

                })

        })
            .catch(e => {
                let url = e.response.config.url;

                let newUrl = url.split("/");

                to_return_errors.push({
                    email: decodeURIComponent(newUrl[ newUrl.length - 1 ] ),
                    groupemail: decodeURIComponent(newUrl[ newUrl.length - 3 ] ) ,
                    msg: e.errors[0].message
                })
            });

            // add to waiting list...
            promises.push(promisee) 
        }
    }
    await Promise.all(promises);
    res.json({ deleted: to_return, error: to_return_errors})
});

module.exports = router;
