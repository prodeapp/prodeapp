import React, {useContext, useEffect, useState} from "react";
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import {MarketStatus, UseMarketsProps} from "../hooks/useMarkets";
import {getCategoryText, getFlattenedCategories} from "../lib/helpers";
import {FormControlLabel, FormGroup, Switch} from "@mui/material";
import {Trans} from '@lingui/macro';
import {styled} from "@mui/material/styles";
import {Radio} from "./Radio";
import {ReactComponent as DropdownArrow} from "../assets/icons/dropdown-down.svg";
import {GlobalContext} from "../lib/GlobalContext";

const FiltersWrapper = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  padding: theme.spacing(2),

  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
  },

  '.filter-columns': {
    display: 'flex',

    [theme.breakpoints.down('md')]: {
      flexDirection: 'column',
      '&>div+div': {
        marginTop: '15px',
      },
    },

    '&>div': {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',

      [theme.breakpoints.up('md')]: {
        flexDirection: 'row',

        '&+div': {
          marginLeft: '20px',
        },
      },
    },

    '.filter-label': {
      fontWeight: 'bold',
      marginRight: '10px',

      [theme.breakpoints.down('md')]: {
        marginRight: 0,
        marginBottom: '5px',
      },
    },
  },

  '& > div': {
    [theme.breakpoints.down('md')]: {
      marginTop: theme.spacing(2),
    },
  },
}));

const FilterSection = styled('div')(({ theme }) => ({
  background: theme.palette.secondary.main,
  padding: '15px 0',

  '&>div': {
    maxWidth: '600px',
    margin: '0 auto',
  },
}));

type FilterDropdownProps = React.HTMLAttributes<HTMLDivElement> & {
  isOpen: boolean
}

const FilterDropdownStyled = styled('div')(({ theme }) => ({
  position: 'relative',
  cursor: 'pointer',
  'svg': {
    fill: theme.palette.primary.main,
  },
  '&.open svg': {
    fill: theme.palette.black.dark,
    transform: 'rotate(180deg)',
  },
}));

function FilterDropdown(props: FilterDropdownProps) {
  const {isOpen, children, ...rest} = props;

  return <FilterDropdownStyled {...rest} className={isOpen ? 'open' : ''}>
    <span>{children} <DropdownArrow style={{marginLeft: '6px'}}/></span>
  </FilterDropdownStyled>
}

type MarketsFilterProps = {
  setMarketFilters: (data: UseMarketsProps) => void
}

function MarketsFilter({setMarketFilters}: MarketsFilterProps) {
  const [activeSection, setActiveSection] = useState<'category' | ''>('');

  const {marketFilters} = useContext(GlobalContext);

  const {
    curated, setCurated,
    status, setStatus,
    category, setCategory
  } = marketFilters;

  const changeStatus = (newStatus: MarketStatus) => {
    setStatus(newStatus === status ? undefined : newStatus)
  }

  const getMarketFilters= () => {
    return {
      curated: curated ? curated : undefined,
      status,
      category: category === 'All'? '' : category,
      minEvents: 3
    };
  }

  useEffect(() => {
    setMarketFilters(getMarketFilters());
  // eslint-disable-next-line
  }, [curated, status, category]);

  useEffect(() => {
    setMarketFilters(getMarketFilters());
  // eslint-disable-next-line
  }, []);

  return (
    <div>
      <FiltersWrapper>
        <div className="filter-columns">
          <div>
            <div className="filter-label"><Trans>Status</Trans>:</div>
            <Box sx={{ display:'flex', justifyContent: 'center', alignItems: 'center'}}>
              <div><Button onClick={() => changeStatus('active')} color={status === 'active' ? 'primary' : 'secondary'}><Trans>Betting</Trans></Button></div>
              <div><Button onClick={() => changeStatus('pending')} color={status === 'pending' ? 'primary' : 'secondary'}><Trans>Playing</Trans></Button></div>
              <div><Button onClick={() => changeStatus('closed')} color={status === 'closed' ? 'primary' : 'secondary'}><Trans>Closed</Trans></Button></div>
            </Box>
          </div>
          <div>
            <div className="filter-label"><Trans>Category</Trans>:</div>
            <FilterDropdown isOpen={activeSection === 'category'} onClick={() => setActiveSection(activeSection === 'category' ? '' : 'category')}>{category === 'All' ? 'All' : getCategoryText(category)}</FilterDropdown>
          </div>
        </div>
        <div>
          <Box sx={{ display:'flex', justifyContent: 'center', alignItems: 'center'}}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={curated}
                    onClick={() => setCurated(!curated)}
                  />}
                label={<Trans>Only verified markets</Trans>}/>
            </FormGroup>
          </Box>
        </div>
      </FiltersWrapper>
      {activeSection === 'category' && <FilterSection>
        <Grid container spacing={0}>
          <Grid item xs={6} sm={3} >
            <Radio active={category === 'All'} onClick={() => setCategory('All')}><Trans>All</Trans></Radio>
          </Grid>
          {getFlattenedCategories().map(cat => <Grid item xs={6} sm={3} key={cat.id}>
            <Radio active={category === cat.id} onClick={() => setCategory(cat.id)}>{cat.text}</Radio>
          </Grid>)}
        </Grid>
      </FilterSection>}
    </div>
  );
}

export default MarketsFilter;