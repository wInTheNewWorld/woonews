export function Logo({ size = 26 }: { size?: number }) {
  return (
    <svg
      width={size * 4}
      height={size}
      viewBox="0 0 104 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      <text
        x="0" y="21"
        fontFamily="'Arial Black', 'Impact', sans-serif"
        fontWeight="900"
        fontSize="24"
        fill="#F5B820"
        fontStyle="italic"
        letterSpacing="-1"
      >Woo</text>
      <text
        x="52" y="21"
        fontFamily="'Arial Black', 'Impact', sans-serif"
        fontWeight="900"
        fontSize="24"
        fill="#1a1a1a"
        fontStyle="italic"
        letterSpacing="-1"
      >News</text>
    </svg>
  );
}
