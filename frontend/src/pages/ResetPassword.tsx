import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Alert } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { auth } from '../config/firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Logo } from '../components/Logo';
import LoadingButton from '@mui/lab/LoadingButton';
import LockIcon from '@mui/icons-material/Lock';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { PublicLayout } from '../components/PublicLayout';

export default function ResetPassword() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [oobCode, setOobCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('oobCode');
    
    if (!code) {
      setError('Link de redefinição de senha inválido');
      setLoading(false);
      return;
    }

    verifyPasswordResetCode(auth, code)
      .then((email) => {
        setOobCode(code);
        setEmail(email);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Erro ao verificar código:', error);
        setError('Link de redefinição de senha inválido ou expirado');
        setLoading(false);
      });
  }, [location]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!oobCode) {
        throw new Error('Código de redefinição inválido');
      }

      if (password !== confirmPassword) {
        throw new Error('As senhas não coincidem');
      }

      // Verificar o código e atualizar a senha no Firebase Auth
      const email = await verifyPasswordResetCode(auth, oobCode);
      await confirmPasswordReset(auth, oobCode, password);

      // Atualizar a senha no Firestore
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        await updateDoc(doc(db, 'users', userDoc.id), {
          password: password
        });
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      console.error('Erro ao redefinir senha:', error);
      setError('Erro ao redefinir senha. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PublicLayout>
        <Box sx={{ textAlign: 'center' }}>
          <Typography>Verificando link de redefinição...</Typography>
        </Box>
      </PublicLayout>
    );
  }

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
            Redefinir Senha
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.secondary,
              fontSize: '0.95rem',
            }}
          >
            Digite sua nova senha
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Senha redefinida com sucesso! Redirecionando para o login...
          </Alert>
        )}

        <TextField
          fullWidth
          label="Nova Senha"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={resetting || success}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <TextField
          fullWidth
          label="Confirmar Nova Senha"
          type={showConfirmPassword ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={resetting || success}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  edge="end"
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <LoadingButton
          type="submit"
          variant="contained"
          fullWidth
          loading={resetting}
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
          Redefinir Senha
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
