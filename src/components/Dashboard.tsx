import { useState } from 'react';
import ReminderCard from './ReminderCard';
import ReminderForm from './ReminderForm';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';

interface Reminder {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  frequency: string;
}

interface DashboardProps {
  reminders: Reminder[];
  onAddReminder: (reminder: Omit<Reminder, 'id'>) => void;
  onEditReminder: (id: string, reminder: Omit<Reminder, 'id'>) => void;
  onDeleteReminder: (id: string) => void;
}

export default function Dashboard({ reminders, onAddReminder, onEditReminder, onDeleteReminder }: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);

  const filteredReminders = reminders.filter(reminder =>
    reminder.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reminder.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (reminder: Reminder) => {
    setEditingReminder(reminder);
  };

  const handleEditSubmit = (updatedReminder: Omit<Reminder, 'id'>) => {
    if (editingReminder) {
      onEditReminder(editingReminder.id, updatedReminder);
      setEditingReminder(null);
    }
  };

  return (
    <div className="container py-8 animate-fade-in">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight mb-2">Мои напоминания</h2>
            <p className="text-muted-foreground">
              Управляйте своими задачами и событиями
            </p>
          </div>
          <ReminderForm onSubmit={onAddReminder} />
        </div>

        <div className="relative">
          <Icon name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск напоминаний..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {filteredReminders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center animate-scale-in">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">
            <Icon name="Bell" className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-medium mb-2">
            {searchQuery ? 'Ничего не найдено' : 'Нет напоминаний'}
          </h3>
          <p className="text-muted-foreground mb-6 max-w-sm">
            {searchQuery
              ? 'Попробуйте изменить поисковый запрос'
              : 'Создайте первое напоминание, чтобы начать'}
          </p>
          {!searchQuery && <ReminderForm onSubmit={onAddReminder} />}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredReminders.map((reminder) => (
            <ReminderCard
              key={reminder.id}
              reminder={reminder}
              onEdit={handleEdit}
              onDelete={onDeleteReminder}
            />
          ))}
        </div>
      )}

      {editingReminder && (
        <ReminderForm
          onSubmit={handleEditSubmit}
          initialData={editingReminder}
          buttonText="Сохранить изменения"
        />
      )}
    </div>
  );
}
