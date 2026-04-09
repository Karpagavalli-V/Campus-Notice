import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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

const Counter = ({ value, duration = 2 }) => {
    const [count, setCount] = useState(0);
    const target = parseFloat(value.toString().replace(/[^0-9.]/g, ''));
    const suffix = value.toString().replace(/[0-9.]/g, '');

    useEffect(() => {
        let startTime = null;
        let animationFrame = null;

        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = (timestamp - startTime) / (duration * 1000);
            
            if (progress < 1) {
                setCount(Math.min(target, Math.floor(progress * target)));
                animationFrame = requestAnimationFrame(animate);
            } else {
                setCount(target);
            }
        };

        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [target, duration]);

    return <span>{count.toLocaleString()}{suffix}</span>;
};

export default function AboutPage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("about");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="about-root">
      {/* NAV BAR */}
      <nav className={`about-nav ${scrolled ? "about-nav--scrolled" : ""}`}>
        <div className="about-nav__inner">
          <motion.div 
            className="about-nav__logo"
            whileHover={{ scale: 1.05 }}
          >
            <span className="about-nav__logo-icon">📢</span>
            <span className="about-nav__logo-text">Campus<span>Notice</span></span>
          </motion.div>
          
          <ul className={`about-nav__links ${menuOpen ? "about-nav__links--open" : ""}`}>
            {["about", "features", "updates", "team"].map((sec) => (
              <li key={sec}>
                <button
                  className={activeSection === sec ? "active" : ""}
                  onClick={() => { 
                    setActiveSection(sec); 
                    setMenuOpen(false); 
                    document.getElementById(`${sec}-sec`).scrollIntoView({ behavior: "smooth" }); 
                  }}
                >
                  {sec.charAt(0).toUpperCase() + sec.slice(1)}
                  {activeSection === sec && (
                    <motion.div layoutId="nav-underline" className="nav-underline" />
                  )}
                </button>
              </li>
            ))}
          </ul>

          <div className="about-nav__actions">
            <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="about-nav__login" 
                onClick={() => navigate("/login")}
            >Log In</motion.button>
            <motion.button 
                whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(124, 58, 237, 0.4)" }}
                whileTap={{ scale: 0.95 }}
                className="about-nav__signup" 
                onClick={() => navigate("/signup")}
            >Sign Up</motion.button>
          </div>

          <button className="about-nav__hamburger" onClick={() => setMenuOpen((x) => !x)} aria-label="Menu">
            <span></span><span></span><span></span>
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="about-hero" id="about-sec">
        <div className="about-hero__bg">
          <motion.div 
            animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 90, 0],
                x: [0, 50, 0]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="about-hero__orb about-hero__orb--1"
          ></motion.div>
          <motion.div 
            animate={{ 
                scale: [1, 1.3, 1],
                rotate: [0, -90, 0],
                x: [0, -70, 0]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="about-hero__orb about-hero__orb--2"
          ></motion.div>
          <div className="about-hero__grid"></div>
        </div>

        <motion.div 
          className="about-hero__content"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="about-hero__badge">
            <motion.span 
                animate={{ opacity: [1, 0.5, 1] }} 
                transition={{ duration: 2, repeat: Infinity }}
                className="about-hero__badge-dot"
            ></motion.span>
            LEVEL UP YOUR CAMPUS LIFE
          </motion.div>
          
          <motion.h1 
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.05,
                  delayChildren: 0.5
                }
              }
            }}
            className="about-hero__title"
          >
            {"Your Campus.".split("").map((char, index) => (
              <motion.span
                key={index}
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 }
                }}
                style={{ display: "inline-block" }}
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
            <br />
            <span className="about-hero__title-gradient">
              {"Amplified.".split("").map((char, index) => (
                <motion.span
                  key={index}
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  style={{ display: "inline-block" }}
                >
                  {char === " " ? "\u00A0" : char}
                </motion.span>
              ))}
              <motion.span
                variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1 }
                }}
                animate={{ opacity: [1, 0, 1] }}
                transition={{ 
                    opacity: { duration: 0.8, repeat: Infinity, ease: "linear" },
                    default: { delay: 1.5 }
                }}
                className="about-hero__cursor"
              />
            </span>
          </motion.h1>

          <motion.p 
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { 
                opacity: 1, 
                y: 0,
                transition: { delay: 1.8, duration: 0.8 } 
              }
            }} 
            className="about-hero__sub"
          >
            Campus Notice is the ultimate digital notice board for modern colleges —
            built for students, powered by faculty, and designed to keep every corner
            of your campus connected.
          </motion.p>

          <motion.div 
            variants={{
                hidden: { opacity: 0 },
                visible: { 
                    opacity: 1,
                    transition: { delay: 2.2, staggerChildren: 0.1 }
                }
            }}
            className="about-hero__cta"
          >
            <motion.button 
                whileHover={{ scale: 1.05, x: 5 }}
                whileTap={{ scale: 0.95 }}
                className="about-hero__btn-primary" 
                onClick={() => navigate("/signup")}
            >
              <span>JOIN THE CAMPUS</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </motion.button>
            <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="about-hero__btn-secondary" 
                onClick={() => navigate("/login")}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3"/></svg>
              <span>SIGN IN</span>
            </motion.button>
          </motion.div>

          <motion.div 
            variants={{
                hidden: { opacity: 0 },
                visible: { 
                    opacity: 1,
                    transition: { delay: 2.5, staggerChildren: 0.1 }
                }
            }}
            className="about-hero__pills"
          >
            {["⚡ Real-Time Alerts", "🎓 Student Portal", "🛡️ Role-Based Access"].map(pill => (
                <motion.span 
                    key={pill}
                    whileHover={{ y: -5, backgroundColor: "rgba(139, 92, 246, 0.2)" }}
                    className="about-hero__pill"
                >{pill}</motion.span>
            ))}
          </motion.div>
        </motion.div>

        <motion.div 
            className="about-hero__visual"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
        >
          <motion.div 
            className="about-hero__card about-hero__card--main"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="about-hero__card-header">
              <div className="about-hero__card-dot" style={{background:"#ff5f57"}}></div>
              <div className="about-hero__card-dot" style={{background:"#febc2e"}}></div>
              <div className="about-hero__card-dot" style={{background:"#28c840"}}></div>
              <span className="about-hero__card-title">NOTICE FEED</span>
            </div>
            {[
                { tag: "📢 URGENT", title: "Internal Assessment Schedule Released", meta: "CSE Dept • 2 min ago", color: "#a78bfa", bg: "rgba(124,58,237,0.2)" },
                { tag: "🎉 EVENT", title: "Tech Symposium 2026 — Register Now!", meta: "IT Dept • 15 min ago", color: "#67e8f9", bg: "rgba(8,145,178,0.2)" },
                { tag: "🏆 SPORTS", title: "Inter-College Cricket League Selections", meta: "Sports Club • 1 hr ago", color: "#f9a8d4", bg: "rgba(190,24,93,0.2)" }
            ].map((n, i) => (
                <motion.div 
                    key={i}
                    whileHover={{ x: 5, backgroundColor: "rgba(255,255,255,0.05)" }}
                    className="about-hero__notice"
                >
                    <span className="about-hero__notice-tag" style={{background: n.bg, color: n.color}}>{n.tag}</span>
                    <p className="about-hero__notice-title">{n.title}</p>
                    <p className="about-hero__notice-meta">{n.meta}</p>
                </motion.div>
            ))}
          </motion.div>
          
          <motion.div 
            className="about-hero__card about-hero__card--float-1"
            animate={{ y: [0, 15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <span>🔔</span>
            <p>3 new notices</p>
          </motion.div>
          
          <motion.div 
            className="about-hero__card about-hero__card--float-2"
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          >
            <span>⚡</span>
            <p>Live</p>
          </motion.div>
        </motion.div>
      </section>

      {/* STATS BAR */}
      <section className="about-stats">
        <div className="about-stats__inner">
          {STATS.map((s, i) => (
            <motion.div 
                className="about-stats__item" 
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
            >
              <div className="about-stats__icon">{s.icon}</div>
              <div className="about-stats__value">
                <Counter value={s.value} />
              </div>
              <div className="about-stats__label">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="about-features" id="features-sec">
        <motion.div 
            className="about-section-header"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
        >
          <span className="about-section-tag">#FEATURES</span>
          <h2 className="about-section-title">Built Different.<br /><span>Plays Different.</span></h2>
          <p className="about-section-sub">Every feature is crafted to make campus communication faster, smarter, and more engaging.</p>
        </motion.div>

        <motion.div 
            className="about-features__grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
        >
          {FEATURES.map((f, i) => (
            <motion.div 
                className="about-feature-card" 
                key={i}
                variants={itemVariants}
                whileHover={{ y: -10 }}
            >
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
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* MISSION SECTION */}
      <section className="about-mission">
        <div className="about-mission__inner">
          <motion.div 
            className="about-mission__text"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
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
              {[
                { icon: "🎯", title: "Precision", text: "Right notice, right person, right time." },
                { icon: "🌐", title: "Inclusivity", text: "Every department, every student, one feed." },
                { icon: "🔒", title: "Security", text: "Role-based control with zero noisy spam." }
              ].map((v, i) => (
                <motion.div 
                    key={i}
                    whileHover={{ x: 10 }}
                    className="about-mission__value"
                >
                    <span>{v.icon}</span> <p><strong>{v.title}</strong> — {v.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            className="about-mission__visual"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="about-mission__card-stack">
              <div className="about-mission__stack-card about-mission__stack-card--back"></div>
              <div className="about-mission__stack-card about-mission__stack-card--mid"></div>
              <motion.div 
                className="about-mission__stack-card about-mission__stack-card--front"
                whileHover={{ scale: 1.02, rotate: -1 }}
              >
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
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* UPDATES SECTION */}
      <section className="about-updates" id="updates-sec">
        <motion.div 
            className="about-section-header"
            initial="hidden"
            whileInView="visible"
            variants={fadeUp}
        >
          <span className="about-section-tag">#UPDATES</span>
          <h2 className="about-section-title">What's New.<br /><span>What's Next.</span></h2>
          <p className="about-section-sub">We're always shipping. Here's the latest from the Campus Notice dev team.</p>
        </motion.div>

        <div className="about-updates__grid">
          {UPDATES.map((u, i) => (
            <motion.div 
                className="about-update-card" 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ x: 10, backgroundColor: "rgba(255,255,255,0.05)" }}
            >
              <div className="about-update-card__icon">{u.icon}</div>
              <div className="about-update-card__body">
                <div className="about-update-card__meta">
                  <span className="about-update-card__tag" style={{ background: u.tagColor + "22", color: u.tagColor }}>{u.tag}</span>
                  <span className="about-update-card__date">🕒 {u.date}</span>
                </div>
                <h3 className="about-update-card__title">{u.title}</h3>
                <p className="about-update-card__desc">{u.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TEAM SECTION */}
      <section className="about-team" id="team-sec">
        <motion.div 
            className="about-section-header"
            initial="hidden"
            whileInView="visible"
            variants={fadeUp}
        >
          <span className="about-section-tag">#TEAM</span>
          <h2 className="about-section-title">The Squad<br /><span>Behind the Screen.</span></h2>
          <p className="about-section-sub">Built with passion, powered by curiosity — meet the people making Campus Notice possible.</p>
        </motion.div>

        <motion.div 
            className="about-team__grid"
            initial="hidden"
            whileInView="visible"
            variants={containerVariants}
        >
          {TEAM.map((t, i) => (
            <motion.div 
                className="about-team-card" 
                key={i}
                variants={itemVariants}
                whileHover={{ y: -10 }}
            >
              <div className="about-team-card__avatar" style={{ background: t.color }}>
                {t.avatar}
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="about-team-card__avatar-ring" 
                    style={{ borderColor: t.color }}
                ></motion.div>
              </div>
              <h3 className="about-team-card__name">{t.name}</h3>
              <span className="about-team-card__role" style={{ color: t.color }}>{t.role}</span>
              <p className="about-team-card__tagline">"{t.tagline}"</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA SECTION */}
      <section className="about-cta">
        <div className="about-cta__bg">
          <div className="about-cta__orb about-cta__orb--1"></div>
          <div className="about-cta__orb about-cta__orb--2"></div>
        </div>
        <motion.div 
            className="about-cta__inner"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
        >
          <div className="about-cta__badge">🎮 READY PLAYER ONE?</div>
          <h2 className="about-cta__title">Join Your Campus.<br /><span>Stay Ahead.</span></h2>
          <p className="about-cta__sub">Be part of a smarter, faster, more connected campus experience. Sign up today — it's free.</p>
          <div className="about-cta__actions">
            <motion.button 
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="about-hero__btn-primary" 
                onClick={() => navigate("/signup")}
            >
              <span>CREATE ACCOUNT</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </motion.button>
            <motion.button 
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="about-hero__btn-secondary" 
                onClick={() => navigate("/login")}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3"/></svg>
              <span>LOGIN</span>
            </motion.button>
          </div>
        </motion.div>
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
