import CopyCommand from "@/components/CopyCommand";

const INSTALL = "irm https://ecourt.quanturatech.com/install.ps1 | iex";
const UNINSTALL = "irm https://ecourt.quanturatech.com/uninstall.ps1 | iex";

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <video autoPlay muted loop playsInline poster="/logo-glow.png">
          <source src="/brand.mp4" type="video/mp4" />
        </video>
        <div className="wrap hero-inner">
          <img className="hero-logo" src="/logo.png" alt="E-Court Automate" />
          <div className="badge">WINDOWS · 15-DAY TRIAL</div>
          <h1>Court dates change. You should not refresh the portal every morning.</h1>
          <p className="lead">
            Look up Indian eCourts cases by CNR. Captcha is handled. A landscape status email
            lands in your inbox — next hearing, stage, and what changed.
          </p>
          <div className="hero-actions">
            <a className="btn btn-gold" href="#install">
              Install in one line
            </a>
            <a className="btn btn-ghost" href="#product">
              See how it works
            </a>
          </div>
        </div>
      </section>

      <main className="wrap">
        <section className="section" id="product">
          <p className="kicker">The product</p>
          <h2>Built for chambers, not for developers</h2>
          <p className="sub">
            No Python, Git, or administrator rights. One PowerShell command. A Start Menu shortcut.
            Daily checks while you work.
          </p>
          <div className="grid-4">
            <article className="card">
              <div className="icon">01</div>
              <strong>CNR lookup</strong>
              <p>Fetches the case from eCourts using the 16-character CNR.</p>
            </article>
            <article className="card">
              <div className="icon">02</div>
              <strong>Captcha handled</strong>
              <p>Solves the portal captcha so you are not typing it at 6:30 AM.</p>
            </article>
            <article className="card">
              <div className="icon">03</div>
              <strong>Status email</strong>
              <p>Landscape table: court, parties, next hearing, days left, changes.</p>
            </article>
            <article className="card">
              <div className="icon">04</div>
              <strong>Daily schedule</strong>
              <p>Optional Windows task runs every morning. Default 06:30.</p>
            </article>
          </div>
        </section>

        <section className="section" id="workflow">
          <p className="kicker">Workflow</p>
          <h2>Three steps after install</h2>
          <div className="grid-3">
            <article className="card step">
              <em>01</em>
              <strong>Gmail</strong>
              <p>
                Enter Gmail and a 16-character App Password. That starts the 15-day trial for this
                address. Same Gmail on another PC does not get a new trial.
              </p>
            </article>
            <article className="card step">
              <em>02</em>
              <strong>Add a CNR</strong>
              <p>
                <code>run_ecourt APKR180004972024</code> — use your real 16-character code. The app
                fetches, emails, and can turn on the daily task.
              </p>
            </article>
            <article className="card step">
              <em>03</em>
              <strong>Confirm</strong>
              <p>
                <code>run_ecourt status</code> · <code>list</code> · <code>license status</code>{" "}
                should show Trial and days left.
              </p>
            </article>
          </div>
        </section>

        <section className="section" id="install">
          <div className="two">
            <div>
              <p className="kicker">Install</p>
              <h2>One line. Then a new terminal.</h2>
              <p className="sub">
                Open Windows PowerShell, paste, wait for version 1.0.0. Close the window. Open a
                new one — or Start Menu → E-Court Automate.
              </p>
              <CopyCommand text={INSTALL} />
              <p className="sub">
                Lives in <code>%LOCALAPPDATA%\ECourtAutomate</code>. Updates keep your cases and
                Gmail: <code>run_ecourt update</code>
              </p>
            </div>
            <img className="poster" src="/logo-glow.png" alt="E-Court Automate mark" />
          </div>
        </section>

        <section className="section">
          <p className="kicker">Before first run</p>
          <h2>Gmail App Password, not your login password</h2>
          <div className="panel">
            <ol>
              <li>
                Open{" "}
                <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer">
                  myaccount.google.com/apppasswords
                </a>{" "}
                with 2-Step Verification on.
              </li>
              <li>Use the same Gmail you will enter in the app.</li>
              <li>Create an app password. Copy 16 characters. Spaces are fine.</li>
            </ol>
            <p className="sub">CNR is exactly 16 letters/digits from eCourts.</p>
          </div>
        </section>

        <section className="section">
          <p className="kicker">Commands</p>
          <h2>Everyday use</h2>
          <div className="panel">
            <table className="pro">
              <thead>
                <tr>
                  <th>Goal</th>
                  <th>Command</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Fetch one case</td>
                  <td>
                    <code>run_ecourt YOURCNR16CHARS</code>
                  </td>
                </tr>
                <tr>
                  <td>Fetch all (digest email)</td>
                  <td>
                    <code>run_ecourt now</code>
                  </td>
                </tr>
                <tr>
                  <td>Registry / last run</td>
                  <td>
                    <code>run_ecourt list</code> · <code>status</code>
                  </td>
                </tr>
                <tr>
                  <td>Daily job</td>
                  <td>
                    <code>run_ecourt schedule on</code> · <code>time 07:00</code>
                  </td>
                </tr>
                <tr>
                  <td>Trial days</td>
                  <td>
                    <code>run_ecourt license status</code>
                  </td>
                </tr>
                <tr>
                  <td>Update / uninstall</td>
                  <td>
                    <code>run_ecourt update</code> · <code>uninstall</code>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="section" id="trial">
          <div className="panel cta">
            <p className="kicker">After 15 days</p>
            <h2>Your cases stay. Fetching pauses until you resume.</h2>
            <p className="sub" style={{ margin: "0 auto 18px" }}>
              Pay via UPI (the ID shown in the app). Send the payment screenshot on WhatsApp to{" "}
              <a href="https://wa.me/919494037782">+91 94940 37782</a> with your Gmail. Then{" "}
              <code>run_ecourt license refresh</code>.
            </p>
            <p>
              Or activate a key: <code>run_ecourt license activate ECOURT1.…</code>
            </p>
          </div>
        </section>

        <section className="section" id="support">
          <p className="kicker">Support</p>
          <h2>If something stalls</h2>
          <div className="grid-3">
            <article className="card">
              <strong>Command not found</strong>
              <p>Open a new terminal, or Start Menu → E-Court Automate.</p>
            </article>
            <article className="card">
              <strong>Email missing</strong>
              <p>App Password, not login password. Check Spam. run_ecourt reconfigure.</p>
            </article>
            <article className="card">
              <strong>Talk to us</strong>
              <p>
                WhatsApp <a href="https://wa.me/919494037782">+91 94940 37782</a> with your Gmail.
              </p>
            </article>
          </div>
          <p className="sub">
            Uninstall: <code>run_ecourt uninstall</code> or
          </p>
          <CopyCommand text={UNINSTALL} />
        </section>
      </main>
    </>
  );
}
