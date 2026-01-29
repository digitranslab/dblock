// Gray color for all inputs - type compatibility is still enforced during connection validation
const INPUT_GRAY_COLOR = "#9CA3AF"; // Tailwind gray-400

export function getNodeInputColors(
  _input_types: string[] | undefined,
  _type: string | undefined,
  _types: { [char: string]: string },
) {
  // Return gray for all inputs - visual simplification
  // Type compatibility is still enforced during edge connection validation
  return [INPUT_GRAY_COLOR];
}
