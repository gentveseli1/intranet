import React, { useState } from 'react';

import Card from './Card';
import axios from 'axios';

import './Form.scss';
import Modal from "./Modal";
import SuccessAlert from './SuccessAlert';
import FailAlert from './FailAlert';

function UpdateGroup(props) {
    const [groupName, setGroupName] = useState(props.groupName);
    const [groupEmail, setGroupEmail] = useState(props.groupEmail);
    const [groupDescription, setGroupDescription] = useState(props.groupDescription);

    const editGroupHandler = (event) => {
        var updateData = {
            name: groupName,
            email: groupEmail,
            description: groupDescription,
        }       
        if(groupDescription) {
            updateData.description = groupDescription
        }
        event.preventDefault();
        axios({
            method: "PATCH",
            url: `google/groups/edit_groups`,
            data: updateData
        }).then(() => {
            props.forceRerender(true);
            props.onClose(true);
            SuccessAlert('👍 Group Edited Successfully');
        }).catch(function (error) {
            if (error.response.status !== 200) {
                FailAlert(error.response.data);
            }
        });
    };

    return (
        <Modal onClose={props.onClose}>
            <Card>
                <form onSubmit={editGroupHandler} method="PUT">
                    <input className="form-control h-unset visibility-hidden" name="id" value={props.userId} readOnly type="text"
                           placeholder="id"/>
                    <div className="form-control h-unset">
                        <label>Name</label>
                        <input
                            className="form-control h-unset"
                            value={groupName}
                            onChange={(event) => {
                                setGroupName(event.target.value);
                            }}
                            type="text"
                            placeholder="Name"
                        />
                    </div>
                    <div className="form-control h-unset">
                        <label>Email</label>
                        <input
                            className="form-control h-unset"
                            value={groupEmail}
                            onChange={(event) => {
                                setGroupEmail(event.target.value);
                            }}
                            type="email"
                            placeholder="Surname"
                        />
                    </div>
                    <div className="form-control h-unset">
                        <label>Description</label>
                        <textarea
                            rows="5"
                            className="form-control h-unset"
                            value={groupDescription}
                            onChange={(event) => {
                                setGroupDescription(event.target.value);
                            }}
                            type="text"
                            placeholder="Description"
                        />
                    </div>
                    <button type="submit" className="button">Edit Group</button>
                    <button type="button" className="cancel-btn" onClick={props.onClose}>Cancel</button>
                </form>
            </Card>
        </Modal>
    );

}

export default UpdateGroup;