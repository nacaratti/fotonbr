import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Aperture, Users, Library, Zap, MessageSquare, Newspaper, ArrowRight } from 'lucide-react';

const FeatureCard = ({ icon, title, description, delay }) => (
  <motion.div 
    className="bg-card p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col items-center text-center"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: delay * 0.1 }}
  >
    <div className="p-3 bg-primary/10 rounded-full mb-4 text-primary">
      {icon}
    </div>
    <h3 className="text-xl font-semibold mb-2 text-card-foreground">{title}</h3>
    <p className="text-muted-foreground text-sm">{description}</p>
  </motion.div>
);

const HomePage = () => {
  const features = [
    { icon: <Aperture size={28} />, title: "Equipamentos Fotônicos", description: "Explore uma vasta gama de equipamentos fotônicos disponíveis para pesquisa e desenvolvimento." },
    { icon: <Users size={28} />, title: "Projetos Inovadores", description: "Descubra e colabore em projetos de ponta na área de fotônica." },
    { icon: <Library size={28} />, title: "Repositório de Conhecimento", description: "Acesse publicações, teses e materiais didáticos sobre fotônica." },
    { icon: <Zap size={28} />, title: "Plataforma Colaborativa", description: "Conecte-se com pesquisadores, instituições e empresas do setor." },
    { icon: <MessageSquare size={28} />, title: "Fórum Interativo", description: "Participe de discussões, tire dúvidas e compartilhe suas ideias com a comunidade." },
    { icon: <Newspaper size={28} />, title: "Newsletter", description: "Mantenha-se atualizado com as últimas notícias, eventos e oportunidades na fotônica." },
  ];

  return (
    <div className="bg-background text-foreground">
      {/* Hero Section */}
      <motion.section 
        className="py-20 md:py-32 bg-gradient-to-br from-primary/5 via-background to-background"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto px-4 text-center">
          <motion.h1 
            className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-500 to-purple-600"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Bem-vindo ao fotonBR
          </motion.h1>
          <motion.p 
            className="text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            Sua plataforma central para equipamentos, projetos, conhecimento e colaboração no ecossistema brasileiro de fotônica.
          </motion.p>
          <motion.div 
            className="space-x-4"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.6 }}
          >
            <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-transform transform hover:scale-105">
              <Link to="/equipamentos">Explorar Equipamentos <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="shadow-lg transition-transform transform hover:scale-105">
              <Link to="/projetos">Ver Projetos</Link>
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-semibold text-center mb-4 text-foreground">Conectando a Fotônica Brasileira</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            O fotonBR visa integrar e fortalecer a comunidade fotônica, facilitando o acesso a recursos e promovendo a colaboração.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} icon={feature.icon} title={feature.title} description={feature.description} delay={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container mx-auto px-4 text-center">
          <motion.h2 
            className="text-3xl md:text-4xl font-semibold mb-6 text-foreground"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Junte-se à Comunidade fotonBR
          </motion.h2>
          <motion.p 
            className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Cadastre-se para compartilhar seus equipamentos, propor projetos, participar de discussões e ficar por dentro das novidades.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Button size="lg" asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl transition-transform transform hover:scale-105">
              <Link to="/signup">Criar Conta <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Visual Placeholder Section */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <h3 className="text-2xl md:text-3xl font-semibold mb-4 text-foreground">Inovação e Colaboração em Foco</h3>
              <p className="text-muted-foreground mb-4">
                O fotonBR é mais do que um catálogo; é um hub dinâmico para impulsionar a pesquisa e o desenvolvimento tecnológico em fotônica no Brasil.
                Conectamos mentes brilhantes a recursos essenciais.
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center"><Zap size={18} className="mr-2 text-primary"/> Acesso facilitado a infraestrutura de pesquisa.</li>
                <li className="flex items-center"><Users size={18} className="mr-2 text-primary"/> Formação de parcerias estratégicas.</li>
                <li className="flex items-center"><Library size={18} className="mr-2 text-primary"/> Disseminação de conhecimento e melhores práticas.</li>
              </ul>
            </motion.div>
            <motion.div 
              className="h-64 md:h-80 bg-gradient-to-tr from-primary/20 via-blue-500/20 to-purple-600/20 rounded-xl flex items-center justify-center p-8 shadow-xl"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <img  alt="Abstract representation of photonic connections" className="w-full h-full object-contain opacity-75" src="https://images.unsplash.com/photo-1697706079319-a7217447cb36" />
            </motion.div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;