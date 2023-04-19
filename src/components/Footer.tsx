export default function Footer() {
  const rLogoPath = '/img/layout/Reddit.png';
  const dLogoPath = '/img/layout/Discord.png';
  const gLogoPath = '/img/layout/GitHub.png';

  return (
    <footer>
      <div className="footerGrid">
        <div className="logoElementGridF">
          <img className="imageLogo" src="" alt="" />
        </div>

        <nav className="menuElementGridF">
          <div className="menuButtonElementGridF">Home</div>
          <div className="menuButtonElementGridF">About us</div>
          <div className="menuButtonElementGridF">Terms of Use</div>
          <div className="menuButtonElementGridF">Rules</div>
        </nav>

        <nav className="iconElements">
          <img
            className="iconButtonElementGridRedditF"
            src={rLogoPath}
            alt="Reddit Logo"
          />
          <img
            className="iconButtonElementGridDiscordF"
            src={dLogoPath}
            alt="Discord Logo"
          />
          <img
            className="iconButtonElementGridGhF"
            src={gLogoPath}
            alt="GitHub Logo"
          />
        </nav>

        <div className="horizontalLine"> </div>

        <p className="copyrightElement">
          {' '}
          Advance Wars is (c) 1990-2001 Nintendo and (c) 2001 Intelligent
          Systems. All images are copyright their respective owners.
        </p>
      </div>
    </footer>
  );
}
