import React from "react";
import "whatwg-fetch";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { server } from "../mocks/server";
import App from "../components/App";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test("displays question prompts after fetching", async () => {
  render(<App />);

  // Click the "View Questions" button
  fireEvent.click(screen.getByText("View Questions"));

  // Wait for the question prompts to appear
  await waitFor(() => {
    expect(screen.getByText("lorem testum 1")).toBeInTheDocument();
    expect(screen.getByText("lorem testum 2")).toBeInTheDocument();
  });
});

test("creates a new question when the form is submitted", async () => {
  render(<App />);

  // Wait for the initial question to appear
  await screen.findByText(/lorem testum 1/g);

  // Click the "New Question" button
  fireEvent.click(screen.getByText("New Question"));

  // Fill out the form
  fireEvent.change(screen.getByLabelText("Prompt"), {
    target: { value: "Test Prompt" },
  });
  fireEvent.change(screen.getByLabelText("Answer 1"), {
    target: { value: "Test Answer 1" },
  });
  fireEvent.change(screen.getByLabelText("Answer 2"), {
    target: { value: "Test Answer 2" },
  });
  fireEvent.change(screen.getByLabelText("Correct Answer"), {
    target: { value: "1" },
  });

  // Submit the form
  fireEvent.submit(screen.getByText("Add Question"));

  // Wait for the new question to appear
  await waitFor(() => {
    expect(screen.getByText("Test Prompt")).toBeInTheDocument();
  });
});

test("deletes the question when the delete button is clicked", async () => {
  const { rerender } = render(<App />);

  // Click the "View Questions" button
  fireEvent.click(screen.getByText("View Questions"));

  // Wait for the question to appear
  await screen.findByText(/lorem testum 1/g);

  // Click the delete button of the first question
  fireEvent.click(screen.getAllByText("Delete Question")[0]);

  // Wait for the question to be removed
  await waitForElementToBeRemoved(screen.queryByText(/lorem testum 1/g));

  // Re-render and ensure the deleted question is no longer present
  rerender(<App />);
  expect(screen.queryByText(/lorem testum 1/g)).not.toBeInTheDocument();
});

test("updates the answer when the dropdown is changed", async () => {
  const { rerender } = render(<App />);

  // Click the "View Questions" button
  fireEvent.click(screen.getByText("View Questions"));

  // Wait for the question to appear
  await screen.findByText(/lorem testum 2/g);

  // Change the dropdown selection for the first question
  fireEvent.change(screen.getAllByLabelText("Correct Answer")[0], {
    target: { value: "3" },
  });

  // Check that the dropdown value has been updated
  expect(screen.getByDisplayValue("3")).toBeInTheDocument();

  // Re-render and ensure the updated answer is retained
  rerender(<App />);
  expect(screen.getByDisplayValue("3")).toBeInTheDocument();
});
