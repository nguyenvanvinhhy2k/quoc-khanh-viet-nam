import React, { useEffect, useRef, useState } from "react";

export default function Vinhnv() {
  const bgCanvasRef = useRef(null);
  const fgCanvasRef = useRef(null);
  const bgMusicRef = useRef(null);

  // state để lưu kích thước màn hình
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    // chỉ chạy ở client
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    handleResize(); // set lần đầu
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!size.width || !size.height) return; // chưa có size thì bỏ qua

    const { width, height } = size;
    const bgCanvas = bgCanvasRef.current;
    const fgCanvas = fgCanvasRef.current;
    const bgCtx = bgCanvas.getContext("2d");
    const fgCtx = fgCanvas.getContext("2d");
    bgCanvas.width = fgCanvas.width = width;
    bgCanvas.height = fgCanvas.height = height;

    // --- Background gradient + stars ---
    function drawBackground() {
      const gradient = bgCtx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, "#000010");
      gradient.addColorStop(1, "#001a33");
      bgCtx.fillStyle = gradient;
      bgCtx.fillRect(0, 0, width, height);

      for (let i = 0; i < 150; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height * 0.7;
        const r = Math.random() * 1.5;
        bgCtx.fillStyle = "white";
        bgCtx.beginPath();
        bgCtx.arc(x, y, r, 0, Math.PI * 2);
        bgCtx.fill();
      }
    }
    drawBackground();

    // --- Phrases ---
    const phrases = [
      "I love Anoma",
      "I love Shrimpers",
      "I love Anomapay",
      "I love Sullyswap",
      "I love VietNam",
      "Chào mừng Kỷ niệm 80 năm\nQuốc Khánh Nước Việt Nam",
    ];

    let currentPhraseIndex = 0;
    let particles = [];
    let fireworks = [];

    class Particle {
      constructor(x, y, tx, ty, color, style) {
        this.x = x;
        this.y = y;
        this.tx = tx;
        this.ty = ty;
        this.vx = (Math.random() - 0.5) * 20;
        this.vy = (Math.random() - 0.5) * 20;
        this.color = color;
        this.size = 2;
        this.life = 0;
        this.style = style;
        this.angle = Math.random() * Math.PI * 2;
      }
      update() {
        this.life++;
        switch (this.style) {
          case "neon":
            this.x += (this.tx - this.x) * 0.05;
            this.y += (this.ty - this.y) * 0.05;
            break;
          case "blink":
            this.x += (this.tx - this.x) * 0.1;
            this.y += (this.ty - this.y) * 0.1;
            break;
          case "shake":
            this.x += (this.tx - this.x) * 0.05 + Math.sin(this.life / 2) * 2;
            this.y += (this.ty - this.y) * 0.05 + Math.cos(this.life / 2) * 2;
            break;
          case "rotate":
            this.angle += 0.1;
            this.x += (this.tx - this.x) * 0.04 + Math.cos(this.angle) * 3;
            this.y += (this.ty - this.y) * 0.04 + Math.sin(this.angle) * 3;
            break;
          case "smoke":
            this.x += (this.tx - this.x) * 0.03;
            this.y += (this.ty - this.y) * 0.03 - 0.5;
            break;
          default:
            this.x += (this.tx - this.x) * 0.05;
            this.y += (this.ty - this.y) * 0.05;
        }
      }
      draw(ctx) {
        ctx.fillStyle =
          this.style === "blink" && this.life % 20 < 10 ? "transparent" : this.color;
        ctx.shadowBlur = 12;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    class FireworkParticle {
      constructor(x, y, color) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 7 + 3;
        this.x = x;
        this.y = y;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.life = 0;
        this.maxLife = 150;
        this.color = color;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.05;
        this.life++;
      }
      draw(ctx) {
        ctx.globalAlpha = 1 - this.life / this.maxLife;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    const styles = [
      { color: "#00ffff", style: "neon" },
      { color: "#ff66cc", style: "blink" },
      { color: "#ffd700", style: "shake" },
      { color: "#ff3333", style: "neon" },
      { color: "#00ff66", style: "blink" },
      { color: "#ffffff", style: "neon" },
    ];

    function createParticlesFromText(text, styleIndex) {
      const tempCanvas = document.createElement("canvas");
      const tempCtx = tempCanvas.getContext("2d");
      tempCanvas.width = width;
      tempCanvas.height = height;
      tempCtx.fillStyle = "white";
      tempCtx.textAlign = "center";
      tempCtx.textBaseline = "middle";
      tempCtx.font = "bold 100px Arial";

      const lines = text.split("\n");
      lines.forEach((line, i) => {
        tempCtx.fillText(line, width / 2, height / 2 - 50 + i * 120);
      });

      const imageData = tempCtx.getImageData(0, 0, width, height);
      const newParticles = [];
      const { color, style } = styles[styleIndex] || styles[0];
      for (let y = 0; y < height; y += 5) {
        for (let x = 0; x < width; x += 5) {
          const index = (y * width + x) * 4;
          if (imageData.data[index + 3] > 128) {
            newParticles.push(
              new Particle(Math.random() * width, Math.random() * height, x, y, color, style)
            );
          }
        }
      }
      particles = newParticles;
    }

    // --- Trigger fireworks + explosion sound ---
    function triggerFireworks(count = 180) {
      const positions = [
        [width / 2, height / 2],
        [width / 3, height / 2.5],
        [(2 * width) / 3, height / 2.5],
        [width / 4, height / 1.5],
        [(3 * width) / 4, height / 1.5],
      ];
      const [cx, cy] = positions[Math.floor(Math.random() * positions.length)];
      const colors = ["red", "yellow", "lime", "cyan", "magenta", "orange", "#00ffff", "#ff00ff"];
      for (let i = 0; i < count; i++) {
        fireworks.push(new FireworkParticle(cx, cy, colors[Math.floor(Math.random() * colors.length)]));
      }

      const boom = new Audio("/explosion.mp3"); // thêm file riêng
      boom.volume = 0.6;
      boom.play();
    }

    // --- Vẽ cờ ---
    function drawFlag(ctx, time) {
      const flagWidth = 160;
      const flagHeight = 100;
      const x = width - flagWidth - 40;
      const y = 40;
      const wave = Math.sin(time / 300) * 5;

      ctx.fillStyle = "red";
      ctx.fillRect(x, y + wave, flagWidth, flagHeight);

      const cx = x + flagWidth / 2;
      const cy = y + flagHeight / 2 + wave;
      const spikes = 5;
      const outerRadius = 30;
      const innerRadius = 12;
      ctx.beginPath();
      ctx.moveTo(cx, cy - outerRadius);
      for (let i = 0; i < spikes; i++) {
        ctx.lineTo(
          cx + Math.cos((i * 2 * Math.PI) / spikes - Math.PI / 2) * outerRadius,
          cy + Math.sin((i * 2 * Math.PI) / spikes - Math.PI / 2) * outerRadius
        );
        ctx.lineTo(
          cx + Math.cos(((i * 2 + 1) * Math.PI) / spikes - Math.PI / 2) * innerRadius,
          cy + Math.sin(((i * 2 + 1) * Math.PI) / spikes - Math.PI / 2) * innerRadius
        );
      }
      ctx.closePath();
      ctx.fillStyle = "yellow";
      ctx.fill();
    }

    // --- Background music (play sau 3s + fade in) ---
    const bgMusic = new Audio(
      "https://chiennvtodolist.runasp.net/api/FileAudio/get/de33762e-2615-4d59-b8f1-1626d0a89a73.mp3"
    );
    bgMusic.loop = true;
    bgMusic.volume = 0;

    const timer = setTimeout(() => {
      bgMusic.play().then(() => {
        let v = 0;
        const fade = setInterval(() => {
          if (v < 0.5) {
            v += 0.02;
            bgMusic.volume = v;
          } else {
            clearInterval(fade);
          }
        }, 200);
      }).catch((err) => {
        console.log("Autoplay bị chặn:", err);
      });
    }, 3000);

    bgMusicRef.current = bgMusic;

    createParticlesFromText(phrases[currentPhraseIndex], currentPhraseIndex);

    let lastTime = 0;
    const fps = 40;
    const interval = 1000 / fps;

    function animate(timestamp) {
      if (timestamp - lastTime < interval) {
        requestAnimationFrame(animate);
        return;
      }
      lastTime = timestamp;

      fgCtx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.update();
        p.draw(fgCtx);
      });

      fireworks.forEach((f, i) => {
        f.update();
        f.draw(fgCtx);
        if (f.life > f.maxLife) fireworks.splice(i, 1);
      });

      drawFlag(fgCtx, timestamp);

      requestAnimationFrame(animate);
    }

    animate();

    let phraseInterval = setInterval(() => {
      currentPhraseIndex++;
      if (currentPhraseIndex < phrases.length) {
        createParticlesFromText(phrases[currentPhraseIndex], currentPhraseIndex);
        triggerFireworks();
      } else {
        clearInterval(phraseInterval);
        setInterval(() => triggerFireworks(180), 1500);
      }
    }, 5000);

    return () => {
      clearTimeout(timer);
      bgMusic.pause();
    };
  }, [size]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <canvas ref={bgCanvasRef} style={{ position: "absolute", top: 0, left: 0 }} />
      <canvas ref={fgCanvasRef} style={{ position: "absolute", top: 0, left: 0 }} />
    </div>
  );
}
