import { useState } from 'react';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import AuthForm from '../components/AuthForm';
import Dashboard from '../components/Dashboard';
import { useToast } from '@/hooks/use-toast';

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
  const [reminders, setReminders] = useState<Reminder[]>([
    {
      id: '1',
      title: 'Встреча с командой',
      description: 'Обсудить планы на следующий квартал',
      date: '2025-11-25',
      time: '10:00',
      frequency: 'weekly'
    },
    {
      id: '2',
      title: 'Отправить отчет',
      description: 'Финансовый отчет за ноябрь',
      date: '2025-11-30',
      time: '17:00',
      frequency: 'monthly'
    }
  ]);

  const { toast } = useToast();

  const handleLogin = (email: string, password: string) => {
    setIsAuthenticated(true);
    setShowAuth(false);
    toast({
      title: 'Успешный вход',
      description: `Добро пожаловать, ${email}!`
    });
  };

  const handleRegister = (email: string, password: string, name: string) => {
    setIsAuthenticated(true);
    setShowAuth(false);
    toast({
      title: 'Регистрация успешна',
      description: `Аккаунт создан для ${name}`
    });
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    toast({
      title: 'Выход выполнен',
      description: 'До встречи!'
    });
  };

  const handleAddReminder = (reminder: Omit<Reminder, 'id'>) => {
    const newReminder = {
      ...reminder,
      id: Date.now().toString()
    };
    setReminders([...reminders, newReminder]);
    toast({
      title: 'Напоминание создано',
      description: `"${reminder.title}" успешно добавлено`
    });
  };

  const handleEditReminder = (id: string, updatedReminder: Omit<Reminder, 'id'>) => {
    setReminders(reminders.map(r => (r.id === id ? { ...updatedReminder, id } : r)));
    toast({
      title: 'Напоминание обновлено',
      description: 'Изменения сохранены'
    });
  };

  const handleDeleteReminder = (id: string) => {
    setReminders(reminders.filter(r => r.id !== id));
    toast({
      title: 'Напоминание удалено',
      description: 'Напоминание успешно удалено',
      variant: 'destructive'
    });
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