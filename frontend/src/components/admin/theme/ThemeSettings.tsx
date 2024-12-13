import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Tab,
  Tabs,
  Slider,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from '@mui/material';
import { ColorPicker } from './ColorPicker';
import { ThemePreview } from './ThemePreview';
import { uploadLogo, getThemeSettings, saveThemeSettings } from '../../../services/themeService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`theme-tabpanel-${index}`}
      aria-labelledby={`theme-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export const ThemeSettings: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [primaryColor, setPrimaryColor] = useState('#1976d2');
  const [secondaryColor, setSecondaryColor] = useState('#dc004e');
  const [menuColor, setMenuColor] = useState('#ffffff');
  const [backgroundColor, setBackgroundColor] = useState('#f5f5f5');
  const [textColor, setTextColor] = useState('#000000');
  const [logo, setLogo] = useState<string | undefined>();
  const [buttonRadius, setButtonRadius] = useState(4);
  const [cardRadius, setCardRadius] = useState(4);
  const [cardShadow, setCardShadow] = useState<'light' | 'medium' | 'strong'>('medium');
  const [successColor, setSuccessColor] = useState('#4caf50');
  const [errorColor, setErrorColor] = useState('#f44336');
  const [warningColor, setWarningColor] = useState('#ff9800');
  const [tableBorder, setTableBorder] = useState(true);
  const [tableStriped, setTableStriped] = useState(true);
  const [menuSelected, setMenuSelected] = useState('rgba(0, 0, 0, 0.08)');
  const [menuHover, setMenuHover] = useState('rgba(0, 0, 0, 0.04)');
  const [loginCardColor, setLoginCardColor] = useState('#ffffff');
  const [loginCardRadius, setLoginCardRadius] = useState(4);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadThemeSettings();
  }, []);

  const loadThemeSettings = async () => {
    try {
      const settings = await getThemeSettings();
      if (settings) {
        setPrimaryColor(settings.primaryColor);
        setSecondaryColor(settings.secondaryColor);
        setMenuColor(settings.menuColor);
        setBackgroundColor(settings.backgroundColor);
        setTextColor(settings.textColor);
        setLogo(settings.logo);
        setButtonRadius(settings.buttonRadius ?? 4);
        setCardRadius(settings.cardRadius ?? 4);
        setCardShadow(settings.cardShadow ?? 'medium');
        setSuccessColor(settings.successColor ?? '#4caf50');
        setErrorColor(settings.errorColor ?? '#f44336');
        setWarningColor(settings.warningColor ?? '#ff9800');
        setTableBorder(settings.tableBorder ?? true);
        setTableStriped(settings.tableStriped ?? true);
        setMenuSelected(settings.menuSelected ?? 'rgba(0, 0, 0, 0.08)');
        setMenuHover(settings.menuHover ?? 'rgba(0, 0, 0, 0.04)');
        setLoginCardColor(settings.loginCardColor ?? '#ffffff');
        setLoginCardRadius(settings.loginCardRadius ?? 4);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações do tema:', error);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        setLoading(true);
        const logoUrl = await uploadLogo(file);
        setLogo(logoUrl);
      } catch (error) {
        console.error('Erro ao fazer upload do logo:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await saveThemeSettings({
        primaryColor,
        secondaryColor,
        menuColor,
        backgroundColor,
        textColor,
        logo,
        buttonRadius,
        cardRadius,
        cardShadow,
        successColor,
        errorColor,
        warningColor,
        tableBorder,
        tableStriped,
        menuSelected,
        menuHover,
        loginCardColor,
        loginCardRadius,
      });
      window.location.reload(); // Recarrega a página para aplicar o novo tema
    } catch (error) {
      console.error('Erro ao salvar configurações do tema:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      <Box sx={{ flexGrow: 1, minWidth: 300 }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Configurações do Tema
          </Typography>

          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="Logo" />
              <Tab label="Cores" />
              <Tab label="Elementos" />
              <Tab label="Tabelas" />
              <Tab label="Menu" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="h6">Cores Principais</Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box>
                  <Typography>Cor Primária</Typography>
                  <ColorPicker color={primaryColor} onChange={setPrimaryColor} />
                </Box>
                <Box>
                  <Typography>Cor Secundária</Typography>
                  <ColorPicker color={secondaryColor} onChange={setSecondaryColor} />
                </Box>
              </Box>

              <Typography variant="h6" sx={{ mt: 2 }}>Cores do Sistema</Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box>
                  <Typography>Cor do Menu</Typography>
                  <ColorPicker color={menuColor} onChange={setMenuColor} />
                </Box>
                <Box>
                  <Typography>Cor de Fundo</Typography>
                  <ColorPicker color={backgroundColor} onChange={setBackgroundColor} />
                </Box>
                <Box>
                  <Typography>Cor do Texto</Typography>
                  <ColorPicker color={textColor} onChange={setTextColor} />
                </Box>
              </Box>

              <Typography variant="h6" sx={{ mt: 2 }}>Logo</Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                {logo && (
                  <Box
                    component="img"
                    src={logo}
                    alt="Logo"
                    sx={{ maxWidth: 200, maxHeight: 100 }}
                  />
                )}
                <Button
                  variant="contained"
                  component="label"
                >
                  Upload Logo
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleLogoUpload}
                  />
                </Button>
              </Box>

              <Typography variant="h6" sx={{ mt: 2 }}>Aparência do Login</Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ width: 200 }}>
                  <Typography>Cor do Card de Login</Typography>
                  <ColorPicker color={loginCardColor} onChange={setLoginCardColor} />
                </Box>
                <Box sx={{ width: 200 }}>
                  <Typography>Raio do Card de Login</Typography>
                  <Slider
                    value={loginCardRadius}
                    onChange={(e, value) => setLoginCardRadius(value as number)}
                    min={0}
                    max={20}
                    step={1}
                    marks
                    valueLabelDisplay="auto"
                  />
                </Box>
              </Box>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <ColorPicker
                label="Cor de Sucesso"
                value={successColor}
                onChange={setSuccessColor}
              />
              <ColorPicker
                label="Cor de Erro"
                value={errorColor}
                onChange={setErrorColor}
              />
              <ColorPicker
                label="Cor de Alerta"
                value={warningColor}
                onChange={setWarningColor}
              />
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box>
                <Typography gutterBottom>Raio dos Botões</Typography>
                <Slider
                  value={buttonRadius}
                  onChange={(_, value) => setButtonRadius(value as number)}
                  min={0}
                  max={24}
                  step={1}
                  marks
                  valueLabelDisplay="auto"
                />
              </Box>

              <Box>
                <Typography gutterBottom>Raio dos Cards</Typography>
                <Slider
                  value={cardRadius}
                  onChange={(_, value) => setCardRadius(value as number)}
                  min={0}
                  max={24}
                  step={1}
                  marks
                  valueLabelDisplay="auto"
                />
              </Box>

              <FormControl fullWidth>
                <InputLabel>Sombra dos Cards</InputLabel>
                <Select
                  value={cardShadow}
                  onChange={(e) => setCardShadow(e.target.value as 'light' | 'medium' | 'strong')}
                  label="Sombra dos Cards"
                >
                  <MenuItem value="light">Leve</MenuItem>
                  <MenuItem value="medium">Média</MenuItem>
                  <MenuItem value="strong">Forte</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={tableBorder}
                    onChange={(e) => setTableBorder(e.target.checked)}
                  />
                }
                label="Mostrar Bordas"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={tableStriped}
                    onChange={(e) => setTableStriped(e.target.checked)}
                  />
                }
                label="Linhas Alternadas"
              />
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <ColorPicker
                label="Cor do Item Selecionado"
                value={menuSelected}
                onChange={setMenuSelected}
              />
              <ColorPicker
                label="Cor do Hover"
                value={menuHover}
                onChange={setMenuHover}
              />
            </Box>
          </TabPanel>

          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={loading}
              fullWidth
            >
              Salvar Configurações
            </Button>
          </Box>
        </Paper>
      </Box>

      <Box sx={{ flexGrow: 1, minWidth: 300 }}>
        <ThemePreview
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          menuColor={menuColor}
          backgroundColor={backgroundColor}
          textColor={textColor}
          logo={logo}
          buttonRadius={buttonRadius}
          cardRadius={cardRadius}
          cardShadow={cardShadow}
          successColor={successColor}
          errorColor={errorColor}
          warningColor={warningColor}
          tableBorder={tableBorder}
          tableStriped={tableStriped}
          menuSelected={menuSelected}
          menuHover={menuHover}
          loginCardColor={loginCardColor}
          loginCardRadius={loginCardRadius}
        />
      </Box>
    </Box>
  );
};
