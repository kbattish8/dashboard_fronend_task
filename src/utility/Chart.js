import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Tooltip,
  Legend,
} from "chart.js";


Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend
);

let chartInstance = null;

export const initializeChart = (canvas, type, data, options) => {
  if (chartInstance) {
    chartInstance.destroy(); 
  }
  chartInstance = new Chart(canvas, {
    type,
    data,
    options,
  });
};

export const destroyChart = () => {
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
};
