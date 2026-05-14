import React from 'react';
import './Loader.scss';

const Loader = ({ text = "Loading..." }) => {
    return (
        <div className="loader-container">
            <div className="spinner">
                <div className="double-bounce1"></div>
                <div className="double-bounce2"></div>
            </div>
            <h2 className="loader-text">{text}</h2>
        </div>
    );
};

export default Loader;
