import React from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import { Link, useLocation, useHistory } from 'react-router-dom';
import LogoutButton from '../UI/LogoutButton';
import axios from 'axios';
import Cookies from 'js-cookie';

import './header.scss';

function Header() {
    let history = useHistory();
    const location = useLocation();
    const { pathname } = location;
    const splitLocation = pathname.split("/");

    const logoutHandler = async () => {
        try {
            await axios.post('/google/oauth/logout');
            Cookies.remove('authorize');
            let access_token = Cookies.get('authorize', { signed: true });
            if (!access_token) {
                history.push("/");
            }
        } catch (error) {
            console.log(error)
        }
    }

    if (window.location.pathname === '/') return null;

    return (
        <>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="m-auto">
                    <Link to="/google_users" className={`intranet-link ${splitLocation[1] === "google_users" ? "active" : ""}`}>
                        Users
                    </Link>
                    <Link to="/google_groups" className={`intranet-link ${splitLocation[1] === "google_groups" ? "active" : ""}`}>
                        Groups
                    </Link>
                    <Link to="/assign_users" className={`intranet-link ${splitLocation[1] === "assign_users" ? "active" : ""}`}>
                        Assign
                    </Link>
                    <Link to="/unassign_users" className={`intranet-link ${splitLocation[1] === "unassign_users" ? "active" : ""}`}>
                        Unassign
                    </Link>
                    {/* <Link to="/group_members" className={`intranet-link ${splitLocation[1] === "group_members" ? "active" : ""}`}>
                        Group Members
                    </Link> */}
                    <LogoutButton logout={logoutHandler}>Logout</LogoutButton>
                </Nav>
            </Navbar.Collapse>
        </>
    );

}

export default Header;