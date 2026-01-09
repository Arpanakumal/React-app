import React from 'react';
import './title.css';

const Title = ({ text1, text2 }) => {
    return (
        <h1 className="title">
            {text1} <span className="highlight">{text2}</span>
        </h1>
    );
};

export default Title;
