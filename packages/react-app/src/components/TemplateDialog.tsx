import React from "react";
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
import {useForm} from "react-hook-form";
import AppDialog, {DialogProps} from "../components/Dialog";
import DialogActions from "@mui/material/DialogActions";
import {MarketTemplate} from "../lib/templates";

type FormValues = {
  template: number
}

type TemplateDialogProps = DialogProps & {
  marketsTemplates: MarketTemplate[]
  onTemplateChange: (template?: MarketTemplate) => void
}

function TemplateDialog({open, handleClose, marketsTemplates, onTemplateChange}: TemplateDialogProps) {
  const { register, handleSubmit } = useForm<FormValues>({defaultValues: {
      template: 0,
    }});

  const onSubmit = (data: FormValues) => {
    onTemplateChange(marketsTemplates[data.template] || undefined);
  }

  const clickSubmit = () => {
    handleSubmit(onSubmit)();
  }

  const dialogActions = <DialogActions>
    <Button autoFocus onClick={clickSubmit} color="secondary">
      Change template
    </Button>
  </DialogActions>

  return (
    <AppDialog
      open={open}
      handleClose={handleClose}
      title="Market template"
      actions={dialogActions}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormControl fullWidth sx={{marginBottom: '20px'}}>
          <InputLabel id="market-template-label">Choose template</InputLabel>
          <Select
            labelId="market-template-label"
            id="demo-simple-select"
            label="Choose template"
            defaultValue={0}
            {...register('template', {required: 'This field is required.'})}
          >
            {marketsTemplates.map((template, i) => <MenuItem value={i} key={i}>{template.q}</MenuItem>)}
          </Select>
        </FormControl>
      </form>
    </AppDialog>
  );
}

export default TemplateDialog;
