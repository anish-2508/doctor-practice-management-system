import { useState } from 'react';
import Box from '@mui/joy/Box';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import Typography from '@mui/joy/Typography';
import Input from '@mui/joy/Input';
import Textarea from '@mui/joy/Textarea';
import Button from '@mui/joy/Button';
import FormLabel from '@mui/joy/FormLabel';
import FormControl from '@mui/joy/FormControl';
import FormHelperText from '@mui/joy/FormHelperText';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import Chip from '@mui/joy/Chip';
import Divider from '@mui/joy/Divider';
import { useAuth } from '../../context/AuthContext';
import { updateDoctorMe } from '../../api/doctor';
import { SPECIALIZATIONS, QUALIFICATIONS, SERVICES } from '../../constants';

const DAYS = [
  { label: 'Mon', value: 0 },
  { label: 'Tue', value: 1 },
  { label: 'Wed', value: 2 },
  { label: 'Thu', value: 3 },
  { label: 'Fri', value: 4 },
  { label: 'Sat', value: 5 },
  { label: 'Sun', value: 6 },
];

export default function DoctorProfile() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    name: user?.name || '',
    consultation_fee: user?.consultation_fee || '',
    work_start_time: user?.work_start_time || '',
    work_end_time: user?.work_end_time || '',
    slot_duration_mins: user?.slot_duration_mins || '',
    working_days: user?.working_days || [],
    years_of_exp: user?.years_of_exp || '',
    specialization: user?.specialization || '',
    qualifications: user?.qualifications || [],
    services: user?.services || [],
    bio: user?.bio || '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleDay = (day) => {
    setForm((prev) => ({
      ...prev,
      working_days: prev.working_days.includes(day)
        ? prev.working_days.filter((d) => d !== day)
        : [...prev.working_days, day],
    }));
  };

  const toggleMultiSelect = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }));
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      console.log('[DoctorProfile] Updating doctor profile');
      const payload = {
        ...form,
        consultation_fee: parseInt(form.consultation_fee),
        slot_duration_mins: parseInt(form.slot_duration_mins),
        years_of_exp: parseInt(form.years_of_exp),
      };
      const res = await updateDoctorMe(payload);
      updateUser(res.data);
      console.log('[DoctorProfile] Profile updated successfully');
      setSuccess('Profile updated successfully.');
      setEditing(false);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Update failed. Please try again.';
      console.error('[DoctorProfile] Error updating profile:', errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setForm({
      name: user?.name || '',
      consultation_fee: user?.consultation_fee || '',
      work_start_time: user?.work_start_time || '',
      work_end_time: user?.work_end_time || '',
      slot_duration_mins: user?.slot_duration_mins || '',
      working_days: user?.working_days || [],
      years_of_exp: user?.years_of_exp || '',
      specialization: user?.specialization || '',
      qualifications: user?.qualifications || [],
      services: user?.services || [],
      bio: user?.bio || '',
    });
    setError('');
    setEditing(false);
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#edf2f4', px: 4, py: 4 }}>
      <Box sx={{ maxWidth: 640, mx: 'auto' }}>

        {/* header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography level="h1">My Profile</Typography>
            <Typography level="body-sm">{user?.email}</Typography>
          </Box>
          {!editing && (
            <Button
              variant="outlined"
              sx={{ borderColor: '#8d99ae', color: '#2b2d42' }}
              onClick={() => setEditing(true)}
            >
              Edit Profile
            </Button>
          )}
        </Box>

        {success && (
          <Typography level="body-sm" sx={{ color: '#27ae60', mb: 2 }}>
            {success}
          </Typography>
        )}

        <Card variant="outlined">
          <CardContent sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>

            {/* basic info */}
            <Typography level="h3">Basic Information</Typography>

            <FormControl>
              <FormLabel>Full Name</FormLabel>
              {editing ? (
                <Input name="name" value={form.name} onChange={handleChange} />
              ) : (
                <Typography level="body-md">{user?.name}</Typography>
              )}
            </FormControl>

            <FormControl>
              <FormLabel>Consultation Fee (₹)</FormLabel>
              {editing ? (
                <Input name="consultation_fee" type="number" value={form.consultation_fee} onChange={handleChange} />
              ) : (
                <Typography level="body-md">₹{user?.consultation_fee}</Typography>
              )}
            </FormControl>

            <FormControl>
              <FormLabel>Years of Experience</FormLabel>
              {editing ? (
                <Input name="years_of_exp" type="number" value={form.years_of_exp} onChange={handleChange} />
              ) : (
                <Typography level="body-md">{user?.years_of_exp} years</Typography>
              )}
            </FormControl>

            <FormControl>
              <FormLabel>Bio</FormLabel>
              {editing ? (
                <Textarea name="bio" minRows={3} value={form.bio} onChange={handleChange} />
              ) : (
                <Typography level="body-md">{user?.bio}</Typography>
              )}
            </FormControl>

            <Divider />

            {/* schedule */}
            <Typography level="h3">Schedule</Typography>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl sx={{ flex: 1 }}>
                <FormLabel>Work Start Time</FormLabel>
                {editing ? (
                  <Input name="work_start_time" type="time" value={form.work_start_time} onChange={handleChange} />
                ) : (
                  <Typography level="body-md">{user?.work_start_time}</Typography>
                )}
              </FormControl>
              <FormControl sx={{ flex: 1 }}>
                <FormLabel>Work End Time</FormLabel>
                {editing ? (
                  <Input name="work_end_time" type="time" value={form.work_end_time} onChange={handleChange} />
                ) : (
                  <Typography level="body-md">{user?.work_end_time}</Typography>
                )}
              </FormControl>
            </Box>

            <FormControl>
              <FormLabel>Slot Duration (minutes)</FormLabel>
              {editing ? (
                <Input name="slot_duration_mins" type="number" value={form.slot_duration_mins} onChange={handleChange} />
              ) : (
                <Typography level="body-md">{user?.slot_duration_mins} mins</Typography>
              )}
            </FormControl>

            <FormControl>
              <FormLabel>Working Days</FormLabel>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
                {DAYS.map((day) => (
                  <Chip
                    key={day.value}
                    variant={form.working_days.includes(day.value) ? 'solid' : 'outlined'}
                    onClick={() => editing && toggleDay(day.value)}
                    sx={{
                      cursor: editing ? 'pointer' : 'default',
                      backgroundColor: form.working_days.includes(day.value) ? '#2b2d42' : 'transparent',
                      color: form.working_days.includes(day.value) ? '#ffffff' : '#2b2d42',
                      borderColor: '#8d99ae',
                    }}
                  >
                    {day.label}
                  </Chip>
                ))}
              </Box>
            </FormControl>

            <Divider />

            {/* expertise */}
            <Typography level="h3">Expertise</Typography>

            <FormControl>
              <FormLabel>Specialization</FormLabel>
              {editing ? (
                <Select
                  value={form.specialization}
                  onChange={(_, val) => setForm({ ...form, specialization: val })}
                >
                  {SPECIALIZATIONS.map((s) => (
                    <Option key={s} value={s}>{s.replace(/_/g, ' ')}</Option>
                  ))}
                </Select>
              ) : (
                <Typography level="body-md" sx={{ textTransform: 'capitalize' }}>
                  {user?.specialization?.replace(/_/g, ' ')}
                </Typography>
              )}
            </FormControl>

            <FormControl>
              <FormLabel>Qualifications</FormLabel>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
                {QUALIFICATIONS.map((q) => (
                  <Chip
                    key={q}
                    variant={form.qualifications.includes(q) ? 'solid' : 'outlined'}
                    onClick={() => editing && toggleMultiSelect('qualifications', q)}
                    sx={{
                      cursor: editing ? 'pointer' : 'default',
                      backgroundColor: form.qualifications.includes(q) ? '#2b2d42' : 'transparent',
                      color: form.qualifications.includes(q) ? '#ffffff' : '#2b2d42',
                      borderColor: '#8d99ae',
                    }}
                  >
                    {q}
                  </Chip>
                ))}
              </Box>
            </FormControl>

            <FormControl>
              <FormLabel>Services Offered</FormLabel>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
                {SERVICES.map((s) => (
                  <Chip
                    key={s}
                    variant={form.services.includes(s) ? 'solid' : 'outlined'}
                    onClick={() => editing && toggleMultiSelect('services', s)}
                    sx={{
                      cursor: editing ? 'pointer' : 'default',
                      backgroundColor: form.services.includes(s) ? '#2b2d42' : 'transparent',
                      color: form.services.includes(s) ? '#ffffff' : '#2b2d42',
                      borderColor: '#8d99ae',
                    }}
                  >
                    {s.replace(/_/g, ' ')}
                  </Chip>
                ))}
              </Box>
            </FormControl>

            {error && (
              <FormHelperText sx={{ color: '#c0392b' }}>{error}</FormHelperText>
            )}

            {/* action buttons */}
            {editing && (
              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  sx={{ borderColor: '#8d99ae', color: '#2b2d42' }}
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button
                  fullWidth
                  loading={loading}
                  sx={{ backgroundColor: '#2b2d42', '&:hover': { backgroundColor: '#3d3f57' } }}
                  onClick={handleSave}
                >
                  Save Changes
                </Button>
              </Box>
            )}

          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}