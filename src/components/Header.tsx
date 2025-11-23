import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface HeaderProps {
  isAuthenticated: boolean;
  onLogout: () => void;
  onAuthClick: () => void;
}

export default function Header({ isAuthenticated, onLogout, onAuthClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Icon name="Bell" className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">RemindMe</h1>
            <p className="text-xs text-muted-foreground">Система напоминаний</p>
          </div>
        </div>

        <nav className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-muted-foreground hidden sm:inline">
                Личный кабинет
              </span>
              <Button onClick={onLogout} variant="outline" size="sm">
                <Icon name="LogOut" className="h-4 w-4 mr-2" />
                Выход
              </Button>
            </>
          ) : (
            <Button onClick={onAuthClick} size="sm">
              <Icon name="LogIn" className="h-4 w-4 mr-2" />
              Войти
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
