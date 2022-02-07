import React from 'react';

import './Button.scss';

const Button = props => {

    return (
        <>
            <button 
                className="button bump m-2"
                type={props.type || 'button'} 
                onClick={props.onShowModal}
            >
                {props.children}
            </button>
        </>
    );

};

export default Button;