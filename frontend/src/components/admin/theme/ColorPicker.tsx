import React, { useState } from 'react';
import { Box, Typography, Popover, IconButton } from '@mui/material';
import { HexColorPicker } from 'react-colorful';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Typography sx={{ minWidth: 120 }}>{label}</Typography>
      <IconButton
        onClick={handleClick}
        sx={{
          width: 40,
          height: 40,
          backgroundColor: value,
          borderRadius: 1,
          border: '2px solid #ddd',
          '&:hover': {
            backgroundColor: value,
            opacity: 0.8,
          },
        }}
      />
      <Typography variant="body2" color="textSecondary">
        {value}
      </Typography>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Box sx={{ p: 2 }}>
          <HexColorPicker color={value} onChange={onChange} />
        </Box>
      </Popover>
    </Box>
  );
}
