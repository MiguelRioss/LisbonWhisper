export default function Logo({ logo }) {
  return (
    <div className="flex flex-shrink-0 flex-col items-center">
      <img
        alt="Lisbon Whisper"
        src={logo}
        className="h-16 w-16 object-contain"
      />
      <span className="site-logo-label text-sm">Lisbon Whisper</span>
    </div>
  );
}
