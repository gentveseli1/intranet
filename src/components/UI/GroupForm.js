import React, { useState } from 'react';

import Modal from './Modal';
import Card from './Card';
import SuccessAlert from './SuccessAlert';
import FailAlert from './FailAlert';
import axios from 'axios';
import { InputGroup } from 'react-bootstrap';

import './Form.scss';

function GroupForm(props) {
    const [groupEmail, setGroupEmail] = useState(props.groupEmail);
    const [groupName, setGroupName] = useState(props.userFirstName);
    const [groupDescription, setGroupDescription] = useState(props.groupDescription);

    const addGroupHandler = (event) => {
        event.preventDefault();
        axios({
            method: `POST`,
            url: `google/groups/add_groups`,
            data: {
                email: groupEmail+'@thesocialplus.com',
                name: groupName,
                description: groupDescription,
            }
        }).then((response) => {
            props.forceRerender(true);
            props.onClose(true);
            SuccessAlert('👨‍👨‍👦‍👦 Group Registered Successfully');
        }).catch(function (error) {
            if (error.response.status !== 200) {
                FailAlert(error.response.data);
            }
        });
    };

    return (
        <Modal onClose={props.onClose}>
            <Card>
                <form onSubmit={addGroupHandler} method="POST">
                    <div className="form-control h-unset">
                        <label>Group name</label>
                        <input
                            className="form-control h-unset"
                            value={groupName|| ""}
                            onChange={(event) => {
                                setGroupName(event.target.value);
                            }}
                            name="first_name"
                            type="text"
                            placeholder="Enter group name"
                        />
                    </div>
                    <div className="form-control h-unset">
                        <label>Email address</label>
                        <div className="d-flex h-unset">
                            <input
                                className="form-control"
                                value={groupEmail|| ""}
                                onChange={(event) => {
                                    setGroupEmail(event.target.value);
                                }}
                                type="text"
                                placeholder="Enter group email"
                            />
                            <InputGroup.Text>{process.env.REACT_APP_DOMAIN}</InputGroup.Text>
                        </div>
                    </div>
                    <div className="form-control h-unset">
                        <label>Description</label>
                        <input
                            className="form-control h-unset"
                            value={groupDescription|| ""}
                            onChange={(event) => {
                                setGroupDescription(event.target.value);
                            }}
                            type="text"
                            placeholder="Enter group description"
                        />
                    </div>
                    <button type="submit" className="button">Add Group</button>
                    <button type="button" className="cancel-btn" onClick={props.onClose}>Cancel</button>
                </form>
            </Card>
        </Modal>
    );

}

export default GroupForm;