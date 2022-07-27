import { Container } from "@mui/material";
import { Outlet } from "react-router-dom";
import AppMenuBar from "./AppMenuBar";
import Footer from "./Footer";

function Layout() {
  return (
    <>
      <AppMenuBar />
      <Container sx={{marginTop:"30px"}}>
        <Outlet />
      </Container>
      <Footer />
    </>
  );
}

export default Layout;

