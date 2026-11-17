import Editable from '../components/Editable';
const plans = [['Standard', '$15', 'One clean, high-impact thumbnail.'], ['Pro', '$30', 'Detailed compositing and custom effects.'], ['Channel pack', '$120', 'Consistent look across 10 thumbnails.']];
export default function Home() {
  return (<>
    <section className="hero wrap" id="home">
      <Editable as="h1" k="hero_title" def="Thumbnails people can’t scroll past." />
      <Editable as="p" k="hero_text" def="Custom YouTube thumbnails designed by the owner of FLEET CREATES." />
      <a className="btn red" href="/orders">Start your order</a>
    </section>
    <section className="wrap" id="portfolio"><h2>Portfolio</h2>
      <div className="grid">{[1, 2, 3].map((i) => <img key={i} src={`/portfolio/${i}.jpg`} alt={`Thumbnail ${i}`} />)}</div></section>
    <section className="wrap" id="services"><h2>Services</h2>
      <div className="grid">{plans.map(([n, pr, d], i) => (<div className="card" key={n}>
        <Editable as="h3" k={`plan${i}_name`} def={n} /><Editable as="p" k={`plan${i}_desc`} def={d} />
        <Editable as="p" k={`plan${i}_price`} def={pr} /></div>))}</div></section>
    <section className="wrap" id="about"><h2>About</h2>
      <Editable as="p" k="about_text" def="Write your story here. Click Edit site to change this text." /></section>
    <section className="wrap" id="contact"><h2>Contact</h2>
      <Editable as="p" k="contact_text" def="Add your Discord or other contact here." /></section>
    <footer className="wrap">© 2026 FLEET CREATES</footer>
  </>);
}
