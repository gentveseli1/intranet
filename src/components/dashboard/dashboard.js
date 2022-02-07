import { React, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Col } from 'react-bootstrap';
import axios from 'axios';
import Cookies from 'js-cookie';
import FailAlert from '../UI/FailAlert';

import './dashboard.scss';

function Dashboard(props) {
    let urlCondition = window.location.href.substring(window.location.href.indexOf('?') + 1);

    useEffect(() => {
        if (urlCondition === 'tokenUsed') {
            FailAlert('Old Token')
        } else if (urlCondition === 'forbidden') {
            FailAlert('You are not part of the group Cognito')
        }
    }, [urlCondition])

    let history = useHistory();

    let access_token = Cookies.get('authorize', { signed: true });
    if (access_token !== undefined) {
        history.push("/google_users");
    }

    const [googleURL, setGoogleURL] = useState(null);

    useEffect(() => {
        axios.get('google/oauth/url').then((res) => {
            setGoogleURL(res.data.url);
        });
    }, []);

    const sendToGoogle = () => {
        if (googleURL !== null) {
            window.location.href = googleURL;
        }
    }

    return (
        <>
            <div className="dashboard-holder p-0">
                <Col sm={12} className="p-0">
                    <div className="db-box text-center">
                        <button type="button" className="loginGoogleBtn" onClick={() => sendToGoogle()}>LOGIN WITH GOOGLE</button>
                    </div>
                </Col>
            </div>
        </>
    );

}

export default Dashboard;