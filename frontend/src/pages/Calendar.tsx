import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  useTheme,
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Alert,
  Snackbar,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Add as AddIcon,
  Event as EventIcon,
  CalendarViewMonth as CalendarViewMonthIcon,
  CalendarViewWeek as CalendarViewWeekIcon,
  CalendarViewDay as CalendarViewDayIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import ptBR from 'date-fns/locale/pt-BR';
import { eventService } from '../services/eventService';

const locales = {
  'pt-BR': ptBR,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const MotionPaper = motion(Paper);

interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  type: 'meeting' | 'task' | 'reminder';
}

const eventTypes = [
  { value: 'meeting', label: 'Reunião' },
  { value: 'task', label: 'Tarefa' },
  { value: 'reminder', label: 'Lembrete' },
];

export default function Calendar() {
  const theme = useTheme();
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as const });
  
  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    title: '',
    start: new Date(),
    end: new Date(),
    description: '',
    type: 'meeting',
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await eventService.getAll();
      setEvents(data.map(event => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
      })));
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
      setError('Não foi possível carregar os eventos. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewChange = (
    event: React.MouseEvent<HTMLElement>,
    newView: 'month' | 'week' | 'day' | null,
  ) => {
    if (newView !== null) {
      setView(newView);
    }
  };

  const handleNavigate = (action: 'PREV' | 'NEXT' | 'TODAY') => {
    const newDate = new Date(selectedDate);
    
    switch (action) {
      case 'PREV':
        newDate.setMonth(newDate.getMonth() - 1);
        break;
      case 'NEXT':
        newDate.setMonth(newDate.getMonth() + 1);
        break;
      case 'TODAY':
        newDate.setTime(new Date().getTime());
        break;
    }
    
    setSelectedDate(newDate);
  };

  const handleEventSelect = (event: Event) => {
    setSelectedEvent(event);
    setNewEvent(event);
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedEvent(null);
    setNewEvent({
      title: '',
      start: new Date(),
      end: new Date(),
      description: '',
      type: 'meeting',
    });
  };

  const handleEventSave = async () => {
    try {
      if (!newEvent.title || !newEvent.start || !newEvent.end || !newEvent.type) {
        setSnackbar({
          open: true,
          message: 'Por favor, preencha todos os campos obrigatórios',
          severity: 'error',
        });
        return;
      }

      if (selectedEvent) {
        await eventService.update(selectedEvent.id, newEvent);
        setSnackbar({
          open: true,
          message: 'Evento atualizado com sucesso',
          severity: 'success',
        });
      } else {
        await eventService.create(newEvent);
        setSnackbar({
          open: true,
          message: 'Evento criado com sucesso',
          severity: 'success',
        });
      }

      handleDialogClose();
      loadEvents();
    } catch (error) {
      console.error('Erro ao salvar evento:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao salvar evento. Por favor, tente novamente.',
        severity: 'error',
      });
    }
  };

  const handleEventDelete = async () => {
    if (!selectedEvent) return;

    try {
      await eventService.delete(selectedEvent.id);
      setSnackbar({
        open: true,
        message: 'Evento excluído com sucesso',
        severity: 'success',
      });
      handleDialogClose();
      loadEvents();
    } catch (error) {
      console.error('Erro ao excluir evento:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao excluir evento. Por favor, tente novamente.',
        severity: 'error',
      });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <MotionPaper
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        elevation={2}
        sx={{ p: 3, borderRadius: 2 }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 'bold',
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Calendário
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <ToggleButtonGroup
              value={view}
              exclusive
              onChange={handleViewChange}
              aria-label="view selector"
              size="small"
            >
              <ToggleButton value="month" aria-label="month view">
                <CalendarViewMonthIcon />
              </ToggleButton>
              <ToggleButton value="week" aria-label="week view">
                <CalendarViewWeekIcon />
              </ToggleButton>
              <ToggleButton value="day" aria-label="day view">
                <CalendarViewDayIcon />
              </ToggleButton>
            </ToggleButtonGroup>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton onClick={() => handleNavigate('PREV')}>
                <ChevronLeftIcon />
              </IconButton>
              <Button onClick={() => handleNavigate('TODAY')}>Hoje</Button>
              <IconButton onClick={() => handleNavigate('NEXT')}>
                <ChevronRightIcon />
              </IconButton>
            </Box>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
              sx={{
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                boxShadow: '0 3px 5px 2px rgba(0, 0, 0, .1)',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 10px 4px rgba(0, 0, 0, .1)',
                },
              }}
            >
              Novo Evento
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default' }}>
              <BigCalendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 'calc(100vh - 250px)' }}
                view={view}
                onView={(newView: any) => setView(newView)}
                onSelectEvent={handleEventSelect}
                date={selectedDate}
                onNavigate={(date: Date) => setSelectedDate(date)}
                messages={{
                  next: "Próximo",
                  previous: "Anterior",
                  today: "Hoje",
                  month: "Mês",
                  week: "Semana",
                  day: "Dia",
                  noEventsInRange: "Não há eventos neste período",
                }}
                eventPropGetter={(event: Event) => ({
                  style: {
                    backgroundColor: event.type === 'meeting' 
                      ? theme.palette.primary.main 
                      : event.type === 'task'
                      ? theme.palette.secondary.main
                      : theme.palette.warning.main,
                    borderRadius: '4px',
                  },
                })}
              />
            </Paper>
          </motion.div>
        </AnimatePresence>
      </MotionPaper>

      <Dialog 
        open={openDialog} 
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedEvent ? 'Editar Evento' : 'Novo Evento'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Título"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              required
            />

            <TextField
              select
              fullWidth
              label="Tipo"
              value={newEvent.type}
              onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as Event['type'] })}
              required
            >
              {eventTypes.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              type="datetime-local"
              label="Início"
              value={format(newEvent.start || new Date(), "yyyy-MM-dd'T'HH:mm")}
              onChange={(e) => setNewEvent({ ...newEvent, start: new Date(e.target.value) })}
              InputLabelProps={{ shrink: true }}
              required
            />

            <TextField
              fullWidth
              type="datetime-local"
              label="Fim"
              value={format(newEvent.end || new Date(), "yyyy-MM-dd'T'HH:mm")}
              onChange={(e) => setNewEvent({ ...newEvent, end: new Date(e.target.value) })}
              InputLabelProps={{ shrink: true }}
              required
            />

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Descrição"
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          {selectedEvent && (
            <Button 
              onClick={handleEventDelete}
              color="error"
              sx={{ mr: 'auto' }}
            >
              Excluir
            </Button>
          )}
          <Button onClick={handleDialogClose}>Cancelar</Button>
          <Button 
            onClick={handleEventSave}
            variant="contained"
            sx={{
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            }}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
