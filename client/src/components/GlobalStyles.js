import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`

  html {
    font-size: 16px;
    font-family: 'Comfortaa', cursive;
  
    @media screen and (max-width: 1200px) {
      font-size: 15px
    }

    @media screen and (max-width: 1000px) {
      font-size: 14px
    }

    @media screen and (max-width: 800px) {
      font-size: 13px
    }

    @media screen and (max-width: 600px) {
      font-size: 12px
    }

  }

  html,
  body,
  div,
  span {
    margin: 0;
    padding: 0;
    border: 0;
    vertical-align: baseline;
    
  }
  table {
    border-collapse: collapse;
    border-spacing: 0;
  }

  ul{
    padding: 0; 
    margin: 0; 
  }

  

  /* GLOBAL STYLES */
  *,
  *:before,
  *:after {
    box-sizing: border-box;
    line-height: 1.4;
    -webkit-font-smoothing: antialiased;
    /* font-family: Roboto, -apple-system, BlinkMacSystemFont, 'Segoe UI',
      Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue',
      sans-serif; */
      
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01s !important;
      animation-iteration-count: 0.01s !important;
      transition-duration: 0.01s !important;
    }
  }

  body {
    color: var(--color-dark);
    background: var(--color-white);
    /* overflow-x: hidden; */
  }

  a:focus {
    outline: 5px auto var(--color-primary);
  }

  body,
  input,
  button,
  select,
  option {
    font-family: var(--font-family);
    font-weight: var(--font-weight-light);
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  strong {
    font-weight: var(--font-weight-bold);
    margin-block-start: 0; 
    margin-block-end: 0; 
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  p {
    text-rendering: optimizeLegibility;
  }

  code {
    font-size: 0.95em;
  }

  /* Scrollbar and selection styles */
  ::selection {
    background-color: var(--color-accent);

  }

  :root {
    --color-dark: #333333;
    --color-grey: #FAFAFA;
    --color-white: #FFFFFF;
    --color-accent: #FF4F40;
  }
`;

export default GlobalStyles;
