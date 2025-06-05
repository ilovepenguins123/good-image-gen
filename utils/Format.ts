function formatNetWorth(networth?: number): string {
    if (!networth) return "N/A";
    if (networth >= 1000000000000) return (networth/1000000000000).toFixed(1) + 't';
    if (networth >= 1000000000) return (networth/1000000000).toFixed(1) + 'b';
    if (networth >= 1000000) return (networth/1000000).toFixed(1) + 'm';
    if (networth >= 1000) return (networth/1000).toFixed(1) + 'k';
    return networth.toFixed(2);
  }
  
  function getFKDRColor(fkdr?: number): string {
    if (!fkdr) return '#FF6B6B';
    if (fkdr > 10) return '#7FDBFF';
    if (fkdr > 2) return '#90EE90';
    return '#FF6B6B';
  }
  function formatNumber(number: number): string {
    return number.toLocaleString();
  }
  function formatPlayerName(rank: any, ign: string, pluses: number): string {
    if (!rank?.rank || rank.rank.toLowerCase() === "none") {
      return `<color=${rank?.color}>${ign}</color>`;
    }

    if (rank.rank === "YOUTUBE") {
       return `<color=${rank.color}>[</color><color=white>${rank.rank}</color> <color=${rank.color}>] ${ign}</color>`.replace(" ]", "]");
    }

    return `<color=${rank.color}>[${rank.rank.replace("+", "")}</color><color=${rank.plusColor}>${"+".repeat(Math.max(0, pluses))}</color><color=${rank.color}>] ${ign}</color>`.replace(" ]", "]");
  }
  export { formatNetWorth, getFKDRColor, formatPlayerName, formatNumber };