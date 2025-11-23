import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';

interface ReminderFormProps {
  onSubmit: (reminder: {
    title: string;
    description: string;
    date: string;
    time: string;
    frequency: string;
  }) => void;
  initialData?: {
    title: string;
    description: string;
    date: string;
    time: string;
    frequency: string;
  };
  buttonText?: string;
}

export default function ReminderForm({ onSubmit, initialData, buttonText = 'Создать напоминание' }: ReminderFormProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [date, setDate] = useState(initialData?.date || '');
  const [time, setTime] = useState(initialData?.time || '');
  const [frequency, setFrequency] = useState(initialData?.frequency || 'once');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, description, date, time, frequency });
    setOpen(false);
    if (!initialData) {
      setTitle('');
      setDescription('');
      setDate('');
      setTime('');
      setFrequency('once');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size={initialData ? 'sm' : 'default'}>
          <Icon name={initialData ? 'Edit' : 'Plus'} className="h-4 w-4 mr-2" />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Редактировать напоминание' : 'Новое напоминание'}</DialogTitle>
          <DialogDescription>
            Заполните информацию о напоминании
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Название</Label>
            <Input
              id="title"
              placeholder="Встреча с клиентом"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              placeholder="Обсудить условия контракта"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Дата</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Время</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="frequency">Частота</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger id="frequency">
                <SelectValue placeholder="Выберите частоту" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="once">Один раз</SelectItem>
                <SelectItem value="daily">Каждый день</SelectItem>
                <SelectItem value="weekly">Каждую неделю</SelectItem>
                <SelectItem value="monthly">Каждый месяц</SelectItem>
                <SelectItem value="yearly">Каждый год</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button type="submit">
              <Icon name="Check" className="h-4 w-4 mr-2" />
              {initialData ? 'Сохранить' : 'Создать'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
