import React from 'react';
import { Route, Switch, Link } from 'react-router-dom';
import { Navbar, Nav } from 'react-bootstrap';

import Header from './components/header/header';
import Dashboard from './components/dashboard/dashboard';
import Users from './components/users/Users';
import Groups from './components/groups/groups';
import Members from './components/members/Members';
import AssignUsers from './components/members/AssignUsers';
import UnAssignUsers from './components/members/UnAssignUsers';
import GoogleSuccess from './components/google_success/GoogleSuccess';

import './App.scss';
import logo from './assets/images/1865721.png';

function App() {
    return (
        <>
            <Navbar className="intranet-navbar" bg="dark" variant="dark" expand="lg">
                <Nav.Link as={Link} to="/">
                    <img src={logo} className="intranet-logo" alt="logo" />
                </Nav.Link>
                <Header/>
            </Navbar>
            <Switch>
                <>
                    <main className="main-container">
                        <Route exact path="/" component={Dashboard}/>
                        <Route path="/google_users" component={Users}/>
                        <Route path="/google_groups" component={Groups}/>
                        <Route path="/assign_users" component={AssignUsers}/>
                        <Route path="/unassign_users" component={UnAssignUsers}/>
                        <Route path="/group_members/:name/:email" component={Members}/>
                        <Route path={process.env.REACT_APP_CALLBACK_URL} component={GoogleSuccess}/>
                    </main>
                    {/* <Route exact path="/login" component={Login}></Route> */}
                </>
            </Switch>
            {/* <Sidebar /> */}
        </>
    );
}

export default App;