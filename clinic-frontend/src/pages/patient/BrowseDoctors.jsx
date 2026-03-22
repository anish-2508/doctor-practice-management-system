import { useEffect, useState } from 'react';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import CircularProgress from '@mui/joy/CircularProgress';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import Button from '@mui/joy/Button';
import Grid from '@mui/joy/Grid';
import Input from '@mui/joy/Input';
import { getDoctors } from '../../api/public';
import DoctorCard from '../../components/DoctorCard';
import { SPECIALIZATIONS, SERVICES } from '../../constants';

export default function BrowseDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [specialization, setSpecialization] = useState('');
  const [service, setService] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    console.log('[BrowseDoctors] Component mounted, loading doctors');
    fetchDoctors();
  }, []);

  const fetchDoctors = async (filters = {}) => {
    setLoading(true);
    try {
      console.log('[BrowseDoctors] Fetching doctors with filters:', filters);
      const res = await getDoctors(filters);
      setDoctors(res.data);
      console.log(`[BrowseDoctors] Loaded ${res.data.length} doctors`);
    } catch (err) {
      console.error('[BrowseDoctors] Error fetching doctors:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    const filters = {};
    if (specialization) filters.specialization = specialization;
    if (service) filters.service = service;
    console.log('[BrowseDoctors] Applying filters');
    fetchDoctors(filters);
  };

  const handleClear = () => {
    console.log('[BrowseDoctors] Clearing filters');
    setSpecialization('');
    setService('');
    setSearch('');
    fetchDoctors();
  };

  // client side search by name on top of server side filters
  const filtered = doctors.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#edf2f4', px: 4, py: 4 }}>

      {/* header */}
      <Box sx={{ mb: 4 }}>
        <Typography level="h1">Find a Doctor</Typography>
        <Typography level="body-sm">
          {doctors.length} doctor{doctors.length !== 1 ? 's' : ''} available
        </Typography>
      </Box>

      {/* filters */}
      <Box
        sx={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          p: 2,
          mb: 4,
          display: 'flex',
          gap: 2,
          flexWrap: 'wrap',
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(43,45,66,0.06)',
        }}
      >
        {/* name search */}
        <Input
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 200 }}
        />

        {/* specialization */}
        <Select
          placeholder="Specialization"
          value={specialization}
          onChange={(_, val) => setSpecialization(val)}
          sx={{ minWidth: 200 }}
        >
          {SPECIALIZATIONS.map((s) => (
            <Option key={s} value={s}>
              {s.replace(/_/g, ' ')}
            </Option>
          ))}
        </Select>

        {/* service */}
        <Select
          placeholder="Service"
          value={service}
          onChange={(_, val) => setService(val)}
          sx={{ minWidth: 200 }}
        >
          {SERVICES.map((s) => (
            <Option key={s} value={s}>
              {s.replace(/_/g, ' ')}
            </Option>
          ))}
        </Select>

        <Button
          sx={{ backgroundColor: '#2b2d42', '&:hover': { backgroundColor: '#3d3f57' } }}
          onClick={handleFilter}
        >
          Apply
        </Button>

        <Button
          variant="outlined"
          sx={{ borderColor: '#8d99ae', color: '#2b2d42' }}
          onClick={handleClear}
        >
          Clear
        </Button>
      </Box>

      {/* results */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#2b2d42' }} />
        </Box>
      ) : filtered.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography level="body-md" sx={{ color: '#8d99ae' }}>
            No doctors found. Try adjusting your filters.
          </Typography>
          <Button
            variant="outlined"
            sx={{ mt: 2, borderColor: '#8d99ae', color: '#2b2d42' }}
            onClick={handleClear}
          >
            Clear Filters
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filtered.map((doctor) => (
            <Grid key={doctor.id} xs={12} sm={6} md={4}>
              <DoctorCard doctor={doctor} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}