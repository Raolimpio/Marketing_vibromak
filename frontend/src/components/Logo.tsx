import { Box, BoxProps } from '@mui/material';
import { useTheme } from '../hooks/useTheme';

interface LogoProps extends BoxProps {
  size?: number;
}

export function Logo({ size = 150, ...props }: LogoProps) {
  const theme = useTheme();
  const logo = theme.logo || '/icon-192x192.png';

  return (
    <Box
      component="img"
      src={logo}
      alt="Logo"
      sx={{
        width: size,
        height: 'auto',
        objectFit: 'contain',
        ...props.sx
      }}
      {...props}
    />
  );
}
