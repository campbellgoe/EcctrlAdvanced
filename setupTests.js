import '@testing-library/jest-dom'
import { Request } from 'whatwg-fetch';
import { configure } from '@testing-library/react';

// Optional: Configure global settings for React Testing Library
configure({ asyncUtilTimeout: 3000 });
global.Request = Request;

global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))