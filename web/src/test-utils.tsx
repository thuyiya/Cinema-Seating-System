import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material';
import { MemoryRouter } from 'react-router-dom';

// Suppress React Router warnings in tests
const originalConsoleWarn = console.warn;
console.warn = (...args: any[]) => {
  if (args[0]?.includes?.('React Router')) {
    return;
  }
  originalConsoleWarn(...args);
};

const theme = createTheme();

const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  );
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { route?: string }
) => {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <MemoryRouter initialEntries={[options?.route || '/']}>
      <AllTheProviders>{children}</AllTheProviders>
    </MemoryRouter>
  );

  return render(ui, { wrapper: Wrapper, ...options });
};

// re-export everything
export * from '@testing-library/react';

// override render method
export { customRender as render }; 