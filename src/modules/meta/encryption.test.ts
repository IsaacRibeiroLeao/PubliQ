import { afterEach, describe, expect, it } from "vitest";
import {
  getEncryptionService,
  getMockEncryptionService,
} from "@/modules/meta/encryption";

const originalMode = process.env.NEXT_PUBLIC_INTEGRATION_MODE;
const originalKey = process.env.META_TOKEN_ENCRYPTION_KEY;

afterEach(() => {
  process.env.NEXT_PUBLIC_INTEGRATION_MODE = originalMode;
  process.env.META_TOKEN_ENCRYPTION_KEY = originalKey;
});

describe("Meta encryption boundary", () => {
  it("fails closed in real mode when the encryption key is missing", () => {
    process.env.NEXT_PUBLIC_INTEGRATION_MODE = "real";
    delete process.env.META_TOKEN_ENCRYPTION_KEY;

    expect(() => getEncryptionService()).toThrow(
      "META_TOKEN_ENCRYPTION_KEY",
    );
  });

  it("fails closed in real mode when the encryption key is not 32 bytes", () => {
    process.env.NEXT_PUBLIC_INTEGRATION_MODE = "real";
    process.env.META_TOKEN_ENCRYPTION_KEY = "public-short-key";

    expect(() => getEncryptionService()).toThrow(
      "META_TOKEN_ENCRYPTION_KEY",
    );
  });

  it("keeps mock encryption isolated from the production factory", async () => {
    const encrypted = await getMockEncryptionService().encrypt("mock-token");

    expect(encrypted.cipher).not.toContain("mock-token");
    expect(encrypted.keyVersion).toBe(0);
  });
});
