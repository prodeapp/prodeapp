import React, {useState} from "react";
import {FormRow, FormLabel} from "../components"
import Button from '@mui/material/Button';
import {useContractFunction, useEthers} from "@usedapp/core";
import {Contract} from "@ethersproject/contracts";
import Alert from "@mui/material/Alert";
import { Trans, t } from "@lingui/macro";
import {showWalletError} from "../lib/helpers";
import Container from "@mui/material/Container";
import {Base64AdFactory__factory} from "../typechain";
import {parseUnits} from "@ethersproject/units";

const VALID_EXTENSIONS = {svg: "image/svg+xml", png: "image/png", jpeg: "image/jpeg"};

const IMAGE_DIMENSION = {width: 290, height: 430};

const getImageDimensions = async (file: File) => {
  const img = new Image();
  const _URL = window.URL || window.webkitURL;

  const objectUrl = _URL.createObjectURL(file);

  const promise = new Promise<{width: number, height: number}>((resolve, reject) => {
    img.onload = () => {
      _URL.revokeObjectURL(objectUrl);
      resolve({width: img.naturalWidth, height: img.naturalHeight});
    };

    img.onerror = reject;
  });

  img.src = objectUrl;

  return promise;
}

const getImageResult = async (file: File) => {
  return new Promise<string | ArrayBuffer>((resolve, reject) => {
    let reader = new FileReader();

    reader.onload = function(e) {
      const result = e?.target?.result || '';

      if (result === '') {
        reject();
      }

      resolve(result);
    };

    reader.onerror = reject;

    reader.readAsDataURL(file);
  });
}

const wrapSvg = async (file: File) => {
  const result = await getImageResult(file);

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${IMAGE_DIMENSION.width}" height="${IMAGE_DIMENSION.height}">
<image width="${IMAGE_DIMENSION.width}" height="${IMAGE_DIMENSION.height}" xlink:href="${result}"></image></svg>`
}

function AdsCreate() {

  const [svg, setSvg] = useState('');
  const [error, setError] = useState('');

  const { account, error: walletError } = useEthers();

  const { state, send } = useContractFunction(new Contract(process.env.REACT_APP_BASE64_AD_FACTORY as string, Base64AdFactory__factory.createInterface()), 'createAd');

  if (!account || walletError) {
    return <Alert severity="error">{showWalletError(walletError) || t`Connect your wallet to verify a market.`}</Alert>
  }

  const onClick = async () => {
    try {
      await send(
        btoa(svg),
        {
          value: parseUnits(String(30 + 6.9), 18),
        }
      );
    } catch (e: any) {
      alert(e?.message || t`Unexpected error`);
    }
  }

  if (state.status === 'Success') {
    return <Alert severity="success"><Trans>Ad created.</Trans></Alert>
  }

  const fileChangedHandler = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) {
      setError("Empty file");
      setSvg('');
      return false;
    }

    let file = event.target.files[0];

    if (!Object.values(VALID_EXTENSIONS).includes(file.type)) {
      setError("File type not supported. Must be svg, png or jpg.");
      setSvg('');
      return false;
    }

    const {height, width} = await getImageDimensions(file);

    if (height !== IMAGE_DIMENSION.height || width !== IMAGE_DIMENSION.width) {
      setError("Image dimension must be 290x430");
      setSvg('');
      return false;
    }

    const _svg = await wrapSvg(file);

    if (_svg.length > (1024 * 10)) {
      setError("SVG size must be lower than 10 KB");
      setSvg('');
      return false;
    }

    setError('');
    setSvg(_svg)
  }

  return <Container>
    <div>
      {state.errorMessage && <Alert severity="error" sx={{mb: 2}}>{state.errorMessage}</Alert>}
      <FormRow>
        <FormLabel><Trans>Image</Trans></FormLabel>
        <div style={{width: '100%'}}>
          <input
            name="file"
            id="contained-button-file"
            type="file"
            style={{ display: "none" }}
            onChange={fileChangedHandler}
          />
          <label htmlFor="contained-button-file">
            <Button variant="contained" color="primary" component="span">
              Upload
            </Button>
          </label>
          {error !== '' && <Alert severity="error" sx={{mt: 2}}>{error}</Alert>}
        </div>
      </FormRow>

      {svg && <>
        <FormRow>
          <div dangerouslySetInnerHTML={{__html: svg}}></div>
        </FormRow>
        <FormRow>
          <div style={{textAlign: 'center', width: '100%', marginTop: '20px'}}>
            <Button onClick={onClick}><Trans>Submit Ad</Trans></Button>
          </div>
        </FormRow>
      </>}
    </div>
  </Container>
}

export default AdsCreate;
