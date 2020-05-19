import React, { useEffect } from "react";
import styled from "styled-components";

export default function Snackbars({ snackMsg, setOpenSnack }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      setOpenSnack(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return <Alert>{snackMsg}</Alert>;
}

const Alert = styled.div`
  color: white;
  position: absolute;
  font-weight: bolder;
  bottom: 10px;
  left: 45vw;
  text-align: center;
  width: 200px;
  padding: 10px;
  font-size: 1.1rem;
  border-radius: 10px;
  box-shadow: 0 19px 38px rgba(0, 0, 0, 0.3), 0 15px 12px rgba(0, 0, 0, 0.22);
  background-color: green;
  z-index: 1500;
`;
