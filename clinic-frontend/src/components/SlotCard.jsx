import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import Typography from '@mui/joy/Typography';
import Chip from '@mui/joy/Chip';
import Button from '@mui/joy/Button';
import Box from '@mui/joy/Box';

export default function SlotCard({ slot, onBook, showBookButton = true }) {
  const start = new Date(slot.start_time);
  const end = new Date(slot.end_time);

  const formatTime = (date) =>
    date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const formatDate = (date) =>
    date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    <Card
      variant="outlined"
      sx={{
        backgroundColor: slot.is_booked ? '#f5f5f5' : '#ffffff',
        opacity: slot.is_booked ? 0.7 : 1,
      }}
    >
      <CardContent>
        <Typography level="body-sm" sx={{ color: '#8d99ae', mb: 0.5 }}>
          {formatDate(start)}
        </Typography>

        <Typography level="h3" sx={{ mb: 1 }}>
          {formatTime(start)} — {formatTime(end)}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Chip
            size="sm"
            variant="soft"
            sx={{
              backgroundColor: slot.is_booked ? '#f0d0d0' : '#d0f0d0',
              color: slot.is_booked ? '#c0392b' : '#27ae60',
            }}
          >
            {slot.is_booked ? 'Booked' : 'Available'}
          </Chip>

          {showBookButton && !slot.is_booked && (
            <Button
              size="sm"
              variant="solid"
              sx={{ backgroundColor: '#2b2d42', '&:hover': { backgroundColor: '#3d3f57' } }}
              onClick={() => onBook(slot)}
            >
              Book
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}