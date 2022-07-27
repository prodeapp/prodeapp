import { Container } from "@mui/material";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

function Layout() {
  return (
    <>
      <Header />
      <Container sx={{marginTop:"30px"}}>
        <Outlet />
      </Container>
      <Footer />
    </>
  );
}

export default Layout;

