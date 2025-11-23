import { useState, useEffect } from 'react';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import AuthForm from '../components/AuthForm';
import Dashboard from '../components/Dashboard';
import { useToast } from '@/hooks/use-toast';
import { api, User, Reminder as ApiReminder, ApiError } from '@/lib/api';

interface Reminder {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  frequency: string;
}

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
      loadReminders(storedToken);
    }
  }, []);

  const loadReminders = async (authToken: string) => {
    setIsLoading(true);
    try {
      const data = await api.getReminders(authToken);
      setReminders(data.map(r => ({
        id: r.id.toString(),
        title: r.title,
        description: r.description || '',
        date: r.date,
        time: r.time,
        frequency: r.frequency
      })));
    } catch (error) {
      if (error instanceof ApiError) {
        toast({
          title: 'Ошибка загрузки',
          description: error.message,
          variant: 'destructive'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.login(email, password);
      setUser(response.user);
      setToken(response.token);
      setIsAuthenticated(true);
      setShowAuth(false);
      
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      await loadReminders(response.token);
      
      toast({
        title: 'Успешный вход',
        description: `Добро пожаловать, ${response.user.full_name}!`
      });
    } catch (error) {
      if (error instanceof ApiError) {
        toast({
          title: 'Ошибка входа',
          description: error.message,
          variant: 'destructive'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      const response = await api.register(email, password, name);
      setUser(response.user);
      setToken(response.token);
      setIsAuthenticated(true);
      setShowAuth(false);
      
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      toast({
        title: 'Регистрация успешна',
        description: `Аккаунт создан для ${name}`
      });
    } catch (error) {
      if (error instanceof ApiError) {
        toast({
          title: 'Ошибка регистрации',
          description: error.message,
          variant: 'destructive'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
    setReminders([]);
    
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    
    toast({
      title: 'Выход выполнен',
      description: 'До встречи!'
    });
  };

  const handleAddReminder = async (reminder: Omit<Reminder, 'id'>) => {
    if (!token) return;
    
    setIsLoading(true);
    try {
      const created = await api.createReminder(token, {
        title: reminder.title,
        description: reminder.description,
        date: reminder.date,
        time: reminder.time,
        frequency: reminder.frequency as any
      });
      
      setReminders([...reminders, {
        id: created.id.toString(),
        title: created.title,
        description: created.description || '',
        date: created.date,
        time: created.time,
        frequency: created.frequency
      }]);
      
      toast({
        title: 'Напоминание создано',
        description: `"${reminder.title}" успешно добавлено`
      });
    } catch (error) {
      if (error instanceof ApiError) {
        toast({
          title: 'Ошибка создания',
          description: error.message,
          variant: 'destructive'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditReminder = async (id: string, updatedReminder: Omit<Reminder, 'id'>) => {
    if (!token) return;
    
    setIsLoading(true);
    try {
      const updated = await api.updateReminder(token, parseInt(id), {
        title: updatedReminder.title,
        description: updatedReminder.description,
        date: updatedReminder.date,
        time: updatedReminder.time,
        frequency: updatedReminder.frequency as any
      });
      
      setReminders(reminders.map(r => (r.id === id ? {
        id: updated.id.toString(),
        title: updated.title,
        description: updated.description || '',
        date: updated.date,
        time: updated.time,
        frequency: updated.frequency
      } : r)));
      
      toast({
        title: 'Напоминание обновлено',
        description: 'Изменения сохранены'
      });
    } catch (error) {
      if (error instanceof ApiError) {
        toast({
          title: 'Ошибка обновления',
          description: error.message,
          variant: 'destructive'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteReminder = async (id: string) => {
    if (!token) return;
    
    setIsLoading(true);
    try {
      await api.deleteReminder(token, parseInt(id));
      setReminders(reminders.filter(r => r.id !== id));
      
      toast({
        title: 'Напоминание удалено',
        description: 'Напоминание успешно удалено',
        variant: 'destructive'
      });
    } catch (error) {
      if (error instanceof ApiError) {
        toast({
          title: 'Ошибка удаления',
          description: error.message,
          variant: 'destructive'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetStarted = () => {
    setShowAuth(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
        onAuthClick={() => setShowAuth(true)}
      />
      
      {!isAuthenticated && !showAuth && (
        <HeroSection onGetStarted={handleGetStarted} />
      )}
      
      {!isAuthenticated && showAuth && (
        <AuthForm onLogin={handleLogin} onRegister={handleRegister} />
      )}
      
      {isAuthenticated && (
        <Dashboard
          reminders={reminders}
          onAddReminder={handleAddReminder}
          onEditReminder={handleEditReminder}
          onDeleteReminder={handleDeleteReminder}
        />
      )}
    </div>
  );
};

export default Index;