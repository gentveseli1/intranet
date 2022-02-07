import React from 'react';
import { useHistory } from "react-router-dom";
import axios from 'axios';
import Cookies from 'js-cookie';

import '../fileconfigs/Axios';

function GoogleSuccess() {
    let history = useHistory();

    let url = window.location.href;
    
    let newUrl = url.substring(url.indexOf('?') + 1);

    axios.get('google/oauth/?'+newUrl).then((response) => {
        let auth = Cookies.get('authorize', { signed: true })
        if(auth) {
            history.push("/google_users");
        } else {
            history.push("/");
        }
    }).catch(err => {
        console.log(err)
        if (err.response.status === 403) {
            history.push("/?forbidden");
        } else if (err.response.status === 400) {
            history.push("/?tokenUsed");
        }
    });    

    return (
        <>
        </>
    );

}

export default GoogleSuccess;