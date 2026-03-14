import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

export function initCharts() {
  Chart.defaults.color = '#888';
  Chart.defaults.borderColor = 'rgba(0, 0, 0, 0.06)';
  Chart.defaults.font.family = "'Inter', sans-serif";

  createPostureChart();
  createFatigueChart();
  createActivityChart();
  createPostureTypesChart();
}

function createPostureChart() {
  const ctx = document.getElementById('chart-posture');
  if (!ctx) return;

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: 'Posture Score',
        data: [72, 78, 65, 82, 88, 74, 85],
        borderColor: '#3b82f6', // Bright Blue
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#fff',
          titleColor: '#1a1a1a',
          bodyColor: '#4a4a4a',
          borderColor: '#e8e5e0',
          borderWidth: 1,
          titleFont: { family: "'Outfit', sans-serif", weight: 600 },
          padding: 10,
          cornerRadius: 8,
          callbacks: { label: (ctx) => `Score: ${ctx.parsed.y}/100` }
        }
      },
      scales: {
        y: { min: 0, max: 100, grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { stepSize: 25 } },
        x: { grid: { display: false } }
      },
      interaction: { intersect: false, mode: 'index' }
    }
  });
}

function createFatigueChart() {
  const ctx = document.getElementById('chart-fatigue');
  if (!ctx) return;

  const levels = [15, 22, 35, 55, 30, 45, 62, 78, 50];

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM'],
      datasets: [{
        label: 'Fatigue %',
        data: levels,
        backgroundColor: levels.map(v =>
          v > 60 ? 'rgba(239, 68, 68, 0.8)' : // Red
          v > 40 ? 'rgba(245, 158, 11, 0.8)' : // Amber
          'rgba(16, 185, 129, 0.8)' // Green
        ),
        borderColor: levels.map(v =>
          v > 60 ? '#ef4444' : v > 40 ? '#f59e0b' : '#10b981'
        ),
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#fff', titleColor: '#1a1a1a', bodyColor: '#4a4a4a',
          borderColor: '#e8e5e0', borderWidth: 1, padding: 10, cornerRadius: 8,
          callbacks: { label: (ctx) => `Fatigue: ${ctx.parsed.y}%` }
        }
      },
      scales: {
        y: { min: 0, max: 100, grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { stepSize: 25 } },
        x: { grid: { display: false } }
      }
    }
  });
}

function createActivityChart() {
  const ctx = document.getElementById('chart-activity');
  if (!ctx) return;

  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Sitting', 'Standing', 'Walking', 'Stretching'],
      datasets: [{
        data: [55, 20, 15, 10],
        backgroundColor: [
          '#3b82f6', // Blue
          '#8b5cf6', // Purple
          '#10b981', // Emerald
          '#f59e0b', // Amber
        ],
        borderColor: '#fff',
        borderWidth: 2,
        hoverOffset: 8,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: true, cutout: '65%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { padding: 14, usePointStyle: true, pointStyle: 'circle', font: { size: 11 } }
        },
        tooltip: {
          backgroundColor: '#fff', titleColor: '#1a1a1a', bodyColor: '#4a4a4a',
          borderColor: '#e8e5e0', borderWidth: 1, padding: 10, cornerRadius: 8,
          callbacks: { label: (ctx) => `${ctx.label}: ${ctx.parsed}%` }
        }
      }
    }
  });
}

function createPostureTypesChart() {
  const ctx = document.getElementById('chart-posture-types');
  if (!ctx) return;

  new Chart(ctx, {
    type: 'polarArea',
    data: {
      labels: ['Upright', 'Slouching', 'Lean Left', 'Lean Right', 'Forward', 'Reclined'],
      datasets: [{
        data: [45, 15, 8, 7, 12, 13],
        backgroundColor: [
          'rgba(16, 185, 129, 0.75)', // Upright - Green
          'rgba(239, 68, 68, 0.75)',  // Slouch - Red
          'rgba(139, 92, 246, 0.75)', // Left - Purple
          'rgba(59, 130, 246, 0.75)', // Right - Blue
          'rgba(245, 158, 11, 0.75)', // Forward - Amber
          'rgba(20, 184, 166, 0.75)', // Reclined - Teal
        ],
        borderColor: '#fff',
        borderWidth: 2,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { padding: 12, usePointStyle: true, pointStyle: 'circle', font: { size: 10 } }
        },
        tooltip: {
          backgroundColor: '#fff', titleColor: '#1a1a1a', bodyColor: '#4a4a4a',
          borderColor: '#e8e5e0', borderWidth: 1, padding: 10, cornerRadius: 8,
          callbacks: { label: (ctx) => `${ctx.label}: ${ctx.parsed.r}% of time` }
        }
      },
      scales: {
        r: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { display: false } }
      }
    }
  });
}
