import React, { useState } from "react";
import styled from "styled-components";
import RightNav from "./RightNav";

const Burger = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <StyledBurger open={open} onClick={() => setOpen(!open)}>
        <div></div>
        <div></div>
        <div></div>
      </StyledBurger>
      <RightNav open={open}></RightNav>
    </>
  );
};
export default Burger;

const StyledBurger = styled.div`
  @media (max-width: 768px) {
    width: 2rem;
    height: 2rem;
    position: fixed;
    top: 15px;
    right: 20px;
    display: flex;
    justify-content: space-around;
    flex-flow: column nowrap;
    z-index: 110;
    div {
      width: 2rem;
      height: 0.25rem;
      background-color: ${({ open }) => (open ? "white" : "black")};
      border-radius: 25px;
      transform-origin: 1px;
      transition: all 0.5s;
      position: relative;

      /* grab the first child of the div. */
      &:nth-child(1) {
        transform: ${({ open }) => (open ? "rotate(45deg)" : "rotate(0)")};
      }
      &:nth-child(2) {
        transform: ${({ open }) =>
          open ? "translateX(100%)" : "translateX(0)"};
        opacity: ${({ open }) => (open ? 0 : 1)};
      }
      &:nth-child(3) {
        transform: ${({ open }) => (open ? "rotate(-45deg)" : "rotate(0)")};
      }
    }
  }
`;
