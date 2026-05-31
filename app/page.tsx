"use client";

import { useEffect, useState, useCallback } from "react";
import { getTimeline, getCertifications, saveMessage } from "@/app/actions/admin";

// Declare globals injected by CDN scripts
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    THREE: any;
    Lenis: new (opts: Record<string, unknown>) => { raf: (t: number) => void, destroy: () => void };
    StringTune: {
      StringTune: { getInstance: () => StringTuneInstance };
      StringLazy: unknown; StringProgress: unknown; StringParallax: unknown;
      StringLerp: unknown; StringCursor: unknown; StringMagnetic: unknown;
      StringSplit: unknown;
    };
    StringTuneContext: StringTuneInstance;
  }
  interface StringTuneInstance {
    use: (plugin: unknown) => void;
    start: (delay: number) => void;
  }
}

export default function Portfolio() {
  const [timelineData, setTimelineData] = useState<any[]>([]);
  const [certsData, setCertsData] = useState<any[]>([]);
  const [formStatus, setFormStatus] = useState({ loading: false, success: false, error: "" });

  // ── ADMIN BUTTON ────────────────────────────────────────────────────────
  const handleAdminClick = useCallback(() => {
    window.location.href = "/admin";
  }, []);

  useEffect(() => {
    getTimeline().then(setTimelineData);
    getCertifications().then(setCertsData);
  }, []);

  async function handleContactSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormStatus({ loading: true, success: false, error: "" });

    const formData = new FormData(e.currentTarget);
    try {
      await saveMessage(formData);
      setFormStatus({ loading: false, success: true, error: "" });
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      setFormStatus({ loading: false, success: false, error: "Failed to send message" });
    }
  }
  useEffect(() => {
    // ── NAV SCROLL ──────────────────────────────────────────────────────────
    const nav = document.getElementById("nav");
    const onNavScroll = () => nav?.classList.toggle("scrolled", window.scrollY > 80);
    window.addEventListener("scroll", onNavScroll, { passive: true });

    // ── LENIS SMOOTH SCROLL ─────────────────────────────────────────────────
    let lenis: { raf: (t: number) => void, destroy: () => void } | null = null;
    let lenisRaf: number | null = null;
    if (typeof window.Lenis !== "undefined") {
      lenis = new window.Lenis({
        duration: 1.0,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        wheelMultiplier: 1.2,
        touchMultiplier: 1.5,
        // 'smooth' is not a valid Lenis v1 option — use smoothWheel/smoothTouch
        smoothWheel: true,
        smoothTouch: false,
      } as Record<string, unknown>);
      const lenisLoop = (time: number) => {
        lenis!.raf(time);
        lenisRaf = requestAnimationFrame(lenisLoop);
      };
      lenisRaf = requestAnimationFrame(lenisLoop);
    }

    // ── STRINGTUNE ──────────────────────────────────────────────────────────
    if (typeof window.StringTune !== "undefined") {
      const st = window.StringTune.StringTune.getInstance();
      window.StringTuneContext = st;
      st.use(window.StringTune.StringLazy);
      st.use(window.StringTune.StringProgress);
      st.use(window.StringTune.StringParallax);
      st.use(window.StringTune.StringLerp);
      st.use(window.StringTune.StringCursor);
      st.use(window.StringTune.StringMagnetic);
      st.use(window.StringTune.StringSplit);
      st.start(0);
    }



    // ── MAGNETIC ELEMENTS ─────────────────────────────────────────────────
    const magnetics = document.querySelectorAll("[string~='magnetic']");
    const onMagMove = (e: MouseEvent) => {
      magnetics.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const range = 120;
        if (dist < range) {
          const pull = (1 - dist / range) * 0.4;
          (el as HTMLElement).style.transform = `translate(${dx * pull}px,${dy * pull}px)`;
        } else {
          (el as HTMLElement).style.transform = "";
        }
      });
    };
    document.addEventListener("mousemove", onMagMove);

    // ── SCROLL PROGRESS BAR ─────────────────────────────────────────────────
    const progBar = document.querySelector<HTMLElement>(".scroll-progress");
    const onScroll = () => {
      if (!progBar) return;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      progBar.style.width = total > 0 ? `${(window.scrollY / total) * 100}%` : "0%";
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // ── CUSTOM CURSOR ────────────────────────────────────────────────────────
    const dot = document.getElementById("cursor-dot");
    const ring = document.getElementById("cursor-ring");
    let mx = 0, my = 0, rx = 0, ry = 0;
    let cursorRaf: number;
    let onCursorMouseMove: ((e: MouseEvent) => void) | null = null;
    if (dot && ring && window.matchMedia("(hover: hover)").matches) {
      onCursorMouseMove = (e: MouseEvent) => {
        mx = e.clientX; my = e.clientY;
        dot.style.left = `${mx}px`;
        dot.style.top = `${my}px`;
      };
      document.addEventListener("mousemove", onCursorMouseMove);
      const cursorLoop = () => {
        rx += (mx - rx) * 0.12;
        ry += (my - ry) * 0.12;
        ring.style.left = `${rx}px`;
        ring.style.top = `${ry}px`;
        cursorRaf = requestAnimationFrame(cursorLoop);
      };
      cursorRaf = requestAnimationFrame(cursorLoop);

      const expand = () => ring.classList.add("expanded");
      const shrink = () => ring.classList.remove("expanded");
      document.querySelectorAll("a, button").forEach((el) => {
        el.addEventListener("mouseenter", expand);
        el.addEventListener("mouseleave", shrink);
      });
    }

    // ── PRELOADER — direct setTimeout (window.load fires BEFORE useEffect in Next.js) ─────────
    const pre = document.getElementById("preloader");
    const preT1 = setTimeout(() => {
      if (!pre) return;
      pre.style.opacity = "0";
      const preT2 = setTimeout(() => {
        pre.style.display = "none";
        document.body.classList.add("is-loaded");
      }, 800);
      // store inner timer on element for cleanup
      (pre as any).__t2 = preT2;
    }, 2400);

    // ── THREE.JS HERO CANVAS ─────────────────────────────────────────────────
    const initThree = () => {
      if (window.innerWidth <= 768 || typeof window.THREE === "undefined") return;
      const canvas = document.getElementById("hero-canvas") as HTMLCanvasElement | null;
      if (!canvas) return;
      const THREE = window.THREE;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
      camera.position.z = 5;
      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      const geo = new THREE.PlaneGeometry(20, 10, 100, 50);
      const wire = new THREE.Mesh(
        geo,
        new THREE.MeshBasicMaterial({ color: 0x00aaff, wireframe: true, transparent: true, opacity: 0.08 })
      );
      scene.add(wire);
      const pCount = 200;
      const pGeo = new THREE.BufferGeometry();
      const pos = new Float32Array(pCount * 3);
      for (let i = 0; i < pCount; i++) {
        pos[i * 3] = (Math.random() - 0.5) * 30;
        pos[i * 3 + 1] = (Math.random() - 0.5) * 15;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 5;
      }
      pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      scene.add(new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0x00aaff, size: 0.04, transparent: true, opacity: 0.6 })));
      let t = 0, sy = 0;
      const onThreeScroll = () => { sy = window.scrollY; };
      window.addEventListener("scroll", onThreeScroll, { passive: true });
      const animate = () => {
        requestAnimationFrame(animate);
        if (document.hidden) return;
        t += 0.006;
        const progress = Math.min(sy / window.innerHeight, 1);
        const chaos = 1 - progress * 0.7;
        const p = geo.attributes.position;
        for (let j = 0; j < p.count; j++) {
          p.setY(j, Math.sin(p.getX(j) * 1.5 + t) * Math.cos(p.getZ(j) + t * 0.6) * chaos * 0.35);
        }
        p.needsUpdate = true;
        geo.computeVertexNormals();
        camera.position.x = Math.sin(t * 0.2) * 0.1;
        renderer.render(scene, camera);
      };
      animate();
      const onResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };
      window.addEventListener("resize", onResize);
    };
    window.addEventListener("load", initThree);



    // ── CLEANUP ──────────────────────────────────────────────────────────────
    return () => {
      clearTimeout(preT1);
      clearTimeout((pre as any)?.__t2);
      window.removeEventListener("scroll", onNavScroll);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("load", initThree);
      document.removeEventListener("mousemove", onMagMove);
      if (onCursorMouseMove) document.removeEventListener("mousemove", onCursorMouseMove);
      if (lenisRaf !== null) cancelAnimationFrame(lenisRaf);
      if (lenis) lenis.destroy();
      cancelAnimationFrame(cursorRaf);

    };
  }, []);

  // ── INVIEW OBSERVER (Re-run when data changes) ─────────────────────────
  useEffect(() => {
    const revealObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("-inview");
          entry.target.querySelectorAll(".-splitted").forEach((s) => s.classList.add("-inview"));
          revealObs.unobserve(entry.target);
        });
      },
      { threshold: 0.1 }
    );
    const revealSelectors = [
      ".about-right", ".oscilloscope-section", ".mpoint",
      ".manifesto-section", ".transition-section", ".work-card",
      ".tl-item", ".contact-section",
      ".about-section", ".work-section", ".timeline-section",
      "[string~='inview']",
    ];

    // We use a tiny timeout to ensure React has fully committed the DOM elements
    // for timelineData and certsData before querying and observing them.
    const t = setTimeout(() => {
      revealSelectors.forEach((sel) =>
        document.querySelectorAll(sel).forEach((el) => revealObs.observe(el))
      );
    }, 50);

    return () => {
      clearTimeout(t);
      revealObs.disconnect();
    };
  }, [timelineData, certsData]);

  return (
    <>
      {/* PRELOADER — Space Mono MK. text, matches nav logo style */}
      <div id="preloader">
        <div className="pre-wordmark">
          <span className="pre-char pre-m">M</span>
          <span className="pre-char pre-k">K</span>
          <span className="pre-char pre-dot-char">.</span>
        </div>
      </div>

      {/* CURSOR — suppressHydrationWarning because JS sets left/top styles before rehydration */}
      <div className="cursor-dot" id="cursor-dot" suppressHydrationWarning></div>
      <div className="cursor-ring" id="cursor-ring" suppressHydrationWarning></div>

      {/* SCROLL PROGRESS */}
      <div className="scroll-progress" suppressHydrationWarning></div>

      {/* NAV */}
      <nav id="nav" aria-label="Main navigation">
        <span className="nav-logo mono" aria-label="Mayank Dhodi">MK.</span>
        <a href="#contact" className="nav-pill">Available for work</a>
      </nav>

      <main id="main">

        {/* HERO */}
        <section id="hero" data-bg="#080808" aria-label="Hero introduction">
          {/* Animated sine wave background — blue + gray */}
          <div className="hero-waves" aria-hidden="true">
            <svg className="hero-wave-svg" viewBox="0 0 1400 500" preserveAspectRatio="none">
              {/* Blue primary wave — period is 700. Extended to 2100 (3 periods) */}
              <path className="wave-blue" d="M0,250 Q175,80 350,250 T700,250 T1050,250 T1400,250 T1750,250 T2100,250" stroke="#00aaff" strokeWidth="1.5" fill="none" opacity="0.45" />
              {/* Blue secondary wave — period is 700. Extended to 2100 (3 periods) */}
              <path className="wave-blue-2" d="M0,250 Q175,380 350,250 T700,250 T1050,250 T1400,250 T1750,250 T2100,250" stroke="#00aaff" strokeWidth="0.8" fill="none" opacity="0.2" />
              {/* Gray fine wave — period is 350. Extended to 1750 (5 periods) */}
              <path className="wave-gray" d="M0,250 Q87,170 175,250 T350,250 T525,250 T700,250 T875,250 T1050,250 T1225,250 T1400,250 T1575,250 T1750,250" stroke="#ffffff" strokeWidth="0.6" fill="none" opacity="0.12" />
            </svg>
          </div>
          <canvas id="hero-canvas" suppressHydrationWarning></canvas>
          <div className="hero-content">
            <span className="hero-eyebrow mono">FULL-STACK DEVELOPER / DATA ANALYST / AI ENGINEER</span>
            <h1 className="hero-title" id="hero-title">
              <span className="hero-line">Mayank</span>
              <span className="hero-line">Dhodi</span>
            </h1>
            <p className="hero-sub">I build things that remember they&apos;re alive.</p>
            <div className="hero-ctas">
              <a href="#certifications" className="cta-primary" string="magnetic">View More ↓</a>
              <a href="#contact" className="cta-ghost" string="magnetic">Get in Touch →</a>
            </div>
          </div>
          <div className="hero-scroll">
            <div className="scroll-line"></div>
            <div className="scroll-dot"></div>
          </div>
        </section>

        {/* TICKER */}
        <div className="ticker-wrap" aria-hidden="true">
          <div className="ticker">
            {["WEB DEV", "AI AUTOMATION", "BRAND IDENTITY", "Content", "Vibe Coding", "UI/UX",
              "WEB DEV", "AI AUTOMATION", "BRAND IDENTITY", "Content", "Vibe Coding", "UI/UX"].map((item, i) => (
                <span key={`t-${i}`}>{item}<span className="dot"> · </span></span>
              ))}
          </div>
        </div>

        {/* OSCILLOSCOPE */}
        <section className="oscilloscope-section">
          <div className="osc-bg">
            <svg className="osc-art" viewBox="0 0 1400 400" preserveAspectRatio="xMidYMid slice">
              <path d="M0,200 Q175,50 350,200 T700,200 T1050,200 T1400,200" stroke="#00aaff" strokeWidth="1.5" fill="none" opacity="0.3" />
              <path d="M0,200 Q87,120 175,200 T350,200 T525,200 T700,200 T875,200 T1050,200 T1225,200 T1400,200" stroke="#ffffff" strokeWidth="0.5" fill="none" opacity="0.15" />
            </svg>
          </div>
          <div className="scene-text">
            <span className="mono scene-label" string="inview">SIGNAL ORIGIN</span>
            <p className="scene-quote"
              string="split|inview"
              data-string-split="word"
            >&quot;Chaos is just signal that hasn&apos;t been listened to yet.&quot;</p>
          </div>
        </section>

        {/* ABOUT */}
        <section className="about-section" data-bg="#080808" aria-label="About Mayank Dhodi" id="about">
          <div className="about-left">
            <div className="about-deco">
              <span className="deco-num mono">01</span>
            </div>
          </div>
          <div className="about-right">
            <p className="about-body"
              string="split|inview"
              data-string-split="word"
            >
              I&apos;m Mayank Certified Data Analyst with strong expertise in turning raw data into actionable insights.
              Full-stack vibe coder skilled in building fast, scalable web solutions with a focus on real-world impact.
              Prompt Engineer experienced in leveraging AI to automate workflows, enhance decision-making,
              and create intelligent systems. Combines analytics, development, and AI to deliver efficient,
              data-driven products.
            </p>
            <div className="stats-row">
              <div className="stat"><span className="stat-num accent">10+</span><span className="stat-label mono">PROJECTS</span></div>
              <div className="stat"><span className="stat-num accent">3</span><span className="stat-label mono">MARKETS</span></div>
              <div className="stat"><span className="stat-num accent">∞</span><span className="stat-label mono">ITERATIONS</span></div>
            </div>
            <div className="section-cta-wrap">
              <a href="#timeline" className="section-cta">See my timeline →</a>
            </div>
          </div>
        </section>


        {/* MANIFESTO */}
        <section className="manifesto-section" data-bg="#080808">
          <div className="manifesto-line">
            <span className="man-word" string="split|inview" data-string-split="char">Signal</span>
            <span className="man-connector"></span>
            <span className="man-word" string="split|inview" data-string-split="char">Found.</span>
          </div>
          <div className="manifesto-points">
            <div className="mpoint"><span className="mpoint-num">+</span><p>No JS until you truly need it.</p></div>
            <div className="mpoint"><span className="mpoint-num">+</span><p>Captivating experiences built with precision.</p></div>
            <div className="mpoint"><span className="mpoint-num">+</span><p>Every interaction earned, never assumed.</p></div>
          </div>
        </section>

        {/* PROGRESS TEXT — StringTune scroll-driven char reveal (from tutorial-02) */}
        <div className="progress-text-section">
          <span
            className="pt-sentence"
            string="split|progress"
            data-string-split="line|word|char[random(-10,10)]"
          >Silence,<br />Stitched Into<br />Every Line.</span>
          <span
            className="pt-sentence pt-s2"
            string="split|progress"
            data-string-split="line|word|char[random(-10,10)]"
          >Precision,<br />Carried In<br />Every Cut.</span>
          <span
            className="pt-sentence pt-s3"
            string="split|progress"
            data-string-split="line|word|char[random(-10,10)]"
          >Presence,<br />Felt Before<br />It&apos;s Seen.</span>
        </div>

        {/* TIMELINE */}
        <section className="timeline-section" id="timeline" aria-label="Career timeline">
          <div className="timeline-header">
            <span className="timeline-label mono">JOURNEY</span>
            <h2>How I Got Here</h2>
          </div>
          <div className="timeline-list">
            {timelineData.map((item) => (
              <div className="tl-item" key={item.id}>
                <div className="tl-dot"></div>
                <span className="tl-year mono">{item.year}</span>
                <h3 className="tl-title">{item.title}</h3>
                <p className="tl-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* TRANSITION */}
        <section className="transition-section">
          <div className="transition-arc"></div>
          <div className="transition-content">
            <h2 className="transition-title">Code With<br />Clarity</h2>
            <p className="transition-sub mono">BUILT TO TUNE YOUR STACK, NOT FIGHT IT</p>
          </div>
        </section>

        {/* CERTIFICATIONS */}
        <section className="work-section" id="certifications" data-bg="#080808" aria-label="Professional certifications">
          <div className="work-header">
            <h2 string="split|inview" data-string-split="word|char">Certifications</h2>
            <span className="work-count mono" string="inview">({certsData.length < 10 ? `0${certsData.length}` : certsData.length})</span>
          </div>
          <div className="work-grid">
            {certsData.map((p, i) => (
              <article key={p._id || i} className={`work-card${i === 0 ? " featured" : ""}`}>
                <div className="work-img">
                  {p.image ? (
                    <img src={p.image} alt={`${p.title} certification from ${p.issuer}`} loading="lazy" width="600" height="450" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div className="work-img-pattern"></div>
                  )}
                </div>
                <div className="work-info">
                  <h3>{p.title}</h3>
                  <p>{p.issuer} · {p.date}</p>
                  {p.credId && (
                    <span
                      className="mono"
                      style={{ fontSize: "0.75rem", opacity: 0.5, marginTop: "0.35rem", display: "flex", alignItems: "center", gap: "0.35rem", cursor: "pointer", transition: "opacity 0.2s", width: "fit-content" }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.5")}
                      onClick={() => navigator.clipboard.writeText(p.credId)}
                      title="Copy full ID to clipboard"
                    >
                      ID: {p.credId.length > 5 ? `[${p.credId.slice(0, 4)}...${p.credId.slice(-1)}]` : p.credId}
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                    </span>
                  )}
                  {p.link && <a href={p.link} target="_blank" rel="noopener noreferrer" className="work-link" style={{ marginTop: "1rem", display: "inline-block" }} aria-label={`View ${p.title} certification`}>View ↗</a>}
                </div>
              </article>
            ))}
          </div>
          <div className="section-cta-wrap">
            <a href="#contact" className="section-cta">Start a Project →</a>
          </div>
        </section>

        {/* CONTACT — full form + social icons */}
        <section className="contact-section" id="contact" data-bg="#0a0a0a" aria-label="Contact form">
          <div className="contact-top">
            <span className="contact-label mono">Get in touch</span>
            <h2 className="contact-heading">Let&apos;s Build<br />Something Real.</h2>
          </div>
          <div className="contact-layout">
            {/* FORM */}
            <div className="contact-form-col">
              <form className="contact-form" onSubmit={handleContactSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="cf-name">Name</label>
                    <input id="cf-name" name="name" type="text" placeholder="Mayank Kumar" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="cf-email">Email</label>
                    <input id="cf-email" name="email" type="email" placeholder="hello@you.com" required />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="cf-service">Service</label>
                  <select id="cf-service" name="service">
                    <option value="">What do you need?</option>
                    <option>Web Development</option>
                    <option>AI Automation</option>
                    <option>Brand Identity</option>
                    <option>Mobile App</option>
                    <option>Social Campaign</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="cf-msg">Message</label>
                  <textarea id="cf-msg" name="message" placeholder="Tell me about your project..." required></textarea>
                </div>

                {formStatus.success && <div style={{ color: "#00aaff", marginBottom: "1rem", fontSize: "0.9rem" }}>Message sent successfully!</div>}
                {formStatus.error && <div style={{ color: "#ff4444", marginBottom: "1rem", fontSize: "0.9rem" }}>{formStatus.error}</div>}

                <button type="submit" className="form-submit" disabled={formStatus.loading}>
                  {formStatus.loading ? "Sending..." : "Send Message"}
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 8h10M9 4l4 4-4 4" />
                  </svg>
                </button>
              </form>
            </div>
            {/* INFO + SOCIAL */}
            <div className="contact-info-col">
              <div className="contact-info-block">
                <h3>Direct</h3>
                <a href="mailto:mayankdhodi17@gmail.com" className="contact-email-link">mayankdhodi17@gmail.com</a>
              </div>
              <div className="contact-info-block">
                <h3>Social</h3>
                <div className="social-grid">
                  <a href="https://www.linkedin.com/in/mayank-dhodi/" className="social-link" rel="noopener noreferrer" target="_blank" aria-label="Visit Mayank Dhodi on LinkedIn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00aaff" strokeWidth="1.5" aria-hidden="true"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>
                    <span className="social-name">LinkedIn</span>
                  </a>
                  <a href="https://github.com/UMDhodi" className="social-link" rel="noopener noreferrer" target="_blank" aria-label="Visit Mayank Dhodi on GitHub">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00aaff" strokeWidth="1.5" aria-hidden="true"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" /></svg>
                    <span className="social-name">GitHub</span>
                  </a>
                  <a href="https://ko-fi.com/mayankdhodi" className="social-link" rel="noopener noreferrer" target="_blank">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00aaff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1" /><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" /><line x1="6" y1="2" x2="6" y2="4" /><line x1="10" y1="2" x2="10" y2="4" /><line x1="14" y1="2" x2="14" y2="4" /></svg>
                    <span className="social-name">ko-fi</span>
                  </a>
                  <a href="https://www.instagram.com/mayvxnk/" className="social-link" rel="noopener noreferrer" target="_blank" aria-label="Visit Mayank Dhodi on Instagram">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00aaff" strokeWidth="1.5" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" /><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
                    <span className="social-name">Instagram</span>
                  </a>
                </div>
              </div>
              <div className="contact-info-block">
                <h3>Based In</h3>
                <p style={{ color: 'var(--c-muted)', fontSize: '0.9rem', lineHeight: '1.7' }}>India &middot; Available remotely<br />across UAE &amp; USA</p>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="site-footer" data-bg="#080808" role="contentinfo">
          <div className="footer-art">
            <div className="footer-mirror" aria-hidden="true"><span>SIGNAL FOUND</span></div>
            <svg className="footer-waves" viewBox="0 0 1400 300" preserveAspectRatio="xMidYMid slice">
              <path d="M0,150 Q175,30 350,150 T700,150 T1050,150 T1400,150" stroke="#00aaff" strokeWidth="1.5" fill="none" opacity="0.15" />
              <path d="M0,150 Q175,270 350,150 T700,150 T1050,150 T1400,150" stroke="#ffffff" strokeWidth="1" fill="none" opacity="0.06" />
              <path d="M0,150 Q87,80 175,150 T350,150 T525,150 T700,150 T875,150 T1050,150 T1225,150 T1400,150" stroke="#00aaff" strokeWidth="0.8" fill="none" opacity="0.08" />
            </svg>
            <div className="footer-glow-dot" style={{ left: "25%", top: "50%" }}></div>
            <div className="footer-glow-dot" style={{ left: "75%", top: "50%" }}></div>
          </div>
          <div className="footer-grid">
            <div className="footer-col footer-col-logo">
              <span className="footer-logo mono">MK.</span>
              <p>Building systems for the future while surviving the chaos of the present.</p>
            </div>
            <div className="footer-col">
              <h4>Navigate</h4>
              <ul>
                <li><a href="#hero">Home</a></li>
                <li><a href="#timeline">Timeline</a></li>
                <li><a href="#certifications">Certifications</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Connect</h4>
              <ul>
                <li><a href="https://www.linkedin.com/in/mayank-dhodi/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn profile">LinkedIn ↗</a></li>
                <li><a href="https://github.com/UMDhodi/" target="_blank" rel="noopener noreferrer" aria-label="GitHub profile">GitHub ↗</a></li>
                <li><a href="https://www.instagram.com/mayvxnk/" target="_blank" rel="noopener noreferrer" aria-label="Instagram profile">Instagram ↗</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Contact</h4>
              <ul>
                <li><a href="mailto:mayankdhodi17@gmail.com" className="footer-contact-email">mayankdhodi17@gmail.com</a></li>
                <li><a href="#">India</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom mono">
            <span>Mayank Dhodi © 2026</span>
            <span>All rights reserved.</span>
            <span>Built with precision.</span>
            {/* Admin button: 3 rapid clicks → prompt → /admin */}
            <button className="admin-btn" id="admin-btn" aria-label="Admin" onClick={handleAdminClick}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
                <rect x="2" y="6" width="10" height="7" rx="1" />
                <path d="M4 6V4a3 3 0 016 0v2" />
                <circle cx="7" cy="9.5" r="1" />
              </svg>
            </button>
          </div>
        </footer>

      </main>
    </>
  );
}