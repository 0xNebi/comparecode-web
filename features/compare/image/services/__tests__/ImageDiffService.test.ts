import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createAlignedPair } from "../ImageDiffService";

describe("ImageDiffService createAlignedPair", () => {
  let originalGetContext: typeof HTMLCanvasElement.prototype.getContext;

  beforeEach(() => {
    originalGetContext = HTMLCanvasElement.prototype.getContext;
  });

  afterEach(() => {
    HTMLCanvasElement.prototype.getContext = originalGetContext;
    vi.restoreAllMocks();
  });

  function createMockCanvas(width: number, height: number) {
    const drawImageMock = vi.fn();
    const getImageDataMock = vi.fn((_x: number, _y: number, w: number, h: number) => ({
      data: new Uint8ClampedArray(w * h * 4)
    }));

    const ctx = {
      drawImage: drawImageMock,
      getImageData: getImageDataMock,
      imageSmoothingEnabled: false,
      imageSmoothingQuality: "low",
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      scale: vi.fn()
    } as unknown as CanvasRenderingContext2D;

    const canvas = {
      width,
      height,
      getContext: vi.fn(() => ctx)
    } as unknown as HTMLCanvasElement;

    return { canvas, ctx, drawImageMock, getImageDataMock };
  }

  it("returns original and modified data directly when dimensions are identical and no transform is provided", () => {
    const orig = createMockCanvas(1920, 1080);
    const mod = createMockCanvas(1920, 1080);

    const result = createAlignedPair(orig, mod, null);

    expect(result.width).toBe(1920);
    expect(result.height).toBe(1080);
    expect(orig.getImageDataMock).toHaveBeenCalledWith(0, 0, 1920, 1080);
    expect(mod.getImageDataMock).toHaveBeenCalledWith(0, 0, 1920, 1080);
  });

  it("scales both images to common bounds when dimensions differ and no transform is provided", () => {
    interface MockContext {
      drawImage: ReturnType<typeof vi.fn>;
      getImageData: ReturnType<typeof vi.fn>;
      imageSmoothingEnabled: boolean;
      imageSmoothingQuality: string;
    }
    const createdContexts: MockContext[] = [];
    HTMLCanvasElement.prototype.getContext = vi.fn().mockImplementation(() => {
      const ctx: MockContext = {
        drawImage: vi.fn(),
        getImageData: vi.fn((_x: number, _y: number, w: number, h: number) => ({
          data: new Uint8ClampedArray(w * h * 4)
        })),
        imageSmoothingEnabled: false,
        imageSmoothingQuality: "low"
      };
      createdContexts.push(ctx);
      return ctx as unknown as CanvasRenderingContext2D;
    });

    const orig = createMockCanvas(1910, 1098);
    const mod = createMockCanvas(1024, 590);

    const result = createAlignedPair(orig, mod, null);

    expect(result.width).toBe(1910);
    expect(result.height).toBe(1098);
    expect(createdContexts.length).toBe(2);
    expect(createdContexts[0].imageSmoothingEnabled).toBe(true);
    expect(createdContexts[0].imageSmoothingQuality).toBe("high");
    expect(createdContexts[0].drawImage).toHaveBeenCalledWith(orig.canvas, 0, 0, 1910, 1098);
    expect(createdContexts[1].imageSmoothingEnabled).toBe(true);
    expect(createdContexts[1].imageSmoothingQuality).toBe("high");
    expect(createdContexts[1].drawImage).toHaveBeenCalledWith(mod.canvas, 0, 0, 1910, 1098);
  });
});
