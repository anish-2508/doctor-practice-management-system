import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/joy/Box';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import Typography from '@mui/joy/Typography';
import Button from '@mui/joy/Button';
import Chip from '@mui/joy/Chip';
import Divider from '@mui/joy/Divider';
import CircularProgress from '@mui/joy/CircularProgress';
import { useAuth } from '../../context/AuthContext';
import { getUpcomingBookings } from '../../api/patient';

export default function PatientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpcoming = async () => {
      try {
        console.log('[PatientDashboard] Loading upcoming bookings');
        const res = await getUpcomingBookings();
        setUpcoming(res.data);
        console.log(`[PatientDashboard] Loaded ${res.data.length} upcoming bookings`);
      } catch (err) {
        console.error('[PatientDashboard] Error loading bookings:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUpcoming();
  }, []);

  const statusColors = {
    pending: { bg: '#fff8e1', color: '#f59e0b' },
    approved: { bg: '#e8f5e9', color: '#27ae60' },
    rejected: { bg: '#fdecea', color: '#c0392b' },
    cancelled: { bg: '#f5f5f5', color: '#8d99ae' },
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

      {/* greeting */}
      <Box sx={{ mb: 4 }}>
        <Typography level="h1">
          Good {getTimeOfDay()}, {user?.name?.split(' ')[0]}
        </Typography>
        <Typography level="body-sm">
          {upcoming.length > 0
            ? `You have ${upcoming.length} upcoming appointment${upcoming.length > 1 ? 's' : ''}`
            : 'You have no upcoming appointments'}
        </Typography>
      </Box>

      {/* quick actions */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 4 }}>
        <Button
          size="lg"
          sx={{ backgroundColor: '#2b2d42', '&:hover': { backgroundColor: '#3d3f57' } }}
          onClick={() => navigate('/patient/browse')}
        >
          Find a Doctor
        </Button>
        <Button
          size="lg"
          variant="outlined"
          sx={{ borderColor: '#8d99ae', color: '#2b2d42', '&:hover': { backgroundColor: '#d0d9e0' } }}
          onClick={() => navigate('/patient/bookings')}
        >
          View All Bookings
        </Button>
        <Button
          size="lg"
          variant="outlined"
          sx={{ borderColor: '#8d99ae', color: '#2b2d42', '&:hover': { backgroundColor: '#d0d9e0' } }}
          onClick={() => navigate('/patient/records')}
        >
          Medical Records
        </Button>
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* upcoming bookings */}
      <Typography level="h2" sx={{ mb: 2 }}>Upcoming Appointments</Typography>

      {upcoming.length === 0 ? (
        <Card variant="outlined">
          <CardContent>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography level="body-md" sx={{ color: '#8d99ae', mb: 2 }}>
                No upcoming appointments. Book one now!
              </Typography>
              <Button
                sx={{ backgroundColor: '#2b2d42', '&:hover': { backgroundColor: '#3d3f57' } }}
                onClick={() => navigate('/patient/browse')}
              >
                Browse Doctors
              </Button>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {upcoming.slice(0, 5).map((booking) => {
            const { bg, color } = statusColors[booking.status] || statusColors.pending;
            return (
              <Card key={booking.id} variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography level="h3">
                        Booking #{booking.id.slice(-6)}
                      </Typography>
                      <Typography level="body-sm" sx={{ mt: 0.5 }}>
                        Booked at: {new Date(booking.booked_at).toLocaleString('en-IN')}
                      </Typography>
                    </Box>
                    <Chip
                      size="sm"
                      sx={{ backgroundColor: bg, color, fontWeight: 600, textTransform: 'capitalize' }}
                    >
                      {booking.status}
                    </Chip>
                  </Box>
                </CardContent>
              </Card>
            );
          })}

          {upcoming.length > 5 && (
            <Typography
              level="body-sm"
              sx={{ textAlign: 'center', cursor: 'pointer', color: '#8d99ae' }}
              onClick={() => navigate('/patient/bookings')}
            >
              + {upcoming.length - 5} more appointments
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
}

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  return 'Evening';
}
