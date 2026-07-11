// Site-wide constants used across views and server routes.
const phoneDisplay = '+27 68 025 7725';
const phoneHref = '+27680257725';
const whatsappNumber = '27680257725'; // international format, no plus/spaces, for wa.me links
const email = 'info@mjpsecrity.co.za';

module.exports = {
  siteName: 'MJP Security',
  tagline: 'Your Community Armed Response Service',
  phoneDisplay,
  phoneHref,
  whatsappNumber,
  whatsappLink: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hi MJP Security, I would like to find out more about your services.')}`,
  email,
  address: 'Cape Town, South Africa',
  facebook: 'https://facebook.com',
  gaMeasurementId: process.env.GA_MEASUREMENT_ID || '',
};
