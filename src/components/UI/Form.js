import React, { useState } from 'react';

import Modal from './Modal';
import Card from './Card';
import SuccessAlert from './SuccessAlert';
import FailAlert from './FailAlert';
import axios from 'axios';
import { InputGroup } from 'react-bootstrap';

import './Form.scss';

function Form(props) {
    const [userName, setUserName] = useState(props.userFirstName);
    const [userLastName, setUserLastName] = useState(props.userLastName);
    const [userEmail, setUserEmail] = useState(props.userEmail);

    const addUserHandler = (event) => {
        event.preventDefault();
        axios({
            method: `POST`,
            url: `google/users/add_staff`,
            data: {
                givenName: userName,
                familyName: userLastName,
                email: userEmail+'@thesocialplus.com',
                password: '12345678'
            }
        }).then((response) => {
            props.forceRerender(true);
            props.onClose(true);
            if (response.status === 200) {
                SuccessAlert('👷 User Registered Successfully');
            } 
        }).catch(function (error) {
            if (error.response.status !== 200) {
                props.forceRerender(true);
                FailAlert(error.response.data);
            }
        });
    };

    return (
        <Modal onClose={props.onClose}>
            <Card>
                <form onSubmit={addUserHandler} method="POST">
                    <div className="form-control h-unset">
                        <label>Name</label>
                        <input
                            className="form-control h-unset"
                            value={userName|| ""}
                            onChange={(event) => {
                                setUserName(event.target.value);
                            }}
                            name="first_name"
                            type="text"
                            placeholder="Name"
                        />
                    </div>
                    <div className="form-control h-unset">
                        <label>Last name</label>
                        <input
                            className="form-control h-unset"
                            value={userLastName|| ""}
                            onChange={(event) => {
                                setUserLastName(event.target.value);
                            }}
                            type="text"
                            placeholder="Surname"
                        />
                    </div>
                    <div className="form-control h-unset">
                        <label>Email address</label>
                        <div className="d-flex h-unset">
                            <input
                                className="form-control"
                                value={userEmail|| ""}
                                onChange={(event) => {
                                    setUserEmail(event.target.value);
                                }}
                                type="text"
                                placeholder="Enter email"
                            />
                            <InputGroup.Text>{process.env.REACT_APP_DOMAIN}</InputGroup.Text>
                        </div>
                    </div>
                    <button type="submit" className="button">Add User</button>
                    <button type="button" className="cancel-btn" onClick={props.onClose}>Cancel</button>
                </form>
            </Card>
        </Modal>
    );

}

export default Form;