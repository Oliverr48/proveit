function loadChart(url, canvasId, configBuilder) {
  fetch(url)
    .then(res => res.json())
    .then(data => {
      new Chart(document.getElementById(canvasId).getContext('2d'), configBuilder(data));
    });
}

document.addEventListener('DOMContentLoaded', () => {
  loadChart('/api/time-based-analytics', 'timeAnalyticsChart', (data) => ({
    type: 'line',
    data: {
      labels: data.labels,
      datasets: [{
        label: 'Project Activity',
        data: data.data,
        borderColor: 'teal',
        backgroundColor: 'rgba(0, 128, 128, 0.1)',
        fill: true,
        tension: 0.3
      }]
    }
  }));

  loadChart('/api/team-performance-analytics', 'teamPerformanceChart', (data) => ({
    type: 'bar',
    data: {
      labels: data.labels,
      datasets: [{
        label: 'Tasks Completed',
        data: data.data,
        backgroundColor: ['#60A5FA', '#34D399', '#FBBF24', '#F87171']
      }]
    }
  }));

  loadChart('/api/project-performance-analytics', 'completionChart', (data) => ({
    type: 'line',
    data: {
      labels: data.labels,
      datasets: data.datasets.map(ds => ({
        label: ds.label,
        data: ds.data,
        borderColor: ds.borderColor,
        fill: false
      }))
    }
  }));
});
