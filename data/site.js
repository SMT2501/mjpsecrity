// Site-wide constants used across views and server routes.
const phoneDisplay = '+27 21 010 9151'; // office landline
const phoneHref = '+27210109151';
const whatsappNumber = '27680257725'; // international format, no plus/spaces, for wa.me links
const whatsappDisplay = '+27 68 025 7725';
const email = 'info@mjpsecrity.co.za';

module.exports = {
  siteName: 'MJP Security',
  tagline: 'Your Community Armed Response Service',
  phoneDisplay,
  phoneHref,
  whatsappNumber,
  whatsappDisplay,
  whatsappLink: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hi MJP Security, I would like to find out more about your services.')}`,
  email,
  address: 'Unit 9 Labella Park, Stikland Industrial, 7530, Cape Town',
  addressShort: 'Stikland Industrial, Cape Town',
  facebook: 'https://facebook.com',
  logoEmblem: '/images/logo-emblem.png',
  gaMeasurementId: process.env.GA_MEASUREMENT_ID || '',
};
