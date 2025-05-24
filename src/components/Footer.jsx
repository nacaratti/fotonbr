import React from 'react';
import { motion } from 'framer-motion';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <motion.footer 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="border-t bg-secondary"
    >
      <div className="container mx-auto px-4 py-6 text-center text-secondary-foreground">
        <p className="text-sm">
          &copy; {currentYear} fotonBR. Todos os direitos reservados.
        </p>
        <p className="text-xs mt-1">
          Promovendo a pesquisa em fotônica no Brasil.
        </p>
      </div>
    </motion.footer>
  );
};

export default Footer;