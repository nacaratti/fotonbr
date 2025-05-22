import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, UserPlus, UserCircle, Sun, Moon, LayoutDashboard, ShieldCheck, Shapes } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.jsx";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.jsx";

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, profile, signOut, loading } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getInitials = (name) => {
    if (!name) return "?";
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
  };
  
  const isAdmin = profile?.role === 'admin';

  return (
    <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <Shapes className="h-8 w-8 text-primary" />
          <span className="font-bold text-xl text-primary">fotonBR</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link to="/equipamentos" className="text-foreground/60 transition-colors hover:text-foreground/80">Equipamentos</Link>
          <Link to="/projetos" className="text-foreground/60 transition-colors hover:text-foreground/80">Projetos</Link>
          <Link to="/forum" className="text-foreground/60 transition-colors hover:text-foreground/80">Fórum</Link>
          <Link to="/newsletter" className="text-foreground/60 transition-colors hover:text-foreground/80">Newsletter</Link>
          {isAdmin && (
            <Link to="/admin" className="text-primary transition-colors hover:text-primary/80 flex items-center">
              <ShieldCheck className="h-4 w-4 mr-1" /> Admin
            </Link>
          )}
        </nav>
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>
          {loading ? (
             <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url || ''} alt={profile?.username || user.email} />
                    <AvatarFallback>{getInitials(profile?.full_name || profile?.username || user.email)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{profile?.full_name || profile?.username}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isAdmin && (
                  <>
                    <DropdownMenuItem onClick={() => navigate('/admin')}>
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      <span>Painel Admin</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={() => navigate('/perfil')}>
                  <UserCircle className="mr-2 h-4 w-4" />
                  <span>Meu Perfil</span>
                </DropdownMenuItem>
                {/* <DropdownMenuItem onClick={() => navigate('/dashboard-usuario')}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>Minhas Atividades</span>
                </DropdownMenuItem> */}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" onClick={() => navigate('/login')}>
                <LogIn className="mr-2 h-4 w-4" /> Entrar
              </Button>
              <Button onClick={() => navigate('/signup')}>
                <UserPlus className="mr-2 h-4 w-4" /> Cadastrar
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;