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
import { loginDoctor } from '../../api/auth';
import { getDoctorMe } from '../../api/doctor';
import { useAuth } from '../../context/AuthContext';

export default function DoctorLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      console.log('[DoctorLogin] Attempting login with email:', form.email);
      const res = await loginDoctor(form);
      const token = res.data.access_token;

      // store token first so axios interceptor can attach it
      localStorage.setItem('token', token);

      // fetch doctor profile
      const profileRes = await getDoctorMe();

      console.log('[DoctorLogin] Login successful, redirecting to dashboard');
      login(token, 'doctor', profileRes.data);
      navigate('/doctor/dashboard');
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Invalid email or password.';
      console.error('[DoctorLogin] Login error:', errorMsg);
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
            <Typography level="h2">Doctor Login</Typography>
            <Typography level="body-sm">Login to manage your appointments and slots</Typography>
          </Box>

          <FormControl>
            <FormLabel>Email</FormLabel>
            <Input
              name="email"
              type="email"
              placeholder="doctor@email.com"
              value={form.email}
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
            Login
          </Button>

          <Typography level="body-sm" sx={{ textAlign: 'center' }}>
            Don't have an account?{' '}
            <Link to="/signup/doctor" style={{ color: '#2b2d42', fontWeight: 600 }}>
              Sign Up
            </Link>
          </Typography>

          <Typography level="body-sm" sx={{ textAlign: 'center' }}>
            Are you a patient?{' '}
            <Link to="/login/patient" style={{ color: '#8d99ae', fontWeight: 600 }}>
              Patient Login
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}