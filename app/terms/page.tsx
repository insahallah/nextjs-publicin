"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Divider,
  Alert,
  Breadcrumbs,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

export default function TermsPage() {
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasAccepted = localStorage.getItem('publicinTermsAccepted') === 'true';
      setAccepted(hasAccepted);
    }
  }, []);

  const handleAccept = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('publicinTermsAccepted', 'true');
    }
    setAccepted(true);
  };

  const termsContent = [
    {
      title: "1. Introduction",
      content: "Welcome to PublicIn, India's business discovery platform. By accessing or using our website and services, you agree to be bound by these Terms of Service.",
    },
    {
      title: "2. User Responsibilities",
      content: "You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account. You must provide accurate and complete information when registering.",
    },
    {
      title: "3. Business Listings",
      content: "Business owners are solely responsible for the accuracy and completeness of their listings. We reserve the right to verify, modify, or remove any listing that violates our policies.",
    },
    {
      title: "4. Content Guidelines",
      content: "All content posted on PublicIn must be lawful, truthful, and not misleading. Prohibited content includes false information, spam, adult content, and illegal activities.",
    },
    {
      title: "5. Reviews and Ratings",
      content: "Reviews must be based on genuine experiences. Businesses may not offer incentives for positive reviews or post fake reviews of their own business.",
    },
    {
      title: "6. Intellectual Property",
      content: "PublicIn and its original content, features, and functionality are owned by us and protected by copyright, trademark, and other intellectual property laws.",
    },
    {
      title: "7. Disclaimer",
      content: "PublicIn provides business information 'as is' without warranties of any kind. We do not guarantee the accuracy, completeness, or reliability of any business listing.",
    },
    {
      title: "8. Limitation of Liability",
      content: "PublicIn shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of our platform.",
    },
    {
      title: "9. Changes to Terms",
      content: "We reserve the right to modify these terms at any time. We will notify users of significant changes via email or platform notifications.",
    },
    {
      title: "10. Contact Us",
      content: "For questions about these Terms, contact us at: support@publicin.in",
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 4 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', color: 'inherit' }}>
          <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
          Home
        </Link>
        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
          <DescriptionIcon sx={{ mr: 0.5 }} fontSize="small" />
          Terms of Service
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box textAlign="center" mb={6}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          Terms of Service
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Last Updated: March 2024
        </Typography>
        {accepted && (
          <Alert 
            severity="success" 
            sx={{ maxWidth: 400, mx: 'auto', mb: 2 }}
            icon={<CheckCircleIcon />}
          >
            You have accepted these terms
          </Alert>
        )}
      </Box>

      {/* Terms Content */}
      <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, mb: 4, borderRadius: 2 }}>
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
          {termsContent.map((section, index) => (
            <Box key={index} sx={{ mb: 4 }}>
              <Typography variant="h5" gutterBottom fontWeight={600} color="primary">
                {section.title}
              </Typography>
              <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                {section.content}
              </Typography>
              {index < termsContent.length - 1 && <Divider sx={{ my: 3 }} />}
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Acceptance Section */}
      {!accepted && (
        <Box textAlign="center" mb={6}>
          <Alert 
            severity="info" 
            sx={{ maxWidth: 600, mx: 'auto', mb: 3 }}
          >
            <Typography variant="body2">
              Please read and accept our Terms of Service to continue using PublicIn
            </Typography>
          </Alert>
          <Button
            variant="contained"
            size="large"
            onClick={handleAccept}
            startIcon={<CheckCircleIcon />}
            sx={{ px: 4 }}
          >
            Accept Terms of Service
          </Button>
        </Box>
      )}

      {/* Navigation Links */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap', mt: 6 }}>
        <Button
          component={Link}
          href="/privacy"
          variant="outlined"
        >
          Privacy Policy
        </Button>
        <Button
          component={Link}
          href="/contact"
          variant="outlined"
        >
          Contact Us
        </Button>
        <Button
          component={Link}
          href="/"
          variant="outlined"
        >
          Back to Home
        </Button>
      </Box>

      {/* Footer Note */}
      <Box sx={{ mt: 8, pt: 3, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          © 2024 PublicIn. All rights reserved. PublicIn is India&apos;s business discovery platform.
        </Typography>
      </Box>
    </Container>
  );
}