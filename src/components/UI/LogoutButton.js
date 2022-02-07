import React from 'react';
import Cookies from 'js-cookie';

import '../header/header.scss';

const LogoutButton = props => {
    let access_token = Cookies.get('authorize', { signed: true });
    if (!access_token) {
        return null;
    }

    return (
        <>
            <button 
                className="button logout-btn bump m-2"
                type={props.type || 'button'} 
                onClick={props.logout}
            >
                {props.children}
            </button>
        </>
    );

};

export default LogoutButton;