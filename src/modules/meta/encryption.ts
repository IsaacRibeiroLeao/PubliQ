import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";
import { getIntegrationMode } from "@/shared/integration-mode";

export interface EncryptedSecret {
  cipher: string;
  iv: string;
  tag: string;
  keyVersion: number;
}

export interface EncryptionService {
  encrypt: (plaintext: string) => Promise<EncryptedSecret>;
  decrypt: (secret: EncryptedSecret) => Promise<string>;
}

export function createAesGcmEncryptionService(
  secret: string | Buffer,
  keyVersion = 1,
): EncryptionService {
  const key = Buffer.isBuffer(secret)
    ? secret
    : createHash("sha256").update(secret).digest();
  if (key.length !== 32) {
    throw new Error("AES-256-GCM requires a 32-byte key.");
  }

  return {
    encrypt: async (plaintext) => {
      const iv = randomBytes(12);
      const cipher = createCipheriv("aes-256-gcm", key, iv);
      const encrypted = Buffer.concat([
        cipher.update(plaintext, "utf8"),
        cipher.final(),
      ]);
      return {
        cipher: encrypted.toString("base64"),
        iv: iv.toString("base64"),
        tag: cipher.getAuthTag().toString("base64"),
        keyVersion,
      };
    },
    decrypt: async (encrypted) => {
      const decipher = createDecipheriv(
        "aes-256-gcm",
        key,
        Buffer.from(encrypted.iv, "base64"),
      );
      decipher.setAuthTag(Buffer.from(encrypted.tag, "base64"));
      return Buffer.concat([
        decipher.update(Buffer.from(encrypted.cipher, "base64")),
        decipher.final(),
      ]).toString("utf8");
    },
  };
}

export function getMockEncryptionService(): EncryptionService {
  return createAesGcmEncryptionService(
    "publiq-mock-encryption-never-use-in-production",
    0,
  );
}

function readProductionEncryptionKey(): Buffer {
  const configuredKey = process.env.META_TOKEN_ENCRYPTION_KEY;
  if (!configuredKey) {
    throw new Error(
      "META_TOKEN_ENCRYPTION_KEY is required in real integration mode.",
    );
  }
  const key = /^[a-f\d]{64}$/i.test(configuredKey)
    ? Buffer.from(configuredKey, "hex")
    : Buffer.from(configuredKey, "base64");
  if (key.length !== 32) {
    throw new Error(
      "META_TOKEN_ENCRYPTION_KEY must encode exactly 32 bytes.",
    );
  }
  return key;
}

export function getEncryptionService(): EncryptionService {
  return getIntegrationMode() === "mock"
    ? getMockEncryptionService()
    : createAesGcmEncryptionService(readProductionEncryptionKey());
}
