import { render, screen } from '@testing-library/react';
import App from './App';

beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve([]),
      headers: {
        get: () => 'application/json',
      },
    }),
  );
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('renders planner title', async () => {
  render(<App />);
  const heading = await screen.findByText(/домашний план питания/i);
  expect(heading).toBeInTheDocument();
});
