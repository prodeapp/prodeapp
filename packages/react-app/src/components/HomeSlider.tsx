import React from "react";
import Carousel from "nuka-carousel";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import {styled} from "@mui/material/styles";

const Slide = styled('div')(({ theme }) => ({
  height: '368px',
  padding: '50px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
}));

export default function HomeSlider() {
  return (
    <div>
      <Carousel
        renderCenterLeftControls={({ previousSlide }) => null}
        renderCenterRightControls={({ nextSlide }) => null}
      >
        <Slide style={{backgroundImage: 'url(/banners/banner-1.jpg)'}}>
          <div style={{fontSize: '20px'}}>Uncensorable and KYC-free</div>
          <div style={{fontSize: '40px', fontWeight: '600'}}>Truly decentralized <br />betting platform</div>
        </Slide>
        <Slide>
          <div style={{fontSize: '40px', fontWeight: '600', marginBottom: '20px'}}>More tournaments, betting modes <br />and prizes are coming</div>
          <div>
            <Button component={Link} href="https://twitter.com/prode_eth" target="_blank" rel="noopener">Follow us on twitter</Button>
          </div>
        </Slide>
      </Carousel>
    </div>
  );
}