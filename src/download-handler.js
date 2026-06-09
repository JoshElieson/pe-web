// Download handler with fallback mechanisms
document.addEventListener('DOMContentLoaded', function() {
  // Handle all download links
  const downloadLinks = document.querySelectorAll('a[download], .download-card__btn');
  
  downloadLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      const fileName = href.split('/').pop();
      
      // Log download attempt for debugging
      console.log('Download attempted:', fileName);
      
      // Check if it's an executable file
      if (href.endsWith('.exe') || href.endsWith('.msi')) {
        // For executables, try multiple download methods
        e.preventDefault();
        
        // Method 1: Create a temporary anchor with blob URL
        fetch(href)
          .then(response => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.blob();
          })
          .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            // Show success message
            showDownloadStatus('Download started: ' + fileName, 'success');
          })
          .catch(error => {
            console.error('Download failed:', error);
            
            // Fallback: Direct window navigation
            showDownloadStatus('If download doesn\'t start, trying alternative method...', 'warning');
            setTimeout(() => {
              window.location.href = href;
            }, 1000);
          });
      }
    });
  });
  
  // Function to show download status
  function showDownloadStatus(message, type) {
    // Remove existing status messages
    const existingStatus = document.querySelector('.download-status');
    if (existingStatus) {
      existingStatus.remove();
    }
    
    // Create status element
    const status = document.createElement('div');
    status.className = `download-status download-status--${type}`;
    status.textContent = message;
    status.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 25px;
      background: ${type === 'success' ? '#22c55e' : '#f59e0b'};
      color: white;
      border-radius: 8px;
      font-weight: 500;
      z-index: 9999;
      animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(status);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      status.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => status.remove(), 300);
    }, 5000);
  }
  
  // Add CSS animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
});