import React from 'react';

function optionsAsObjects(options) {
  options.forEach((option, index) => {
    if (typeof (option) == 'string') {
      options[index] = {
        id: option,
        value: option,
      };
    }
  });
}

export default function Select(props) {
  const { options } = props;

  // Convert all values in options to Object type like
  // {name: string, value: string}.
  // Makes sense to check values types since 'options' array might be
  // a list of strings
  optionsAsObjects(options);

  return (
    <div className="mb-3">
      <label htmlFor={props.name} className="form-label">{props.title}</label>
      <select
        className="form-select"
        id={props.name}
        name={props.name}
        value={props.value}
        onChange={props.handleChange}>
        <option className="form-select" value="">{props.placeholder}</option>
        {props.options.map((option) => (
          <option
            key={option.id}
            className="form-select"
            name={option.id}
            value={option.id}
            label={option.value}>
            {option.value}
          </option>
        ))}
      </select>
    </div>
  );
}
