import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, UserPlus, UserCircle, Sun, Moon, ShieldCheck, Shapes, Menu, X, Home, Layers, FlaskConical, Lightbulb, Newspaper as NewspaperIcon, MessageSquare } from 'lucide-react';
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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet.jsx";

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, profile, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const getInitials = (name) => {
    if (!name) return "?";
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
  };
  
  const isAdmin = profile?.role === 'admin';

  const navLinks = [
    { to: "/equipamentos", label: "Equipamentos", icon: <FlaskConical className="mr-2 h-4 w-4" /> },
    { to: "/projetos", label: "Projetos", icon: <Lightbulb className="mr-2 h-4 w-4" /> },
    { to: "/forum", label: "Fórum", icon: <MessageSquare className="mr-2 h-4 w-4" /> },
    { to: "/newsletter", label: "Newsletter", icon: <NewspaperIcon className="mr-2 h-4 w-4" /> },
  ];

  return (
    <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2" onClick={() => setMobileMenuOpen(false)}>
          
          <span className="font-bold text-xl text-primary">fotonBR</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navLinks.map(link => (
            <Link key={link.to} to={link.to} className="text-foreground/60 transition-colors hover:text-foreground/80">
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link to="/admin" className="text-primary transition-colors hover:text-primary/80 flex items-center">
              <ShieldCheck className="h-4 w-4 mr-1" /> Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>

          {/* Mobile Menu Trigger */}
          <div className="md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[320px]">
                <SheetHeader className="mb-6">
                  <SheetTitle className="flex items-center">
                     
                    <span className="font-bold text-lg text-primary">fotonBR</span>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col space-y-3">
                  {navLinks.map(link => (
                    <SheetClose asChild key={`mobile-${link.to}`}>
                      <Link to={link.to} className="flex items-center py-2 px-3 rounded-md hover:bg-accent text-foreground">
                        {link.icon} {link.label}
                      </Link>
                    </SheetClose>
                  ))}
                  {isAdmin && (
                     <SheetClose asChild>
                        <Link to="/admin" className="flex items-center py-2 px-3 rounded-md hover:bg-accent text-primary">
                          <ShieldCheck className="mr-2 h-4 w-4" /> Painel Admin
                        </Link>
                    </SheetClose>
                  )}
                   <hr className="my-3"/>
                   {loading ? (
                      <div className="flex justify-center py-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                      </div>
                    ) : user ? (
                      <>
                        <SheetClose asChild>
                          <Link to="/perfil" className="flex items-center py-2 px-3 rounded-md hover:bg-accent text-foreground">
                            <UserCircle className="mr-2 h-4 w-4" /> Meu Perfil
                          </Link>
                        </SheetClose>
                        <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start py-2 px-3 text-foreground">
                          <LogOut className="mr-2 h-4 w-4" /> Sair
                        </Button>
                      </>
                    ) : (
                      <>
                        <SheetClose asChild>
                          <Link to="/login" className="flex items-center py-2 px-3 rounded-md hover:bg-accent text-foreground">
                            <LogIn className="mr-2 h-4 w-4" /> Entrar
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                           <Link to="/signup" className="flex items-center py-2 px-3 rounded-md hover:bg-accent text-foreground">
                            <UserPlus className="mr-2 h-4 w-4" /> Cadastrar
                          </Link>
                        </SheetClose>
                      </>
                    )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
          
          {/* Desktop User Menu/Login */}
          <div className="hidden md:flex items-center space-x-3">
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
      </div>
    </header>
  );
};

export default Header;