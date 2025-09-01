import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import { createShortLinks, getAllMappings } from '../services/urlService';
import ShortLinkCard from './ShortLinkCard';
import { isValidUrl, isValidShortcode, toIntMinutes } from '../utils/validation';
import loggingMiddleware from '../middleware/loggingMiddleware';
import { useLocation } from 'react-router-dom';

export default function ShortenerPage() {
  // up to 5 lines
  const emptyRow = { longUrl: '', validityMinutes: '', preferredShortcode: '' };
  const [rows, setRows] = useState([ {...emptyRow } ]);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [mappings, setMappings] = useState([]);
  const location = useLocation();

  useEffect(() => {
    setMappings(getAllMappings());
  }, []);

  // show redirect_error if present
  useEffect(() => {
    const qp = new URLSearchParams(location.search);
    const redirectError = qp.get('redirect_error');
    if (redirectError) {
      setError(redirectError);
    }
  }, [location.search]);

  function addRow() {
    if (rows.length >= 5) return;
    setRows(prev => [ ...prev, {...emptyRow} ]);
  }
  function removeRow(idx) {
    setRows(prev => prev.filter((_, i) => i !== idx));
  }
  function updateRow(idx, key, value) {
    setRows(prev => prev.map((r, i) => i === idx ? {...r, [key]: value} : r));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    // Client-side validation
    const toSend = [];
    for (let i=0;i<rows.length;i++) {
      const r = rows[i];
      if (!r.longUrl || r.longUrl.trim() === '') continue; // skip empty rows
      if (!isValidUrl(r.longUrl.trim())) {
        setError(`Row ${i+1}: Invalid URL`);
        loggingMiddleware('shortener_client_validation_failed', { row: i+1, reason: 'invalid_url', value: r.longUrl });
        return;
      }
      if (r.preferredShortcode && r.preferredShortcode.trim() !== '') {
        if (!isValidShortcode(r.preferredShortcode.trim())) {
          setError(`Row ${i+1}: Invalid shortcode (use alphanumeric, 3-20 chars)`);
          loggingMiddleware('shortener_client_validation_failed', { row: i+1, reason: 'invalid_shortcode', value: r.preferredShortcode });
          return;
        }
      }
      const minutes = r.validityMinutes === '' ? null : toIntMinutes(r.validityMinutes);
      if (r.validityMinutes !== '' && minutes === null) {
        setError(`Row ${i+1}: Validity must be an integer (minutes)`);
        loggingMiddleware('shortener_client_validation_failed', { row: i+1, reason: 'invalid_validity', value: r.validityMinutes });
        return;
      }
      toSend.push({
        longUrl: r.longUrl.trim(),
        validityMinutes: minutes,
        preferredShortcode: r.preferredShortcode ? r.preferredShortcode.trim() : undefined
      });
    }

    if (toSend.length === 0) {
      setError('Please enter at least one URL to shorten.');
      return;
    }

    // Call the client-side "API"
    const res = await createShortLinks(toSend);
    if (!res || !res.success) {
      setError('Failed to create short links. Please try again.');
      loggingMiddleware('shortener_create_failed_top', { res });
      return;
    }

    setResults(res.results);
    setMappings(getAllMappings());
    loggingMiddleware('shortener_create_complete', { resultsCount: res.results.length });
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>Shorten URLs (up to 5 at once)</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          {rows.map((r, idx) => (
            <React.Fragment key={idx}>
              <Grid item xs={12}>
                <TextField
                  label={`Long URL ${idx+1}`}
                  fullWidth
                  value={r.longUrl}
                  onChange={(e)=>updateRow(idx,'longUrl', e.target.value)}
                  placeholder="https://example.com/very/long/path"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  label="Validity (minutes)"
                  fullWidth
                  value={r.validityMinutes}
                  onChange={(e)=>updateRow(idx,'validityMinutes', e.target.value)}
                  placeholder="30"
                />
              </Grid>
              <Grid item xs={6} sm={6}>
                <TextField
                  label="Preferred shortcode (optional)"
                  fullWidth
                  value={r.preferredShortcode}
                  onChange={(e)=>updateRow(idx,'preferredShortcode', e.target.value)}
                  placeholder="myCode123"
                />
              </Grid>
              <Grid item xs={12} sm={3} sx={{ display: 'flex', alignItems: 'center' }}>
                <Button variant="outlined" color="error" onClick={()=>removeRow(idx)} disabled={rows.length===1}>Remove</Button>
                <Box sx={{ ml: 1 }} />
                {idx === rows.length - 1 && rows.length < 5 && (
                  <Button variant="contained" onClick={addRow}>Add Row</Button>
                )}
              </Grid>
            </React.Fragment>
          ))}
          <Grid item xs={12}>
            <Button type="submit" variant="contained">Create Short Links</Button>
          </Grid>
        </Grid>
      </form>

      {/* Show results */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6">Results</Typography>
        {results.length === 0 && <Typography variant="body2" sx={{ mt: 1 }}>No results yet.</Typography>}
        {results.map((r, i) => (
          <Box key={i} sx={{ mt: 1 }}>
            {r.success ? (
              <ShortLinkCard mapping={r.mapping} />
            ) : (
              <Alert severity="warning">{r.message}</Alert>
            )}
          </Box>
        ))}
      </Box>

      {/* Recent mappings */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6">All Shortened URLs</Typography>
        {mappings.length === 0 && <Typography variant="body2">No URLs created yet.</Typography>}
        {mappings.slice().reverse().map(m => (
          <ShortLinkCard key={m.shortcode} mapping={m} />
        ))}
      </Box>
    </Box>
  );
}
