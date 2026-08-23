import express from 'express';
import { google } from 'googleapis';
import { prisma } from '../db';
import { authenticate, authorizeRole } from '../middleware/auth';

const router = express.Router();

const getOAuth2Client = () => {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/calendar/callback'
  );
};

// Generate URL for doctor to authenticate with Google
router.get('/auth', authenticate, authorizeRole(['DOCTOR']), (req, res) => {
  const oauth2Client = getOAuth2Client();
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline', // Required to receive a refresh token
    prompt: 'consent',
    scope: ['https://www.googleapis.com/auth/calendar.events'],
    state: req.user!.id // Pass doctor ID in state to retrieve in callback
  });
  res.status(200).json({ url });
});

// Callback for Google to redirect to with authorization code
router.get('/callback', async (req, res) => {
  const { code, state } = req.query;
  const doctorUserId = state as string;

  if (!code || !doctorUserId) {
    return res.status(400).json({ error: 'Missing code or state parameter' });
  }

  try {
    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code as string);
    
    if (tokens.refresh_token) {
      await prisma.doctorProfile.update({
        where: { userId: doctorUserId },
        data: { googleRefreshToken: tokens.refresh_token }
      });
      res.status(200).send('Google Calendar Connected successfully! You can close this window.');
    } else {
      res.status(400).send('No refresh token received. Make sure to revoke access and try again.');
    }
  } catch (error) {
    console.error('Google OAuth Callback Error:', error);
    res.status(500).send('Authentication failed');
  }
});

export default router;
