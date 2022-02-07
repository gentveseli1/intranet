import React from 'react';

import './Button.scss';

const EditButton = props => {

    return (
        <>
            <button 
                className="edit-btn btn p-0"
                type={props.type || 'button'} 
                onClick={props.onShowModalEdit}
            >
                {props.children}
            </button>
        </>
    );

};

export default EditButton;