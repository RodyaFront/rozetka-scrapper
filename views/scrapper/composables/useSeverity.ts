export function useSeverity() {
  const getSeverity = (percent: number | null) => {
    if (!percent) return undefined;

    if (percent >= 0 && percent <= 30) return "success";
    if (percent > 30 && percent <= 70) return "warn";
    if (percent > 70) return "danger";

    return undefined;
  };

  return { getSeverity };
}
