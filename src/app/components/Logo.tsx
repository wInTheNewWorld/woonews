export function Logo({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size * 4.6}
      height={size}
      viewBox="0 0 110 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      <text
        x="0" y="20"
        fontFamily="'Arial Black', 'Impact', 'Haettenschweiler', sans-serif"
        fontWeight="900"
        fontSize="22"
        fill="#E8A800"
        letterSpacing="-0.5"
      >Woo</text>
      <text
        x="57" y="20"
        fontFamily="'Arial Black', 'Impact', 'Haettenschweiler', sans-serif"
        fontWeight="900"
        fontSize="22"
        fill="#1a1a1a"
        letterSpacing="-0.5"
      >News</text>
    </svg>
  );
}
