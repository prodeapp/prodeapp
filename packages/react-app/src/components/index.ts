import styled from "styled-components";
import { Link as RouterLink } from "react-router-dom";

export const Body = styled.div`
  align-items: center;
  color: white;
  display: flex;
  flex-direction: column;
  font-size: calc(10px + 2vmin);
  justify-content: center;
  padding-top: 40px;
`;

export const Button = styled.button`
  background-color: white;
  border: none;
  border-radius: 8px;
  color: #282c34;
  cursor: pointer;
  font-size: 16px;
  margin: 0px 20px;
  padding: 12px 24px;
  text-align: center;
  text-decoration: none;
`;

export const Input = styled.input`
  color: #282c34;
  font-size: 16px;
  padding: 10px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  width: 100%;
  box-sizing: border-box;
`;

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: calc(100vh);
  background-color: #282c34;
`;

export const Header = styled.header`
  align-items: center;
  background-color: #282c34;
  color: white;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  min-height: 70px;
`;

export const Image = styled.img`
  height: 40vmin;
  margin-bottom: 16px;
  pointer-events: none;
`;

export const Link = styled(RouterLink)`
  color: #61dafb;
  margin-top: 8px;
`;
