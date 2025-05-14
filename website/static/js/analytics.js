// analytics.js starter template

document.addEventListener('DOMContentLoaded', () => {
  // Initialize visualization components
  initTeamPerformanceSection();
  initProjectCompletionChart();
  
  // TODO: Add event listeners for filters
});

// Chart colors - feel free to customize
const CHART_COLORS = {
  marketing: '#6366f1', // indigo
  mobile: '#8b5cf6',    // violet
  database: '#ec4899',  // pink
  ui: '#f59e0b',        // amber
  api: '#10b981'        // emerald
};

// Sample data structure - replace with API calls in production
const SAMPLE_DATA = {
  // Average time to complete tasks - for future implementation
  avgTimeData: {
    labels: ['Marketing', 'Mobile App', 'Database', 'UI Redesign', 'API'],
    datasets: [{
      label: 'Average Days to Complete',
      data: [3.3, 4.2, 2.3, 4.5, 2.8],
      backgroundColor: Object.values(CHART_COLORS),
      borderWidth: 1
    }],
    average: 3.2
  },
  
  // Top contributors data
  topContributors: [
    { id: 1, name: 'John Doe', role: 'Front-end Developer', taskCount: 87, initials: 'JD', color: '#6366f1' },
    { id: 2, name: 'Anna Smith', role: 'UX Designer', taskCount: 74, initials: 'AS', color: '#8b5cf6' },
    { id: 3, name: 'Mike Johnson', role: 'Backend Developer', taskCount: 65, initials: 'MJ', color: '#ec4899' },
    { id: 4, name: 'Sarah Thomas', role: 'QA Engineer', taskCount: 59, initials: 'ST', color: '#f59e0b' }
  ],
  
  // Project completion trends
  projectTrends: {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7'],
    datasets: [
      {
        label: 'Marketing Website',
        data: [5, 20, 40, 65, 75, 85, 95],
        borderColor: CHART_COLORS.marketing,
        backgroundColor: CHART_COLORS.marketing + '20', // 12.5% opacity
        tension: 0.3,
        projectId: 'marketing'
      },
      {
        label: 'Mobile App',
        data: [0, 10, 30, 50, 60, 70, 75],
        borderColor: CHART_COLORS.mobile,
        backgroundColor: CHART_COLORS.mobile + '20',
        tension: 0.3,
        projectId: 'mobile'
      },
      {
        label: 'Database Migration',
        data: [12, 35, 55, 70, 82, 94, 98],
        borderColor: CHART_COLORS.database,
        backgroundColor: CHART_COLORS.database + '20',
        tension: 0.3,
        projectId: 'database'
      },
      {
        label: 'UI Redesign',
        data: [0, 0, 20, 30, 40, 60, 75],
        borderColor: CHART_COLORS.ui,
        backgroundColor: CHART_COLORS.ui + '20',
        tension: 0.3,
        projectId: 'ui'
      }
    ]
  }
};

// TODO: Implement Average Time to Complete Chart visualization
// You'll need to create a function that renders a bar chart showing task completion times

// Initialize Team Performance section
function initTeamPerformanceSection() {
  const container = document.getElementById('topContributorsContainer');
  const contributors = SAMPLE_DATA.topContributors;
  
  // TODO: Calculate percentages based on maximum task count
  // TODO: Generate HTML for each contributor with avatar, name, role, and progress bar
  // Example HTML structure for a contributor:
  /*
  <div class="contributor-item">
    <div class="contributor-avatar" style="background-color: [color]">[initials]</div>
    <div class="contributor-info">
      <div class="contributor-name">[name]</div>
      <div class="contributor-role">[role]</div>
      <div class="contributor-progress">
        <div class="contributor-progress-bar" style="width: [percentage]%; background-color: [color]"></div>
      </div>
      <div class="contributor-count">[taskCount] tasks</div>
    </div>
  </div>
  */
}

// Initialize Project Completion Trends Chart
function initProjectCompletionChart() {
  const ctx = document.getElementById('projectCompletionChart').getContext('2d');
  
  // Create a line chart comparing multiple projects
  window.projectCompletionChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: SAMPLE_DATA.projectTrends.labels,
      datasets: SAMPLE_DATA.projectTrends.datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          title: {
            display: true,
            text: 'Completion Percentage'
          },
          ticks: {
            callback: function(value) {
              return value + '%';
            }
          }
        }
      },
      interaction: {
        intersect: false,
        mode: 'index'
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ${context.raw}% complete`;
            }
          }
        }
      }
    }
  });
  
  // TODO: Create and implement custom legend for the project chart
}

// TODO: Create functions for filtering data by time range
// TODO: Create function for filtering by project
// TODO: Create function for exporting data