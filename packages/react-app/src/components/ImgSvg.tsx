import * as React from 'react';

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