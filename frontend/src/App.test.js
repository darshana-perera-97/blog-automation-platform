import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders general statistics title", () => {
  render(<App />);
  const title = screen.getByText(/general statistics/i);
  expect(title).toBeInTheDocument();
});
