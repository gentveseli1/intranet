import React, { useState } from 'react';

import Card from './Card';
import axios from 'axios';

import './Form.scss';
import Modal from "./Modal";
import SuccessAlert from './SuccessAlert';
import FailAlert from './FailAlert';
import Select from 'react-select';

function UpdateMember(props) {
    const [memberEmail, setMemberEmail] = useState(props.memberEmail);
    const [memberRole, setMemberRole] = useState(props.memberRole);
    // const [memberType, setMemberType] = useState(props.memberType);
    const urlSplit = window.location.href.split("/").pop();

    const selectedRole = {value: props.memberRole, label: props.memberRole};
    // const selectedType = {value: props.memberType, label: props.memberType};

    // const typeOptions = [
    //     {
    //         value: 'CUSTOMER',
    //         label: 'CUSTOMER'
    //     },
    //     {
    //         value: 'EXTERNAL',
    //         label: 'EXTERNAL'
    //     },
    //     {
    //         value: 'GROUP',
    //         label: 'GROUP'
    //     },
    //     {
    //         value: 'USER',
    //         label: 'USER'
    //     }
    // ];

    const roleOptions = [
        {
            value: 'MEMBER',
            label: 'MEMBER'
        },
        {
            value: 'MANAGER',
            label: 'MANAGER'
        },
        {
            value: 'OWNER',
            label: 'OWNER'
        }
    ];

    const editGroupHandler = (event) => { 
        event.preventDefault();
        axios({
            method: "PATCH",
            url: `google/groups/edit_members`,
            data: {
                groupKey: urlSplit,
                email: memberEmail,
                role: memberRole.value,
                // type: memberType.value,
            }
        }).then(() => {
            props.forceRerender(true);
            props.onClose(true);
            SuccessAlert('👍 Member Edited Successfully');
        }).catch(function (error) {
            FailAlert('😞 Member Edit Failed');
        });
    };

    return (
        <Modal onClose={props.onClose}>
            <Card>
                <form onSubmit={editGroupHandler} method="PUT">
                    <input className="form-control h-unset visibility-hidden" name="id" value={props.userId} readOnly type="text"
                           placeholder="id"/>
                    <div className="form-control h-unset">
                        <label>Email</label>
                        <input
                            className="form-control h-unset"
                            value={memberEmail}
                            onChange={(event) => {
                                setMemberEmail(event.target.value);
                            }}
                            type="text"
                            placeholder="Name"
                        />
                    </div>
                    <div className="form-control h-unset">
                        <label>Role</label>
                        <Select
                            className="basic-single h-unset"
                            classNamePrefix="select"
                            defaultValue={selectedRole}
                            name="type"
                            options={roleOptions}
                            onChange={(e) => setMemberRole(e)}
                        />
                    </div>
                    {/* <div className="form-control h-unset">
                        <label>Type</label>
                        <Select
                            className="basic-single h-unset"
                            classNamePrefix="select"
                            defaultValue={selectedType}
                            name="type"
                            options={typeOptions}
                            onChange={(e) => setMemberType(e)}
                        />
                    </div> */}
                    <button type="submit" className="button">Edit Group</button>
                    <button type="button" className="cancel-btn" onClick={props.onClose}>Cancel</button>
                </form>
            </Card>
        </Modal>
    );

}

export default UpdateMember;