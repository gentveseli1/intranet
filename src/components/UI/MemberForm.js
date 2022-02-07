import React, { useState } from 'react';

import Modal from './Modal';
import Card from './Card';
import SuccessAlert from './SuccessAlert';
import FailAlert from './FailAlert';
import axios from 'axios';
import { InputGroup } from 'react-bootstrap';
// import Select from 'react-select';

import './Form.scss';

function MemberForm(props) {
    const [groupEmail, setGroupEmail] = useState(props.groupEmail);
    const urlSplit = window.location.href.split("/").pop();

    // const RoleOptions = [
    //     { value: 'MANAGER', label: 'MANAGER' },
    //     { value: 'MEMBER', label: 'MEMBER' },
    //     { value: 'OWNER', label: 'OWNER' }
    // ]
      
    // const Role = () => (
    //     <Select options={RoleOptions} />
    // )

    // const TypeOptions = [
    //     { value: 'CUSTOMER', label: 'CUSTOMER' },
    //     { value: 'EXTERNAL', label: 'EXTERNAL' },
    //     { value: 'GROUP', label: 'GROUP' },
    //     { value: 'USER', label: 'USER' }
    // ]
      
    // const Type = () => (
    //     <Select options={TypeOptions} />
    // )

    // const StatusOptions = [
    //     { value: 'ACTIVE', label: 'ACTIVE' },
    //     { value: 'INACTIVE', label: 'INACTIVE' }
    // ]
      
    // const Status = () => (
    //     <Select options={StatusOptions} />
    // )

    const addMemberHandler = (event) => {
        event.preventDefault();
        axios({
            method: `POST`,
            url: `google/groups/add_members`,
            data: {
                groupKey: urlSplit,
                email: groupEmail+'@thesocialplus.com'
            }
        }).then((response) => {
            props.forceRerender(true);
            props.onClose(true);
            SuccessAlert('👷 Group Member Registered Successfully');
        }).catch(function (error) {
            if (error.response.status === 403) {
                FailAlert('😞 Insufficient Permission');
            } else if (error.response.status === 401) {
                FailAlert('😞 Invalid Credentials');
            }
        });
    };

    return (
        <Modal onClose={props.onClose}>
            <Card>
                <form onSubmit={addMemberHandler} method="POST">
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
                                placeholder="Enter member email"
                            />
                            <InputGroup.Text>{process.env.REACT_APP_DOMAIN}</InputGroup.Text>
                        </div>
                    </div>
                    {/* <div className="form-control h-unset pb-4">
                        <label>Role</label>
                        <Role />
                    </div>
                    <div className="form-control h-unset pb-4">
                        <label>Type</label>
                        <Type />
                    </div>
                    <div className="form-control h-unset pb-4">
                        <label>Status</label>
                        <Status />
                    </div> */}
                    <button type="submit" className="button">Add Member</button>
                    <button type="button" className="cancel-btn" onClick={props.onClose}>Cancel</button>
                </form>
            </Card>
        </Modal>
    );

}

export default MemberForm;