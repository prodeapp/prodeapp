import {UseFormRegister, FieldErrors} from "react-hook-form";
import React, {useEffect} from "react";
import {FormError} from "../index";
import {ErrorMessage} from "@hookform/error-message";
import {MarketFormValues} from "./MarketForm";
import TextField from '@mui/material/TextField';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import {buildBasicTemplate, MarketTemplate} from "../../lib/templates";
import {marketsTemplates} from "../../lib/templates";

type QuestionBuilderProps = {
  eventIndex: number
  onTemplateChange: (questionPlaceholder: string, answers: string[]) => void
  register: UseFormRegister<MarketFormValues>
  errors: FieldErrors<MarketFormValues>
}

type AutocompleteQuestionProps = {
  eventIndex: number
  onTemplateChange: (questionPlaceholder: string, answers: string[]) => void
  register: UseFormRegister<MarketFormValues>
}

interface MarketTemplateOptionType extends MarketTemplate {
  inputValue?: string;
}

const filter = createFilterOptions<MarketTemplateOptionType>();

function AutocompleteQuestion({eventIndex, onTemplateChange, register}: AutocompleteQuestionProps) {
  const [value, setValue] = React.useState<MarketTemplateOptionType | null>(null);

  useEffect(() => {
    if (value !== null) {
      onTemplateChange(
        value.q,
        value.inputValue ? [] : value.a.map((a) => a)
      );
    }
  }, [value, onTemplateChange])

  return (
    <Autocomplete
      value={value}
      onChange={(event, newValue) => {
        if (typeof newValue === 'string') {
          setValue(buildBasicTemplate(newValue));
        } else if (newValue && newValue.inputValue) {
          // Create a new value from the user input
          setValue(buildBasicTemplate(newValue.inputValue));
        } else {
          setValue(newValue);
        }
      }}
      filterOptions={(options, params) => {
        const filtered = filter(options, params);

        const { inputValue } = params;
        // Suggest the creation of a new value
        const isExisting = options.some((option) => inputValue === option.q);
        if (inputValue !== '' && !isExisting) {
          const newOption: MarketTemplateOptionType = buildBasicTemplate(inputValue)
          newOption.inputValue = inputValue;
          newOption.q = `Add template: "${inputValue}"`;
          filtered.push(newOption);
        }

        return filtered;
      }}
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      options={marketsTemplates as MarketTemplateOptionType[]}
      getOptionLabel={(option) => {
        // Value selected with enter, right from the input
        if (typeof option === 'string') {
          return option;
        }
        // Add "xxx" option created dynamically
        if (option.inputValue) {
          return option.inputValue;
        }
        // Regular option
        return option.q;
      }}
      renderOption={(props, option) => <li {...props}>{option.q}</li>}
      sx={{ width: '100%' }}
      freeSolo
      renderInput={(params) => (
        <TextField {...params} {...register(`events.${eventIndex}.questionPlaceholder`, {
          required: 'This field is required.'
        })} style={{flexGrow: 1}} />
      )}
    />
  );
}

export default function QuestionBuilder({eventIndex, onTemplateChange, register, errors}: QuestionBuilderProps) {
  return <div style={{flexGrow: 1}}>
    <div style={{display: 'flex'}}>
      <AutocompleteQuestion {...{eventIndex, onTemplateChange, register}} />
    </div>
    <FormError><ErrorMessage errors={errors} name={`events.${eventIndex}.questionPlaceholder`} /></FormError>
  </div>
}
