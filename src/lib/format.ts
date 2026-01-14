export const formatDateTimeBR = (iso: string | Date) => {
  const d = typeof iso === "string" ? new Date(iso) : iso;

  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();

  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");

  return { date: `${dd}/${mm}/${yyyy}`, time: `${hh}:${min}` };
};
