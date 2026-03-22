import { useEffect, useState } from 'react';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import CircularProgress from '@mui/joy/CircularProgress';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import Grid from '@mui/joy/Grid';
import { getPatientBookings, cancelBooking } from '../../api/patient';
import BookingCard from '../../components/BookingCard';

export default function PatientBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      console.log('[PatientBookings] Fetching patient bookings');
      const res = await getPatientBookings();
      setBookings(res.data);
      console.log(`[PatientBookings] Loaded ${res.data.length} bookings`);
    } catch (err) {
      console.error('[PatientBookings] Error fetching bookings:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    setActionLoading(bookingId);
    try {
      console.log(`[PatientBookings] Cancelling booking ${bookingId}`);
      await cancelBooking(bookingId);
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' } : b))
      );
      console.log(`[PatientBookings] Booking ${bookingId} cancelled successfully`);
    } catch (err) {
      console.error('[PatientBookings] Error cancelling booking:', err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = filter === 'all'
    ? bookings
    : bookings.filter((b) => b.status === filter);

  const counts = {
    all: bookings.length,
    pending: bookings.filter((b) => b.status === 'pending').length,
    approved: bookings.filter((b) => b.status === 'approved').length,
    rejected: bookings.filter((b) => b.status === 'rejected').length,
    cancelled: bookings.filter((b) => b.status === 'cancelled').length,
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography level="h1">My Bookings</Typography>
          <Typography level="body-sm">
            {counts.pending > 0
              ? `${counts.pending} pending · ${counts.approved} approved`
              : 'All bookings history'}
          </Typography>
        </Box>

        <Select
          value={filter}
          onChange={(_, val) => setFilter(val)}
          sx={{ minWidth: 160 }}
        >
          <Option value="all">All ({counts.all})</Option>
          <Option value="pending">Pending ({counts.pending})</Option>
          <Option value="approved">Approved ({counts.approved})</Option>
          <Option value="rejected">Rejected ({counts.rejected})</Option>
          <Option value="cancelled">Cancelled ({counts.cancelled})</Option>
        </Select>
      </Box>

      {/* bookings list */}
      {filtered.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography level="body-md" sx={{ color: '#8d99ae' }}>
            No {filter === 'all' ? '' : filter} bookings found.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {filtered.map((booking) => (
            <Grid key={booking.id} xs={12} sm={6} md={4}>
              <BookingCard
                booking={booking}
                role="patient"
                onCancel={handleCancel}
                loading={actionLoading === booking.id}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}