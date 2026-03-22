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
import { loginPatient } from '../../api/auth';
import { getPatientMe } from '../../api/patient';
import { useAuth } from '../../context/AuthContext';

export default function PatientLogin() {
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
      console.log('[PatientLogin] Attempting login with email:', form.email);
      const res = await loginPatient(form);
      const token = res.data.access_token;

      // store token first so axios interceptor can attach it
      localStorage.setItem('token', token);

      // fetch patient profile
      const profileRes = await getPatientMe();

      console.log('[PatientLogin] Login successful, redirecting to dashboard');
      login(token, 'patient', profileRes.data);
      navigate('/patient/dashboard');
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Invalid email or password.';
      console.error('[PatientLogin] Login error:', errorMsg);
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
            <Typography level="h2">Welcome Back</Typography>
            <Typography level="body-sm">Login to manage your appointments</Typography>
          </Box>

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
            <Link to="/register/patient" style={{ color: '#2b2d42', fontWeight: 600 }}>
              Register
            </Link>
          </Typography>

          <Typography level="body-sm" sx={{ textAlign: 'center' }}>
            Are you a doctor?{' '}
            <Link to="/login/doctor" style={{ color: '#8d99ae', fontWeight: 600 }}>
              Doctor Login
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}