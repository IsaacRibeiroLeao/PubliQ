import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PubliQLogo } from "@/components/PubliQLogo";

describe("PubliQLogo", () => {
  it("renders the PubliQ wordmark", () => {
    render(<PubliQLogo />);
    expect(screen.getByLabelText("PubliQ")).toBeInTheDocument();
    expect(screen.getByText("PubliQ")).toBeInTheDocument();
  });
});
