import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/joy/Box';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import Typography from '@mui/joy/Typography';
import Button from '@mui/joy/Button';
import Divider from '@mui/joy/Divider';
import CircularProgress from '@mui/joy/CircularProgress';
import { useAuth } from '../../context/AuthContext';
import { getDoctorBookings } from '../../api/doctor';
import { getDoctorSlots } from '../../api/doctor';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('[DoctorDashboard] Loading bookings and slots');
        const [bookingsRes, slotsRes] = await Promise.all([
          getDoctorBookings(),
          getDoctorSlots(),
        ]);
        setBookings(bookingsRes.data);
        setSlots(slotsRes.data);
        console.log(`[DoctorDashboard] Loaded ${bookingsRes.data.length} bookings and ${slotsRes.data.length} slots`);
      } catch (err) {
        console.error('[DoctorDashboard] Error loading dashboard:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const pending = bookings.filter((b) => b.status === 'pending').length;
  const approved = bookings.filter((b) => b.status === 'approved').length;
  const todaySlots = slots.filter((s) => {
    const slotDate = new Date(s.start_time).toDateString();
    return slotDate === new Date().toDateString();
  });
  const availableToday = todaySlots.filter((s) => !s.is_booked).length;

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
          Good {getTimeOfDay()}, Dr. {user?.name?.split(' ')[0]}
        </Typography>
        <Typography level="body-sm">
          Here's a quick overview of your practice today
        </Typography>
      </Box>

      {/* stats cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 2,
          mb: 4,
        }}
      >
        <StatCard label="Pending Bookings" value={pending} color="#f59e0b" />
        <StatCard label="Approved Bookings" value={approved} color="#27ae60" />
        <StatCard label="Today's Slots" value={todaySlots.length} color="#2b2d42" />
        <StatCard label="Available Today" value={availableToday} color="#8d99ae" />
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* quick actions */}
      <Typography level="h2" sx={{ mb: 2 }}>Quick Actions</Typography>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button
          size="lg"
          sx={{ backgroundColor: '#2b2d42', '&:hover': { backgroundColor: '#3d3f57' } }}
          onClick={() => navigate('/doctor/bookings')}
        >
          Manage Bookings
          {pending > 0 && (
            <Box
              component="span"
              sx={{
                ml: 1,
                backgroundColor: '#f59e0b',
                color: '#fff',
                borderRadius: '50%',
                width: 20,
                height: 20,
                fontSize: '0.7rem',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
              }}
            >
              {pending}
            </Box>
          )}
        </Button>

        <Button
          size="lg"
          variant="outlined"
          sx={{ borderColor: '#8d99ae', color: '#2b2d42', '&:hover': { backgroundColor: '#d0d9e0' } }}
          onClick={() => navigate('/doctor/slots')}
        >
          View Slots
        </Button>

        <Button
          size="lg"
          variant="outlined"
          sx={{ borderColor: '#8d99ae', color: '#2b2d42', '&:hover': { backgroundColor: '#d0d9e0' } }}
          onClick={() => navigate('/doctor/profile')}
        >
          Edit Profile
        </Button>
      </Box>

      {/* recent pending bookings */}
      {pending > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography level="h2" sx={{ mb: 2 }}>Pending Bookings</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {bookings
              .filter((b) => b.status === 'pending')
              .slice(0, 3)
              .map((booking) => (
                <Card key={booking.id} variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography level="h3">{booking.patient_name}</Typography>
                        <Typography level="body-sm">
                          Booked at: {new Date(booking.booked_at).toLocaleString('en-IN')}
                        </Typography>
                      </Box>
                      <Button
                        size="sm"
                        sx={{ backgroundColor: '#2b2d42', '&:hover': { backgroundColor: '#3d3f57' } }}
                        onClick={() => navigate('/doctor/bookings')}
                      >
                        Manage
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            {pending > 3 && (
              <Typography
                level="body-sm"
                sx={{ textAlign: 'center', cursor: 'pointer', color: '#8d99ae' }}
                onClick={() => navigate('/doctor/bookings')}
              >
                + {pending - 3} more pending bookings
              </Typography>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
}

// helper components
function StatCard({ label, value, color }) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography level="body-sm" sx={{ color: '#8d99ae', mb: 0.5 }}>
          {label}
        </Typography>
        <Typography level="h1" sx={{ color, fontWeight: 700 }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  return 'Evening';
}