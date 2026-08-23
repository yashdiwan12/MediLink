import { google } from 'googleapis';

import { prisma } from '../db';

const getOAuth2Client = () => {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/calendar/callback'
  );
};

export const createCalendarEvent = async (doctorId: string, appointmentDetails: any) => {
  try {
    if (!process.env.GOOGLE_CLIENT_ID) {
      console.log('Skipping Calendar Sync: Missing Google Credentials in env');
      return null;
    }

    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: doctorId }
    });

    if (!doctorProfile?.googleRefreshToken) {
      console.log(`Skipping Calendar Sync: Doctor ${doctorId} has not connected Google Calendar`);
      return null;
    }

    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials({ refresh_token: doctorProfile.googleRefreshToken });
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const { summary, description, startTime, endTime, attendeeEmail } = appointmentDetails;
    
    const event = {
      summary,
      description,
      start: { dateTime: startTime, timeZone: 'UTC' },
      end: { dateTime: endTime, timeZone: 'UTC' },
      attendees: [{ email: attendeeEmail }],
    };

    const res = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });

    return res.data.id;
  } catch (error) {
    console.error('Calendar Sync Error:', error);
    return null;
  }
};

export const deleteCalendarEvent = async (doctorId: string, eventId: string) => {
  try {
    if (!process.env.GOOGLE_CLIENT_ID) {
      console.log('Skipping Calendar Sync: Missing Google Credentials in env');
      return false;
    }

    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: doctorId }
    });

    if (!doctorProfile?.googleRefreshToken) {
      return false;
    }

    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials({ refresh_token: doctorProfile.googleRefreshToken });
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    await calendar.events.delete({
      calendarId: 'primary',
      eventId,
    });

    return true;
  } catch (error) {
    console.error('Calendar Delete Error:', error);
    return false;
  }
};
