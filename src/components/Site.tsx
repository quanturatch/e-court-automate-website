"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { shownDownloads, useStats } from "@/components/ViewsProvider";

const INSTALL = "irm https://ecourt.quanturatech.com/install.ps1 | iex";
const UNINSTALL = "irm https://ecourt.quanturatech.com/uninstall.ps1 | iex";

type Page = "product" | "install" | "workflow" | "trial" | "support";

const TABS: Record<
  string,
  { title: string; body: string; items: string[] }
> = {
  advocate: {
    title: "Never let a changed hearing date hide in plain sight.",
    body: "For an advocate, the core value is reducing the effort required to stay current across active matters.",
    items: [
      "Add the matter using its 16-character CNR.",
      "Run routine monitoring without repeating portal lookups manually.",
      "Review the next hearing, stage and changes in an email-friendly summary.",
      "Keep hearing dates visible in the same Gmail calendar workflow.",
    ],
  },
  chamber: {
    title: "Turn a chamber’s morning review into a repeatable system.",
    body: "For chambers, automation helps standardize how multiple active matters are reviewed and escalated.",
    items: [
      "Maintain one monitored list across ongoing matters.",
      "Surface changed cases so staff spend less time checking unchanged matters.",
      "Use daily summaries to coordinate advocate and clerk attention.",
      "Keep new or changed hearings close to the team’s planning calendar.",
    ],
  },
  firm: {
    title: "Give a growing matter portfolio a consistent monitoring rhythm.",
    body: "For law firms, the use case is operational scale: more matters, more updates and less repetitive manual checking.",
    items: [
      "Group recurring monitoring into a predictable process.",
      "Identify cases with fresh activity or upcoming hearings.",
      "Create a shared information habit across lawyers and support staff.",
      "Reduce the administrative overhead of checking the same portals repeatedly.",
    ],
  },
  inhouse: {
    title: "Keep legal operations focused on exceptions, not refresh cycles.",
    body: "For legal teams, the workflow is useful when court matters need to be monitored alongside broader business responsibilities.",
    items: [
      "Automate routine case-status awareness.",
      "Receive a digest instead of manually inspecting every active matter.",
      "Highlight changes that may warrant legal or business follow-up.",
      "Maintain hearing-date visibility through calendar-oriented workflows.",
    ],
  },
};

function parsePage(hash: string): Page {
  const h = hash.replace("#", "").split("/")[0];
  if (h === "install" || h === "workflow" || h === "trial" || h === "support" || h === "product") {
    return h;
  }
  return "product";
}

