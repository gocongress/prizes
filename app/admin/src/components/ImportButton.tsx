import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import {
  Alert,
  Autocomplete,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import Papa from 'papaparse';
import React, { useEffect, useState } from 'react';
import { Button, HttpError, useDataProvider, useNotify, useRefresh } from 'react-admin';

interface ReferenceSelector {
  reference: string;
  label: string;
  fieldName: string;
  optionText?: string | ((record: Record<string, unknown>) => string);
  defaultValue?: string;
}

interface ImportButtonProps {
  buttonLabel?: string;
  csvFields: string;
  csvNotes?: object;
  dialogTitle: string;
  importUrl: string;
  payloadKey?: string;
  referenceSelector?: ReferenceSelector;
  confirmMessage?: string;
}

const ImportButton = ({
  buttonLabel = 'Import CSV',
  csvFields,
  csvNotes,
  dialogTitle,
  importUrl,
  payloadKey = 'users',
  referenceSelector,
  confirmMessage,
}: ImportButtonProps) => {
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [selectedReference, setSelectedReference] = useState<Record<string, unknown> | null>(null);
  const [referenceOptions, setReferenceOptions] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const refresh = useRefresh();

  // If import includes a reference selector, load options when dialog opens
  useEffect(() => {
    if (open && referenceSelector) {
      setLoading(true);
      dataProvider
        .getList(referenceSelector.reference, {
          pagination: { page: 1, perPage: 100 },
          sort: { field: 'title', order: 'ASC' },
          filter: {},
        })
        .then(({ data }) => {
          setReferenceOptions(data);
          // Pre-select the default value if provided
          if (referenceSelector.defaultValue) {
            const defaultOption = data.find(
              (option: Record<string, unknown>) => option.id === referenceSelector.defaultValue,
            );
            if (defaultOption) {
              setSelectedReference(defaultOption);
            }
          }
        })
        .catch((error) => {
          notify(`Error loading ${referenceSelector.label}: ${error.message}`, { type: 'error' });
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [open, referenceSelector, dataProvider, notify]);

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setFile(null);
    setSelectedReference(null);
  };

  const handleConfirmClose = () => {
    setConfirmOpen(false);
  };

  const handleConfirmAccept = () => {
    setConfirmOpen(false);
    processImport();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    if (referenceSelector && !selectedReference) {
      notify(`Please select a ${referenceSelector.label}`, { type: 'warning' });
      return;
    }

    // If confirmMessage is provided, show confirmation dialog first
    if (confirmMessage) {
      setConfirmOpen(true);
      return;
    }

    // Otherwise proceed directly
    processImport();
  };

  const processImport = async () => {
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: 'greedy',
      transform: (v) => v.trim(),
      complete: async (results) => {
        try {
          // If a reference selector is provided, inject the selected value into each row
          let data = results.data as Record<string, unknown>[];
          if (referenceSelector && selectedReference) {
            // Extract the ID from the selected reference object
            const referenceId = selectedReference.id as string;
            data = (results.data as Record<string, unknown>[]).map((row) => ({
              ...row,
              [referenceSelector.fieldName]: referenceId,
            }));
          }

          const token = localStorage.getItem('token');
          const response = await fetch(importUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ [payloadKey]: data }),
          });

          if (!response.ok) {
            throw new HttpError('Import error.', response.status);
          }
          notify('Import successful!', { type: 'success' });
          refresh();
          handleClose();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
          notify(`Import failed: ${error.message}`, { type: 'error' });
        }
      },
      error: (error) => {
        notify(`CSV format error: ${error.message}`, { type: 'error' });
      },
    });
  };

  return (
    <>
      <Button label={buttonLabel} onClick={handleClickOpen} startIcon={<CloudUploadIcon />} />

      {/* Confirmation Dialog */}
      {confirmMessage && (
        <Dialog open={confirmOpen} onClose={handleConfirmClose} maxWidth="sm" fullWidth>
          <DialogTitle>Confirm Import</DialogTitle>
          <DialogContent>
            <Alert severity="warning" icon={<WarningAmberIcon />} sx={{ mb: 2 }}>
              {confirmMessage}
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleConfirmClose} label="Cancel" />
            <Button onClick={handleConfirmAccept} label="Confirm" variant="contained" />
          </DialogActions>
        </Dialog>
      )}

      {/* Main Import Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent>
          {referenceSelector && (
            <div style={{ marginBottom: '1rem', marginTop: '1rem' }}>
              <Autocomplete<Record<string, unknown>>
                options={referenceOptions}
                loading={loading}
                getOptionLabel={(option) => {
                  if (typeof referenceSelector.optionText === 'function') {
                    return referenceSelector.optionText(option);
                  }
                  return String(option[referenceSelector.optionText || 'id'] || '');
                }}
                value={selectedReference}
                onChange={(_, newValue) => setSelectedReference(newValue)}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={(params) => (
                  <TextField {...params} label={referenceSelector.label} required />
                )}
                fullWidth
              />
            </div>
          )}
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            style={{ display: 'block', margin: '1rem 0' }}
          />
          {file && <p>Uploading: {file.name}</p>}
          <ul style={{ display: 'flex', flexDirection: 'column' }}>
            <li>CSV must have headers matching field names.</li>
            <li>
              Required CSV fields: <b>{csvFields}</b>
            </li>
            {csvNotes && (
              <ul>
                {Object.entries(csvNotes).map(([key, value]) => (
                  <li key={key}>
                    <b>{key}</b>: {value}
                  </li>
                ))}
              </ul>
            )}
          </ul>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} label="Cancel" />
          <Button
            onClick={handleImport}
            label="Import"
            disabled={!file || (referenceSelector && !selectedReference)}
            variant="contained"
          />
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ImportButton;
