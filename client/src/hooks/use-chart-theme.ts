// Returns computed chart theme colors from CSS variables
// Usage: const { gridColor, textColor } = useChartTheme();

import { useState, useEffect } from "react";

export function useChartTheme() {
  const [colors, setColors] = useState({
    gridColor: "hsl(220 10% 18%)",
    textColor: "hsl(215 15% 55%)",
  });

  useEffect(() => {
    const update = () => {
      const style = getComputedStyle(document.documentElement);
      const grid = style.getPropertyValue("--chart-grid").trim();
      const text = style.getPropertyValue("--chart-text").trim();
      setColors({
        gridColor: grid ? `hsl(${grid})` : "hsl(220 10% 18%)",
        textColor: text ? `hsl(${text})` : "hsl(215 15% 55%)",
      });
    };

    update();

    // Watch for class changes on html element (dark mode toggle)
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return colors;
}
