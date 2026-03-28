import { useEffect, useRef, useState } from 'react';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Button from '@mui/joy/Button';
import CircularProgress from '@mui/joy/CircularProgress';
import Input from '@mui/joy/Input';
import Textarea from '@mui/joy/Textarea';
import Divider from '@mui/joy/Divider';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import ModalClose from '@mui/joy/ModalClose';
import {
  createPatientRecord,
  downloadDoctorRecordAttachment,
  getDoctorPatientRecords,
  uploadDoctorRecordAttachment,
  updatePatientRecord,
} from '../api/doctor';
import { PRESCRIPTION_TABLE_COLUMNS } from '../constants';
import { triggerBlobDownload } from '../utils/download';

const EMPTY_RECORD_FORM = {
  chief_complaint: '',
  symptoms: '',
  diagnosis: '',
  notes: '',
  follow_up_date: '',
};

const EMPTY_PRESCRIPTION_ROW = PRESCRIPTION_TABLE_COLUMNS.reduce((acc, column) => {
  acc[column.key] = '';
  return acc;
}, {});

function toRecordForm(record) {
  return {
    chief_complaint: record?.chief_complaint || '',
    symptoms: record?.symptoms || '',
    diagnosis: record?.diagnosis || '',
    notes: record?.notes || '',
    follow_up_date: record?.follow_up_date
      ? new Date(record.follow_up_date).toISOString().slice(0, 10)
      : '',
  };
}

function toPrescriptionRows(record) {
  const rows = Array.isArray(record?.prescription_table) ? record.prescription_table : [];
  if (rows.length === 0) return [{ ...EMPTY_PRESCRIPTION_ROW }];

  return rows.map((row) =>
    PRESCRIPTION_TABLE_COLUMNS.reduce((acc, column) => {
      acc[column.key] = row?.[column.key] || '';
      return acc;
    }, {})
  );
}

function buildRecordPayload(form, prescriptionRows) {
  return {
    chief_complaint: form.chief_complaint.trim(),
    symptoms: form.symptoms.trim(),
    diagnosis: form.diagnosis.trim(),
    prescription_table: prescriptionRows.map((row) =>
      PRESCRIPTION_TABLE_COLUMNS.reduce((acc, column) => {
        acc[column.key] = String(row?.[column.key] || '').trim();
        return acc;
      }, {})
    ),
    notes: form.notes.trim(),
    follow_up_date: form.follow_up_date || null,
  };
}

