import { React, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import MUIDataTable from "mui-datatables";
import { Container } from 'react-bootstrap';
import Loader from "react-loader-spinner";
import axios from 'axios';
import Cookies from 'js-cookie';

import UpdateMember from '../UI/UpdateMember';
import MemberForm from '../UI/MemberForm';
import Button from '../UI/Button';
import EditButton from '../UI/EditButton';
import SuccessAlert from '../UI/SuccessAlert';
import FailAlert from '../UI/FailAlert';
import './Members.scss';

function Members(props) {
    let history = useHistory();

    let access_token = Cookies.get('authorize', { signed: true });
    if (access_token === null || access_token === undefined) {
        history.push("/");
    }

    const urlSplit = window.location.href.split("/").pop();

    const columns = [
        {
            name: "email",
            label: "Email"
        },
        {
            name: "role",
            label: "Role"
        },
        {
            name: "type",
            label: "Type"
        },
        {
            name: "status",
            label: "Status"
        },
        {
            name: "edit_member",
            label: "Edit Member",
            options: {
                customBodyRender: (value, tableMeta) => {
                    return (
                        <>
                            <EditButton type="button" onShowModalEdit={() => showModalEditMemberHandler(tableMeta.rowData)}>
                                <div className="p-10px"></div>
                            </EditButton>
                        </>
                    )
                },
                filter: false,
                print: false,
            }
        }
    ];

    // ADD NEW USER MODAL 
    const [addMemberModal, setaddMemberModal] = useState(false);
    const [memberEmail, setMemberEmail] = useState('');
    const [memberRole, setMemberRole] = useState('');
    const [memberType, setMemberType] = useState('');
    const [memberStatus, setMemberStatus] = useState('');
    const [shouldReRender, setShouldReRender] = useState(false);

    const showModalHandler = () => {
        setaddMemberModal(true);
    }

    const hideModalHandler = () => {
        setaddMemberModal(false);
    }

    // EDIT USER MODAL
    const [editMemberModal, setEditMemberModal] = useState(false);

    const showModalEditMemberHandler = (tableRowData) => {
        setMemberEmail(tableRowData[0]);
        setMemberRole(tableRowData[1]);
        setMemberType(tableRowData[2]);
        setMemberStatus(tableRowData[3]);
        setEditMemberModal(true);
    }

    const hideModalEditMemberHandler = () => {
        setEditMemberModal(false);
    }

    // FETCHING FROM REGISTERED GOOGLE GROUPS MEMBERS
    const [fetching, setFetching] = useState();

    useEffect(() => {
        getUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[]);

    useEffect(() => {
        if(shouldReRender){
            getUsers()
            setShouldReRender(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shouldReRender]);

    const params = useParams();

    const getUsers = () => {
        axios.get(`google/groups/get_members/?email=${params.email}`).then((res) => {
            setFetching(res.data);
        });
    }

    if(fetching === undefined) {
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
    
    const data = fetching.members?.map 
    (members => (
        {
            email:  members.email,
            role:   members.role,
            type:   members.type,
            status: members.status
        }))

    const options = {
        onRowsDelete: (rowsDeleted) => {
            let email = rowsDeleted.data.map(d => data[d.dataIndex].email).pop();
            axios({ 
                method: "DELETE",
                url: `google/groups/delete_members`,
                data: {
                    groupKey: urlSplit,
                    email: email
                }
            }).then((response) => {
                if (response.status === 200) {
                    setShouldReRender(true);
                    SuccessAlert('🚀 Member Deleted Successfully');
                }
            }).catch(function (error) {
                if (error) {
                    setShouldReRender(true);
                    FailAlert('💥 Member Delete Failed');
                }
            });
        },
        selectableRows: 'single',
        responsive: 'standard'
    };

    return(
        <>
            {addMemberModal && <MemberForm
                onClose={hideModalHandler}
                forceRerender={setShouldReRender}
            />}
            {editMemberModal && <UpdateMember 
                onClose={hideModalEditMemberHandler} 
                memberEmail={memberEmail}
                memberRole={memberRole}
                memberType={memberType}
                memberStatus={memberStatus}
                forceRerender={setShouldReRender}
            />}
            <Container fluid className="mt-4">
                <Button type="button" onShowModal={showModalHandler}>Add Member</Button>
                <MUIDataTable
                    title={`${props.match.params.name}`}
                    data={data}
                    columns={columns}
                    options={options}
                />
            </Container>
        </>
    );

}

export default Members;