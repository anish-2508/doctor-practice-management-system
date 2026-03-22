import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Input from '@mui/joy/Input';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import Grid from '@mui/joy/Grid';
import CircularProgress from '@mui/joy/CircularProgress';
import Button from '@mui/joy/Button';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import DoctorCard from '../components/DoctorCard';
import { getDoctors } from '../api/public';
import { SPECIALIZATIONS, SERVICES } from '../constants';

export default function Landing() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [specialization, setSpecialization] = useState('');
  const [service, setService] = useState('');
  const navigate = useNavigate();

  const fetchDoctors = async (filters = {}) => {
    setLoading(true);
    try {
      console.log('[Landing] Fetching doctors with filters:', filters);
      const res = await getDoctors(filters);
      setDoctors(res.data);
      console.log(`[Landing] Fetched ${res.data.length} doctors`);
    } catch (err) {
      console.error('[Landing] Error fetching doctors:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('[Landing] Component mounted, loading doctors');
    fetchDoctors();
  }, []);

  const handleFilter = () => {
    const filters = {};
    if (specialization) filters.specialization = specialization;
    if (service) filters.service = service;
    console.log('[Landing] Applying filters');
    fetchDoctors(filters);
  };

  const handleClear = () => {
    console.log('[Landing] Clearing filters');
    setSpecialization('');
    setService('');
    fetchDoctors();
  };

  const handleBrowseAll = () => {
    console.log('[Landing] Browsing all doctors');
    navigate('/patient/browse');
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>

      {/* HERO SECTION WITH SEARCH */}
      <Box
        sx={{
          backgroundColor: '#2b2d42',
          py: 6,
          px: 4,
          textAlign: 'center',
        }}
      >
        <Typography level="h1" sx={{ color: '#ffffff', mb: 1, fontSize: '2.5rem' }}>
          Find & Book Appointments with Top Doctors
        </Typography>
        <Typography level="body-md" sx={{ color: '#8d99ae', mb: 4 }}>
          Search by specialization, book instantly, and consult online or in-person
        </Typography>

        {/* Search Bar */}
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            maxWidth: 600,
            mx: 'auto',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <Select
            placeholder="Select Specialization"
            value={specialization}
            onChange={(_, val) => setSpecialization(val)}
            sx={{ minWidth: 200, backgroundColor: '#ffffff' }}
          >
            {SPECIALIZATIONS.map((s) => (
              <Option key={s} value={s}>
                {s.replace(/_/g, ' ')}
              </Option>
            ))}
          </Select>

          <Select
            placeholder="Select Service"
            value={service}
            onChange={(_, val) => setService(val)}
            sx={{ minWidth: 200, backgroundColor: '#ffffff' }}
          >
            {SERVICES.map((s) => (
              <Option key={s} value={s}>
                {s.replace(/_/g, ' ')}
              </Option>
            ))}
          </Select>

          <Button
            size="lg"
            sx={{ backgroundColor: '#8d99ae', '&:hover': { backgroundColor: '#6d7d8e' } }}
            onClick={handleFilter}
          >
            Search
          </Button>
        </Box>
      </Box>

      {/* QUICK ACTION CARDS */}
      <Box sx={{ px: 4, py: 6, backgroundColor: '#ffffff' }}>
        <Grid container spacing={2} sx={{ mb: 0 }}>
          {[
            { title: 'Instant Consultation', desc: 'Video call with doctors now' },
            { title: 'Book Appointment', desc: 'Schedule at your convenience' },
            { title: 'Verified Doctors', desc: 'All doctors are verified experts' },
            { title: '24/7 Available', desc: 'Book anytime, anywhere' },
          ].map((item, idx) => (
            <Grid key={idx} xs={12} sm={6} md={3}>
              <Card
                sx={{
                  backgroundColor: '#f5f5f5',
                  border: 'none',
                  boxShadow: 'none',
                  textAlign: 'center',
                  p: 2,
                }}
              >
                <CardContent>
                  <Typography level="h4" sx={{ color: '#2b2d42', mb: 1 }}>
                    {item.title}
                  </Typography>
                  <Typography level="body-sm" sx={{ color: '#8d99ae' }}>
                    {item.desc}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* HOW IT WORKS */}
      <Box sx={{ px: 4, py: 6, backgroundColor: '#edf2f4' }}>
        <Typography level="h2" sx={{ textAlign: 'center', mb: 4, color: '#2b2d42' }}>
          How It Works
        </Typography>
        <Grid container spacing={3} sx={{ maxWidth: 900, mx: 'auto' }}>
          {[
            { step: '1', title: 'Search Doctors', desc: 'Find the right specialist for your needs' },
            { step: '2', title: 'Check Availability', desc: 'View their schedules and book slots' },
            { step: '3', title: 'Book Appointment', desc: 'Confirm your appointment instantly' },
            { step: '4', title: 'Consult', desc: 'Meet online or visit the clinic' },
          ].map((item, idx) => (
            <Grid key={idx} xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 50,
                    height: 50,
                    backgroundColor: '#2b2d42',
                    color: '#ffffff',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                    mx: 'auto',
                    fontSize: '1.5rem',
                    fontWeight: 700,
                  }}
                >
                  {item.step}
                </Box>
                <Typography level="h4" sx={{ color: '#2b2d42', mb: 0.5 }}>
                  {item.title}
                </Typography>
                <Typography level="body-sm" sx={{ color: '#8d99ae' }}>
                  {item.desc}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* FEATURED DOCTORS */}
      <Box sx={{ px: 4, py: 6, backgroundColor: '#ffffff' }}>
        <Typography level="h2" sx={{ textAlign: 'center', mb: 1, color: '#2b2d42' }}>
          Featured Doctors
        </Typography>
        <Typography level="body-md" sx={{ textAlign: 'center', color: '#8d99ae', mb: 4 }}>
          Top-rated specialists ready to help
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#2b2d42' }} />
          </Box>
        ) : doctors.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography level="body-md" sx={{ color: '#8d99ae' }}>
              No doctors found
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {doctors.slice(0, 6).map((doctor) => (
              <Grid key={doctor.id} xs={12} sm={6} md={4}>
                <DoctorCard doctor={doctor} />
              </Grid>
            ))}
          </Grid>
        )}

        {doctors.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button
              size="lg"
              variant="outlined"
              sx={{ borderColor: '#2b2d42', color: '#2b2d42' }}
              onClick={handleBrowseAll}
            >
              Browse All Doctors
            </Button>
          </Box>
        )}
      </Box>

      {/* CTA SECTION */}
      <Box
        sx={{
          backgroundColor: '#2b2d42',
          py: 6,
          px: 4,
          textAlign: 'center',
        }}
      >
        <Typography level="h2" sx={{ color: '#ffffff', mb: 2 }}>
          Ready to Book Your Appointment?
        </Typography>
        <Typography level="body-md" sx={{ color: '#8d99ae', mb: 4 }}>
          Join thousands of patients who trust us for their healthcare
        </Typography>
        <Button
          size="lg"
          sx={{ backgroundColor: '#8d99ae', '&:hover': { backgroundColor: '#6d7d8e' } }}
          onClick={() => navigate('/register/patient')}
        >
          Sign Up Now
        </Button>
      </Box>
    </Box>
  );
}