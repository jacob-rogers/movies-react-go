import React from 'react';

export default function Input(props) {
  return (
    <div className="mb-3">
      <label htmlFor={props.name} className="form-label">{props.title}</label>
      <input
        className={`form-control ${props.className}`}
        type={props.type}
        id={props.name}
        name={props.name}
        value={props.value}
        onChange={props.handleChange}
        placeholder={props.placeholder}
      />
      <div className={props.errorDiv}>{props.errorMsg}</div>
    </div>
  );
}
