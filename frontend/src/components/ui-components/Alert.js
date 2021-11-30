import React from 'react';

export default function Alert(props) {
  return (
    <div className={`alert ${props.alertType}`} role="alert">
      {props.alertMessage}
    </div>
  );
}
