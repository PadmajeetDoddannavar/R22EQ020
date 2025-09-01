import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import dayjs from 'dayjs';

export default function ShortLinkCard({ mapping }) {
  const shortUrl = `${window.location.origin}/${mapping.shortcode}`;
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="subtitle1">{mapping.longUrl}</Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Short: <a href={shortUrl} target="_blank" rel="noreferrer">{shortUrl}</a>
        </Typography>
        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
          Created: {dayjs(mapping.createdAt).format('YYYY-MM-DD HH:mm:ss')} • Expires: {dayjs(mapping.expiresAt).format('YYYY-MM-DD HH:mm:ss')}
        </Typography>
        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2">Clicks: {mapping.clicks || 0}</Typography>
          <Button size="small" href={shortUrl} target="_blank" rel="noreferrer">Open</Button>
        </Box>
      </CardContent>
    </Card>
  );
}
