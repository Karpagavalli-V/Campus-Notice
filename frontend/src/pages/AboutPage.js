import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./AboutPage.css";

const STATS = [
  { value: "5000+", label: "Students Connected", icon: "🎓" },
  { value: "200+", label: "Faculty Members", icon: "👨‍🏫" },
  { value: "10K+", label: "Notices Delivered", icon: "📢" },
  { value: "99.9%", label: "Uptime Guaranteed", icon: "⚡" },
];

const FEATURES = [
  {
    icon: "🔔",
    tag: "#ALERTS",
    tagColor: "#7c3aed",
    title: "Instant Smart Notifications",
    desc: "Real-time alerts for exams, events, and campus updates — never miss a beat. Priority-based delivery ensures critical notices reach you first.",
    date: "Core Feature",
  },
  {
    icon: "🛡️",
    tag: "#ACCESS",
    tagColor: "#0891b2",
    title: "Role-Based Access Control",
    desc: "Admins, faculty and students all have distinct, secure portals. Post, manage and view notices based on your role — total control, zero confusion.",
    date: "Security",
  },
  {
    icon: "📸",
    tag: "#MEDIA",
    tagColor: "#be185d",
    title: "Rich Media Notice Boards",
    desc: "Upload posters, images, and attachments with your notices. Instagram-style carousels bring your campus announcements to life.",
    date: "Media",
  },
  {
    icon: "📊",
    tag: "#ANALYTICS",
    tagColor: "#065f46",
    title: "Deep Analytics Dashboard",
    desc: "Track notice reach, engagement, and faculty activity with powerful analytics. Data-driven decisions for smarter campus communication.",
    date: "Intelligence",
  },
  {
    icon: "💬",
    tag: "#SOCIAL",
    tagColor: "#92400e",
    title: "Comments & Reactions",
    desc: "Students and faculty can react, comment and discuss notices in real time. Campus communication just got social.",
    date: "Engagement",
  },
  {
    icon: "📅",
    tag: "#CALENDAR",
    tagColor: "#1e40af",
    title: "Smart Event Calendar",
    desc: "All events auto-sync to your campus calendar. Plan ahead, set reminders, and never double-book your schedule again.",
    date: "Planning",
  },
];

const TEAM = [
  {
    name: "Karpagavalli V",
    role: "Developer & Designer",
    avatar: "K",
    color: "#7c3aed",
    tagline: "Building the future of campus communication",
  },
  {
    name: "Campus IT Team",
    role: "Infrastructure & Support",
    avatar: "IT",
    color: "#0891b2",
    tagline: "Keeping the servers blazing fast 24/7",
  },
  {
    name: "Student Council",
    role: "Community & Feedback",
    avatar: "SC",
    color: "#be185d",
    tagline: "Voice of every student on campus",
  },
];

const UPDATES = [
  {
    tag: "#NEW",
    tagColor: "#7c3aed",
    title: "v2.0 — Carousel Notices & Rich Media",
    desc: "Upload multiple images per notice with swipeable carousels. Your campus posters deserve a spotlight.",
    date: "Mar 2026",
    icon: "🚀",
  },
  {
    tag: "#UPDATE",
    tagColor: "#0891b2",
    title: "Direct Messaging Between Users",
    desc: "Faculty and students can now communicate directly within Campus Notice — no more hunting through emails.",
    date: "Feb 2026",
    icon: "💌",
  },
  {
    tag: "#FEATURE",
    tagColor: "#be185d",
    title: "Analytics Board for Admins",
    desc: "Full visibility into campus notice trends, user engagement, and departmental activity — all in one dashboard.",
    date: "Jan 2026",
    icon: "📈",
  },
];

