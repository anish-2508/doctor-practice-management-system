import { useState } from 'react';
import Box from '@mui/joy/Box';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import Typography from '@mui/joy/Typography';
import Input from '@mui/joy/Input';
import Button from '@mui/joy/Button';
import FormLabel from '@mui/joy/FormLabel';
import FormControl from '@mui/joy/FormControl';
import FormHelperText from '@mui/joy/FormHelperText';
import Divider from '@mui/joy/Divider';
import { useAuth } from '../../context/AuthContext';
import { updatePatientMe } from '../../api/patient';

export default function PatientProfile() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      console.log('[PatientProfile] Updating patient profile');
      const res = await updatePatientMe(form);
      updateUser(res.data);
      console.log('[PatientProfile] Profile updated successfully');
      setSuccess('Profile updated successfully.');
      setEditing(false);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Update failed. Please try again.';
      console.error('[PatientProfile] Error updating profile:', errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setForm({
      name: user?.name || '',
      phone: user?.phone || '',
    });
    setError('');
    setEditing(false);
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#edf2f4', px: 4, py: 4 }}>
      <Box sx={{ maxWidth: 480, mx: 'auto' }}>

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

            <Typography level="h3">Account Information</Typography>

            {/* email — never editable */}
            <FormControl>
              <FormLabel>Email</FormLabel>
              <Typography level="body-md">{user?.email}</Typography>
            </FormControl>

            <FormControl>
              <FormLabel>Full Name</FormLabel>
              {editing ? (
                <Input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                />
              ) : (
                <Typography level="body-md">{user?.name}</Typography>
              )}
            </FormControl>

            <FormControl>
              <FormLabel>Phone</FormLabel>
              {editing ? (
                <Input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                />
              ) : (
                <Typography level="body-md">{user?.phone}</Typography>
              )}
            </FormControl>

            <Divider />

            <FormControl>
              <FormLabel>Member Since</FormLabel>
              <Typography level="body-md">
                {new Date(user?.created_at).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </Typography>
            </FormControl>

            {error && (
              <FormHelperText sx={{ color: '#c0392b' }}>{error}</FormHelperText>
            )}

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