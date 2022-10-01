import * as React from 'react';
import {useState} from "react";
import Alert from "@mui/material/Alert";
import {Trans} from "@lingui/macro";

type ImgSvgProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  svg: string
};

/**
 * Using an IMG tag is the safest way to load untrusted SVG files and prevent XSS attacks.
 */
export default function ImgSvg({svg, alt, ...rest}: ImgSvgProps) {
  if (!svg.includes('xmlns')) {
    svg = svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
  }

  return <img
    src={`data:image/svg+xml;base64,${btoa(svg)}`}
    alt={alt || ''}
    {...rest}
  />
}

export function AdImg(props: ImgSvgProps) {
  const [error, setError] = useState(false);

  if (error) {
    return <Alert severity="error"><Trans>Failed to load image.</Trans></Alert>
  }

  const onError = () => setError(true);

  return <ImgSvg {...props} onError={onError} />
}