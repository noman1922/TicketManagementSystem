import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* LEFT */}
        <div className="footer-brand">
          <h2>🎟 Ticket Broker</h2>
          <p>
            Ticket Broker is owned and operated by <br />
            <strong>Adventor Global Limited</strong>
          </p>
          <p className="license">
            TRADE LICENSE: TRAD/DNCC/141845/2022
          </p>

          <div className="socials">
            <span>Follow Us</span>
            <div className="icons">
              <a href="#">🌐</a>
              <a href="#">📘</a>
              <a href="#">📸</a>
              <a href="#">🐦</a>
            </div>
          </div>
        </div>

        {/* MIDDLE */}
        <div className="footer-links">
          <h4>More Info</h4>
          <ul>
            <li>Contact Us</li>
            <li>FAQ</li>
            <li>Legals</li>
            <li>Terms & Conditions</li>
            <li>Privacy Policy</li>
            <li>Refund Policy</li>
          </ul>
        </div>

        {/* RIGHT */}
        <div className="footer-contact">
          <h4>Contacts</h4>
          <p>
            House 6, Road 16, Block D <br />
            Mirpur 6, Dhaka 1216
          </p>
          <p>📞 +88 01400019228</p>
          <p>✉️ mdnomanahamed22@gmail.com</p>
        </div>
      </div>

      <div className="footer-bottom">
        © {new Date().getFullYear()} Ticket Broker. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
