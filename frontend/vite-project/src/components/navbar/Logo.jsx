export default function Logo({ logo }) {
  return (
    <div className="flex flex-shrink-0 flex-col items-center">
      <img
        alt="Your Company"
        src={logo}
        className="h-8 w-auto"
        style={{ filter: 'invert(1)' }} // Optional: Makes the logo white
      />
      <span className="text-gray-300 text-sm">Lisbon Whisper</span>
    </div>
  );
}
