import clsx from "clsx";
import React from "react";
import { Spinner } from "react-bootstrap";

const Loader = ({ className = "align-items-center vh-100" }) => {
  return (
    <div className={clsx("d-flex justify-content-center", className)}>
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </div>
  );
};

export default Loader;
