import React from "react";
import styled from "styled-components";
import Burger from "./Burger";

const Navbar = () => {
  return (
    <>
      <Header>
        <StyledNav>
          {/* make ul and li */}
          <Burger></Burger>
        </StyledNav>
      </Header>
    </>
  );
};
export default Navbar;

const Header = styled.header`
  background-image: linear-gradient(15deg, #13547a 0%, #80d0c7 100%);
  height: 5rem;
  position: relative;
  z-index: 101;
  background-position: right;
`;
const StyledNav = styled.nav`
  width: 100%;
`;
