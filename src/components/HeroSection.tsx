import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface HeroSectionProps {
  onGetStarted: () => void;
}

export default function HeroSection({ onGetStarted }: HeroSectionProps) {
  return (
    <div className="container">
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-12 text-center animate-fade-in">
        <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-primary/10 animate-scale-in">
          <Icon name="Bell" className="h-12 w-12 text-primary" />
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 max-w-4xl">
          Никогда не забывайте важные события
        </h1>

        <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl">
          RemindMe — профессиональная система напоминаний с гибкими настройками периодичности
          и уведомлениями на почту
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button size="lg" onClick={onGetStarted} className="text-lg px-8">
            <Icon name="Rocket" className="h-5 w-5 mr-2" />
            Начать работу
          </Button>
        </div>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl w-full">
          <div className="flex flex-col items-center p-6 rounded-lg bg-card border hover:shadow-md transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-4">
              <Icon name="Calendar" className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Гибкое расписание</h3>
            <p className="text-sm text-muted-foreground">
              Настройте напоминания на нужную дату и время с различной периодичностью
            </p>
          </div>

          <div className="flex flex-col items-center p-6 rounded-lg bg-card border hover:shadow-md transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-4">
              <Icon name="Mail" className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Email уведомления</h3>
            <p className="text-sm text-muted-foreground">
              Получайте своевременные напоминания прямо на почту
            </p>
          </div>

          <div className="flex flex-col items-center p-6 rounded-lg bg-card border hover:shadow-md transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-4">
              <Icon name="Shield" className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Надежная защита</h3>
            <p className="text-sm text-muted-foreground">
              Ваши данные защищены с помощью JWT токенов и шифрования
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
