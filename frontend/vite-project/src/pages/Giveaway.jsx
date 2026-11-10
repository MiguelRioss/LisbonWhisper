import { Link } from 'react-router-dom';
import logo from '../res/logo.png';
import './Giveaway.css';

const causes = [
  { name: 'Ginjinha', purpose: 'Um teto para quem vive na rua', symbol: '01', tone: 'warm' },
  { name: 'Sousa Martins', purpose: 'Saúde para os mais pequenos', symbol: '02', tone: 'blue' },
  { name: 'Amália · Fado', purpose: 'Companhia para os avós', symbol: '03', tone: 'coral' },
];

const steps = [
  'Segue a nossa página',
  'Gosta deste post',
  'Identifica 2 amigos',
];

export function GiveawayHighlight() {
  return (
    <section className="giveaway-highlight" aria-labelledby="giveaway-highlight-title">
      <div>
        <span className="giveaway-eyebrow">Sorteio · Lisbon Whisper</span>
        <h2 id="giveaway-highlight-title">Ganha um tour por Lisboa para 4 pessoas</h2>
        <p>Uma aventura pela Mouraria e Graça, com sabores locais e uma causa para apoiar.</p>
        <Link className="giveaway-link" to="/sorteio">Descobre o sorteio <span aria-hidden="true">→</span></Link>
      </div>
      <img src={logo} alt="" aria-hidden="true" />
    </section>
  );
}

export default function Giveaway() {
  return (
    <div className="giveaway-page">
      <div className="giveaway-shell">
        <div className="giveaway-header">
          <span className="giveaway-eyebrow">Lisbon Whisper · Sorteio</span>
          <h1>Ganha um tour por Lisboa <em>para 4 pessoas!</em></h1>
          <p>Percurso gamificado pela Mouraria e Graça até Santa Luzia, com ginjinha e pastel de nata pelo caminho.</p>
        </div>

        <section className="giveaway-section" aria-labelledby="giveaway-causes-title">
          <h2 id="giveaway-causes-title">Cada pessoa leva uma moeda que apoia uma causa</h2>
          <div className="giveaway-causes">
            {causes.map((cause) => (
              <div className={`giveaway-cause giveaway-cause--${cause.tone}`} key={cause.name}>
                <span className="giveaway-coin" aria-hidden="true">{cause.symbol}</span>
                <h3>{cause.name}</h3>
                <p>{cause.purpose}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="giveaway-section" aria-labelledby="giveaway-steps-title">
          <h2 id="giveaway-steps-title">Como participar</h2>
          <ol className="giveaway-steps">
            {steps.map((step, index) => <li key={step}><span>{index + 1}</span>{step}</li>)}
          </ol>
          <p className="giveaway-date">Vencedor anunciado a <strong>10 de dezembro</strong>.</p>
        </section>
      </div>
    </div>
  );
}
