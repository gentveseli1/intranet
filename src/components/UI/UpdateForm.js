import React, { useState } from 'react';

import Card from './Card';
import axios from 'axios';

import './Form.scss';
import Modal from "./Modal";
import SuccessAlert from './SuccessAlert';
import FailAlert from './FailAlert';

function UpdateForm(props) {
    const [userPassword, setUserPassword] = useState('');
    const [userName, setUserName] = useState(props.userFirstName);
    const [userLastName, setUserLastName] = useState(props.userLastName);

    const editUserHandler = (event) => {
        var updateData = {
            email: props.userEmail,
            givenName: userName,
            familyName:  userLastName,
            fullName: userName+ ' ' +userLastName,           
        }       

        if(userPassword.length > 8) {
            updateData.password = userPassword
        }
        
        event.preventDefault();
        axios({
            method: "PATCH",
            url: `google/users/edit_staff`,
            data: updateData
        }).then((response) => {
            props.forceRerender(true);
            props.onClose(true);
            if (response.status === 200) {
                SuccessAlert('👍 User Edited Successfully');
            }
        }).catch(function (error) {
            if (error.response.status !== 200) {
                FailAlert(error.response.data);
            }
        });
    };

    return (
        <Modal onClose={props.onClose}>
            <Card>
                <form onSubmit={editUserHandler} method="PUT">
                    <input className="form-control h-unset visibility-hidden" name="email_hidden" value={props.userEmail} readOnly type="email"
                           placeholder="email"/>
                    <div className="form-control h-unset">
                        <label>Name</label>
                        <input
                            className="form-control h-unset"
                            value={userName}
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
                            value={userLastName}
                            onChange={(event) => {
                                setUserLastName(event.target.value);
                            }}
                            type="text"
                            placeholder="Surname"
                        />
                    </div>
                    <div className="form-control h-unset">
                        <label>Password</label>
                        <input
                            className="form-control h-unset mb-1"
                            type="password"
                            placeholder="Enter new password"
                            onChange={(event) => {
                                setUserPassword(event.target.value);
                            }}
                        />
                        <span className="alert-validation">Password must be longer than 8 characters!</span>
                    </div>
                    <button type="submit" className="button">Edit User</button>
                    <button type="button" className="cancel-btn" onClick={props.onClose}>Cancel</button>
                </form>
            </Card>
        </Modal>
    );

}

export default UpdateForm;