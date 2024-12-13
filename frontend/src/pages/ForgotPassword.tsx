import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Alert } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Logo } from '../components/Logo';
import LoadingButton from '@mui/lab/LoadingButton';
import EmailIcon from '@mui/icons-material/Email';
import InputAdornment from '@mui/material/InputAdornment';
import { PublicLayout } from '../components/PublicLayout';

export default function ForgotPassword() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      // Primeiro, verificar se o email existe no Firestore
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error('Email não encontrado no sistema');
      }

      // Se o email existe, enviar email de recuperação
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (error: any) {
      console.error('Erro ao recuperar senha:', error);
      if (error.code === 'auth/invalid-email') {
        setError('Email inválido');
      } else if (error.code === 'auth/user-not-found') {
        setError('Email não encontrado');
      } else if (error.message === 'Email não encontrado no sistema') {
        setError('Email não encontrado no sistema');
      } else {
        setError('Erro ao enviar email de recuperação. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <Box
        component={motion.form}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        onSubmit={handleSubmit}
        sx={{
          width: '100%',
          maxWidth: 400,
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          backgroundColor: 'white',
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          padding: { xs: 3, sm: 4 },
          mx: 2,
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Logo 
            size={120}
            sx={{ mb: 3, mx: 'auto', display: 'block' }}
          />
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 700,
              color: theme.palette.primary.main,
              mb: 1.5,
              fontSize: { xs: '1.75rem', sm: '2rem' },
            }}
          >
            Recuperar Senha
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.secondary,
              fontSize: '0.95rem',
            }}
          >
            Digite seu email para receber as instruções de recuperação
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Email de recuperação enviado com sucesso! Verifique sua caixa de entrada.
          </Alert>
        )}

        <TextField
          fullWidth
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading || success}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailIcon color="action" />
              </InputAdornment>
            ),
          }}
        />

        <LoadingButton
          type="submit"
          variant="contained"
          fullWidth
          loading={loading}
          disabled={success}
          sx={{
            mt: 2,
            py: 1.5,
            borderRadius: 1.5,
            textTransform: 'none',
            fontSize: '1rem',
            fontWeight: 600,
          }}
        >
          Enviar Email de Recuperação
        </LoadingButton>

        <Button
          variant="text"
          onClick={() => navigate('/login')}
          sx={{
            textTransform: 'none',
            color: theme.palette.text.secondary,
          }}
        >
          Voltar para Login
        </Button>
      </Box>
    </PublicLayout>
  );
}
