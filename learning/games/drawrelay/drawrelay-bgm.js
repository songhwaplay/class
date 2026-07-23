(() => {
  "use strict";

  const tracks = [
    "assets/sound/glass-pulse-01.mp3",
    "assets/sound/glass-pulse-02.mp3",
    "assets/sound/glass-pulse-03.mp3"
  ];
  const audio = document.getElementById("bgm");
  if (!audio || !tracks.length) return;

  let trackIndex = 0;
  audio.src = tracks[trackIndex];

  audio.addEventListener("ended", () => {
    trackIndex = (trackIndex + 1) % tracks.length;
    audio.src = tracks[trackIndex];
    audio.play().catch(() => {});
  });
})();
