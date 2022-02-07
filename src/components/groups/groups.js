import { React, useEffect, useState } from 'react';
import { Link , useHistory } from 'react-router-dom';
import MUIDataTable from "mui-datatables";
import { Container } from 'react-bootstrap';
import Loader from "react-loader-spinner";
import axios from 'axios';
import Cookies from 'js-cookie';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';

import GroupForm from '../UI/GroupForm';
import UpdateGroup from '../UI/UpdateGroup';
import Button from '../UI/Button';
import EditButton from '../UI/EditButton';
import SuccessAlert from '../UI/SuccessAlert';
import FailAlert from '../UI/FailAlert';
import './groups.scss';

function Groups(props) {
    let history = useHistory();

    let access_token = Cookies.get('authorize', { signed: true });
    if (access_token === null || access_token === undefined) {
        history.push("/");
    }

    const columns = [
        {
            name: "name",
            label: "Name"
        },
        {
            name: "email",
            label: "Email"
        },
        {
            name: "description",
            label: "Description",
        },
        {
            name: "edit_group",
            label: "Edit Group",
            options: {
                customBodyRender: (value, tableMeta) => {
                    return (
                        <>
                            <EditButton type="button" onShowModalEdit={() => showModalEditGroupHandler(tableMeta.rowData)}>
                                <div className="p-10px"></div>
                            </EditButton>
                        </>
                    )
                },
                filter: false,
                print: false,
            }
        },
        {
            name: "g_members",
            label: "Group Details",
            options: {
                filter: false,
                sort: false,
                print: false,
                viewColumns: false
            }
        }
    ];

    const getMuiTheme = () => createMuiTheme({
        overrides: {
          MUIDataTableBodyCell: {
            root: {
                '&:nth-child(4)': {
                  width: '40%'
                }
            }
          }
        }
    })

    // ADD NEW GROUP MODAL 
    const [addGroupModal, setAddGroupModal] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [groupEmail, setGroupEmail] = useState('');
    const [groupDescription, setGroupDescription] = useState('');
    const [shouldReRender, setShouldReRender] = useState(true);

    const showModalHandler = () => {
        setAddGroupModal(true);
    }

    const hideModalHandler = () => {
        setAddGroupModal(false);
    }

    // EDIT GROUP MODAL
    const [editGroupModal, setEditGroupModal] = useState(false);

    const showModalEditGroupHandler = (tableRowData) => {
        setGroupName(tableRowData[0]);
        setGroupEmail(tableRowData[1]);
        setGroupDescription(tableRowData[2]);
        setEditGroupModal(true);
    }

    const hideModalEditGroupHandler = () => {
        setEditGroupModal(false);
    }

    // FETCHING FROM REGISTERED GOOGLE GROUPS
    const [fetching, setFetching] = useState();

    // useEffect(() => {
    //     getUsers();
    // },[]);

    useEffect(() => {
        if(shouldReRender){
            getUsers()
            setShouldReRender(false);
        }
    }, [shouldReRender]);

    const getUsers = () => {
        axios.get('google/groups/get_groups_db').then((res) => {
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
    (groups => (
        {
            name: groups.name,
            email:  groups.email,
            description: groups.description,
            g_members: <Link className="group-details-btn" to={`/group_members/${groups.name}/${groups.email}`}></Link>
        }))

    const options = {
        onRowsDelete: (rowsDeleted) => {
            let email = rowsDeleted.data.map(d => data[d.dataIndex].email).pop();
            axios({ 
                method: "DELETE",
                url: `google/groups/delete_groups`,
                data: {
                    email: email
                }
            }).then((response) => {
                if (response.status === 200) {
                    SuccessAlert('🚀 Group Deleted Successfully');
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

    return(
        <>
            {addGroupModal && <GroupForm
                onClose={hideModalHandler}
                forceRerender={setShouldReRender}
            />}
            {editGroupModal && <UpdateGroup 
                onClose={hideModalEditGroupHandler} 
                groupName={groupName}
                groupEmail={groupEmail}
                groupDescription={groupDescription}
                forceRerender={setShouldReRender}
            />}
            <Container fluid className="mt-4">
                <Button type="button" onShowModal={showModalHandler}>Add Group</Button>
                <MuiThemeProvider theme={getMuiTheme()}>
                    <MUIDataTable
                        title={"Google Users"}
                        data={data}
                        columns={columns}
                        options={options}
                    />
                </MuiThemeProvider>
            </Container>
        </>
    );

}

export default Groups;