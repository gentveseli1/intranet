const dynamoose = require("dynamoose");
const google_user = require('../models/user')

async function save_user(new_user) {
    try {
        return await new_user.save();
    } catch (error) {
        console.error(error);
    }
}
// save_user()

async function get_user_by_id(id) {
    try {
        var dd = await google_user.get(id);
        console.log("GET USER operation was successful." + id);
        console.log(dd);
        return dd
    } catch (error) {
        console.error(error);
    }
}

async function get_user(condition) {
    try {
        return (await google_user.scan(condition).exec())[0];
    } catch (error) {
        console.error(error);
    }
}

async function update_access_token(email, access_token) {
    try {
        const user = await get_user({"email": {"eq": email}});
        if(user) {
            user.access_token = access_token;
            return await save_user(user);
        }
        return false;
    } catch (error) {
        console.error(error);
        return false;
    }
}

async function update_refresh_token(email, refresh_token) {
    try {
        const user = await get_user({"email": {"eq": email}});
        if(user) {
            user.refresh_token = refresh_token;
            return await save_user(user);
        }
        return false;
    } catch (error) {
        console.error(error);
        return false;
    }
}
async function update_id_token(email, id_token) {
    try {
        const user = await get_user({"email": {"eq": email}});
        if(user) {
            user.id_token = id_token;
            return await save_user(user);
        }
        return false;
    } catch (error) {
        console.error(error);
        return false;
    }
}
// get_user({"id": {"contains": "asds"}, })

async function delete_user(user) {
    try {
        return await user.delete();
        console.log("Delete operation was successful.");
    } catch (error) {
        console.error(error);
    }
}

async function delete_user_by_id(id) {
    try {
        const user = await get_user_by_id(id)
        if(!user) return -1;        
        return await delete_user(user)
    } catch (error) {
        console.error(error);
    }
}
module.exports = {
    delete_user_by_id,
    delete_user,
    get_user,
    get_user_by_id,
    save_user,
    update_access_token,
    update_refresh_token,
    update_id_token,
}