export default function PatientRecordDialog({ open, booking, onClose }) {
  const attachmentInputRef = useRef(null);
  const [existingRecord, setExistingRecord] = useState(null);
  const [recordForm, setRecordForm] = useState(EMPTY_RECORD_FORM);
  const [prescriptionRows, setPrescriptionRows] = useState([{ ...EMPTY_PRESCRIPTION_ROW }]);
  const [recordLoading, setRecordLoading] = useState(false);
  const [recordSaving, setRecordSaving] = useState(false);
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [attachmentUploading, setAttachmentUploading] = useState(false);
  const [recordError, setRecordError] = useState('');
  const [recordSuccess, setRecordSuccess] = useState('');

  useEffect(() => {
    const loadRecord = async () => {
      if (!open || !booking || booking.status !== 'approved') {
        setExistingRecord(null);
        setRecordForm(EMPTY_RECORD_FORM);
        setPrescriptionRows([{ ...EMPTY_PRESCRIPTION_ROW }]);
        setAttachmentFile(null);
        setAttachmentUploading(false);
        setRecordError('');
        setRecordSuccess('');
        setRecordLoading(false);
        return;
      }

      setRecordLoading(true);
      setRecordError('');
      setRecordSuccess('');

      try {
        const res = await getDoctorPatientRecords(booking.patient_id);
        const matchedRecord = res.data.find((record) => record.booking_id === booking.id) || null;
        setExistingRecord(
          matchedRecord
            ? {
                ...matchedRecord,
                attachments: matchedRecord.attachments || [],
              }
            : null
        );
        setRecordForm(matchedRecord ? toRecordForm(matchedRecord) : EMPTY_RECORD_FORM);
        setPrescriptionRows(toPrescriptionRows(matchedRecord));
      } catch (err) {
        setExistingRecord(null);
        setRecordForm(EMPTY_RECORD_FORM);
        setPrescriptionRows([{ ...EMPTY_PRESCRIPTION_ROW }]);
        setRecordError(err.response?.data?.detail || 'Unable to load patient record.');
      } finally {
        setRecordLoading(false);
      }
    };

    loadRecord();
  }, [open, booking]);

  const handleRecordChange = (e) => {
    setRecordForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRecordSubmit = async () => {
    if (!booking) return;

    const payload = buildRecordPayload(recordForm, prescriptionRows);
    if (!payload.chief_complaint || !payload.diagnosis) {
      setRecordError('Chief complaint and diagnosis are required.');
      setRecordSuccess('');
      return;
    }

    setRecordSaving(true);
    setRecordError('');
    setRecordSuccess('');

    try {
      const res = existingRecord
        ? await updatePatientRecord(existingRecord.id, payload)
        : await createPatientRecord({ booking_id: booking.id, ...payload });

      setExistingRecord({
        ...res.data,
        attachments: res.data.attachments || [],
      });
      setRecordForm(toRecordForm(res.data));
      setPrescriptionRows(toPrescriptionRows(res.data));
      setRecordSuccess(existingRecord ? 'Patient record updated.' : 'Patient record saved.');
    } catch (err) {
      setRecordError(err.response?.data?.detail || 'Unable to save patient record.');
    } finally {
      setRecordSaving(false);
    }
  };

  const handleUpload = async () => {
    if (!existingRecord?.id) {
      setRecordError('Save the patient record first, then upload attachments.');
      setRecordSuccess('');
      return;
    }

    if (!attachmentFile) {
      setRecordError('Select an attachment file first.');
      setRecordSuccess('');
      return;
    }

    setAttachmentUploading(true);
    setRecordError('');
    setRecordSuccess('');

    try {
      const res = await uploadDoctorRecordAttachment(existingRecord.id, attachmentFile);
      const uploadedAttachment = res.data?.attachment;

      setExistingRecord((prev) => {
        if (!prev || !uploadedAttachment) return prev;
        return {
          ...prev,
          attachments: [...(prev.attachments || []), uploadedAttachment],
        };
      });

      setAttachmentFile(null);
      if (attachmentInputRef.current) attachmentInputRef.current.value = '';
      setRecordSuccess('Attachment uploaded.');
    } catch (err) {
      setRecordError(err.response?.data?.detail || 'Unable to upload file.');
      setRecordSuccess('');
    } finally {
      setAttachmentUploading(false);
    }
  };

  const handleAttachmentDownload = async (attachment) => {
    if (!existingRecord?.id || !attachment?.id) return;
    setRecordError('');
    setRecordSuccess('');

    try {
      const res = await downloadDoctorRecordAttachment(existingRecord.id, attachment.id);
      triggerBlobDownload(res, attachment.file_name || 'attachment');
    } catch (err) {
      setRecordError(err.response?.data?.detail || 'Unable to download attachment.');
    }
  };

  const handlePrescriptionCellChange = (rowIndex, key, value) => {
    setPrescriptionRows((prev) =>
      prev.map((row, index) => (index === rowIndex ? { ...row, [key]: value } : row))
    );
  };

  const handleAddPrescriptionRow = () => {
    setPrescriptionRows((prev) => [...prev, { ...EMPTY_PRESCRIPTION_ROW }]);
  };

  const handleRemovePrescriptionRow = (rowIndex) => {
    setPrescriptionRows((prev) => {
      if (prev.length === 1) return [{ ...EMPTY_PRESCRIPTION_ROW }];
      return prev.filter((_, index) => index !== rowIndex);
    });
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog sx={{ width: 'min(1120px, calc(100vw - 32px))', maxHeight: '88vh', overflowY: 'auto' }}>
        <ModalClose />

        <Box sx={{ mb: 2 }}>
          <Typography level="h3">Patient Record</Typography>
          <Typography level="body-sm" sx={{ color: '#8d99ae' }}>
            {booking ? `For ${booking.patient_name}` : 'Select a booking to continue'}
          </Typography>
        </Box>

        {recordLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size="sm" />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1.5 }}>
              <FormControl>
                <FormLabel>Chief Complaint</FormLabel>
                <Input
                  name="chief_complaint"
                  value={recordForm.chief_complaint}
                  onChange={handleRecordChange}
                  placeholder="Primary issue reported by the patient"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Symptoms</FormLabel>
                <Textarea
                  name="symptoms"
                  minRows={2}
                  value={recordForm.symptoms}
                  onChange={handleRecordChange}
                  placeholder="Symptoms and duration"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Diagnosis</FormLabel>
                <Textarea
                  name="diagnosis"
                  minRows={2}
                  value={recordForm.diagnosis}
                  onChange={handleRecordChange}
                  placeholder="Clinical assessment"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Notes</FormLabel>
                <Textarea
                  name="notes"
                  minRows={2}
                  value={recordForm.notes}
                  onChange={handleRecordChange}
                  placeholder="Additional advice or observations"
                />
              </FormControl>
            </Box>

            <FormControl>
              <FormLabel>Prescription Table</FormLabel>
              <Box sx={{ overflowX: 'auto', border: '1px solid #d0d7de', borderRadius: '8px', p: 1 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(8, minmax(140px, 1fr)) 72px', gap: 1, minWidth: 1220 }}>
                  {PRESCRIPTION_TABLE_COLUMNS.map((column) => (
                    <Typography key={column.key} level="body-sm" sx={{ color: '#8d99ae', fontWeight: 600 }}>
                      {column.label}
                    </Typography>
                  ))}
                  <Typography level="body-sm" sx={{ color: '#8d99ae', fontWeight: 600 }}>
                    Action
                  </Typography>

                  {prescriptionRows.map((row, rowIndex) => (
                    <Box
                      key={`prescription-row-${rowIndex}`}
                      sx={{ display: 'contents' }}
                    >
                      {PRESCRIPTION_TABLE_COLUMNS.map((column) => (
                        <Input
                          key={`${column.key}-${rowIndex}`}
                          value={row[column.key] || ''}
                          onChange={(e) =>
                            handlePrescriptionCellChange(rowIndex, column.key, e.target.value)
                          }
                          placeholder={column.label}
                          size="sm"
                        />
                      ))}
                      <Button
                        size="sm"
                        variant="outlined"
                        color="danger"
                        onClick={() => handleRemovePrescriptionRow(rowIndex)}
                      >
                        Delete
                      </Button>
                    </Box>
                  ))}
                </Box>
              </Box>

              <Box sx={{ mt: 1 }}>
                <Button size="sm" variant="soft" onClick={handleAddPrescriptionRow}>
                  Add Row
                </Button>
              </Box>
            </FormControl>

            <Divider sx={{ my: 0.5 }} />

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1.5 }}>
              <FormControl>
                <FormLabel>Follow-up Date (Optional)</FormLabel>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 1 }}>
                  <Input
                    name="follow_up_date"
                    type="date"
                    value={recordForm.follow_up_date}
                    onChange={handleRecordChange}
                  />
                  <Button
                    variant="outlined"
                    onClick={() =>
                      setRecordForm((prev) => ({ ...prev, follow_up_date: '' }))
                    }
                    disabled={!recordForm.follow_up_date}
                  >
                    None
                  </Button>
                </Box>
              </FormControl>

              <Box>
                <Typography level="title-sm" sx={{ mb: 1 }}>
                  Files
                </Typography>
                {!existingRecord?.id ? (
                  <Typography level="body-sm" sx={{ color: '#8d99ae' }}>
                    Save the record first to upload attachments.
                  </Typography>
                ) : (
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr auto' }, gap: 1 }}>
                    <Box
                      sx={{
                        border: '1px solid #cbd5e1',
                        borderRadius: '10px',
                        px: 1,
                        py: 0.75,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        minHeight: '44px',
                      }}
                    >
                      <input
                        ref={attachmentInputRef}
                        type="file"
                        style={{ display: 'none' }}
                        onChange={(e) => setAttachmentFile(e.target.files?.[0] || null)}
                      />
                      <Button
                        size="sm"
                        variant="outlined"
                        onClick={() => attachmentInputRef.current?.click()}
                        sx={{ borderColor: '#8d99ae', color: '#2b2d42' }}
                      >
                        Select File
                      </Button>
                      <Typography
                        level="body-sm"
                        sx={{
                          color: attachmentFile ? '#2b2d42' : '#8d99ae',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {attachmentFile ? attachmentFile.name : 'No file selected'}
                      </Typography>
                    </Box>
                    <Button
                      loading={attachmentUploading}
                      onClick={handleUpload}
                      disabled={!attachmentFile}
                      sx={{ backgroundColor: '#2b2d42', '&:hover': { backgroundColor: '#3d3f57' } }}
                    >
                      Upload
                    </Button>
                  </Box>
                )}
              </Box>
            </Box>

            {existingRecord?.id && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                <Typography level="body-sm" sx={{ color: '#8d99ae' }}>
                  Uploaded Files
                </Typography>
                {(existingRecord.attachments || []).length === 0 ? (
                  <Typography level="body-sm">No files uploaded yet.</Typography>
                ) : (
                  (existingRecord.attachments || []).map((attachment) => (
                    <Box
                      key={attachment.id}
                      sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}
                    >
                      <Typography level="body-sm">
                        {attachment.file_name}
                      </Typography>
                      <Button
                        size="sm"
                        variant="outlined"
                        onClick={() => handleAttachmentDownload(attachment)}
                      >
                        Download
                      </Button>
                    </Box>
                  ))
                )}
              </Box>
            )}

            {recordError && (
              <Typography level="body-sm" sx={{ color: '#c0392b' }}>
                {recordError}
              </Typography>
            )}

            {recordSuccess && (
              <Typography level="body-sm" sx={{ color: '#27ae60' }}>
                {recordSuccess}
              </Typography>
            )}

            <Button
              loading={recordSaving}
              onClick={handleRecordSubmit}
              sx={{ mt: 1, backgroundColor: '#2b2d42', '&:hover': { backgroundColor: '#3d3f57' } }}
            >
              {existingRecord ? 'Update Record' : 'Save Record'}
            </Button>
          </Box>
        )}
      </ModalDialog>
    </Modal>
  );
}
