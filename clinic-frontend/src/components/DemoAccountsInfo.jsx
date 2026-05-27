import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';

const DOCTOR_ACCOUNTS = [
  ['Dr. Priya Sharma', 'priya.sharma@clinic.com'],
  ['Dr. Rahul Mehta', 'rahul.mehta@clinic.com'],
  ['Dr. Ananya Iyer', 'ananya.iyer@clinic.com'],
  ['Dr. Vikram Nair', 'vikram.nair@clinic.com'],
  ['Dr. Sneha Kulkarni', 'sneha.kulkarni@clinic.com'],
];

const PATIENT_ACCOUNTS = [
  ['Amit Joshi', 'amit.joshi@gmail.com'],
  ['Neha Gupta', 'neha.gupta@gmail.com'],
  ['Rohan Desai', 'rohan.desai@gmail.com'],
  ['Prachi Patil', 'prachi.patil@gmail.com'],
  ['Siddharth Rao', 'siddharth.rao@gmail.com'],
];

function AccountList({ title, password, accounts }) {
  return (
    <Box sx={{ mb: 1.5 }}>
      <Typography level="title-sm">{title}</Typography>
      <Typography level="body-xs" sx={{ mb: 0.5 }}>
        Password: <strong>{password}</strong>
      </Typography>
      {accounts.map(([name, email]) => (
        <Typography key={email} level="body-xs">
          {name} - {email}
        </Typography>
      ))}
    </Box>
  );
}

export default function DemoAccountsInfo() {
  return (
    <Box
      sx={{
        border: '1px solid #d8dee9',
        borderRadius: '10px',
        p: 1.25,
        backgroundColor: '#f8fafc',
      }}
    >
      <details>
        <summary style={{ cursor: 'pointer', fontWeight: 600 }}>
          Demo accounts for exploring the app 
        </summary>
        <Box sx={{ mt: 1, maxHeight: 220, overflowY: 'auto', pr: 0.5 }}>
          <Typography level="body-xs" sx={{ mb: 1 }}>
            Use any email below with its role password to explore app functionality.
          </Typography>
          <AccountList title="Doctors" password="doctor123" accounts={DOCTOR_ACCOUNTS} />
          <AccountList title="Patients" password="patient123" accounts={PATIENT_ACCOUNTS} />
        </Box>
      </details>
    </Box>
  );
}
