import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  formatSnapshotFilename,
  ImageSnapshotService,
  SnapshotRenderOptions
} from "../ImageSnapshotService";
import * as ImageDiffService from "../ImageDiffService";

const originalImage = {
  name: "photo-before.png",
  size: 1024,
  type: "image/png",
  lastModified: 1000,
  width: 800,
  height: 600,
  url: "blob:original",
  exif: null
};

const modifiedImage = {
  name: "photo-after.jpg",
  size: 2048,
  type: "image/jpeg",
  lastModified: 2000,
  width: 800,
  height: 600,
  url: "blob:modified",
  exif: null
};

describe("ImageSnapshotService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("formatSnapshotFilename", () => {
    it("formats snapshot filename for fade mode with fixed timestamp", () => {
      const options: SnapshotRenderOptions = {
        compareMode: "fade",
        originalImage,
        modifiedImage,
        fadeValue: 650,
        sliderPosition: 0.5,
        diffAlgorithm: "highlight",
        alignmentTransform: null
      };

      const filename = formatSnapshotFilename(options, "20260922-120000");
      expect(filename).toBe("comparecode-photo-before-vs-photo-after-fade-65pct-20260922-120000.png");
    });

    it("formats snapshot filename for slider mode with fixed timestamp", () => {
      const options: SnapshotRenderOptions = {
        compareMode: "slider",
        originalImage,
        modifiedImage,
        fadeValue: 500,
        sliderPosition: 0.42,
        diffAlgorithm: "highlight",
        alignmentTransform: null
      };

      const filename = formatSnapshotFilename(options, "20260922-120000");
      expect(filename).toBe("comparecode-photo-before-vs-photo-after-slider-42pct-20260922-120000.png");
    });

    it("formats snapshot filename for diff mode with fixed timestamp", () => {
      const options: SnapshotRenderOptions = {
        compareMode: "diff",
        originalImage,
        modifiedImage,
        fadeValue: 500,
        sliderPosition: 0.5,
        diffAlgorithm: "perceptual",
        alignmentTransform: null
      };

      const filename = formatSnapshotFilename(options, "20260922-120000");
      expect(filename).toBe("comparecode-photo-before-vs-photo-after-diff-perceptual-20260922-120000.png");
    });

    it("formats snapshot filename for side-by-side mode with fixed timestamp", () => {
      const options: SnapshotRenderOptions = {
        compareMode: "side-by-side",
        originalImage,
        modifiedImage,
        fadeValue: 500,
        sliderPosition: 0.5,
        diffAlgorithm: "highlight",
        alignmentTransform: null
      };

      const filename = formatSnapshotFilename(options, "20260922-120000");
      expect(filename).toBe("comparecode-photo-before-vs-photo-after-side-by-side-20260922-120000.png");
    });

    it("sanitizes unusual characters and long filenames", () => {
      const options: SnapshotRenderOptions = {
        compareMode: "slider",
        originalImage: {
          ...originalImage,
          name: "My File (Final) [Draft]!@#.png"
        },
        modifiedImage: {
          ...modifiedImage,
          name: "Another File (Revised) [v2]!@#.png"
        },
        fadeValue: 500,
        sliderPosition: 0.5,
        diffAlgorithm: "highlight",
        alignmentTransform: null
      };

      const filename = formatSnapshotFilename(options, "20260922-120000");
      expect(filename).toContain("comparecode-My-File-Final-Draft");
      expect(filename).toContain("-vs-Another-File-Revised-v");
      expect(filename).toMatch(/\.png$/);
    });
  });

  describe("renderSnapshotCanvas", () => {
    it("calls renderFade for fade mode", async () => {
      const renderFadeSpy = vi.spyOn(ImageDiffService, "renderFade").mockResolvedValue();

      const options: SnapshotRenderOptions = {
        compareMode: "fade",
        originalImage,
        modifiedImage,
        fadeValue: 750,
        sliderPosition: 0.5,
        diffAlgorithm: "highlight",
        alignmentTransform: null
      };

      const canvas = await ImageSnapshotService.renderSnapshotCanvas(options);
      expect(canvas).toBeInstanceOf(HTMLCanvasElement);
      expect(renderFadeSpy).toHaveBeenCalledWith(
        originalImage.url,
        modifiedImage.url,
        expect.any(HTMLCanvasElement),
        0.75,
        null
      );
    });

    it("calls renderSlider for slider mode", async () => {
      const renderSliderSpy = vi.spyOn(ImageDiffService, "renderSlider").mockResolvedValue();

      const options: SnapshotRenderOptions = {
        compareMode: "slider",
        originalImage,
        modifiedImage,
        fadeValue: 500,
        sliderPosition: 0.35,
        diffAlgorithm: "highlight",
        alignmentTransform: null
      };

      const canvas = await ImageSnapshotService.renderSnapshotCanvas(options);
      expect(canvas).toBeInstanceOf(HTMLCanvasElement);
      expect(renderSliderSpy).toHaveBeenCalledWith(
        originalImage.url,
        modifiedImage.url,
        expect.any(HTMLCanvasElement),
        0.35,
        null
      );
    });

    it("calls renderDiff for diff mode", async () => {
      const renderDiffSpy = vi.spyOn(ImageDiffService, "renderDiff").mockResolvedValue({
        totalPixels: 100,
        differentPixels: 10,
        percentDifferent: 10
      });

      const options: SnapshotRenderOptions = {
        compareMode: "diff",
        originalImage,
        modifiedImage,
        fadeValue: 500,
        sliderPosition: 0.5,
        diffAlgorithm: "ssim",
        alignmentTransform: null
      };

      const canvas = await ImageSnapshotService.renderSnapshotCanvas(options);
      expect(canvas).toBeInstanceOf(HTMLCanvasElement);
      expect(renderDiffSpy).toHaveBeenCalledWith(
        originalImage.url,
        modifiedImage.url,
        expect.any(HTMLCanvasElement),
        "ssim",
        null
      );
    });

    it("calls renderSideBySide for side-by-side mode", async () => {
      const renderSideBySideSpy = vi.spyOn(ImageDiffService, "renderSideBySide").mockResolvedValue();

      const options: SnapshotRenderOptions = {
        compareMode: "side-by-side",
        originalImage,
        modifiedImage,
        fadeValue: 500,
        sliderPosition: 0.5,
        diffAlgorithm: "highlight",
        alignmentTransform: null
      };

      const canvas = await ImageSnapshotService.renderSnapshotCanvas(options);
      expect(canvas).toBeInstanceOf(HTMLCanvasElement);
      expect(renderSideBySideSpy).toHaveBeenCalledWith(
        originalImage.url,
        modifiedImage.url,
        expect.any(HTMLCanvasElement)
      );
    });
  });

  describe("downloadSnapshot", () => {
    it("throws error if original or modified image is missing", async () => {
      const invalidOptions = {
        compareMode: "fade",
        originalImage: null as unknown as SnapshotRenderOptions["originalImage"],
        modifiedImage,
        fadeValue: 500,
        sliderPosition: 0.5,
        diffAlgorithm: "highlight",
        alignmentTransform: null
      } as SnapshotRenderOptions;

      await expect(ImageSnapshotService.downloadSnapshot(invalidOptions)).rejects.toThrow(
        "Both original and modified images are required to export a snapshot"
      );
    });

    it("triggers file download through document link click", async () => {
      vi.spyOn(ImageDiffService, "renderFade").mockImplementation(async (_orig, _mod, targetCanvas) => {
        targetCanvas.width = 10;
        targetCanvas.height = 10;
      });

      vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(function (
        this: HTMLCanvasElement,
        callback: BlobCallback
      ) {
        callback(new Blob(["mock-png-data"], { type: "image/png" }));
      });

      const clickSpy = vi.fn();
      const originalCreateElement = document.createElement.bind(document);
      vi.spyOn(document, "createElement").mockImplementation((tagName: string) => {
        const el = originalCreateElement(tagName);
        if (tagName.toLowerCase() === "a") {
          el.click = clickSpy;
        }
        return el;
      });

      const options: SnapshotRenderOptions = {
        compareMode: "fade",
        originalImage,
        modifiedImage,
        fadeValue: 500,
        sliderPosition: 0.5,
        diffAlgorithm: "highlight",
        alignmentTransform: null
      };

      const filename = await ImageSnapshotService.downloadSnapshot(options);
      expect(filename).toMatch(/^comparecode-photo-before-vs-photo-after-fade-50pct-/);
      expect(clickSpy).toHaveBeenCalled();
    });
  });
});