export default function AboutPage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("about");
  const [animatedStats, setAnimatedStats] = useState([0, 0, 0, 0]);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !statsVisible) {
          setStatsVisible(true);
        }
      },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, [statsVisible]);

  useEffect(() => {
    if (!statsVisible) return;
    const targets = [5000, 200, 10000, 99.9];
    const duration = 2000;
    const steps = 60;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedStats(targets.map((t) => Math.round(t * eased)));
      if (step >= steps) clearInterval(interval);
    }, duration / steps);
    return () => clearInterval(interval);
  }, [statsVisible]);

  const formatStat = (idx, val) => {
    if (idx === 0) return val.toLocaleString() + "+";
    if (idx === 1) return val + "+";
    if (idx === 2) return (val / 1000).toFixed(val >= 1000 ? 0 : 1) + "K+";
    if (idx === 3) return val.toFixed(1) + "%";
    return val;
  };

  return (
    <div className="about-root">
      {/* NAV BAR */}
      <nav className={`about-nav ${scrolled ? "about-nav--scrolled" : ""}`}>
        <div className="about-nav__inner">
          <div className="about-nav__logo">
            <span className="about-nav__logo-icon">📢</span>
            <span className="about-nav__logo-text">Campus<span>Notice</span></span>
          </div>
          <ul className={`about-nav__links ${menuOpen ? "about-nav__links--open" : ""}`}>
            <li>
              <button
                className={activeSection === "about" ? "active" : ""}
                onClick={() => { setActiveSection("about"); setMenuOpen(false); document.getElementById("about-sec").scrollIntoView({ behavior: "smooth" }); }}
              >About</button>
            </li>
            <li>
              <button
                className={activeSection === "features" ? "active" : ""}
                onClick={() => { setActiveSection("features"); setMenuOpen(false); document.getElementById("features-sec").scrollIntoView({ behavior: "smooth" }); }}
              >Features</button>
            </li>
            <li>
              <button
                className={activeSection === "updates" ? "active" : ""}
                onClick={() => { setActiveSection("updates"); setMenuOpen(false); document.getElementById("updates-sec").scrollIntoView({ behavior: "smooth" }); }}
              >Updates</button>
            </li>
            <li>
              <button
                className={activeSection === "team" ? "active" : ""}
                onClick={() => { setActiveSection("team"); setMenuOpen(false); document.getElementById("team-sec").scrollIntoView({ behavior: "smooth" }); }}
              >Team</button>
            </li>
          </ul>
          <div className="about-nav__actions">
            <button className="about-nav__login" onClick={() => navigate("/login")}>Log In</button>
            <button className="about-nav__signup" onClick={() => navigate("/signup")}>Sign Up</button>
          </div>
          <button className="about-nav__hamburger" onClick={() => setMenuOpen((x) => !x)} aria-label="Menu">
            <span></span><span></span><span></span>
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="about-hero" id="about-sec">
        <div className="about-hero__bg">
          <div className="about-hero__orb about-hero__orb--1"></div>
          <div className="about-hero__orb about-hero__orb--2"></div>
          <div className="about-hero__orb about-hero__orb--3"></div>
          <div className="about-hero__grid"></div>
        </div>
        <div className="about-hero__content">
          <div className="about-hero__badge">
            <span className="about-hero__badge-dot"></span>
            LEVEL UP YOUR CAMPUS LIFE
          </div>
          <h1 className="about-hero__title">
            Your Campus.<br />
            <span className="about-hero__title-gradient">Amplified.</span>
          </h1>
          <p className="about-hero__sub">
            Campus Notice is the ultimate digital notice board for modern colleges —
            built for students, powered by faculty, and designed to keep every corner
            of your campus connected.
          </p>
          <div className="about-hero__cta">
            <button className="about-hero__btn-primary" onClick={() => navigate("/signup")}>
              <span>JOIN THE CAMPUS</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
            <button className="about-hero__btn-secondary" onClick={() => navigate("/login")}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3"/></svg>
              <span>SIGN IN</span>
            </button>
          </div>
          <div className="about-hero__pills">
            <span className="about-hero__pill">⚡ Real-Time Alerts</span>
            <span className="about-hero__pill">🎓 Student Portal</span>
            <span className="about-hero__pill">🛡️ Role-Based Access</span>
          </div>
        </div>
        <div className="about-hero__visual">
          <div className="about-hero__card about-hero__card--main">
            <div className="about-hero__card-header">
              <div className="about-hero__card-dot" style={{background:"#ff5f57"}}></div>
              <div className="about-hero__card-dot" style={{background:"#febc2e"}}></div>
              <div className="about-hero__card-dot" style={{background:"#28c840"}}></div>
              <span className="about-hero__card-title">NOTICE FEED</span>
            </div>
            <div className="about-hero__notice">
              <span className="about-hero__notice-tag" style={{background:"rgba(124,58,237,0.2)",color:"#a78bfa"}}>📢 URGENT</span>
              <p className="about-hero__notice-title">Internal Assessment Schedule Released</p>
              <p className="about-hero__notice-meta">CSE Dept • 2 min ago</p>
            </div>
            <div className="about-hero__notice">
              <span className="about-hero__notice-tag" style={{background:"rgba(8,145,178,0.2)",color:"#67e8f9"}}>🎉 EVENT</span>
              <p className="about-hero__notice-title">Tech Symposium 2026 — Register Now!</p>
              <p className="about-hero__notice-meta">IT Dept • 15 min ago</p>
            </div>
            <div className="about-hero__notice">
              <span className="about-hero__notice-tag" style={{background:"rgba(190,24,93,0.2)",color:"#f9a8d4"}}>🏆 SPORTS</span>
              <p className="about-hero__notice-title">Inter-College Cricket League Selections</p>
              <p className="about-hero__notice-meta">Sports Club • 1 hr ago</p>
            </div>
          </div>
          <div className="about-hero__card about-hero__card--float-1">
            <span>🔔</span>
            <p>3 new notices</p>
          </div>
          <div className="about-hero__card about-hero__card--float-2">
            <span>⚡</span>
            <p>Live</p>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="about-stats" ref={statsRef}>
        <div className="about-stats__inner">
          {STATS.map((s, i) => (
            <div className="about-stats__item" key={i}>
              <div className="about-stats__icon">{s.icon}</div>
              <div className="about-stats__value">{formatStat(i, animatedStats[i])}</div>
              <div className="about-stats__label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="about-features" id="features-sec">
        <div className="about-section-header">
          <span className="about-section-tag">#FEATURES</span>
          <h2 className="about-section-title">Built Different.<br /><span>Plays Different.</span></h2>
          <p className="about-section-sub">Every feature is crafted to make campus communication faster, smarter, and more engaging.</p>
        </div>
        <div className="about-features__grid">
          {FEATURES.map((f, i) => (
            <div className="about-feature-card" key={i}>
              <div className="about-feature-card__inner">
                <div className="about-feature-card__top">
                  <span className="about-feature-card__tag" style={{ background: f.tagColor + "22", color: f.tagColor }}>{f.tag}</span>
                </div>
                <div className="about-feature-card__icon">{f.icon}</div>
                <h3 className="about-feature-card__title">{f.title}</h3>
                <p className="about-feature-card__desc">{f.desc}</p>
                <div className="about-feature-card__footer">
                  <span className="about-feature-card__date">{f.date}</span>
                  <div className="about-feature-card__glow" style={{ background: f.tagColor }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MISSION SECTION */}
      <section className="about-mission">
        <div className="about-mission__inner">
          <div className="about-mission__text">
            <span className="about-section-tag">#OUR MISSION</span>
            <h2 className="about-section-title">Why We Built<br /><span>Campus Notice</span></h2>
            <p className="about-mission__para">
              We noticed that critical campus information was scattered across Whatsapp groups,
              bulletin boards, and word-of-mouth. Students missed exams. Events went unattended.
              Faculty struggled to reach everyone.
            </p>
            <p className="about-mission__para">
              So we built <strong>Campus Notice</strong> — one unified, beautiful, real-time platform
              where every notice reaches every student instantly, with the right context and the right
              level of urgency.
            </p>
            <div className="about-mission__values">
              <div className="about-mission__value">
                <span>🎯</span> <p><strong>Precision</strong> — Right notice, right person, right time.</p>
              </div>
              <div className="about-mission__value">
                <span>🌐</span> <p><strong>Inclusivity</strong> — Every department, every student, one feed.</p>
              </div>
              <div className="about-mission__value">
                <span>🔒</span> <p><strong>Security</strong> — Role-based control with zero noisy spam.</p>
              </div>
            </div>
          </div>
          <div className="about-mission__visual">
            <div className="about-mission__card-stack">
              <div className="about-mission__stack-card about-mission__stack-card--back"></div>
              <div className="about-mission__stack-card about-mission__stack-card--mid"></div>
              <div className="about-mission__stack-card about-mission__stack-card--front">
                <div className="about-mission__quote">
                  <div className="about-mission__quote-mark">"</div>
                  <p>Campus Notice turned our chaos into clarity. Every student now knows what's happening, when it's happening.</p>
                  <div className="about-mission__quote-author">
                    <div className="about-mission__quote-avatar">SC</div>
                    <div>
                      <strong>Student Council</strong>
                      <span>Campus Representative</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* UPDATES SECTION */}
      <section className="about-updates" id="updates-sec">
        <div className="about-section-header">
          <span className="about-section-tag">#UPDATES</span>
          <h2 className="about-section-title">What's New.<br /><span>What's Next.</span></h2>
          <p className="about-section-sub">We're always shipping. Here's the latest from the Campus Notice dev team.</p>
        </div>
        <div className="about-updates__grid">
          {UPDATES.map((u, i) => (
            <div className="about-update-card" key={i}>
              <div className="about-update-card__icon">{u.icon}</div>
              <div className="about-update-card__body">
                <div className="about-update-card__meta">
                  <span className="about-update-card__tag" style={{ background: u.tagColor + "22", color: u.tagColor }}>{u.tag}</span>
                  <span className="about-update-card__date">🕒 {u.date}</span>
                </div>
                <h3 className="about-update-card__title">{u.title}</h3>
                <p className="about-update-card__desc">{u.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TEAM SECTION */}
      <section className="about-team" id="team-sec">
        <div className="about-section-header">
          <span className="about-section-tag">#TEAM</span>
          <h2 className="about-section-title">The Squad<br /><span>Behind the Screen.</span></h2>
          <p className="about-section-sub">Built with passion, powered by curiosity — meet the people making Campus Notice possible.</p>
        </div>
        <div className="about-team__grid">
          {TEAM.map((t, i) => (
            <div className="about-team-card" key={i}>
              <div className="about-team-card__avatar" style={{ background: t.color }}>
                {t.avatar}
                <div className="about-team-card__avatar-ring" style={{ borderColor: t.color }}></div>
              </div>
              <h3 className="about-team-card__name">{t.name}</h3>
              <span className="about-team-card__role" style={{ color: t.color }}>{t.role}</span>
              <p className="about-team-card__tagline">"{t.tagline}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="about-cta">
        <div className="about-cta__bg">
          <div className="about-cta__orb about-cta__orb--1"></div>
          <div className="about-cta__orb about-cta__orb--2"></div>
        </div>
        <div className="about-cta__inner">
          <div className="about-cta__badge">🎮 READY PLAYER ONE?</div>
          <h2 className="about-cta__title">Join Your Campus.<br /><span>Stay Ahead.</span></h2>
          <p className="about-cta__sub">Be part of a smarter, faster, more connected campus experience. Sign up today — it's free.</p>
          <div className="about-cta__actions">
            <button className="about-hero__btn-primary" onClick={() => navigate("/signup")}>
              <span>CREATE ACCOUNT</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
            <button className="about-hero__btn-secondary" onClick={() => navigate("/login")}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3"/></svg>
              <span>LOGIN</span>
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="about-footer">
        <div className="about-footer__inner">
          <div className="about-footer__brand">
            <span className="about-nav__logo-icon">📢</span>
            <span className="about-nav__logo-text">Campus<span>Notice</span></span>
          </div>
          <p className="about-footer__tagline">Connecting campuses. Empowering communities.</p>
          <div className="about-footer__links">
            <a href="#about-sec">About</a>
            <a href="#features-sec">Features</a>
            <a href="#updates-sec">Updates</a>
            <a href="#team-sec">Team</a>
            <button onClick={() => navigate("/login")}>Login</button>
            <button onClick={() => navigate("/signup")}>Sign Up</button>
          </div>
          <div className="about-footer__bottom">
            <span>© 2026 Campus Notice. All rights reserved.</span>
            <span>Made with ❤️ by Karpagavalli V</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
