import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import App from "../src/App";

function LocationProbe() {
  const location = useLocation();
  return <span data-testid="location-probe">{location.pathname}</span>;
}

test("redirects unmatched routes to login", () => {
  render(
    <MemoryRouter initialEntries={["/some-unknown-path"]}>
      <LocationProbe />
      <App />
    </MemoryRouter>
  );

  expect(screen.getByText("login")).toBeInTheDocument();
  expect(screen.getByTestId("location-probe")).toHaveTextContent("/login");
});

test("redirects root path to login", () => {
  render(
    <MemoryRouter initialEntries={["/"]}>
      <LocationProbe />
      <App />
    </MemoryRouter>
  );

  expect(screen.getByText("login")).toBeInTheDocument();
  expect(screen.getByTestId("location-probe")).toHaveTextContent("/login");
});
