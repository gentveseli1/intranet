const dynamoose = require("dynamoose");
const group_db = require('../models/group')

async function save_group(group) {
    try {
        return await group.save();
        console.log("Save operation was successful. GROUP SAVED!!");
    } catch (error) {
        console.error(error);
    }
}

async function get_group_by_id(id) {
    try {
        return await group_db.get(id);
    } catch (error) {
        console.error(error);
    }
}

async function get_group_by_email(email) {
    try {
        return (await group_db.scan("email").eq(email).exec())[0];
    } catch (error) {
        console.error(error);
    }
}

async function get_group(condition) {
    try {
        return await group_db.scan(condition).exec();
    } catch (error) {
        console.error(error);
    }
}

async function delete_group(group) {
    try {
        return await group.delete();
    } catch (error) {
        console.error(error);
    }
}

async function delete_group_by_id(id) {
    try {
        console.log(id)
        const targeted_group = await get_group_by_id(id)
        console.log("targeted_group" , targeted_group)
        if(!targeted_group) return -1;
        return await delete_group(targeted_group)
    } catch (error) {
        console.error(error);
    }
}

async function delete_group_by_email(email) {
    try {
        const targeted_group = await get_group_by_email(email)
        console.log("targeted_group" , targeted_group)
       
        return await delete_group(targeted_group)
    } catch (error) {
        console.error(error);
    }
}


function validate_group(group_json) {
    let error = [];

    if(group_json !== null) {

        if(group_json.name == null || group_json.name?.length < 2){
            error.push("Name too short or not given.");
        }
        if(group_json.email == undefined || group_json.email.length === 0  ){
            error.push("PrimaryEmail not set.");
        }
        if(group_json.email !== null && !group_json.email.endsWith(process.env.USER_DOMAIN) ){
            error.push("Invalid email.");
        }
    } else {
        error.push("Group not sent.");
    }

    let is_valid = error.length === 0;

    return {errors: error, is_valid: is_valid};
}

module.exports = {
    delete_group_by_id,
    delete_group,
    delete_group_by_email,
    get_group,
    get_group_by_id,
    get_group_by_email,
    save_group,
    validate_group
}