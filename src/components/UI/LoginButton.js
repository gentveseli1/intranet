import React from 'react';
import { Link } from "react-router-dom";

import './LoginButton.scss';

const LoginButton = props => {

    return (
        <>
            <div className="login-button-holder">
                <Link 
                    className="login-button"
                    to="/"
                >
                    {props.children}
                </Link>
            </div>
        </>
    );

};

export default LoginButton;