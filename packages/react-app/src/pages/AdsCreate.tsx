import React, {useState} from "react";
import {FormRow, FormLabel, FormError} from "../components"
import Button from '@mui/material/Button';
import {useContractFunction, useEthers} from "@usedapp/core";
import {Contract} from "@ethersproject/contracts";
import Alert from "@mui/material/Alert";
import { Trans, t } from "@lingui/macro";
import {showWalletError} from "../lib/helpers";
import Container from "@mui/material/Container";
import {SVGFactory__factory} from "../typechain";
import {useSVGAdFactoryDeposit} from "../hooks/useSVGFactoryDeposit";
import {AdImg} from "../components/ImgSvg";
import TextField from "@mui/material/TextField";
import {ErrorMessage} from "@hookform/error-message";
import {useForm} from "react-hook-form";
import {Typography} from "@mui/material";
import {Banner} from "./MarketsCreate";
import CircularProgress from "@mui/material/CircularProgress";

const VALID_EXTENSIONS = {svg: "image/svg+xml", png: "image/png", jpeg: "image/jpeg"};

const IMAGE_DIMENSION = {width: 290, height: 430};

interface AdCreateFormValues {
  url: string
}

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

const isValidUrl = (url: string) => {
  try {
    new URL(url);
  } catch (e) {
    return false;
  }
  return true;
};

function AdsCreate() {

  const [svg, setSvg] = useState('');
  const [error, setError] = useState('');

  const { account, error: walletError } = useEthers();

  const { state, send } = useContractFunction(new Contract(process.env.REACT_APP_SVG_AD_FACTORY as string, SVGFactory__factory.createInterface()), 'createAd');

  const baseDeposit = useSVGAdFactoryDeposit();

  const {register, handleSubmit, formState} = useForm<AdCreateFormValues>({
    mode: 'all',
    defaultValues: {
      url: '',
    }});

  const {errors, isValid} = formState;

  const showError = showWalletError(walletError)
  if (!account || showError) {
    return <Alert severity="error">{showError || t`Connect your wallet to create an ad.`}</Alert>
  }

  const onSubmit = async (data: AdCreateFormValues) => {
    try {
      await send(
        btoa(svg),
        data.url,
        {
          value: baseDeposit,
        }
      );
    } catch (e: any) {
      alert(e?.message || t`Unexpected error`);
    }
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

  return <div>
    <Banner style={{backgroundImage: 'url(/banners/banner-3.jpg)', marginBottom: '50px'}}>
      <Typography variant="h1s"><Trans>Create a new ad</Trans></Typography>
    </Banner>

    <Container>

      {state.status === 'Success' && <Alert severity="success"><Trans>Ad created.</Trans></Alert>}

      {state.status === 'Mining' && <div style={{textAlign: 'center', marginBottom: 15}}><CircularProgress /></div>}

      {state.status !== 'Success' && state.status !== 'Mining' &&
      <form onSubmit={handleSubmit(onSubmit)} style={{width: '100%', maxWidth: '675px'}}>
        {state.errorMessage && <Alert severity="error" sx={{mb: 2}}>{state.errorMessage}</Alert>}
        <FormRow>
          <FormLabel><Trans>Image</Trans></FormLabel>
          <div style={{width: '100%'}}>
            <input
              name="file"
              id="contained-button-file"
              type="file"
              style={{display: "none"}}
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

        <FormRow>
          <FormLabel>URL</FormLabel>
          <div>
            <TextField {...register('url', {
              required: t`This field is required.`,
              validate: v => isValidUrl(v) || t`Invalid URL`,
            })} error={!!errors.url} style={{width: '100%'}}/>
            <FormError><ErrorMessage errors={errors} name="url"/></FormError>
          </div>
        </FormRow>

        <FormRow>
          The ad must follow the <a href="https://ipfs.kleros.io/ipfs/QmeycGJx3HUBjC3cbgtKqfgD6N4eZtZDn8tmCuJZPMVrQt/ad-content-curation-policy.pdf" target="_blank" rel="noopener noreferrer">Ad Content Moderation Policy</a>
        </FormRow>

        {isValid && svg && <>
          <div style={{textAlign: 'center', marginBottom: '30px'}}>
            <AdImg svg={svg} type="svg" width={290}/>
          </div>
          <div style={{marginBottom: '20px'}}>
            <Button type="submit" fullWidth size="large"><Trans>Submit Ad</Trans></Button>
          </div>
        </>}
      </form>}
    </Container>
  </div>
}

export default AdsCreate;
