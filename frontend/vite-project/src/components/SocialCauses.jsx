import { Link } from 'react-router-dom';
import CoinExpansionGrid from './CoinExpansionGrid';
import logo from '../res/logo.png';
import '../pages/Giveaway.css';

export const causes = [
  {
    name: 'Ginjinha',
    purpose: 'Support for people experiencing homelessness',
    purposePt: 'Um teto para quem vive na rua',
    symbol: '01',
    tone: 'warm',
    supportDetails: 'The Ginjinha coin represents support for people experiencing homelessness and for the Mouraria community. The cause promotes solidarity and social inclusion in the neighbourhood.',
  },
  {
    name: 'Sousa Martins',
    purpose: 'Children’s health and wellbeing',
    purposePt: 'Saúde para os mais pequenos',
    symbol: '02',
    tone: 'blue',
    coinStory: 'This coin is inspired by Dr. Sousa Martins and his legacy of caring for others.',
    supportDetails: 'Choosing this coin directs part of your ticket price towards a cause focused on children’s health.',
  },
  {
    name: 'Amália · Fado',
    purpose: 'Support for older residents and Lisbon’s fado heritage',
    purposePt: 'Companhia para os avós',
    symbol: '03',
    tone: 'coral',
    supportDetails: 'The Amália coin represents support for older people in Lisbon’s historic neighbourhoods and the preservation of the memories and cultural heritage tied to fado.',
  },
];

export default function SocialCauses({ standalone = false, items = causes }) {
  const Heading = standalone ? 'h1' : 'h2';
  const coins = items.map(({ name, tone, purpose, coinStory, supportDetails }) => ({
    id: name,
    name,
    subtitle: purpose,
    artwork: <span className={`social-cause-artwork social-cause-artwork--${tone}`} />,
    details: (
      <>
        {coinStory && <p><strong>About the coin</strong><br />{coinStory}</p>}
        {supportDetails && <p><strong>The cause</strong><br />{supportDetails}</p>}
        {!coinStory && !supportDetails && <p>More about this coin and its cause coming soon.</p>}
      </>
    ),
  }));

  return (
    <section className="social-causes" lang="en" aria-labelledby="social-causes-title">
      <div className="social-causes-inner">
        <div className="social-causes-summary">
          {standalone ? (
            <div className="social-causes-heading">
              <img src={logo} alt="Lisbon Whisper" width="72" height="72" />
              <Heading id="social-causes-title" aria-label="Social Causes">
                {['Social', 'Causes'].map((word, wordIndex) => (
                  <span key={word} className="social-causes-title-word" aria-hidden="true">
                    {Array.from(word, (letter, index) => (
                      <span key={index} style={{ '--letter-delay': `${(wordIndex * 6 + index) * 42}ms` }}>{letter}</span>
                    ))}
                  </span>
                ))}
              </Heading>
            </div>
          ) : <Heading id="social-causes-title">Social Causes</Heading>}
          <p className="social-causes-intro"><strong>Three coins. Three causes. One city.</strong></p>
          <p className="social-causes-hint">Explore Lisbon like a local. Leave it a little better.</p>
          {standalone && (
            <div className="social-causes-copy">
              <p>Discover Lisbon on one of our walking tours, take on interactive challenges and choose a local cause to support. At the end, you’ll take home a 3D-printed collectible coin representing your chosen cause. Part of your ticket price goes towards that cause.</p>
              <p>Choose a coin to learn about the people and neighbourhoods it represents.</p>
            </div>
          )}
        </div>
        <CoinExpansionGrid items={coins} interactive={standalone} />
        {standalone && (
          <div className="social-causes-copy social-causes-impact">
            <p>Each coin has a QR code linked to its certificate and information about its impact. In the future, we plan to let you follow the progress of the causes you support on this website.</p>
          </div>
        )}
        {!standalone && (
          <Link className="social-causes-link" to="/social-causes">
            Explore the causes <span aria-hidden="true">→</span>
          </Link>
        )}
      </div>
    </section>
  );
}
