import * as chatRepository from "./chat.repository";
import { askAssistant } from "./chat.service";

jest.mock("./chat.repository");

const mockRepo = chatRepository as jest.Mocked<typeof chatRepository>;

describe("chat.service askAssistant", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("rejects empty thread", async () => {
    const result = await askAssistant([]);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.status).toBe(400);
      expect(mockRepo.ask).not.toHaveBeenCalled();
    }
  });

  it("rejects when last message is not from user", async () => {
    const result = await askAssistant([{ role: "assistant", content: "Hi" }]);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.status).toBe(400);
      expect(mockRepo.ask).not.toHaveBeenCalled();
    }
  });

  it("rejects empty messages", async () => {
    const result = await askAssistant([{ role: "user", content: "   " }]);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.status).toBe(400);
      expect(mockRepo.ask).not.toHaveBeenCalled();
    }
  });

  it("rejects overly long last user message", async () => {
    const result = await askAssistant([{ role: "user", content: "x".repeat(9000) }]);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.status).toBe(400);
      expect(mockRepo.ask).not.toHaveBeenCalled();
    }
  });

  it("returns reply when repository succeeds", async () => {
    mockRepo.ask.mockResolvedValue({ ok: true, reply: "Hello." });
    const result = await askAssistant([{ role: "user", content: "Hi" }]);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.reply).toBe("Hello.");
    }
    expect(mockRepo.ask).toHaveBeenCalledWith([{ role: "user", content: "Hi" }]);
  });

  it("passes multi-turn thread to repository", async () => {
    mockRepo.ask.mockResolvedValue({ ok: true, reply: "Done." });
    const thread = [
      { role: "user" as const, content: "List projects" },
      { role: "assistant" as const, content: "Here they are." },
      { role: "user" as const, content: "Use id 11" },
    ];
    await askAssistant(thread);
    expect(mockRepo.ask).toHaveBeenCalledWith(thread);
  });

  it("passes through repository errors with status", async () => {
    mockRepo.ask.mockResolvedValue({
      ok: false,
      error: "Gemini API key is not configured.",
      details: ["Set GEMINI_API_KEY"],
      status: 503,
    });
    const result = await askAssistant([{ role: "user", content: "count employees" }]);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.status).toBe(503);
      expect(result.details).toContain("Set GEMINI_API_KEY");
    }
  });
});
