const dynamoose = require("dynamoose");
const staff_db = require('../models/staff')


async function save_staff(staff) {
    try {
        return await staff.save();
    } catch (error) {
        console.error(error);
    }
}

async function get_staff_by_id(id) {
    try {
        return await staff_db.get(id);
    } catch (error) {
        console.error(error);
    }
}

async function get_staff_by_email(email) {
    try {
        return (await staff_db.scan("email").eq(email).exec())[0];
    } catch (error) {
        console.error(error);
    }
}

async function get_staff(condition) {
    try {
        return await staff_db.scan(condition).exec();
    } catch (error) {
        console.error(error);
    }
}

async function delete_staff(staff) {
    try {
        await staff.delete();
        console.log("Delete operation was successful.");
    } catch (error) {
        console.error(error);
    }
}

async function delete_staff_by_id(id) {
    try {
        const staff = await get_staff_by_id(id)
        if(!staff) return -1;
        return await delete_staff(staff)
    } catch (error) {
        console.error(error);
    }
}

async function delete_staff_by_email(email) {
    try {
        const staff = await get_staff_by_email(email)
        if(!staff) return -1;
        return await delete_staff(staff)
    } catch (error) {
        console.error(error);
    }
}

function validate_user(user_json) {
    let error = [];
    
    if(user_json !== null) {
        if(user_json.password === null){
            error.push("Password not set.");
        }
        if(user_json.name?.givenName == null || user_json.name?.givenName.length < 2){
            error.push("GivenName too short or not given.");
        }
    
        if(user_json.name?.familyName == null || user_json.name?.familyName.length < 2){
            error.push("FamilyName too short or not given.");
        }
        if(user_json.password !== null && user_json.password.length <= 7){
            error.push("Password too short.");
        }
        if(user_json.primaryEmail == undefined || user_json.primaryEmail.length === 0  ){
            error.push("PrimaryEmail not set.");
        }
        if(user_json.primaryEmail !== null && !user_json.primaryEmail.endsWith(process.env.USER_DOMAIN) ){
            error.push("Invalid email.");
        }
    } else {
        error.push("User not sent.");
    }
    
    let is_valid = error.length === 0 ;
    
    return {errors: error, is_valid: is_valid};
}

module.exports = {
    delete_staff_by_id,
    delete_staff,
    delete_staff_by_email,
    get_staff,
    get_staff_by_id,
    save_staff,
    get_staff_by_email,
    validate_user
}