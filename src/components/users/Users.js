import { React, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import MUIDataTable from "mui-datatables";
import { Container } from 'react-bootstrap';
import Loader from "react-loader-spinner";
import axios from 'axios';
import Cookies from 'js-cookie';

import Form from '../UI/Form';
import UpdateForm from '../UI/UpdateForm';
import Button from '../UI/Button';
import EditButton from '../UI/EditButton';
import SuccessAlert from '../UI/SuccessAlert';
import FailAlert from '../UI/FailAlert';
import './Users.scss';

function Users(props) {
    let history = useHistory();

    let access_token = Cookies.get('authorize', { signed: true });
    if (access_token === null || access_token === undefined) {
        history.push("/");
    }

    const columns = [
        {
            name: "id",
            label: "ID",
        },
        {
            name: "first_name",
            label: "Name"
        },
        {
            name: "last_name",
            label: "Last Name"
        },
        {
            name: "email",
            label: "Email"
        },
        // {
        //     name: "invited_by",
        //     label: "Invited By",
        // },
        {
            name: "edit_user",
            label: "Edit User",
            options: {
                customBodyRender: (value, tableMeta) => {
                    return (
                        <>
                            <EditButton type="button" onShowModalEdit={() => showModalEditHandler(tableMeta.rowData)}>
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
    const [fetching, setFetching] = useState();
    const [addUserModal, setAddUserModal] = useState(false);
    const [userFirstName, setUserFirstName] = useState('');
    const [userLastName, setUserLastName] = useState('');
    const [userEmail, setuserEmail] = useState('');
    const [userId, setUserId] = useState('');
    const [shouldReRender, setShouldReRender] = useState(true);

    const showModalHandler = () => {
        setAddUserModal(true);
    }

    const hideModalHandler = () => {
        setAddUserModal(false);
    }

    // EDIT USER MODAL
    const [editUserModal, setEditUserModal] = useState(false);

    const showModalEditHandler = (tableRowData) => {
        setUserFirstName(tableRowData[1]);
        setUserLastName(tableRowData[2]);
        setuserEmail(tableRowData[3]);
        setUserId(tableRowData[0]);
        setEditUserModal(true);
    }

    const hideModalEditHandler = () => {
        setEditUserModal(false);
    }

    // useEffect(() => {
    //     getUsers();
    // },[]);

    useEffect(() => {
        if (shouldReRender) {
            getUsers();
            setShouldReRender(false);
        }
    }, [shouldReRender]);

    const getUsers = () => {
        axios.get('google/users/get_staff').then((res) => {
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

    const data = fetching.map 
    (item => (
        {
            id: item.id,
            // first_name: item.name.givenName,
            first_name: item.name,
            last_name: item.last_name,
            email: item.email,
            // email:  item.primaryEmail,
            // invited_by: item.invited_by
        }))
        
    const options = {
        onRowsDelete: (rowsDeleted) => {
            let email = rowsDeleted.data.map(d => data[d.dataIndex].email).pop();
            axios({
                method: "DELETE",
                url: `google/users/delete_staff`,
                data: {
                    email: email
                }
            }).then((response) => {
                if (response.status === 200) {
                    SuccessAlert('🚀 User Deleted Successfully');
                }
            }).catch(function (error) {
                if (error.response.status !== 200) {
                    setShouldReRender(true);
                    FailAlert(error.response.data);
                }
            });
        },
        selectableRows: 'single',
        responsive: 'standard'
    };

    return (
        <>
            {addUserModal && <Form
                onClose={hideModalHandler}
                forceRerender={setShouldReRender}
            />}
            {editUserModal && <UpdateForm 
                onClose={hideModalEditHandler} 
                userFirstName={userFirstName}
                userLastName={userLastName}
                userId={userId}
                userEmail={userEmail}
                forceRerender={setShouldReRender}
            />}
            <Container fluid className="mt-4">
                <Button type="button" onShowModal={showModalHandler}>Add User</Button>
                <MUIDataTable
                    title={"Google Users"}
                    data={data}
                    columns={columns}
                    options={options}
                />
            </Container>
        </>
    );

}

export default Users;