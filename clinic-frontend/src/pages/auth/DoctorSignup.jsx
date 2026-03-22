import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
import Checkbox from '@mui/joy/Checkbox';
import Chip from '@mui/joy/Chip';
import Divider from '@mui/joy/Divider';
import { signupDoctor, loginDoctor } from '../../api/auth';
import { getDoctorMe } from '../../api/doctor';
import { useAuth } from '../../context/AuthContext';
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

export default function DoctorSignup() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    consultation_fee: '',
    work_start_time: '',
    work_end_time: '',
    slot_duration_mins: '',
    working_days: [],
    years_of_exp: '',
    specialization: '',
    qualifications: [],
    services: [],
    bio: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 2 step form

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

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      console.log('[DoctorSignup] Attempting registration with email:', form.email);
      const payload = {
        ...form,
        consultation_fee: parseInt(form.consultation_fee),
        slot_duration_mins: parseInt(form.slot_duration_mins),
        years_of_exp: parseInt(form.years_of_exp),
        work_start_time: form.work_start_time + ':00',
        work_end_time: form.work_end_time + ':00',
      };

      await signupDoctor(payload);

      // auto login after signup
      localStorage.setItem('token', '');
      const res = await loginDoctor({ email: form.email, password: form.password });
      const token = res.data.access_token;
      localStorage.setItem('token', token);

      const profileRes = await getDoctorMe();
      console.log('[DoctorSignup] Registration successful, redirecting to dashboard');
      login(token, 'doctor', profileRes.data);
      navigate('/doctor/dashboard');
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Signup failed. Please try again.';
      console.error('[DoctorSignup] Registration error:', errorMsg);
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
        py: 6,
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 560 }}>
        <CardContent sx={{ gap: 2, display: 'flex', flexDirection: 'column' }}>

          <Box sx={{ mb: 1 }}>
            <Typography level="h2">Doctor Sign Up</Typography>
            <Typography level="body-sm">
              Step {step} of 2 — {step === 1 ? 'Account & Schedule' : 'Profile & Expertise'}
            </Typography>
          </Box>

          {/* step indicator */}
          <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
            {[1, 2].map((s) => (
              <Box
                key={s}
                sx={{
                  height: 4,
                  flex: 1,
                  borderRadius: 4,
                  backgroundColor: step >= s ? '#2b2d42' : '#d0d9e0',
                  transition: 'background-color 0.3s',
                }}
              />
            ))}
          </Box>

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <>
              <FormControl>
                <FormLabel>Full Name</FormLabel>
                <Input name="name" placeholder="Dr. Jane Smith" value={form.name} onChange={handleChange} />
              </FormControl>

              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input name="email" type="email" placeholder="doctor@email.com" value={form.email} onChange={handleChange} />
              </FormControl>

              <FormControl>
                <FormLabel>Password</FormLabel>
                <Input name="password" type="password" placeholder="••••••••" value={form.password} onChange={handleChange} />
              </FormControl>

              <FormControl>
                <FormLabel>Consultation Fee (₹)</FormLabel>
                <Input name="consultation_fee" type="number" placeholder="500" value={form.consultation_fee} onChange={handleChange} />
              </FormControl>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControl sx={{ flex: 1 }}>
                  <FormLabel>Work Start Time</FormLabel>
                  <Input name="work_start_time" type="time" value={form.work_start_time} onChange={handleChange} />
                </FormControl>
                <FormControl sx={{ flex: 1 }}>
                  <FormLabel>Work End Time</FormLabel>
                  <Input name="work_end_time" type="time" value={form.work_end_time} onChange={handleChange} />
                </FormControl>
              </Box>

              <FormControl>
                <FormLabel>Slot Duration (minutes)</FormLabel>
                <Input name="slot_duration_mins" type="number" placeholder="30" value={form.slot_duration_mins} onChange={handleChange} />
              </FormControl>

              <FormControl>
                <FormLabel>Working Days</FormLabel>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
                  {DAYS.map((day) => (
                    <Chip
                      key={day.value}
                      variant={form.working_days.includes(day.value) ? 'solid' : 'outlined'}
                      onClick={() => toggleDay(day.value)}
                      sx={{
                        cursor: 'pointer',
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

              <Button
                fullWidth
                sx={{ backgroundColor: '#2b2d42', '&:hover': { backgroundColor: '#3d3f57' }, mt: 1 }}
                onClick={() => setStep(2)}
              >
                Next
              </Button>
            </>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <>
              <FormControl>
                <FormLabel>Years of Experience</FormLabel>
                <Input name="years_of_exp" type="number" placeholder="5" value={form.years_of_exp} onChange={handleChange} />
              </FormControl>

              <FormControl>
                <FormLabel>Specialization</FormLabel>
                <Select
                  placeholder="Select specialization"
                  value={form.specialization}
                  onChange={(_, val) => setForm({ ...form, specialization: val })}
                >
                  {SPECIALIZATIONS.map((s) => (
                    <Option key={s} value={s}>
                      {s.replace(/_/g, ' ')}
                    </Option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Qualifications</FormLabel>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
                  {QUALIFICATIONS.map((q) => (
                    <Chip
                      key={q}
                      variant={form.qualifications.includes(q) ? 'solid' : 'outlined'}
                      onClick={() => toggleMultiSelect('qualifications', q)}
                      sx={{
                        cursor: 'pointer',
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
                      onClick={() => toggleMultiSelect('services', s)}
                      sx={{
                        cursor: 'pointer',
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

              <FormControl>
                <FormLabel>Bio</FormLabel>
                <Textarea
                  name="bio"
                  placeholder="Tell patients about yourself, your experience and approach..."
                  minRows={3}
                  value={form.bio}
                  onChange={handleChange}
                />
              </FormControl>

              {error && (
                <FormHelperText sx={{ color: '#c0392b' }}>
                  {error}
                </FormHelperText>
              )}

              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  sx={{ borderColor: '#8d99ae', color: '#2b2d42' }}
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
                <Button
                  fullWidth
                  loading={loading}
                  sx={{ backgroundColor: '#2b2d42', '&:hover': { backgroundColor: '#3d3f57' } }}
                  onClick={handleSubmit}
                >
                  Create Account
                </Button>
              </Box>
            </>
          )}

          <Divider />

          <Typography level="body-sm" sx={{ textAlign: 'center' }}>
            Already have an account?{' '}
            <Link to="/login/doctor" style={{ color: '#2b2d42', fontWeight: 600 }}>
              Login
            </Link>
          </Typography>

        </CardContent>
      </Card>
    </Box>
  );
}