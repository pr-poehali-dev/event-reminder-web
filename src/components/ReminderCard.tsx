import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface Reminder {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  frequency: string;
}

interface ReminderCardProps {
  reminder: Reminder;
  onEdit: (reminder: Reminder) => void;
  onDelete: (id: string) => void;
}

const frequencyLabels: Record<string, string> = {
  once: 'Один раз',
  daily: 'Каждый день',
  weekly: 'Каждую неделю',
  monthly: 'Каждый месяц',
  yearly: 'Каждый год'
};

const frequencyIcons: Record<string, string> = {
  once: 'Clock',
  daily: 'Calendar',
  weekly: 'CalendarDays',
  monthly: 'CalendarRange',
  yearly: 'CalendarCheck'
};

export default function ReminderCard({ reminder, onEdit, onDelete }: ReminderCardProps) {
  const formattedDate = new Date(reminder.date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <Card className="transition-all hover:shadow-md hover:-translate-y-1 animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Icon name={frequencyIcons[reminder.frequency]} className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{reminder.title}</CardTitle>
              <CardDescription className="mt-1">
                {formattedDate} в {reminder.time}
              </CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className="ml-2">
            {frequencyLabels[reminder.frequency]}
          </Badge>
        </div>
      </CardHeader>
      {reminder.description && (
        <CardContent className="pb-3">
          <p className="text-sm text-muted-foreground">{reminder.description}</p>
        </CardContent>
      )}
      <CardContent className="flex gap-2 pt-0">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(reminder)}
          className="flex-1"
        >
          <Icon name="Edit" className="h-4 w-4 mr-2" />
          Изменить
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(reminder.id)}
          className="flex-1"
        >
          <Icon name="Trash2" className="h-4 w-4 mr-2" />
          Удалить
        </Button>
      </CardContent>
    </Card>
  );
}
