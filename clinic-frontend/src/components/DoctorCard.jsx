import { useNavigate } from 'react-router-dom';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import Typography from '@mui/joy/Typography';
import Chip from '@mui/joy/Chip';
import Button from '@mui/joy/Button';
import Box from '@mui/joy/Box';
import Divider from '@mui/joy/Divider';

export default function DoctorCard({ doctor }) {
  const navigate = useNavigate();

  return (
    <Card
      variant="outlined"
      sx={{
        width: '100%',
        transition: 'box-shadow 0.2s',
        '&:hover': { boxShadow: '0 4px 16px rgba(43,45,66,0.12)' },
      }}
    >
      <CardContent>
        {/* name and specialization */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box>
            <Typography level="h3">{doctor.name}</Typography>
            <Typography level="body-sm" sx={{ textTransform: 'capitalize' }}>
              {doctor.specialization.replace('_', ' ')}
            </Typography>
          </Box>
          <Typography level="body-sm" sx={{ color: '#2b2d42', fontWeight: 600 }}>
            ₹{doctor.consultation_fee}
          </Typography>
        </Box>

        <Divider sx={{ my: 1 }} />

        {/* experience */}
        <Typography level="body-sm" sx={{ mb: 1 }}>
          {doctor.years_of_exp} {doctor.years_of_exp === 1 ? 'year' : 'years'} of experience
        </Typography>

        {/* services */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
          {doctor.services.map((service) => (
            <Chip
              key={service}
              size="sm"
              variant="soft"
              sx={{ textTransform: 'capitalize', backgroundColor: '#edf2f4', color: '#2b2d42' }}
            >
              {service.replace(/_/g, ' ')}
            </Chip>
          ))}
        </Box>

        <Button
          fullWidth
          variant="solid"
          sx={{ backgroundColor: '#2b2d42', '&:hover': { backgroundColor: '#3d3f57' } }}
          onClick={() => navigate(`/doctors/${doctor.id}`)}
        >
          View Profile & Book
        </Button>
      </CardContent>
    </Card>
  );
}