import React from "react";
import Carousel from "nuka-carousel";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";

const styles: React.CSSProperties = {
  height: '200px',
  background: '#121212',
  backgroundImage: 'linear-gradient(#ffffff17, #ffffff17)',
  padding: '50px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
}

export default function HomeSlider() {
  return (
    <div style={{marginBottom: '20px'}}>
      <Carousel
        renderCenterLeftControls={({ previousSlide }) => null}
        renderCenterRightControls={({ nextSlide }) => null}
      >
        <div style={styles}>
          <div style={{fontSize: '20px'}}>Uncensorable and KYC-free</div>
          <div style={{fontSize: '40px', fontWeight: '600'}}>Truly decentralized betting platform</div>
        </div>
        <div style={styles}>
          <div style={{fontSize: '40px', fontWeight: '600', marginBottom: '20px'}}>More tournaments, betting modes <br />and prizes are coming</div>
          <div>
            <Button component={Link} href="https://twitter.com/prode_eth" target="_blank" rel="noopener">Follow us on twitter</Button>
          </div>
        </div>
      </Carousel>
    </div>
  );
}