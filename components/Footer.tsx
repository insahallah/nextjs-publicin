import Link from 'next/link';

const Footer = () => {
  return (
    <footer>
      <div className="container margin_60_35">
        <div className="row">
          <div className="col-lg-3 col-md-12">
            <p>
              <Link href="/" title="Publicin">
                <img 
                  src="/img/logo.png" 
                  data-retina="true" 
                  alt="Publicin Logo" 
                  width="163" 
                  height="36" 
                  className="img-fluid"
                />
              </Link>
            </p>
          </div>
          <div className="col-lg-3 col-md-4">
            <h5>About</h5>
            <ul className="links">
              <li><Link href="/about">About us</Link></li>
              <li><Link href="/blog">Blog</Link></li>
              <li><Link href="/faq">FAQ</Link></li>
              <li><Link href="/login">Login</Link></li>
              <li><Link href="/register">Register</Link></li>
            </ul>
          </div>
          <div className="col-lg-3 col-md-4">
            <h5>Useful links</h5>
            <ul className="links">
              <li><Link href="/doctors">Doctors</Link></li>
              <li><Link href="/clinics">Clinics</Link></li>
              <li><Link href="/specialization">Specialization</Link></li>
              <li><Link href="/join-doctor">Join as a Doctor</Link></li>
              <li><Link href="/download-app">Download App</Link></li>
            </ul>
          </div>
          <div className="col-lg-3 col-md-4">
            <h5>Contact with Us</h5>
            <ul className="contacts">
              <li>
                <a href="tel:+61280932400">
                  <i className="icon_mobile"></i> + 61 23 8093 3400
                </a>
              </li>
              <li>
                <a href="mailto:help@publicin.com">
                  <i className="icon_mail_alt"></i> help@publicin.com
                </a>
              </li>
            </ul>
            <div className="follow_us">
              <h5>Follow us</h5>
              <ul>
                <li>
                  <a href="#0" aria-label="Facebook">
                    <i className="social_facebook"></i>
                  </a>
                </li>
                <li>
                  <a href="#0" aria-label="Twitter">
                    <i className="social_twitter"></i>
                  </a>
                </li>
                <li>
                  <a href="#0" aria-label="LinkedIn">
                    <i className="social_linkedin"></i>
                  </a>
                </li>
                <li>
                  <a href="#0" aria-label="Instagram">
                    <i className="social_instagram"></i>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        {/* /row */}
        <hr />
        <div className="row">
          <div className="col-md-8">
            <ul id="additional_links">
              <li><Link href="/terms">Terms and conditions</Link></li>
              <li><Link href="/privacy">Privacy</Link></li>
            </ul>
          </div>
          <div className="col-md-4">
            <div id="copy">© {new Date().getFullYear()} Publicin</div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;