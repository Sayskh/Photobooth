/**
 * Stitches recorded live video clips (or photo frames) into a smooth animated video
 * (format MP4 or WebM) that plays each pose sequentially in an infinite loop.
 */
export async function createLivePhotoMontage(
  liveVideoUrls: string[],
  fallbackPhotos: string[]
): Promise<string | null> {
  if (typeof window === "undefined") return null;

  if (
    typeof window.MediaRecorder === "undefined" ||
    typeof HTMLCanvasElement.prototype.captureStream === "undefined"
  ) {
    return null;
  }

  return new Promise(async (resolve) => {
    try {
      const width = 640;
      const height = 480;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(null);

      // Determine supported mime type
      const mimeType = MediaRecorder.isTypeSupported("video/mp4")
        ? "video/mp4"
        : MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : "video/webm";

      const stream = canvas.captureStream(30);
      const recorder = new MediaRecorder(stream, { mimeType });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const finalBlob = new Blob(chunks, { type: mimeType });
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(finalBlob);
      };

      recorder.start();

      // If we have video clips
      if (liveVideoUrls && liveVideoUrls.length > 0) {
        for (let i = 0; i < liveVideoUrls.length; i++) {
          const videoSrc = liveVideoUrls[i];
          if (!videoSrc) continue;

          await new Promise<void>((clipDone) => {
            const vid = document.createElement("video");
            vid.crossOrigin = "anonymous";
            vid.muted = true;
            vid.playsInline = true;
            vid.src = videoSrc;

            let animId: number;
            const startTime = Date.now();

            const drawLoop = () => {
              try {
                // Mirror video to match camera display
                ctx.save();
                ctx.translate(width, 0);
                ctx.scale(-1, 1);
                ctx.drawImage(vid, 0, 0, width, height);
                ctx.restore();

                // Watermark badge
                ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
                ctx.fillRect(16, height - 38, 150, 24);
                ctx.fillStyle = "#ffffff";
                ctx.font = "bold 11px sans-serif";
                ctx.fillText(`Live Pose ${i + 1}`, 26, height - 22);
              } catch {
                // Ignore draw error
              }

              if (Date.now() - startTime < 1600) {
                animId = requestAnimationFrame(drawLoop);
              } else {
                cancelAnimationFrame(animId);
                vid.pause();
                clipDone();
              }
            };

            vid.oncanplay = () => {
              vid.play().catch(() => {});
              drawLoop();
            };

            vid.onerror = () => {
              clipDone();
            };

            setTimeout(() => {
              cancelAnimationFrame(animId);
              clipDone();
            }, 2200);
          });
        }
      } else if (fallbackPhotos && fallbackPhotos.length > 0) {
        // Fallback: stop-motion slideshow from photos
        for (let loop = 0; loop < 2; loop++) {
          for (let i = 0; i < fallbackPhotos.length; i++) {
            const img = new Image();
            img.src = fallbackPhotos[i];
            await new Promise((r) => {
              img.onload = r;
              img.onerror = r;
            });
            ctx.drawImage(img, 0, 0, width, height);
            await new Promise((r) => setTimeout(r, 500));
          }
        }
      }

      // Finish recording
      setTimeout(() => {
        if (recorder.state !== "inactive") {
          recorder.stop();
        }
      }, 300);
    } catch (err) {
      console.error("Live photo montage error:", err);
      resolve(null);
    }
  });
}
