import React, { useEffect, useState } from 'react';
import { getAllMappings } from '../services/urlService';
import { getLogs } from '../middleware/loggingMiddleware';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import dayjs from 'dayjs';

export default function StatsPage() {
  const [mappings, setMappings] = useState([]);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    setMappings(getAllMappings());
    setLogs(getLogs());
  }, []);

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>URL Shortener Statistics</Typography>

      <Paper sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Short URL</TableCell>
              <TableCell>Original URL</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Expires</TableCell>
              <TableCell>Clicks</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mappings.length === 0 && (
              <TableRow><TableCell colSpan={5}>No data</TableCell></TableRow>
            )}
            {mappings.map(m => (
              <TableRow key={m.shortcode}>
                <TableCell>{window.location.origin}/{m.shortcode}</TableCell>
                <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.longUrl}</TableCell>
                <TableCell>{dayjs(m.createdAt).format('YYYY-MM-DD HH:mm:ss')}</TableCell>
                <TableCell>{dayjs(m.expiresAt).format('YYYY-MM-DD HH:mm:ss')}</TableCell>
                <TableCell>{m.clicks || 0}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Typography variant="subtitle1" sx={{ mb: 1 }}>Detailed Click Data (per URL)</Typography>
      {mappings.map(m => (
        <Box key={m.shortcode} sx={{ mb: 2 }}>
          <Typography variant="body1">{m.shortcode} — clicks: {m.clicks || 0}</Typography>
          <Paper sx={{ p: 1, mt: 1 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>Referrer / Source</TableCell>
                  <TableCell>Geo (coarse)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(m.clickDetails || []).slice().reverse().map((c, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{dayjs(c.timestamp).format('YYYY-MM-DD HH:mm:ss')}</TableCell>
                    <TableCell>{c.referrer}</TableCell>
                    <TableCell>{c.geo}</TableCell>
                  </TableRow>
                ))}
                {(!m.clickDetails || m.clickDetails.length === 0) && (
                  <TableRow><TableCell colSpan={3}>No clicks yet</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>
        </Box>
      ))}

      <Typography variant="subtitle1" sx={{ mt: 3 }}>Event Logs (from logging middleware)</Typography>
      <Paper sx={{ mt: 1, p: 1 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Time</TableCell>
              <TableCell>Event</TableCell>
              <TableCell>Payload (summary)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.length === 0 && <TableRow><TableCell colSpan={3}>No logs</TableCell></TableRow>}
            {logs.slice().reverse().map(l => (
              <TableRow key={l.id}>
                <TableCell>{dayjs(l.timestamp).format('YYYY-MM-DD HH:mm:ss')}</TableCell>
                <TableCell>{l.eventType}</TableCell>
                <TableCell style={{ maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {typeof l.payload === 'object' ? JSON.stringify(l.payload) : String(l.payload)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
