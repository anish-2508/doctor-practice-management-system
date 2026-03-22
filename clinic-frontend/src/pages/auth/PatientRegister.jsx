import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Box from '@mui/joy/Box';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import Typography from '@mui/joy/Typography';
import Input from '@mui/joy/Input';
import Button from '@mui/joy/Button';
import FormLabel from '@mui/joy/FormLabel';
import FormControl from '@mui/joy/FormControl';
import FormHelperText from '@mui/joy/FormHelperText';
import { registerPatient } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import { loginPatient } from '../../api/auth';

export default function PatientRegister() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setError('');
    
    // Validate all fields are filled
    if (!form.name || !form.email || !form.password || !form.phone) {
      console.error('[PatientRegister] Validation error: All fields are required');
      setError('All fields are required');
      return;
    }

    setLoading(true);
    try {
      console.log('[PatientRegister] Attempting registration with email:', form.email);
      // register
      await registerPatient(form);

      // auto login after register
      const res = await loginPatient({ email: form.email, password: form.password });
      const token = res.data.access_token;

      // fetch patient profile
      const { getPatientMe } = await import('../../api/patient');
      const profileRes = await getPatientMe();

      console.log('[PatientRegister] Registration successful, redirecting to dashboard');
      login(token, 'patient', profileRes.data);
      navigate('/patient/dashboard');
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Registration failed. Please try again.';
      console.error('[PatientRegister] Registration error:', errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#edf2f4',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 440 }}>
        <CardContent sx={{ gap: 2, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ mb: 1 }}>
            <Typography level="h2">Create Account</Typography>
            <Typography level="body-sm">Sign up as a patient to book appointments</Typography>
          </Box>

          <FormControl>
            <FormLabel>Full Name</FormLabel>
            <Input
              name="name"
              placeholder="John Doe"
              value={form.name}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Email</FormLabel>
            <Input
              name="email"
              type="email"
              placeholder="john@email.com"
              value={form.email}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Phone</FormLabel>
            <Input
              name="phone"
              placeholder="+91 9876543210"
              value={form.phone}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Password</FormLabel>
            <Input
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
            />
          </FormControl>

          {error && (
            <FormHelperText sx={{ color: '#c0392b' }}>
              {error}
            </FormHelperText>
          )}

          <Button
            fullWidth
            loading={loading}
            sx={{ backgroundColor: '#2b2d42', '&:hover': { backgroundColor: '#3d3f57' }, mt: 1 }}
            onClick={handleSubmit}
          >
            Create Account
          </Button>

          <Typography level="body-sm" sx={{ textAlign: 'center' }}>
            Already have an account?{' '}
            <Link to="/login/patient" style={{ color: '#2b2d42', fontWeight: 600 }}>
              Login
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}