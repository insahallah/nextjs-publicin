"use client";

import { useState } from 'react';
import Link from 'next/link';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Breadcrumbs,
  Chip,
} from '@mui/material';
import {
  Home as HomeIcon,
  PrivacyTip as PrivacyIcon,
  Shield as ShieldIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  NavigateNext as NavigateNextIcon,
  Security as SecurityIcon,
  VisibilityOff as VisibilityOffIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { yellow, grey } from '@mui/material/colors';

export default function PrivacyPage() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Define colors
  const blackColor = '#000000';
  const yellowColor = yellow[800];
  const lightYellow = yellow[50];
  const darkYellow = yellow[900];

  // Your contact information
  const contactInfo = {
    email: 'support@publicin.in',
    address: 'Jamua, Giridih, Jharkhand - 815318',
    hours: 'Monday-Friday, 9:00 AM - 6:00 PM IST',
    website: 'https://www.publicin.in',
  };

  const privacySections = [
    {
      id: 'introduction',
      title: '1. Introduction & Overview',
      icon: <PrivacyIcon />,
      content: `Welcome to PublicIn ("we", "our", "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website publicin.in or use our services.`,
      highlight: true,
    },
    {
      id: 'information-we-collect',
      title: '2. Information We Collect',
      icon: <EditIcon />,
      content: `We collect information to provide better services to all our users. The types of information we collect include:

**A. Personal Information:**
- Name, email address, phone number
- Business name, address, category
- Profile picture and business logos
- Contact details for business listings

**B. Business Information:**
- Business descriptions, services, products
- Operating hours, location, contact details
- Photos, videos, and other media
- Reviews and ratings

**C. Usage Data:**
- IP address, browser type, device information
- Pages visited, time spent, features used
- Search queries, clicks, and navigation patterns
- Location data (with your permission)`,
      subSections: [
        'Registration Information',
        'Business Listing Data',
        'User Interactions',
        'Technical Information',
      ],
    },
    {
      id: 'how-we-use',
      title: '3. How We Use Your Information',
      icon: <ShieldIcon />,
      content: `We use the information we collect for the following purposes:

- **To Provide Services:** Display business listings, enable user interactions, and facilitate connections
- **To Improve Platform:** Analyze usage patterns to enhance user experience and platform functionality
- **To Communicate:** Send service updates, respond to inquiries, and provide customer support
- **To Maintain Security:** Detect, prevent, and address technical issues and fraudulent activities
- **For Legal Compliance:** Comply with applicable laws, regulations, and legal processes`,
      points: [
        'Service delivery and operation',
        'Platform optimization and development',
        'User communication and support',
        'Security and fraud prevention',
        'Legal compliance and enforcement',
      ],
    },
    {
      id: 'data-sharing',
      title: '4. Data Sharing & Disclosure',
      icon: <VisibilityOffIcon />,
      content: `We respect your privacy and do not sell your personal information. We may share your information only in the following circumstances:

**With Your Consent:** When you explicitly agree to share information
**Business Listings:** Business information you provide is publicly visible on our platform
**Service Providers:** With trusted third-party vendors who assist in platform operations
**Legal Requirements:** When required by law, regulation, or legal process
**Business Transfers:** In connection with a merger, acquisition, or sale of assets`,
      warning: true,
    },
    {
      id: 'data-security',
      title: '5. Data Security',
      icon: <LockIcon />,
      content: `We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:

- **Encryption:** SSL/TLS encryption for data transmission
- **Access Controls:** Restricted access to personal information
- **Regular Audits:** Security assessments and vulnerability testing
- **Employee Training:** Privacy and security awareness programs

Despite our safeguards, no internet transmission is completely secure. We cannot guarantee absolute security.`,
      highlight: true,
    },
    {
      id: 'user-rights',
      title: '6. Your Rights & Choices',
      icon: <CheckIcon />,
      content: `As a user of PublicIn, you have the following rights regarding your personal information:

**Access:** Request access to the personal information we hold about you
**Correction:** Request correction of inaccurate or incomplete information
**Deletion:** Request deletion of your personal information, subject to legal requirements
**Objection:** Object to certain processing activities
**Data Portability:** Request transfer of your data to another service
**Withdraw Consent:** Withdraw consent for data processing at any time

To exercise these rights, contact us at ${contactInfo.email}`,
      points: [
        'Right to access your data',
        'Right to correct inaccuracies',
        'Right to delete your data',
        'Right to data portability',
        'Right to object to processing',
      ],
    },
    {
      id: 'cookies',
      title: '7. Cookies & Tracking Technologies',
      icon: <SecurityIcon />,
      content: `We use cookies and similar tracking technologies to enhance your experience on our platform:

**Essential Cookies:** Required for basic platform functionality
**Analytics Cookies:** Help us understand how users interact with our platform
**Preference Cookies:** Remember your settings and preferences
**Advertising Cookies:** Deliver relevant advertisements

You can control cookie preferences through your browser settings. However, disabling cookies may affect platform functionality.`,
    },
    {
      id: 'third-party',
      title: '8. Third-Party Links & Services',
      icon: <WarningIcon />,
      content: `Our platform may contain links to third-party websites or services. This Privacy Policy does not apply to those third-party services. We encourage you to review the privacy policies of any third-party services you visit.

We are not responsible for the content, privacy practices, or security of third-party websites.`,
      warning: true,
    },
    {
      id: 'children-privacy',
      title: '9. Children\'s Privacy',
      icon: <ShieldIcon />,
      content: `PublicIn is not intended for children under the age of 16. We do not knowingly collect personal information from children under 16. If you believe we have collected information from a child under 16, please contact us immediately at ${contactInfo.email} so we can take appropriate action.`,
    },
    {
      id: 'changes',
      title: '10. Changes to Privacy Policy',
      icon: <EditIcon />,
      content: `We may update this Privacy Policy from time to time. We will notify you of significant changes by:
- Posting the new Privacy Policy on this page
- Sending an email notification (if you have provided your email)
- Displaying a notice on our platform

The "Last Updated" date at the top of this page indicates when the policy was last revised.`,
    },
    {
      id: 'contact',
      title: '11. Contact Us',
      icon: <EmailIcon />,
      content: `If you have any questions, concerns, or requests regarding this Privacy Policy or our privacy practices, please contact us:

**Email:** ${contactInfo.email}
**Address:** ${contactInfo.address}
**Hours:** ${contactInfo.hours}
**Website:** ${contactInfo.website}

We aim to respond to all privacy-related inquiries within 7 business days.`,
      contactInfo: true,
    },
  ];

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  return (
    <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        {/* Breadcrumbs */}
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />} 
          sx={{ mb: 4 }}
        >
          <Link 
            href="/" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              color: blackColor,
              textDecoration: 'none',
              fontWeight: 500,
            }}
          >
            <HomeIcon sx={{ mr: 1, color: yellowColor }} />
            Home
          </Link>
          <Typography sx={{ display: 'flex', alignItems: 'center', color: blackColor }}>
            <PrivacyIcon sx={{ mr: 1, color: yellowColor }} />
            Privacy Policy
          </Typography>
        </Breadcrumbs>

        {/* Header */}
        <Box textAlign="center" mb={6}>
          <Chip 
            label="PRIVACY POLICY" 
            sx={{ 
              bgcolor: yellowColor, 
              color: 'white',
              fontWeight: 'bold',
              mb: 2,
              px: 2,
              py: 1,
            }}
          />
          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom 
            fontWeight="bold"
            sx={{ 
              color: blackColor,
              fontSize: { xs: '2rem', md: '2.5rem' },
            }}
          >
            Our Commitment to Your Privacy
          </Typography>
          <Typography variant="h6" color={grey[700]} paragraph>
            Last Updated: March 2024 • Version 2.0
          </Typography>
          <Typography variant="body1" color={grey[600]} sx={{ maxWidth: 800, mx: 'auto' }}>
            At PublicIn, we believe in transparency and protecting your personal information. 
            This policy explains how we handle your data on India&apos;s premier business discovery platform.
          </Typography>
        </Box>

        {/* Quick Info Cards */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 6, justifyContent: 'center' }}>
          <Paper 
            sx={{ 
              p: 3, 
              textAlign: 'center',
              flex: 1,
              minWidth: 200,
              bgcolor: lightYellow,
              borderLeft: `4px solid ${yellowColor}`,
            }}
          >
            <SecurityIcon sx={{ fontSize: 40, color: yellowColor, mb: 1 }} />
            <Typography variant="subtitle1" fontWeight="bold">Data Protected</Typography>
            <Typography variant="body2" color={grey[600]}>Enterprise-grade security</Typography>
          </Paper>
          
          <Paper 
            sx={{ 
              p: 3, 
              textAlign: 'center',
              flex: 1,
              minWidth: 200,
              bgcolor: lightYellow,
              borderLeft: `4px solid ${yellowColor}`,
            }}
          >
            <DeleteIcon sx={{ fontSize: 40, color: yellowColor, mb: 1 }} />
            <Typography variant="subtitle1" fontWeight="bold">Your Control</Typography>
            <Typography variant="body2" color={grey[600]}>Manage your data anytime</Typography>
          </Paper>
          
          <Paper 
            sx={{ 
              p: 3, 
              textAlign: 'center',
              flex: 1,
              minWidth: 200,
              bgcolor: lightYellow,
              borderLeft: `4px solid ${yellowColor}`,
            }}
          >
            <VisibilityOffIcon sx={{ fontSize: 40, color: yellowColor, mb: 1 }} />
            <Typography variant="subtitle1" fontWeight="bold">No Selling</Typography>
            <Typography variant="body2" color={grey[600]}>We don&apos;t sell your data</Typography>
          </Paper>
        </Box>

        {/* Privacy Sections */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: { xs: 3, md: 4 }, 
            mb: 4, 
            borderRadius: 3,
            border: `1px solid ${grey[200]}`,
          }}
        >
          {privacySections.map((section, index) => (
            <Box key={section.id}>
              <Box
                onClick={() => toggleSection(section.id)}
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 3,
                  mb: 3,
                  cursor: 'pointer',
                  p: 2,
                  borderRadius: 2,
                  bgcolor: expandedSection === section.id ? lightYellow : 'transparent',
                  borderLeft: `4px solid ${section.highlight ? yellowColor : grey[300]}`,
                  '&:hover': {
                    bgcolor: lightYellow,
                  },
                }}
              >
                <Box sx={{ color: yellowColor }}>
                  {section.icon}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography 
                    variant="h5" 
                    gutterBottom 
                    fontWeight="bold"
                    sx={{ color: blackColor }}
                  >
                    {section.title}
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      whiteSpace: 'pre-line',
                      lineHeight: 1.8,
                      color: grey[700],
                    }}
                  >
                    {section.content}
                  </Typography>
                  
                  {section.points && (
                    <List sx={{ mt: 2, pl: 2 }}>
                      {section.points.map((point, idx) => (
                        <ListItem key={idx} sx={{ py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 30 }}>
                            <CheckIcon sx={{ color: yellowColor, fontSize: 16 }} />
                          </ListItemIcon>
                          <ListItemText 
                            primary={point} 
                            sx={{ color: grey[700] }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}

                  {section.subSections && (
                    <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {section.subSections.map((sub, idx) => (
                        <Chip
                          key={idx}
                          label={sub}
                          size="small"
                          sx={{
                            bgcolor: yellow[100],
                            color: darkYellow,
                            fontWeight: 500,
                          }}
                        />
                      ))}
                    </Box>
                  )}

                  {section.contactInfo && (
                    <Box sx={{ mt: 3, p: 3, bgcolor: lightYellow, borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <EmailIcon sx={{ mr: 2, color: yellowColor }} />
                        <Typography fontWeight="bold">
                          <a 
                            href={`mailto:${contactInfo.email}`}
                            style={{ color: blackColor, textDecoration: 'none' }}
                          >
                            {contactInfo.email}
                          </a>
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                        <LocationIcon sx={{ mr: 2, color: yellowColor, mt: 0.5 }} />
                        <Typography fontWeight="bold">{contactInfo.address}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <HomeIcon sx={{ mr: 2, color: yellowColor }} />
                        <Typography fontWeight="bold">{contactInfo.hours}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PrivacyIcon sx={{ mr: 2, color: yellowColor }} />
                        <Typography fontWeight="bold">
                          <a 
                            href={contactInfo.website}
                            style={{ color: blackColor, textDecoration: 'none' }}
                          >
                            {contactInfo.website}
                          </a>
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>
              
              {section.warning && (
                <Paper
                  sx={{
                    p: 3,
                    mb: 3,
                    bgcolor: '#fff8e1',
                    border: `1px solid ${yellow[300]}`,
                    borderRadius: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <WarningIcon sx={{ color: yellowColor, flexShrink: 0 }} />
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        Important Notice
                      </Typography>
                      <Typography variant="body2">
                        Your business information will be publicly visible on our platform. 
                        Do not share sensitive personal information in business listings.
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              )}

              {index < privacySections.length - 1 && (
                <Divider sx={{ my: 4, opacity: 0.3 }} />
              )}
            </Box>
          ))}
        </Paper>

        {/* Location Map Section */}
        <Paper
          sx={{
            p: 4,
            mb: 6,
            bgcolor: lightYellow,
            border: `2px solid ${yellow[200]}`,
            borderRadius: 3,
          }}
        >
          <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ color: blackColor, display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationIcon /> Our Location
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4, alignItems: 'center' }}>
            <Box>
              <Typography variant="h6" gutterBottom>PublicIn Headquarters</Typography>
              <Typography variant="body1" paragraph>
                Located in the heart of Jharkhand, our team works diligently to serve businesses across India.
              </Typography>
              <List>
                <ListItem sx={{ py: 1 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <LocationIcon sx={{ color: yellowColor }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Address" 
                    secondary={contactInfo.address}
                  />
                </ListItem>
                <ListItem sx={{ py: 1 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <EmailIcon sx={{ color: yellowColor }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Email" 
                    secondary={
                      <a href={`mailto:${contactInfo.email}`} style={{ color: yellowColor }}>
                        {contactInfo.email}
                      </a>
                    }
                  />
                </ListItem>
                <ListItem sx={{ py: 1 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <HomeIcon sx={{ color: yellowColor }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Business Hours" 
                    secondary={contactInfo.hours}
                  />
                </ListItem>
              </List>
            </Box>
            <Box sx={{ height: 300, borderRadius: 2, overflow: 'hidden', border: `1px solid ${grey[300]}` }}>
              {/* Google Maps Embed */}
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3630.4728854372387!2d86.1911446742806!3d24.38895625921617!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f22010c3f98379%3A0x796001456161937c!2sJamua%2C%20Giridih%2C%20Jharkhand%20815318!5e0!3m2!1sen!2sin!4v1709890000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="PublicIn Office Location"
              />
            </Box>
          </Box>
        </Paper>

        {/* Navigation Links */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap', mb: 6 }}>
          <Button
            component={Link}
            href="/terms"
            variant="contained"
            sx={{
              bgcolor: yellowColor,
              color: 'white',
              px: 4,
              py: 1.5,
              '&:hover': {
                bgcolor: darkYellow,
              },
            }}
          >
            View Terms of Service
          </Button>
          <Button
            component={Link}
            href="/contact"
            variant="outlined"
            sx={{
              borderColor: yellowColor,
              color: yellowColor,
              px: 4,
              py: 1.5,
              '&:hover': {
                borderColor: darkYellow,
                bgcolor: lightYellow,
              },
            }}
          >
            Contact Support
          </Button>
          <Button
            component={Link}
            href="/"
            variant="outlined"
            sx={{
              borderColor: grey[400],
              color: grey[700],
              px: 4,
              py: 1.5,
            }}
          >
            Back to Home
          </Button>
        </Box>

        {/* Footer */}
        <Box sx={{ 
          mt: 8, 
          pt: 4, 
          borderTop: `2px solid ${grey[200]}`,
          textAlign: 'center',
        }}>
          <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ color: blackColor }}>
            PublicIn - India&apos;s Business Discovery Platform
          </Typography>
          <Typography variant="body2" color={grey[600]} paragraph>
            Connecting businesses with customers across India • Based in Giridih, Jharkhand
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mb: 2, flexWrap: 'wrap' }}>
            <Typography variant="caption" color={grey[500]}>
              📧 {contactInfo.email}
            </Typography>
            <Typography variant="caption" color={grey[500]}>
              📍 {contactInfo.address}
            </Typography>
          </Box>
          <Typography variant="caption" color={grey[500]}>
            © 2024 PublicIn. All rights reserved. | Privacy Policy v2.0 | 
            This document is available in multiple formats upon request.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}