import { Typography } from '@mui/material'
import { useParams } from 'react-router-dom';

export default function User() {
    const { id } = useParams();
    return (
    <Typography variant="h5">User: {id}</Typography>
  )
}
