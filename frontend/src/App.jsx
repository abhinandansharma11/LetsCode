import React from 'react';
import AppRouter from './AppRouter';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
      <Toaster position="top-right" richColors />
      <AppRouter />
    </>
  );
}

export default App;
