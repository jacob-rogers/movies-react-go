import React, { useState, Fragment } from "react";

import Alert from "./ui-components/Alert";
import Input from "./form-components/Input";

export default function LoginFunc(props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState([]);
  const [alert, setAlert] = useState({
    type: "d-none",
    message: "",
  });

  const cleanupAlert = () => {
    setAlert({ type: "d-none", message: "" });
  }

  const handleEmail = ({ target: { name, value } }) => {
    const newErrors = errors.filter((v) => v !== name);
    setErrors(newErrors);
    setEmail(value);
  }

  const handleJWTChange = (jwt) => props.handleJWTChange(jwt);

  const handlePassword = ({ target: { name, value } }) => {
    const newErrors = errors.filter((v) => v !== name);
    setErrors(newErrors);
    setPassword(value);
  }

  const handleSubmit = (evt) => {
    evt.preventDefault();

    // Cleaning up the alert if shows
    cleanupAlert();

    // Login form client-side validation
    const errors = [];

    if (!email) {
      errors.push("email");
    }

    if (!password) {
      errors.push("password");
    }

    setErrors(errors);

    if (errors.length) {
      return false;
    }

    const data = new FormData(evt.target);
    const payload = Object.fromEntries(data.entries());

    const requestOptions = {
      method: "POST",
      body: JSON.stringify(payload),
    };

    fetch(`${process.env.REACT_APP_API_URL}/v1/signin`, requestOptions)
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          setAlert({
            type: "alert-danger",
            message: data.error.message,
          });
        } else {
          handleJWTChange(Object.values(data)[0]);
          // Save token at local storage
          window.localStorage.setItem(
            "jwt",
            JSON.stringify(Object.values(data)[0]),
          );
          props.history.push({ pathname: "/admin" });
        }
      });
  }

  const hasError = (key) => errors.indexOf(key) !== -1;

  return (
    <Fragment>
      <h2>Login</h2>
      <hr />
      <Alert alertType={alert.type} alertMessage={alert.message} />

      <form className="pt-3" onSubmit={handleSubmit}>
        <Input
          title={"Email"}
          type={"email"}
          name={"email"}
          handleChange={handleEmail}
          className={hasError("email") ? "is-invalid" : ""}
          errorDiv={hasError("email") ? "text-danger" : "d-none"}
          errorMsg={"Please enter a valid email address"}
        />

        <Input
          title={"Password"}
          type={"password"}
          name={"password"}
          handleChange={handlePassword}
          className={hasError("password") ? "is-invalid" : ""}
          errorDiv={hasError("password") ? "text-danger" : "d-none"}
          errorMsg={"Please enter a password"}
        />

        <hr />
        <button className="btn btn-primary">
          Login
        </button>
      </form>
    </Fragment>
  );
}