export default function Site() {
  const { views, copies } = useStats();
  const downloads = shownDownloads(copies);
  const viewsShown = views ?? 0;

  const [page, setPage] = useState<Page>("product");
  const [navOpen, setNavOpen] = useState(false);
  const [tab, setTab] = useState("advocate");
  const [copied, setCopied] = useState(false);
  const [cnr, setCnr] = useState("");
  const [preview, setPreview] = useState("");
  const [booted, setBooted] = useState(false);
  const [bootW, setBootW] = useState(0);
  const [progress, setProgress] = useState(0);
  const [dlBump, setDlBump] = useState(false);
  const prevDownloads = useRef(downloads);
  const year = new Date().getFullYear();
  const dlClass = `dl-count${dlBump ? " is-bump" : ""}`;
  const dlText = downloads.toLocaleString("en-IN");

  function go(next: Page, push = true) {
    setPage(next);
    setNavOpen(false);
    if (push) {
      history.pushState({ page: next }, "", "#" + next);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  useEffect(() => {
    const initial = parsePage(window.location.hash);
    setPage(initial);
    const onPop = () => setPage(parsePage(window.location.hash));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    const titles: Record<Page, string> = {
      product: "E-Court Automate — Legal Case Monitoring & Automation",
      install: "E-Court Automate — Install",
      workflow: "E-Court Automate — Workflow",
      trial: "E-Court Automate — Trial",
      support: "E-Court Automate — Support",
    };
    document.title = titles[page];
  }, [page]);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? (window.scrollY / max) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [page]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setBooted(true);
      setBootW(100);
      return;
    }
    let w = 0;
    const tick = window.setInterval(() => {
      w += 8 + Math.random() * 10;
      if (w >= 100) {
        w = 100;
        setBootW(100);
        window.clearInterval(tick);
        window.setTimeout(() => setBooted(true), 280);
      } else {
        setBootW(w);
      }
    }, 90);
    return () => window.clearInterval(tick);
  }, []);

  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        });
      },
      { threshold: 0.09 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [page]);

  useEffect(() => {
    if (downloads > prevDownloads.current) {
      setDlBump(true);
      const t = window.setTimeout(() => setDlBump(false), 520);
      prevDownloads.current = downloads;
      return () => window.clearTimeout(t);
    }
    prevDownloads.current = downloads;
  }, [downloads]);

  async function copyInstall() {
    try {
      await navigator.clipboard.writeText(INSTALL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  function showPreview(e?: FormEvent) {
    e?.preventDefault();
    const v = cnr.trim().toUpperCase();
    if (!v) {
      setPreview("Enter a CNR to preview the monitored-case experience.");
      return;
    }
    if (v.length !== 16) {
      setPreview(
        "For the product workflow, a CNR is expected to contain 16 letters/digits. This demo will still show the experience."
      );
      return;
    }
    setPreview(
      `CNR ${v} is ready for a monitored-case view — next hearing, stage, status and detected changes would appear in the daily summary.`
    );
  }

  const tabInfo = TABS[tab];

  return (
    <>
      <div className={`boot${booted ? " is-done" : ""}`} aria-hidden="true">
        <div className="boot-core">
          <div className="boot-seal">⚖</div>
          <div className="boot-name">E-Court Automate</div>
          <div className="boot-sub">BY QUANTURA TECHNOLOGIES</div>
          <div className="boot-bar">
            <i style={{ width: `${bootW}%` }} />
          </div>
        </div>
      </div>
      <div className="fx-progress" style={{ width: `${progress}%` }} aria-hidden="true" />

      <header>
        <div className="container nav">
          <a
            className="brand"
            href="#product"
            aria-label="E-Court Automate home"
            onClick={(e) => {
              e.preventDefault();
              go("product");
            }}
          >
            <span className="brand-mark">⚖</span>
            <span className="brand-text">
              <span>E-Court Automate</span>
              <small>BY QUANTURA TECHNOLOGIES</small>
            </span>
          </a>
          <button className="menu-btn" type="button" aria-label="Toggle navigation" onClick={() => setNavOpen((o) => !o)}>
            ☰
          </button>
          <nav id="nav" className={navOpen ? "open" : undefined} aria-label="Primary navigation">
            {(["product", "install", "workflow", "trial", "support"] as Page[]).map((p) => (
              <a
                key={p}
                href={`#${p}`}
                className={page === p ? "active" : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  go(p);
                }}
              >
                {p[0].toUpperCase() + p.slice(1)}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main id="top">
        <div id="siteContent">
          <section className={`page-view${page === "product" ? " active" : ""}`}>
            <section className="hero">
              <div className="container hero-grid">
                <div className="reveal">
                  <span className="eyebrow">
                    <i className="dot" /> Legal workflow automation
                  </span>
                  <h1>
                    Stop refreshing the portal. <em>Start running your cases.</em>
                  </h1>
                  <p className="hero-copy">
                    E-Court Automate turns repetitive eCourts monitoring into a predictable daily
                    workflow. Add cases by CNR, watch for changes, surface the next hearing, and keep
                    your legal team informed.
                  </p>
                  <div className="hero-actions">
                    <a
                      className="btn btn-primary"
                      href="#install"
                      onClick={(e) => {
                        e.preventDefault();
                        go("install");
                      }}
                    >
                      Install in one line →
                    </a>
                    <a className="btn btn-ghost" href="#use-cases">
                      Explore use cases
                    </a>
                  </div>
                </div>
                <div className="terminal-card reveal">
                  <div className="terminal-top">
                    <i /><i /><i />
                    <span>Windows PowerShell</span>
                  </div>
                  <div className="terminal-body">
                    <div className="terminal-label">Command line</div>
                    <div className="workflow-command" style={{ marginTop: 12 }}>
                      run_ecourt APKR180004972024
                    </div>
                    <div className="workflow-command">run_ecourt now</div>
                    <div className="workflow-command">run_ecourt list · status</div>
                    <div className="workflow-command">run_ecourt schedule time 19:30</div>
                    <div className="terminal-success" style={{ marginTop: 16 }}>
                      <span className="gold-check">✓</span>
                      <div>
                        <b className={dlClass}>{dlText} downloads</b>
                        <span>People who copied the one-line installer</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <div className="metric-strip">
              <button
                type="button"
                className="metric metric-downloads"
                data-track-copy="1"
                aria-label={`${dlText} installer downloads. Click to add one.`}
              >
                <strong className={dlClass}>{dlText}</strong>
                <span>Installer downloads</span>
              </button>
              <div className="metric metric-trial">
                <strong>60-day trial</strong>
                <span>Free trial · Gmail-bound · no payment</span>
              </div>
            </div>

            <section className="section" id="use-cases">
              <div className="container">
                <div className="section-head reveal">
                  <span className="eyebrow">
                    <i className="dot" /> Where it fits
                  </span>
                  <h2>Built around the moments that consume legal teams’ time.</h2>
                  <p>
                    Instead of treating case monitoring as a manual lookup task, E-Court Automate
                    makes it part of the routine operating system of a chamber or firm.
                  </p>
                </div>
                <div className="usecases">
                  {[
                    ["👨‍⚖️", "Advocate case monitoring", "Track active matters from a CNR-based registry without repeatedly opening the eCourts portal to check whether something changed.", "INDIVIDUAL PRACTICE"],
                    ["🏛️", "Law chamber operations", "Give a chamber a repeatable morning workflow: review monitored cases, spot changes, and identify the hearings that need attention.", "CHAMBER WORKFLOW"],
                    ["👥", "Multi-lawyer team visibility", "Create a centralized overview for teams managing many matters so important changes are easier to surface and distribute.", "TEAM COORDINATION"],
                    ["⏰", "Hearing-date awareness", "Highlight upcoming hearing dates and changes so calendar planning can start from the latest monitored case information.", "DEADLINE AWARENESS"],
                    ["🔔", "Status-change alerts", "Detect meaningful updates in case status or stage and surface them through automated email summaries instead of passive manual checking.", "CHANGE DETECTION"],
                    ["📅", "Hearing calendar organization", "Turn new or changed next-hearing dates into calendar-ready invitations so upcoming court work is easier to plan around.", "GMAIL CALENDAR"],
                    ["📨", "Daily legal digest", "Replace scattered checks with a landscape-style status summary that gives the team a quick daily picture of court activity.", "DAILY SUMMARY"],
                    ["🗂️", "Large case portfolios", "Reduce repetitive monitoring work when the number of active matters grows beyond what one person can comfortably inspect every morning.", "PORTFOLIO MANAGEMENT"],
                    ["⚙️", "Routine automation", "Move recurring checks into a scheduled process so the team can focus more attention on legal work than administrative refresh cycles.", "PROCESS AUTOMATION"],
                  ].map(([icon, title, body, tag]) => (
                    <article className="usecase reveal" key={title}>
                      <div className="icon">{icon}</div>
                      <h3>{title}</h3>
                      <p>{body}</p>
                      <span className="tag">{tag}</span>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            <section className="section" id="workflow">
              <div className="container">
                <div className="section-head reveal">
                  <span className="eyebrow">
                    <i className="dot" /> Simple operating model
                  </span>
                  <h2>One workflow. Multiple legal-team outcomes.</h2>
                  <p>
                    Choose the role that matches your workflow to see how the same monitoring engine
                    translates into day-to-day value.
                  </p>
                </div>
                <div className="workflow">
                  <div className="tabs reveal" role="tablist">
                    {[
                      ["advocate", "01", "For Advocates"],
                      ["chamber", "02", "For Chambers"],
                      ["firm", "03", "For Law Firms"],
                      ["inhouse", "04", "For Legal Teams"],
                    ].map(([key, n, label]) => (
                      <button
                        key={key}
                        className={`tab-btn${tab === key ? " active" : ""}`}
                        type="button"
                        role="tab"
                        onClick={() => setTab(key)}
                      >
                        <small>{n}</small>
                        <strong>{label}</strong>
                      </button>
                    ))}
                  </div>
                  <div className="panel reveal">
                    <h3>{tabInfo.title}</h3>
                    <p>{tabInfo.body}</p>
                    <div className="panel-list">
                      {tabInfo.items.map((item) => (
                        <div className="panel-item" key={item}>
                          <span className="check">✓</span>
                          <p>{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="section" id="automation">
              <div className="container">
                <div className="section-head reveal">
                  <span className="eyebrow">
                    <i className="dot" /> Automation loop
                  </span>
                  <h2>From CNR to a useful morning update.</h2>
                  <p>
                    The point is not another dashboard to babysit. The point is a workflow that tells
                    you what changed and what deserves attention.
                  </p>
                </div>
                <div className="alert-flow">
                  {[
                    ["STEP 01", "Add the case", "Use the case’s CNR to create a monitored matter in the workflow."],
                    ["STEP 02", "Check automatically", "Routine checks fetch the latest available case information on schedule."],
                    ["STEP 03", "Detect changes", "New hearings, changed status and other meaningful updates become visible."],
                    ["STEP 04", "Deliver the update", "Email summaries and calendar-ready hearing events move the information into your daily workflow."],
                  ].map(([n, t, p]) => (
                    <div className="flow-card reveal" key={n}>
                      <div className="flow-num">{n}</div>
                      <h3>{t}</h3>
                      <p>{p}</p>
                    </div>
                  ))}
                </div>
                <div className="cta reveal">
                  <div>
                    <h2>A calmer morning starts with knowing what changed.</h2>
                    <p>Designed for the practical reality of chambers and firms managing multiple active court matters.</p>
                  </div>
                  <a
                    className="btn btn-primary"
                    href="#install"
                    onClick={(e) => {
                      e.preventDefault();
                      go("install");
                    }}
                  >
                    See the workflow →
                  </a>
                </div>
              </div>
            </section>

            <section className="section" id="demo">
              <div className="container">
                <div className="demo">
                  <div className="demo-copy reveal">
                    <span className="eyebrow">
                      <i className="dot" /> Interactive concept
                    </span>
                    <h2>See how a monitored case feels.</h2>
                    <p>Enter a sample CNR below to preview the type of summary a legal team might want to see first thing in the day.</p>
                    <div className="mini-note">
                      This front-end demo does not query the live eCourts service. It simply demonstrates the product experience and information hierarchy.
                    </div>
                  </div>
                  <div className="demo-box reveal">
                    <label htmlFor="cnr">
                      <strong>16-character CNR</strong>
                    </label>
                    <form className="form-row" onSubmit={showPreview}>
                      <input
                        id="cnr"
                        className="input"
                        maxLength={16}
                        placeholder="APKR180004972024"
                        autoComplete="off"
                        value={cnr}
                        onChange={(e) => setCnr(e.target.value)}
                      />
                      <button className="btn btn-primary" type="submit">
                        Preview
                      </button>
                    </form>
                    {preview ? (
                      <div className="result show">
                        <strong style={{ display: "block", color: "white", marginBottom: 6 }}>
                          Case monitor ready ✓
                        </strong>
                        <span>{preview}</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </section>

            <section className="section" id="faq">
              <div className="container">
                <div className="section-head reveal">
                  <span className="eyebrow">
                    <i className="dot" /> Practical questions
                  </span>
                  <h2>What the workflow is designed to solve.</h2>
                </div>
                <div className="faq">
                  <details className="reveal" open>
                    <summary>Who is this useful for?</summary>
                    <p>Advocates, law chambers, law firms, and legal teams that manage active Indian court matters and want a more consistent monitoring routine.</p>
                  </details>
                  <details className="reveal">
                    <summary>What does the CNR do in the workflow?</summary>
                    <p>The CNR acts as the case identifier used to retrieve and monitor the corresponding matter information in the product workflow.</p>
                  </details>
                  <details className="reveal">
                    <summary>What kind of updates matter most?</summary>
                    <p>Typical priority signals include a new or changed next hearing date, a case-status change, stage updates, and a daily view of upcoming court activity.</p>
                  </details>
                  <details className="reveal">
                    <summary>Can hearings be organized in a calendar?</summary>
                    <p>The product sends Gmail calendar invites for new or changed next-hearing dates, with updates intended to keep the same case event from becoming a pile of duplicates.</p>
                  </details>
                </div>
              </div>
            </section>
          </section>

          <section className={`page-view${page === "install" ? " active" : ""}`}>
            <div className="install-shell">
              <div className="container">
                <div className="install-hero">
                  <div className="reveal">
                    <span className="install-kicker">
                      <span /> WINDOWS · 60-DAY TRIAL
                    </span>
                    <h1>
                      One line. Then a <em>cleaner court workflow.</em>
                    </h1>
                    <p>
                      Install E-Court Automate directly from Windows PowerShell. No Python, Git, or
                      administrator rights — just install once, open a new terminal, and start
                      monitoring your cases.
                    </p>
                    <div className="install-actions">
                      <a
                        href="#product"
                        className="btn btn-primary"
                        onClick={(e) => {
                          e.preventDefault();
                          go("product");
                        }}
                      >
                        See the product →
                      </a>
                      <a
                        href="#workflow"
                        className="btn btn-ghost"
                        onClick={(e) => {
                          e.preventDefault();
                          go("workflow");
                        }}
                      >
                        See how it works
                      </a>
                    </div>
                    <div className="trial-ribbon">
                      <strong>60-day trial</strong>
                      <span>starts for the Gmail address you configure on first run.</span>
                    </div>
                    <div className="trial-ribbon">
                      <strong className={dlClass}>{dlText} downloads</strong>
                      <span>copied this installer from the site.</span>
                    </div>
                  </div>
                  <div className="terminal-card reveal">
                    <div className="terminal-top">
                      <i /><i /><i />
                      <span>Windows PowerShell</span>
                    </div>
                    <div className="terminal-body">
                      <div className="terminal-label">Install command</div>
                      <div className="install-command">
                        <code>{INSTALL}</code>
                        <button
                          className="copy-command"
                          type="button"
                          data-track-copy="1"
                          onClick={copyInstall}
                        >
                          {copied ? "COPIED ✓" : "COPY"}
                        </button>
                      </div>
                      <div className="terminal-success">
                        <span className="gold-check">↓</span>
                        <div>
                          <b className={dlClass}>{dlText} downloads</b>
                          <span>Live count of people who copied the installer</span>
                        </div>
                      </div>
                      <div className="terminal-success">
                        <span className="gold-check">✓</span>
                        <div>
                          <b>Installed locally</b>
                          <span>%LOCALAPPDATA%\ECourtAutomate</span>
                        </div>
                      </div>
                      <div className="terminal-success">
                        <span className="gold-check">↻</span>
                        <div>
                          <b>Open a new terminal</b>
                          <span>
                            Then use <code>run_ecourt help</code> or the Start Menu shortcut.
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="install-divider">Before first run</div>
                <div className="install-section-head reveal">
                  <span className="page-kicker">Gmail credentials</span>
                  <h2>Gmail App Password, not your login password.</h2>
                  <p>
                    The product uses a Gmail App Password for the trial and email workflow. Keep the
                    same Gmail account you intend to use with E-Court Automate.
                  </p>
                </div>
                <div className="install-grid-2">
                  <article className="install-card g-card reveal">
                    <div className="install-card-icon">G</div>
                    <h3>Prepare your Gmail account</h3>
                    <div className="number-list">
                      <div className="number-item">
                        <div className="n">1</div>
                        <div>
                          <strong>Open Google App Passwords</strong>
                          <span>Visit myaccount.google.com/apppasswords with 2-Step Verification enabled.</span>
                        </div>
                      </div>
                      <div className="number-item">
                        <div className="n">2</div>
                        <div>
                          <strong>Use the same Gmail</strong>
                          <span>Enter the Gmail address you want the application to use for status emails.</span>
                        </div>
                      </div>
                      <div className="number-item">
                        <div className="n">3</div>
                        <div>
                          <strong>Create the App Password</strong>
                          <span>Copy the generated 16-character password. Spaces are acceptable.</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ marginTop: 18 }}>
                      <a
                        className="btn btn-ghost"
                        href="https://myaccount.google.com/apppasswords"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open Google App Passwords ↗
                      </a>
                    </div>
                  </article>
                  <article className="install-card reveal">
                    <div className="install-card-icon">⚖</div>
                    <h3>Then start the E-Court workflow</h3>
                    <p>
                      Once the application is installed, the first-run flow connects the Gmail
                      address, starts the trial and prepares the commands you’ll use every day.
                    </p>
                    <div className="file-path">CNR → case fetch → status email → calendar invite</div>
                    <div className="activation" style={{ marginTop: 17 }}>
                      <h3 style={{ fontSize: "1.3rem" }}>CNR means one thing.</h3>
                      <p>Your case identifier from eCourts — exactly 16 letters or digits.</p>
                    </div>
                  </article>
                </div>

                <div className="install-divider" style={{ marginTop: 72 }}>
                  Everyday use
                </div>
                <div className="install-section-head reveal">
                  <span className="page-kicker">Command desk</span>
                  <h2>The commands your chamber will actually use.</h2>
                  <p>
                    Keep the recurring operations compact: fetch, inspect, schedule, manage calendar
                    sync and keep the installation updated.
                  </p>
                </div>
                <div className="command-table reveal">
                  <div className="command-row2 head">
                    <span>Goal</span>
                    <span>Command</span>
                  </div>
                  {[
                    ["Help", "run_ecourt help"],
                    ["Fetch one case", "run_ecourt YOUR CNR16 CHARS"],
                    ["Fetch all · digest email", "run_ecourt now"],
                    ["Registry / last run", "run_ecourt list · status"],
                    ["Set schedule", "run_ecourt schedule time 19:30"],
                    ["License status", "run_ecourt license status"],
                    ["Update / uninstall", "run_ecourt update · uninstall"],
                    ["Gmail calendar invites", "run_ecourt calendar on · off · status"],
                  ].map(([g, c]) => (
                    <div className="command-row2" key={g}>
                      <span>{g}</span>
                      <code>{c}</code>
                    </div>
                  ))}
                </div>

                <div className="activation reveal">
                  <h3>After 60 days: your cases stay.</h3>
                  <p>
                    Fetching pauses until the license is resumed. The product flow can then be
                    continued through UPI activation or a license key.
                  </p>
                  <div className="activation-grid">
                    <div className="activation-cell">
                      <b>UPI workflow</b>
                      <span>Pay using the ID shown in the app and send the payment screenshot on WhatsApp with your Gmail.</span>
                    </div>
                    <div className="activation-cell">
                      <b>Refresh</b>
                      <span>
                        <code>run_ecourt license refresh</code>
                      </span>
                    </div>
                    <div className="activation-cell">
                      <b>Key activation</b>
                      <span>
                        <code>run_ecourt license activate ECOURT1.…</code>
                      </span>
                    </div>
                    <div className="activation-cell">
                      <b>Support</b>
                      <span>WhatsApp +91 94940 37782</span>
                    </div>
                  </div>
                </div>
                <div className="install-footer-note reveal">
                  <span>Built for Windows · Designed for chambers · Developed by Quantura Technologies</span>
                  <a
                    href="#support"
                    style={{ color: "#d7c580", fontWeight: 850 }}
                    onClick={(e) => {
                      e.preventDefault();
                      go("support");
                    }}
                  >
                    Need help? Open Support →
                  </a>
                </div>
              </div>
            </div>
          </section>

          <section className={`page-view${page === "workflow" ? " active" : ""}`}>
            <div className="workflow-shell">
              <div className="container">
                <div className="workflow-hero">
                  <div className="reveal">
                    <span className="install-kicker">
                      <span /> WORKFLOW · AFTER INSTALL
                    </span>
                    <h1>
                      Three steps to a <em>quiet morning.</em>
                    </h1>
                    <p>
                      Once E-Court Automate is installed, the daily workflow is deliberately simple:
                      connect Gmail, add a CNR, and confirm the scheduled monitoring status.
                    </p>
                    <div className="install-actions">
                      <a
                        href="#install"
                        className="btn btn-primary"
                        onClick={(e) => {
                          e.preventDefault();
                          go("install");
                        }}
                      >
                        Install in one line →
                      </a>
                      <a
                        href="#trial"
                        className="btn btn-ghost"
                        onClick={(e) => {
                          e.preventDefault();
                          go("trial");
                        }}
                      >
                        See the trial
                      </a>
                    </div>
                  </div>
                  <div className="workflow-hero-note reveal">
                    <b>The app does the checking. Your team reviews the result.</b>
                    <p>
                      Routine case monitoring, email delivery and optional daily scheduling keep the
                      manual refresh cycle out of the morning routine.
                    </p>
                    <div className="workflow-command">
                      run_ecourt status&nbsp;&nbsp;·&nbsp;&nbsp;run_ecourt list&nbsp;&nbsp;·&nbsp;&nbsp;run_ecourt license status
                    </div>
                  </div>
                </div>
                <div className="workflow-steps">
                  <article className="workflow-step reveal">
                    <div className="workflow-step-num">01</div>
                    <h3>Gmail</h3>
                    <p>
                      Enter the Gmail address and a 16-character App Password. That establishes the
                      60-day trial for that address.
                    </p>
                    <code>Gmail + App Password</code>
                  </article>
                  <article className="workflow-step reveal">
                    <div className="workflow-step-num">02</div>
                    <h3>Add a CNR</h3>
                    <p>
                      Use the real 16-character CNR. The application fetches the case, prepares the
                      status email and can enable the daily task.
                    </p>
                    <code>run_ecourt APKR180004972024</code>
                  </article>
                  <article className="workflow-step reveal">
                    <div className="workflow-step-num">03</div>
                    <h3>Confirm</h3>
                    <p>
                      Check the registry, status and license state. You should see Trial and the
                      number of days remaining.
                    </p>
                    <code>run_ecourt status · list · license status</code>
                  </article>
                </div>
                <div className="workflow-connector">
                  <span />
                </div>
                <div className="workflow-section-title reveal">
                  <span className="page-kicker">Daily rhythm</span>
                  <h2>What happens after the setup is done.</h2>
                  <p>
                    The workflow moves from scheduled monitoring to a useful status summary, without
                    asking the advocate or chamber staff to repeatedly inspect the portal.
                  </p>
                </div>
                <div className="workflow-diagram reveal">
                  <div className="diagram-box">
                    <strong>Schedule</strong>
                    <span>Optional daily task</span>
                  </div>
                  <div className="diagram-arrow">→</div>
                  <div className="diagram-box">
                    <strong>eCourts</strong>
                    <span>CNR-based lookup</span>
                  </div>
                  <div className="diagram-arrow">→</div>
                  <div className="diagram-box">
                    <strong>Compare</strong>
                    <span>Find what changed</span>
                  </div>
                  <div className="diagram-arrow">→</div>
                  <div className="diagram-box">
                    <strong>Status email</strong>
                    <span>Landscape digest</span>
                  </div>
                  <div className="diagram-arrow">→</div>
                  <div className="diagram-box">
                    <strong>Calendar</strong>
                    <span>Hearing event</span>
                  </div>
                </div>
                <div className="workflow-section-title reveal">
                  <span className="page-kicker">The morning report</span>
                  <h2>A status email designed for a quick scan.</h2>
                  <p>
                    A landscape-style status table so the important matter details are visible
                    together.
                  </p>
                </div>
                <div className="command-table reveal">
                  <div className="command-row2 head">
                    <span>Signal</span>
                    <span>What the workflow reports</span>
                  </div>
                  <div className="command-row2">
                    <span>18 SEP</span>
                    <code>APKR180004972024 · District Court · Civil · Next hearing</code>
                  </div>
                  <div className="command-row2">
                    <span>22 SEP</span>
                    <code>TSHY020008182024 · Magistrate · Criminal · Next hearing</code>
                  </div>
                  <div className="command-row2">
                    <span>CHANGED</span>
                    <code>DLHC010011232025 · High Court · Petition · Status updated</code>
                  </div>
                </div>
                <div className="workflow-section-title reveal">
                  <span className="page-kicker">At a glance</span>
                  <h2>The four things the product is doing for the chamber.</h2>
                </div>
                <div className="workflow-bottom">
                  <div className="workflow-callout reveal">
                    <h3>Less checking.</h3>
                    <p>Routine monitoring moves the repetitive portal-refresh task into an automated process.</p>
                  </div>
                  <div className="workflow-callout reveal">
                    <h3>More context.</h3>
                    <p>The daily digest brings court, parties, next hearing, days left and changes into one readable view.</p>
                  </div>
                  <div className="workflow-callout reveal">
                    <h3>Fewer surprises.</h3>
                    <p>Changes in hearing date or case status become visible as signals rather than discoveries at the last minute.</p>
                  </div>
                  <div className="workflow-callout reveal">
                    <h3>One connected routine.</h3>
                    <p>Email and optional Gmail Calendar synchronization keep the information close to where legal teams already work.</p>
                  </div>
                </div>
                <div className="install-footer-note reveal">
                  <span>Workflow designed for advocates, chambers and legal teams managing active court matters.</span>
                  <a
                    href="#install"
                    style={{ color: "#d7c580", fontWeight: 850 }}
                    onClick={(e) => {
                      e.preventDefault();
                      go("install");
                    }}
                  >
                    Open Install →
                  </a>
                </div>
              </div>
            </div>
          </section>

          <section className={`page-view${page === "trial" ? " active" : ""}`}>
            <div className="trial-shell">
              <div className="container">
                <div className="trial-hero">
                  <div className="reveal">
                    <span className="install-kicker">
                      <span /> WINDOWS · 60-DAY TRIAL
                    </span>
                    <h1>
                      Try the workflow before it becomes <em>your routine.</em>
                    </h1>
                    <p>
                      The first-run experience is designed to be light: enter the Gmail account you
                      will actually use, provide a 16-character App Password, add a CNR and let
                      E-Court Automate begin the monitoring workflow.
                    </p>
                    <div className="trial-points">
                      <div className="trial-point">
                        <span style={{ color: "#e4c36a" }}>✦</span>
                        <span>
                          <b>60 days</b> for the configured Gmail address.
                        </span>
                      </div>
                      <div className="trial-point">
                        <span style={{ color: "#e4c36a" }}>✦</span>
                        <span>
                          <b>Same Gmail, same trial</b> — another PC does not create a fresh trial.
                        </span>
                      </div>
                      <div className="trial-point">
                        <span style={{ color: "#e4c36a" }}>✦</span>
                        <span>
                          <b>Your cases stay</b> after the trial; fetching pauses until you resume.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="trial-divider">What the trial is meant to prove</div>
                <div className="trial-section-head reveal">
                  <span className="page-kicker">The experience</span>
                  <h2>From first run to a useful daily signal.</h2>
                  <p>
                    The real value of the trial is not a countdown. It is seeing whether automated
                    monitoring fits the way your chamber or legal team already works.
                  </p>
                </div>
                <div className="trial-feature-grid">
                  <article className="trial-feature reveal">
                    <div className="trial-icon">✉</div>
                    <h3>Status email</h3>
                    <p>See the landscape-style report with court, parties, next hearing, days left and what changed.</p>
                  </article>
                  <article className="trial-feature reveal">
                    <div className="trial-icon">◈</div>
                    <h3>CNR monitoring</h3>
                    <p>Add real 16-character CNRs and build the list of matters you want the workflow to keep watching.</p>
                  </article>
                  <article className="trial-feature reveal">
                    <div className="trial-icon">⌁</div>
                    <h3>Daily schedule</h3>
                    <p>Optional Windows scheduling can run the monitoring process each morning. Default 06:30.</p>
                  </article>
                </div>
                <div className="trial-section-head reveal" style={{ marginTop: 72 }}>
                  <span className="page-kicker">A simple test</span>
                  <h2>Three things to experience during the trial.</h2>
                </div>
                <div className="trial-steps">
                  <div className="trial-step reveal">
                    <div className="n">01 · CONNECT</div>
                    <strong>Gmail is ready</strong>
                    <span>Use the same Gmail account and App Password you want the product to send through.</span>
                  </div>
                  <div className="trial-step reveal">
                    <div className="n">02 · MONITOR</div>
                    <strong>Add active matters</strong>
                    <span>Run the CNR command and verify the case enters your registry and status workflow.</span>
                  </div>
                  <div className="trial-step reveal">
                    <div className="n">03 · REVIEW</div>
                    <strong>Read the daily digest</strong>
                    <span>Look for upcoming hearings, changes and the information that actually deserves attention.</span>
                  </div>
                  <div className="trial-step reveal">
                    <div className="n">04 · ORGANIZE</div>
                    <strong>Connect Calendar</strong>
                    <span>Turn calendar synchronization on when you want changed hearing dates to reach Gmail Calendar.</span>
                  </div>
                </div>
                <div className="trial-warning reveal">
                  <h3>After 60 days, your cases do not disappear.</h3>
                  <p>
                    Fetching pauses until the license is resumed. The case registry remains while
                    active fetching waits for reactivation.
                  </p>
                  <div className="trial-warning-grid">
                    <div className="trial-warning-cell">
                      <b>UPI activation</b>
                      <span>Pay via the UPI ID shown in the app and send the payment screenshot on WhatsApp with your Gmail.</span>
                    </div>
                    <div className="trial-warning-cell">
                      <b>Resume</b>
                      <span>
                        <code>run_ecourt license refresh</code>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="install-footer-note reveal">
                  <span>Want to see the exact setup? Start with Install, then return here for the trial flow.</span>
                  <a
                    href="#install"
                    style={{ color: "#d7c580", fontWeight: 850 }}
                    onClick={(e) => {
                      e.preventDefault();
                      go("install");
                    }}
                  >
                    Open Install →
                  </a>
                </div>
              </div>
            </div>
          </section>

          <section className={`page-view${page === "support" ? " active" : ""}`}>
            <div className="support-shell">
              <div className="container">
                <div className="support-hero">
                  <div className="reveal">
                    <span className="install-kicker">
                      <span /> SUPPORT · QUANTURA TECHNOLOGIES
                    </span>
                    <h1>
                      When something stalls, <em>we help you move.</em>
                    </h1>
                    <p>
                      Most E-Court Automate issues are simple to resolve: a new terminal, the
                      correct Gmail App Password, a quick reconfiguration, or a direct message to
                      the team.
                    </p>
                    <div className="support-hero-actions">
                      <a className="btn btn-primary" href="https://wa.me/919494037782" target="_blank" rel="noopener noreferrer">
                        WhatsApp Support ↗
                      </a>
                      <a
                        className="btn btn-ghost"
                        href="#install"
                        onClick={(e) => {
                          e.preventDefault();
                          go("install");
                        }}
                      >
                        Review Install
                      </a>
                    </div>
                  </div>
                  <div className="support-orbit reveal">
                    <div className="ring r3" />
                    <div className="ring r1" />
                    <div className="ring r2" />
                    <div className="node n1" />
                    <div className="node n2" />
                    <div className="node n3" />
                    <div className="node n4" />
                    <div className="support-seal">⚖</div>
                    <div className="support-floating-label l1">
                      <b>COMMAND</b>New terminal
                    </div>
                    <div className="support-floating-label l2">
                      <b>EMAIL</b>Check Spam
                    </div>
                    <div className="support-floating-label l3">
                      <b>CONFIG</b>reconfigure
                    </div>
                    <div className="support-floating-label l4">
                      <b>DIRECT</b>WhatsApp
                    </div>
                  </div>
                </div>
                <div className="support-divider">If something stalls</div>
                <div className="support-grid">
                  <article className="support-card reveal">
                    <div className="support-icon">⌘</div>
                    <h3>Command not found</h3>
                    <p>Open a new terminal, or use Start Menu → E-Court Automate. A fresh terminal picks up the installed command path.</p>
                    <div className="support-contact">
                      <strong>First move</strong>
                      <br />
                      Close the old terminal → open a new one.
                    </div>
                  </article>
                  <article className="support-card reveal">
                    <div className="support-icon">✉</div>
                    <h3>Email missing</h3>
                    <p>Use a Gmail App Password rather than your normal login password. Then check Spam before reconfiguring.</p>
                    <div className="support-contact">
                      <strong>Command</strong>
                      <br />
                      <code>run_ecourt reconfigure</code>
                    </div>
                  </article>
                  <article className="support-card reveal">
                    <div className="support-icon">◉</div>
                    <h3>Talk to us</h3>
                    <p>Send the team a WhatsApp message with the Gmail address used by your E-Court Automate installation.</p>
                    <div className="support-contact">
                      <strong>WhatsApp</strong>
                      <br />
                      +91 94940 37782
                    </div>
                    <a className="btn btn-primary" href="https://wa.me/919494037782" target="_blank" rel="noopener noreferrer">
                      Open WhatsApp →
                    </a>
                  </article>
                </div>
                <div className="support-divider" style={{ marginTop: 70 }}>
                  Quick answers
                </div>
                <div className="support-faq">
                  <div className="support-panel reveal">
                    <span className="page-kicker">Support desk</span>
                    <h2>Keep the fix simple.</h2>
                    <p>
                      The first support step should usually be the smallest one: restart the
                      terminal, verify the App Password, or run the relevant status/reconfigure
                      command.
                    </p>
                    <div className="support-contact" style={{ marginTop: 19 }}>
                      <strong>Company</strong>
                      <br />
                      Quantura Technologies
                    </div>
                    <div className="support-contact">
                      <strong>Phone / WhatsApp</strong>
                      <br />
                      +91 94940 37782
                    </div>
                    <div style={{ marginTop: 16 }}>
                      <a className="btn btn-ghost" href="https://www.quanturatech.com" target="_blank" rel="noopener noreferrer">
                        Visit Quantura ↗
                      </a>
                    </div>
                  </div>
                  <div className="support-panel support-faq-list reveal">
                    <details open>
                      <summary>Where does E-Court Automate live after installation?</summary>
                      <p>
                        Files land in <code>%LOCALAPPDATA%\ECourtAutomate</code>.
                      </p>
                    </details>
                    <details>
                      <summary>What should I do when a command is not recognized?</summary>
                      <p>Open a new terminal, or start E-Court Automate from the Windows Start Menu.</p>
                    </details>
                    <details>
                      <summary>What password should be used for Gmail?</summary>
                      <p>Use the Gmail App Password generated with 2-Step Verification, not your regular Google login password.</p>
                    </details>
                    <details>
                      <summary>How do I turn calendar synchronization off?</summary>
                      <p>
                        Run <code>run_ecourt calendar off</code>. Use{" "}
                        <code>run_ecourt calendar status</code> to check the setting.
                      </p>
                    </details>
                    <details>
                      <summary>How do I uninstall?</summary>
                      <p>
                        Use <code>run_ecourt uninstall</code> or{" "}
                        <code>{UNINSTALL}</code>
                      </p>
                    </details>
                  </div>
                </div>
                <div className="support-final reveal">
                  <h2>Still stuck? Go straight to the source.</h2>
                  <p>
                    Quantura Technologies provides the E-Court Automate support channel. Send your
                    Gmail address with the issue so the team can identify the installation context
                    quickly.
                  </p>
                  <div className="support-final-actions">
                    <a className="btn btn-primary" href="https://wa.me/919494037782" target="_blank" rel="noopener noreferrer">
                      Message +91 94940 37782 ↗
                    </a>
                    <a className="btn btn-ghost" href="https://www.quanturatech.com" target="_blank" rel="noopener noreferrer">
                      Quantura Technologies ↗
                    </a>
                  </div>
                </div>
                <div className="install-footer-note reveal">
                  <span>Developed by Quantura Technologies · E-Court Automate</span>
                  <a
                    href="#product"
                    style={{ color: "#d7c580", fontWeight: 850 }}
                    onClick={(e) => {
                      e.preventDefault();
                      go("product");
                    }}
                  >
                    Back to Product →
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer id="contact">
        <div className="container">
          <div className="footer-grid">
            <div>
              <div className="brand" style={{ marginBottom: 12 }}>
                <span className="brand-mark">⚖</span>
                <span className="brand-text">
                  <span>E-Court Automate</span>
                  <small>BY QUANTURA TECHNOLOGIES</small>
                </span>
              </div>
              <p className="footer-text">
                A legal-tech workflow for automated court-case monitoring, change detection and
                hearing organization.
              </p>
            </div>
            <div>
              <div className="footer-title">Contact</div>
              <div className="footer-links">
                <a href="https://wa.me/919494037782" target="_blank" rel="noopener noreferrer">
                  WhatsApp: +91 94940 37782
                </a>
                <a href="https://www.quanturatech.com" target="_blank" rel="noopener noreferrer">
                  Quantura Technologies ↗
                </a>
              </div>
            </div>
            <div>
              <div className="footer-title">Explore</div>
              <div className="footer-links">
                <a href="#use-cases" onClick={() => go("product")}>
                  Use cases
                </a>
                <a
                  href="#workflow"
                  onClick={(e) => {
                    e.preventDefault();
                    go("workflow");
                  }}
                >
                  Workflow
                </a>
                <a
                  href="#install"
                  onClick={(e) => {
                    e.preventDefault();
                    go("install");
                  }}
                >
                  Install
                </a>
                <a href="#demo" onClick={() => go("product")}>
                  CNR demo
                </a>
              </div>
            </div>
          </div>
          <div className="copyright">
            <span>
              © {year} Quantura Technologies · {viewsShown.toLocaleString("en-IN")} page views
            </span>
            <span>Windows · 60-day trial · +91 94940 37782</span>
          </div>
        </div>
      </footer>
    </>
  );
}
