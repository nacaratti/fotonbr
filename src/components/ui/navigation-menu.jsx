import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';
import { User, LogOut, Settings, Home, Info, Phone } from 'lucide-react';

const Navbar = () => {
  const { user, profile, initialized, loading, signOut } = useAuth();
  const navigate = useNavigate();

  if (!initialized) {
    return (
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 hidden md:flex">
            <div className="h-6 w-24 animate-pulse rounded bg-muted"></div>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="h-8 w-32 animate-pulse rounded bg-muted"></div>
          </div>
        </div>
      </nav>
    );
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login'); // 🔥 Redireciona após logout
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {/* Logo/Brand */}
        <div className="mr-4 hidden md:flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">
              MeuApp
            </span>
          </Link>
        </div>

        {/* Navigation Menu */}
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <NavigationMenu>
            <NavigationMenuList>
              {/* Menu público sempre visível */}
              <NavigationMenuItem>
                <NavigationMenuTrigger>Sobre</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                    <li className="row-span-3">
                      <NavigationMenuLink asChild>
                        <Link
                          className="flex h-full w-full select-none flex-col justify-end rounded-lg bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                          to="/"
                        >
                          <Home className="h-6 w-6" />
                          <div className="mb-2 mt-4 text-lg font-medium">
                            MeuApp
                          </div>
                          <p className="text-sm leading-tight text-muted-foreground">
                            Aplicação moderna com autenticação segura.
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/sobre"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none flex items-center gap-2">
                            <Info className="h-4 w-4" />
                            Sobre nós
                          </div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Conheça nossa história e missão.
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/contato"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            Contato
                          </div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Entre em contato conosco.
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Área de autenticação */}
              {user ? (
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {loading ? (
                      <span className="h-4 w-16 animate-pulse rounded bg-muted"></span>
                    ) : (
                      <span>{profile?.name || user.email}</span>
                    )}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[200px] gap-2 p-2">
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/perfil"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none flex items-center gap-2">
                              <Settings className="h-4 w-4" />
                              Meu Perfil
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Gerencie suas informações
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <button
                          onClick={handleSignOut}
                          disabled={loading}
                          className="w-full block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:opacity-50"
                        >
                          <div className="text-sm font-medium leading-none flex items-center gap-2">
                            <LogOut className="h-4 w-4" />
                            {loading ? 'Saindo...' : 'Sair'}
                          </div>
                        </button>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ) : (
                <>
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link
                        to="/login"
                        className={cn(navigationMenuTriggerStyle())}
                      >
                        Entrar
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link
                        to="/cadastro"
                        className={cn(
                          navigationMenuTriggerStyle(),
                          'bg-primary text-primary-foreground hover:bg-primary/90'
                        )}
                      >
                        Cadastrar
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                </>
              )}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
