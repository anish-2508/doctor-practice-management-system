import { useEffect, useState } from 'react';
import Box from '@mui/joy/Box';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import Chip from '@mui/joy/Chip';
import Divider from '@mui/joy/Divider';
import Typography from '@mui/joy/Typography';
import CircularProgress from '@mui/joy/CircularProgress';
import Input from '@mui/joy/Input';
import Button from '@mui/joy/Button';
import {
  downloadPatientPrescription,
  downloadPatientRecordAttachment,
  getPatientRecords,
} from '../../api/patient';
import { PRESCRIPTION_TABLE_COLUMNS } from '../../constants';
import { triggerBlobDownload } from '../../utils/download';

function formatDate(value) {
  if (!value) return 'N/A';
  return new Date(value).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function renderText(value) {
  if (!value || String(value).trim() === '') return 'Not provided';
  return value;
}

function normalizePrescriptionRows(record) {
  const rows = Array.isArray(record?.prescription_table) ? record.prescription_table : [];
  return rows.map((row) =>
    PRESCRIPTION_TABLE_COLUMNS.reduce((acc, column) => {
      acc[column.key] = row?.[column.key] || '';
      return acc;
    }, {})
  );
}

function CompactSection({ title, children }) {
  return (
    <Box
      component="details"
      sx={{
        mt: 1,
        border: '1px solid #d8dee8',
        borderRadius: '8px',
        px: 1.25,
        py: 0.75,
        '& > summary': {
          cursor: 'pointer',
          listStyle: 'none',
          outline: 'none',
        },
        '& > summary::-webkit-details-marker': {
          display: 'none',
        },
      }}
    >
      <Box component="summary">
        <Typography level="body-sm" sx={{ color: '#2b2d42', fontWeight: 600 }}>
          {title}
        </Typography>
      </Box>
      <Box sx={{ mt: 1 }}>{children}</Box>
    </Box>
  );
}

export default function PatientRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [month, setMonth] = useState('');
  const [appliedFilters, setAppliedFilters] = useState({ doctor_name: '', month: '' });

  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      setError('');
      try {
        console.log('[PatientRecords] Fetching patient records');
        const res = await getPatientRecords(appliedFilters);
        setRecords(res.data || []);
        console.log(`[PatientRecords] Loaded ${res.data?.length || 0} records`);
      } catch (err) {
        const errorMsg = err.response?.data?.detail || 'Could not load records right now.';
        console.error('[PatientRecords] Error fetching records:', errorMsg);
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [appliedFilters]);

  const handleAttachmentDownload = async (recordId, attachment) => {
    try {
      const res = await downloadPatientRecordAttachment(recordId, attachment.id);
      triggerBlobDownload(res, attachment.file_name || 'attachment');
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to download attachment.');
    }
  };

  const handlePrescriptionDownload = async (record) => {
    try {
      const res = await downloadPatientPrescription(record.id);
      triggerBlobDownload(res, 'prescription.txt');
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to download prescription file.');
    }
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
      <Box
        sx={{
          mb: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', lg: 'flex-end' },
          flexDirection: { xs: 'column', lg: 'row' },
          gap: 2,
        }}
      >
        <Box>
          <Typography level="h1">Medical Records</Typography>
          <Typography level="body-sm">
            Read-only visit history shared by your doctors
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
          <Input
            placeholder="Search doctor name"
            value={doctorName}
            onChange={(e) => setDoctorName(e.target.value)}
            sx={{ minWidth: 220 }}
          />
          <Input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            sx={{ minWidth: 170 }}
          />
          <Button
            onClick={() => setAppliedFilters({ doctor_name: doctorName.trim(), month })}
            sx={{ backgroundColor: '#2b2d42', '&:hover': { backgroundColor: '#3d3f57' } }}
          >
            Apply
          </Button>
          <Button
            variant="outlined"
            sx={{ borderColor: '#8d99ae', color: '#2b2d42' }}
            onClick={() => {
              setDoctorName('');
              setMonth('');
              setAppliedFilters({ doctor_name: '', month: '' });
            }}
          >
            Clear
          </Button>
        </Box>
      </Box>

      {error && (
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography level="body-sm" sx={{ color: '#c0392b' }}>
              {error}
            </Typography>
          </CardContent>
        </Card>
      )}

      {records.length === 0 ? (
        <Card variant="outlined">
          <CardContent>
            <Typography level="body-md" sx={{ color: '#8d99ae', textAlign: 'center', py: 3 }}>
              No medical records yet.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: '1fr 1fr' }, gap: 2 }}>
          {records.map((record) => {
            const prescriptionRows = normalizePrescriptionRows(record);
            return (
              <Card key={record.id} variant="outlined">
                <CardContent sx={{ p: 1.75 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1.25, flexWrap: 'wrap' }}>
                    <Box>
                      <Typography level="title-lg">{record.doctor_name}</Typography>
                      <Typography level="body-xs" sx={{ color: '#8d99ae' }}>
                        {formatDate(record.visit_date)}
                      </Typography>
                    </Box>
                    <Chip size="sm" variant="soft" sx={{ backgroundColor: '#edf2f4', color: '#2b2d42' }}>
                      #{record.booking_id?.slice(-8)}
                    </Chip>
                  </Box>

                  <Divider sx={{ my: 1 }} />

                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1 }}>
                    <Box>
                      <Typography level="body-xs" sx={{ color: '#8d99ae' }}>Chief Complaint</Typography>
                      <Typography level="body-sm" sx={{ lineHeight: 1.3 }}>
                        {renderText(record.chief_complaint)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography level="body-xs" sx={{ color: '#8d99ae' }}>Diagnosis</Typography>
                      <Typography level="body-sm" sx={{ lineHeight: 1.3 }}>
                        {renderText(record.diagnosis)}
                      </Typography>
                    </Box>
                  </Box>

                  <CompactSection title="Clinical Details">
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1 }}>
                      <Box>
                        <Typography level="body-xs" sx={{ color: '#8d99ae' }}>Symptoms</Typography>
                        <Typography level="body-sm">{renderText(record.symptoms)}</Typography>
                      </Box>
                      <Box>
                        <Typography level="body-xs" sx={{ color: '#8d99ae' }}>Follow-up</Typography>
                        <Typography level="body-sm">
                          {record.follow_up_date ? formatDate(record.follow_up_date) : 'Not scheduled'}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ mt: 1 }}>
                      <Typography level="body-xs" sx={{ color: '#8d99ae' }}>Notes</Typography>
                      <Typography level="body-sm">{renderText(record.notes)}</Typography>
                    </Box>
                  </CompactSection>

                  <CompactSection title={`Prescription (${prescriptionRows.length} row${prescriptionRows.length !== 1 ? 's' : ''})`}>
                    {prescriptionRows.length === 0 ? (
                      <Typography level="body-sm">No prescription rows.</Typography>
                    ) : (
                      <Box sx={{ overflowX: 'auto' }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(8, minmax(120px, 1fr))', gap: 0.75, minWidth: 920 }}>
                          {PRESCRIPTION_TABLE_COLUMNS.map((column) => (
                            <Typography key={column.key} level="body-xs" sx={{ color: '#8d99ae', fontWeight: 600 }}>
                              {column.label}
                            </Typography>
                          ))}
                          {prescriptionRows.flatMap((row, rowIndex) =>
                            PRESCRIPTION_TABLE_COLUMNS.map((column) => (
                              <Typography key={`${rowIndex}-${column.key}`} level="body-xs">
                                {row[column.key] ? row[column.key] : '-'}
                              </Typography>
                            ))
                          )}
                        </Box>
                      </Box>
                    )}
                  </CompactSection>

                  <CompactSection title={`Files (${record.attachments?.length || 0})`}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                      <Button
                        size="sm"
                        variant="soft"
                        sx={{ backgroundColor: '#edf2f4', color: '#2b2d42' }}
                        onClick={() => handlePrescriptionDownload(record)}
                      >
                        Prescription
                      </Button>
                      {(record.attachments || []).map((attachment) => (
                        <Button
                          key={attachment.id}
                          size="sm"
                          variant="outlined"
                          onClick={() => handleAttachmentDownload(record.id, attachment)}
                        >
                          {attachment.file_name}
                        </Button>
                      ))}
                      {(!record.attachments || record.attachments.length === 0) && (
                        <Typography level="body-sm">No attachments uploaded.</Typography>
                      )}
                    </Box>
                  </CompactSection>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
