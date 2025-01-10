import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import {
  Box,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Link,
  Typography,
  Alert,
  Container,
  Paper
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { login } from '../services/authService';

const validationSchema = yup.object({
  email: yup
    .string()
    .email('Geçerli bir email adresi giriniz')
    .required('Email adresi gereklidir'),
  password: yup
    .string()
    .min(6, 'Şifre en az 6 karakter olmalıdır')
    .required('Şifre gereklidir'),
});

const StyledContainer = styled(Container)({
  height: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#1e2530',
});

const StyledPaper = styled(Paper)({
  padding: '2rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  backgroundColor: '#262f3d',
  borderRadius: '8px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  width: '100%',
  maxWidth: '400px',
});

const StyledTextField = styled(TextField)({
  marginBottom: '1rem',
  '& .MuiOutlinedInput-root': {
    color: '#fff',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    '& fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.23)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#00bcd4',
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.7)',
  },
});

const StyledButton = styled(Button)({
  marginTop: '1rem',
  backgroundColor: '#00bcd4',
  padding: '0.75rem',
  '&:hover': {
    backgroundColor: '#00acc1',
  },
});

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = React.useState<string>('');

  const formik = useFormik({
    initialValues: {
      email: 'admin@admin.com',
      password: 'StrongPass123!',
      rememberMe: false,
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        setError('');
        const response = await login(values.email, values.password);
        
        const token = response.accessToken;
        if (values.rememberMe) {
          localStorage.setItem('token', token);
        } else {
          sessionStorage.setItem('token', token);
        }
        
        navigate('/dashboard');
      } catch (err: any) {
        setError(err.message || 'Giriş başarısız');
      }
    },
  });

  return (
    <StyledContainer>
      <StyledPaper>
        <Typography component="h1" variant="h5" style={{ color: '#fff', marginBottom: '1.5rem' }}>
          Giriş Yap
        </Typography>
        {error && (
          <Alert severity="error" style={{ marginBottom: '1rem', width: '100%' }}>
            {error}
          </Alert>
        )}
        <form onSubmit={formik.handleSubmit} style={{ width: '100%' }}>
          <StyledTextField
            fullWidth
            id="email"
            name="email"
            label="Email"
            value={formik.values.email}
            onChange={formik.handleChange}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />
          <StyledTextField
            fullWidth
            id="password"
            name="password"
            label="Şifre"
            type="password"
            value={formik.values.password}
            onChange={formik.handleChange}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
          />
          <FormControlLabel
            control={
              <Checkbox
                name="rememberMe"
                checked={formik.values.rememberMe}
                onChange={formik.handleChange}
                style={{ color: '#00bcd4' }}
              />
            }
            label="Beni Hatırla"
            style={{ color: '#fff', marginBottom: '1rem' }}
          />
          <StyledButton
            type="submit"
            fullWidth
            variant="contained"
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </StyledButton>
        </form>
      </StyledPaper>
    </StyledContainer>
  );
};

export default Login; 