// analytics.js - Updated with days instead of weeks for the avg time chart

document.addEventListener('DOMContentLoaded', () => {
  initAvgTimeToCompleteChart();
  initTopContributorsChart();
  initProjectCompletionChart();n
});

// Color palette for charts
const CHART_COLORS = {
  blue: '#3b82f6',
  purple: '#a855f7',
  green: '#22c55e',
  orange: '#f97316',
  red: '#ef4444',
  teal: '#14b8a6',
  indigo: '#6366f1',
  pink: '#ec4899',
  yellow: '#f59e0b',
  cyan: '#06b6d4'
};

/**
 * Initialize the Average Time to Complete Tasks chart
 * Fetches data from the API and renders a bar chart with an average line
 * Now displays days instead of weeks
 */
async function initAvgTimeToCompleteChart() {
  const ctx = document.getElementById('avgTimeToCompleteChart').getContext('2d');
  
  try {
    const response = await fetch('/api/analytics/avg-time-to-complete');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    const labels = result.labels;
    const data = result.data;
    const average = result.average;
    
    // Assign colors to bars
    const backgroundColors = [
      CHART_COLORS.blue, 
      CHART_COLORS.purple, 
      CHART_COLORS.green, 
      CHART_COLORS.orange, 
      CHART_COLORS.red,
      CHART_COLORS.teal,
      CHART_COLORS.indigo,
      CHART_COLORS.pink
    ];
    
    // Use Chart.js annotation plugin to create the average line
    const averageLine = {
      type: 'line',
      borderColor: CHART_COLORS.orange,
      borderDash: [6, 6],
      borderWidth: 2,
      label: {
        display: true,
        content: `Avg. ${average}`,
        position: 'end',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        color: '#1e293b',
        font: {
          weight: 'bold',
          size: 12
        },
        padding: 6
      },
      scaleID: 'y',
      value: average
    };
    
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Average Completion Time (days)',
          data: data,
          backgroundColor: backgroundColors.slice(0, data.length),
          barPercentage: 0.7,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { 
            display: false 
          },
          tooltip: {
            callbacks: {
              title: (context) => context[0].label,
              label: (context) => `${context.raw} days`
            }
          },
          annotation: {
            annotations: {
              averageLine
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Days',
              font: {
                size: 14
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });
  } catch (error) {
    console.error('Error fetching average time data:', error);
    document.getElementById('avgTimeToCompleteChart').closest('.card-content').innerHTML = `
      <div class="placeholder">
        <div>Error loading chart data. Please try again later.</div>
      </div>
    `;
  }
}

/**
 * Initialize the Top Contributors chart
 * Fetches data from the API and renders the contributor list
 */
async function initTopContributorsChart() {
  const container = document.getElementById('topContributorsContainer');
  try {
    const response = await fetch('/api/team-performance-analytics');
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    if (!data || data.length === 0) {
      container.innerHTML = `<div class="placeholder"><div>No contributor data available</div></div>`;
      return;
    }

    const contributors = data.flatMap((item, index) => {
      const color = Object.values(CHART_COLORS)[index % Object.values(CHART_COLORS).length];
      const initials = item.full_name.split(' ').map(p => p[0]).join('');
      return item.projects.map(project => ({
        username: item.username,
        name: item.full_name,
        role: item.role,
        taskCount: project.task_count,
        project: project.project_name,
        initials,
        color
      }));
    });

    contributors.sort((a, b) => b.taskCount - a.taskCount);
    const top = contributors.slice(0, 3);
    const max = Math.max(...top.map(c => c.taskCount));

    const html = top.map(c => `
      <div class="contributor-item flex items-center mb-6">
        <div class="contributor-avatar w-12 h-12 rounded-full flex items-center justify-center mr-4" style="background-color: ${c.color}20">
          <span class="text-lg font-semibold" style="color: ${c.color}">${c.initials}</span>
        </div>
        <div class="contributor-info flex-grow">
          <div class="flex justify-between mb-1">
            <div>
              <div class="font-semibold text-gray-800">${c.username}</div>
              <div class="text-sm text-gray-500">${c.project}</div>
            </div>
            <div class="font-bold text-gray-700">${c.taskCount}t</div>
          </div>
          <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div class="h-full rounded-full" style="width: ${(c.taskCount / max) * 100}%; background-color: ${c.color}"></div>
          </div>
        </div>
      </div>`).join('');

    container.innerHTML = html;
  } catch (error) {
    console.error('Error fetching contributor data:', error);
    container.innerHTML = `<div class="placeholder"><div>Error loading contributor data.</div></div>`;
  }
}

/**
 * Initialize the Project Completion Trends chart
 * Fetches project progress data and renders a line chart
 */
async function initProjectCompletionChart() {
  const ctx = document.getElementById('projectCompletionChart').getContext('2d');
  const legendContainer = document.getElementById('projectChartLegend');
  try {
    const response = await fetch('/api/project-performance-analytics');
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const result = await response.json();

    const colorKeys = Object.keys(CHART_COLORS);
    result.datasets.forEach((dataset, i) => {
      const color = CHART_COLORS[colorKeys[i % colorKeys.length]];
      Object.assign(dataset, {
        borderColor: color,
        backgroundColor: color + '20',
        tension: 0.3,
        borderWidth: 2,
        pointBackgroundColor: color,
        pointRadius: 3,
        pointHoverRadius: 5
      });
    });

    new Chart(ctx, {
      type: 'line',
      data: result,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            title: { display: true, text: 'Completion %' },
            ticks: { callback: v => v + '%' },
            grid: { color: 'rgba(0,0,0,0.05)' }
          },
          x: {
            title: { display: true, text: 'Weeks Since Project Creation' },
            grid: { display: false }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => `${ctx.dataset.label}: ${ctx.raw}% complete`
            }
          }
        }
      }
    });

    legendContainer.innerHTML = result.datasets.map(d => `
      <div class="legend-item flex items-center mr-4">
        <div class="w-3 h-3 rounded-full mr-2" style="background-color: ${d.borderColor}"></div>
        <span class="text-sm text-gray-700">${d.label}</span>
      </div>`).join('');
  } catch (err) {
    console.error('Error fetching project completion data:', err);
    ctx.closest('.card-content').innerHTML = `<div class="placeholder"><div>Error loading project completion data. Please try again later.</div></div>`;
  }
}
