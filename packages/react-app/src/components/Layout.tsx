import { Container } from "@mui/material";
import { Outlet } from "react-router-dom";
import AppMenuBar from "./AppMenuBar";

function Layout() {
  return (
    <>
      <AppMenuBar />
      <Container sx={{marginTop:"30px"}}>
        <Outlet />
      </Container>
    </>
  );
}

export default Layout;

