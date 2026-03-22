import { useEffect, useState } from 'react';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import CircularProgress from '@mui/joy/CircularProgress';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import Grid from '@mui/joy/Grid';
import Chip from '@mui/joy/Chip';
import { getDoctorSlots } from '../../api/doctor';
import SlotCard from '../../components/SlotCard';

export default function DoctorSlots() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState('all');

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    setLoading(true);
    try {
      console.log('[DoctorSlots] Fetching doctor slots');
      const res = await getDoctorSlots();
      setSlots(res.data);
      console.log(`[DoctorSlots] Loaded ${res.data.length} slots`);
    } catch (err) {
      console.error('[DoctorSlots] Error fetching slots:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // get unique dates from slots for date filter
  const uniqueDates = [
    ...new Set(
      slots.map((s) =>
        new Date(s.start_time).toLocaleDateString('en-IN', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        })
      )
    ),
  ];

  const filtered = slots.filter((s) => {
    const slotDate = new Date(s.start_time).toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });

    const matchesStatus =
      filter === 'all' ||
      (filter === 'available' && !s.is_booked) ||
      (filter === 'booked' && s.is_booked);

    const matchesDate = selectedDate === 'all' || slotDate === selectedDate;

    return matchesStatus && matchesDate;
  });

  const counts = {
    total: slots.length,
    available: slots.filter((s) => !s.is_booked).length,
    booked: slots.filter((s) => s.is_booked).length,
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress sx={{ color: '#2b2d42' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#edf2f4', px: 4, py: 4 }}>

      {/* header */}
      <Box sx={{ mb: 3 }}>
        <Typography level="h1">My Slots</Typography>
        <Typography level="body-sm">
          {counts.available} available · {counts.booked} booked · {counts.total} total
        </Typography>
      </Box>

      {/* filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>

        {/* status filter */}
        <Select
          value={filter}
          onChange={(_, val) => setFilter(val)}
          sx={{ minWidth: 160 }}
        >
          <Option value="all">All Slots</Option>
          <Option value="available">Available</Option>
          <Option value="booked">Booked</Option>
        </Select>

        {/* date filter chips */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            variant={selectedDate === 'all' ? 'solid' : 'outlined'}
            onClick={() => setSelectedDate('all')}
            sx={{
              cursor: 'pointer',
              backgroundColor: selectedDate === 'all' ? '#2b2d42' : 'transparent',
              color: selectedDate === 'all' ? '#ffffff' : '#2b2d42',
              borderColor: '#8d99ae',
            }}
          >
            All Days
          </Chip>
          {uniqueDates.map((date) => (
            <Chip
              key={date}
              variant={selectedDate === date ? 'solid' : 'outlined'}
              onClick={() => setSelectedDate(date)}
              sx={{
                cursor: 'pointer',
                backgroundColor: selectedDate === date ? '#2b2d42' : 'transparent',
                color: selectedDate === date ? '#ffffff' : '#2b2d42',
                borderColor: '#8d99ae',
              }}
            >
              {date}
            </Chip>
          ))}
        </Box>
      </Box>

      {/* slots grid */}
      {filtered.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography level="body-md" sx={{ color: '#8d99ae' }}>
            No slots found for the selected filters.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {filtered.map((slot) => (
            <Grid key={slot.id} xs={12} sm={6} md={4} lg={3}>
              <SlotCard
                slot={slot}
                showBookButton={false}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}