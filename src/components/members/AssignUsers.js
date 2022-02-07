import { React, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Container, Col } from 'react-bootstrap';
import Loader from "react-loader-spinner";
import axios from 'axios';
import Cookies from 'js-cookie';
import Select from 'react-select';
import FailAlert from '../UI/FailAlert';
import {toast} from "react-toastify";

import './Members.scss';

toast.configure();

function AssignMembers(props) {
    let history = useHistory();

    let access_token = Cookies.get('authorize', { signed: true });
    if (access_token === null || access_token === undefined) {
        history.push("/");
    }

    const [userFetching, setUserFetching] = useState();
    const [groupFetching, setGroupFetching] = useState();
    const [groups, setGroups] = useState();
    const [users, setUsers] = useState();

    useEffect(() => {
        getUsers();
        getGroups();
    },[]);

    useEffect(() => {
        getUsers();
        getGroups();
    }, []);

    const getUsers = () => {
        axios.get(`google/users/get_staff`).then((res) => {
            setUserFetching(res.data);
        });
    }

    const getGroups = () => {
        axios.get(`google/groups/get_groups`).then((res) => {
            setGroupFetching(res.data);
        });
    }

    const onGroupChange = (e) => {
        let groupsVal = e.map(group => {
        return group.label
        })
        setGroups(groupsVal)
    }

    const onUserChange = (e) => {
        let usersVal = e.map(user => {
        return user.label

        })
        setUsers(usersVal)
    }

    let selectUserRef = null
    const clearValue = () => {
      selectUserRef.select.clearValue();
    };

    const submitForm = (e) => {
        e.preventDefault();
        axios({
            method: "POST",
            url: `/google/groups/add_members_bulk`,
            data: {
                email_arr: users,
                groupKey_arr: groups
            },
        }).then(res => {
            if (res.data.added) {
                const added = res.data.added;
                added.map(add => (
                    toast.success(
                        <div className="toast-holder">
                            <p>🚀 Member assigned:<br />
                                <span>{decodeURIComponent(add.user.email)}</span>
                            </p>
                            <p>💭 Message: successfully assigned to<br />
                                <span>{add.groupemail}</span>!
                            </p>
                        </div>, {
                        position: "bottom-right",
                        autoClose: 3000,
                        hideProgressBar: true,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: false,
                        progress: undefined,
                    })
                ))
                clearValue();
            } 
            if (res.data.error) {
                const errors = res.data.error;
                errors.map(err => (
                    toast.error(
                        <div className="toast-holder">
                            <p>💥 Cant assign:<br /><span>{decodeURIComponent(err.email)}</span></p>
                            <p>👨‍👨‍👦‍👦 To group:<br /><span>{err.groupemail}</span></p>
                            <p>💭 Message:<br /><span>{err.msg}</span></p>
                        </div>
                        , {
                        position: "bottom-right",
                        autoClose: 3000,
                        hideProgressBar: true,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: false,
                        progress: undefined,
                    })
                ))
            }
        }).catch(err => {
            console.log(err)
            if (err) {
                FailAlert('Users Failed to Register');
            }
        }) 
    }

    if(userFetching === undefined || groupFetching === undefined) {
        return(
            <div style={{width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 80px)'}}>
            <Loader
                type="Puff"
                color="#343a40"
                height={100}
                width={100}
            />
            </div>
        )
    }

    const usersOptions = userFetching ? userFetching.map(user => {
        return(
            {
                label: user.email, value: user.id
            }
        )
    }) : ''
    
    const groupsOptions = groupFetching.groups ? groupFetching.groups.map(group => {
        return(
            {
                label: group.email, value: group.id
            }
        )
    }) : ''

    return(
        <>
            <Container className="mt-4">
                <form onSubmit={submitForm} method="POST" className="d-flex flex-wrap">
                    <Col md={6}>
                        <label>Groups</label>
                        <Select
                            isMulti
                            name="colors"
                            options={groupsOptions}
                            className="basic-multi-select"
                            classNamePrefix="select"
                            onChange={(e) => onGroupChange(e)}
                        />
                    </Col>
                    <Col md={6}>
                        <label>Users</label>
                        <Select
                            isMulti
                            name="colors"
                            options={usersOptions}
                            className="basic-multi-select"
                            classNamePrefix="select"
                            onChange={(e) => onUserChange(e)}
                            ref={ref => {
                                selectUserRef = ref
                            }}
                        />
                    </Col>
                    <button type="submit" className="btn btn-success m-3">ASSIGN USERS</button>
                </form>
            </Container>
        </>
    );

}

export default AssignMembers;